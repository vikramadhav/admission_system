import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResult } from '../core/api/api.models';
import { DAHC_PORTAL_CONFIG } from '../core/config/portal-config';
import { idempotent } from './applications-api.service';
import { Application } from './application.models';
import {
  CandidatePortfolioResult,
  ContactVerification,
  ContactVerificationInput,
  ContactVerificationResult,
  LookupItem,
  OtpChallenge,
  PaymentSession,
  PortfolioAppealInput,
  PortfolioSubmission,
  PortfolioSubmissionInput,
  WithdrawalChallenge,
  WithdrawalRequestInput,
  WorkflowActionResult,
} from './candidate-lifecycle.models';

/**
 * Candidate lifecycle operations that run as one-time actions: portfolio, payment and
 * submission, withdrawal with OTP, contact verification, the portfolio result and appeal,
 * and the withdrawal reason lookup (candidate-lifecycle.yaml, catalog.yaml). Every method takes
 * an optional HttpContext; pass callerHandlesProblems() when the caller shows problems itself.
 */
@Injectable({ providedIn: 'root' })
export class CandidateActionsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(DAHC_PORTAL_CONFIG).apiBaseUrl;

  /** GET /applications/{id}/portfolio. */
  getPortfolio(applicationId: string, context = new HttpContext()): Observable<ApiResult<PortfolioSubmission>> {
    return this.http.get<ApiResult<PortfolioSubmission>>(`${this.url(applicationId)}/portfolio`, { context });
  }

  /** POST /applications/{id}/portfolio-submission: one time only, cannot be changed afterwards. */
  submitPortfolio(
    applicationId: string,
    input: PortfolioSubmissionInput,
    context = new HttpContext(),
  ): Observable<ApiResult<PortfolioSubmission>> {
    return this.http.post<ApiResult<PortfolioSubmission>>(`${this.url(applicationId)}/portfolio-submission`, input, {
      headers: idempotent(),
      context,
    });
  }

  /** POST /applications/{id}/payment-sessions: the server re-validates and returns the gateway URL. */
  createPaymentSession(
    applicationId: string,
    idempotencyKey: string,
    context = new HttpContext(),
  ): Observable<ApiResult<PaymentSession>> {
    return this.http.post<ApiResult<PaymentSession>>(`${this.url(applicationId)}/payment-sessions`, null, {
      headers: new HttpHeaders({ 'Idempotency-Key': idempotencyKey }),
      context,
    });
  }

  /** GET /applications/{id}/payment-sessions/{paymentSessionId}. */
  getPaymentSession(
    applicationId: string,
    paymentSessionId: string,
    context = new HttpContext(),
  ): Observable<ApiResult<PaymentSession>> {
    return this.http.get<ApiResult<PaymentSession>>(
      `${this.url(applicationId)}/payment-sessions/${encodeURIComponent(paymentSessionId)}`,
      { context },
    );
  }

  /** POST /applications/{id}/submission after a PAID payment session. */
  submitApplication(
    applicationId: string,
    paymentSessionId: string,
    context = new HttpContext(),
  ): Observable<ApiResult<Application>> {
    return this.http.post<ApiResult<Application>>(
      `${this.url(applicationId)}/submission`,
      { paymentSessionId, confirmed: true },
      { headers: idempotent(), context },
    );
  }

  /** POST /applications/{id}/withdrawal-requests: records the reason and sends the OTP. */
  startWithdrawal(
    applicationId: string,
    input: WithdrawalRequestInput,
    context = new HttpContext(),
  ): Observable<ApiResult<WithdrawalChallenge>> {
    return this.http.post<ApiResult<WithdrawalChallenge>>(`${this.url(applicationId)}/withdrawal-requests`, input, {
      context,
    });
  }

  /** POST …/withdrawal-requests/{requestId}/confirmation with the OTP. */
  confirmWithdrawal(
    applicationId: string,
    requestId: string,
    otp: string,
    context = new HttpContext(),
  ): Observable<ApiResult<WorkflowActionResult>> {
    return this.http.post<ApiResult<WorkflowActionResult>>(
      `${this.url(applicationId)}/withdrawal-requests/${encodeURIComponent(requestId)}/confirmation`,
      { otp },
      { context },
    );
  }

  /** POST …/withdrawal-requests/{requestId}/otp-resend (429 while the cooldown runs). */
  resendWithdrawalOtp(applicationId: string, requestId: string, context = new HttpContext()): Observable<ApiResult<OtpChallenge>> {
    return this.http.post<ApiResult<OtpChallenge>>(
      `${this.url(applicationId)}/withdrawal-requests/${encodeURIComponent(requestId)}/otp-resend`,
      null,
      { context },
    );
  }

  /** POST /applications/{id}/contact-verifications: OTP for a changed contact e-mail or mobile. */
  startContactVerification(
    applicationId: string,
    input: ContactVerificationInput,
    context = new HttpContext(),
  ): Observable<ApiResult<ContactVerification>> {
    return this.http.post<ApiResult<ContactVerification>>(`${this.url(applicationId)}/contact-verifications`, input, {
      context,
    });
  }

  confirmContactVerification(
    applicationId: string,
    verificationId: string,
    otp: string,
    context = new HttpContext(),
  ): Observable<ApiResult<ContactVerificationResult>> {
    return this.http.post<ApiResult<ContactVerificationResult>>(
      `${this.url(applicationId)}/contact-verifications/${encodeURIComponent(verificationId)}/confirmation`,
      { otp },
      { context },
    );
  }

  resendContactVerificationOtp(
    applicationId: string,
    verificationId: string,
    context = new HttpContext(),
  ): Observable<ApiResult<ContactVerification>> {
    return this.http.post<ApiResult<ContactVerification>>(
      `${this.url(applicationId)}/contact-verifications/${encodeURIComponent(verificationId)}/otp-resend`,
      null,
      { context },
    );
  }

  /** GET /applications/{id}/portfolio-result; 404 portfolio.scores_not_announced before the announcement. */
  getPortfolioResult(applicationId: string, context = new HttpContext()): Observable<ApiResult<CandidatePortfolioResult>> {
    return this.http.get<ApiResult<CandidatePortfolioResult>>(`${this.url(applicationId)}/portfolio-result`, { context });
  }

  /** POST /applications/{id}/appeals: one appeal inside the window. */
  submitAppeal(
    applicationId: string,
    input: PortfolioAppealInput,
    context = new HttpContext(),
  ): Observable<ApiResult<WorkflowActionResult>> {
    return this.http.post<ApiResult<WorkflowActionResult>>(`${this.url(applicationId)}/appeals`, input, {
      headers: idempotent(),
      context,
    });
  }

  /** GET /lookups/WITHDRAWAL_REASON: the only lookup type candidate tokens may read. */
  listWithdrawalReasons(context = new HttpContext()): Observable<ApiResult<LookupItem[]>> {
    return this.http.get<ApiResult<LookupItem[]>>(`${this.baseUrl}/lookups/WITHDRAWAL_REASON`, { context });
  }

  private url(applicationId: string): string {
    return `${this.baseUrl}/applications/${encodeURIComponent(applicationId)}`;
  }
}
