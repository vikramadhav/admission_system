/*==============================================================================
  90_Seed_Reference.sql : status lookups, payment providers, program categories,
                          access roles and reason codes (idempotent)
  Status codes mirror the status enums of the OpenAPI contract
  (Contracts\openapi\openapi.yaml: ApplicationStatus, VerificationStatus,
  PortfolioStatus, PortfolioRoundStatus, AnnouncementStatus, PaymentStatus).
==============================================================================*/
:on error exit
USE [$(DatabaseName)];
GO

INSERT cfg.ApplicationStatus (StatusCode, DisplayName, SortOrder, IsTerminal)
SELECT v.c, v.n, v.s, v.t FROM (VALUES
 ('DRAFT',N'Draft',1,0),('SUBMITTED',N'Submitted',2,0),('UNDER_REVIEW',N'Under review',3,0),
 ('CORRECTION_REQUIRED',N'Correction required',4,0),('CORRECTION_SUBMITTED',N'Correction submitted',5,0),
 ('SCREENED_OUT',N'Screened out',6,0),('REVIEW_COMPLETED',N'Review completed',7,0),
 ('APPEAL_UNDER_REVIEW',N'Appeal under review',8,0),
 ('WITHDRAWN',N'Withdrawn',9,1),('ARCHIVED',N'Archived',10,1)) v(c,n,s,t)
WHERE NOT EXISTS (SELECT 1 FROM cfg.ApplicationStatus x WHERE x.StatusCode = v.c);

INSERT cfg.VerificationStatus (StatusCode, DisplayName, SortOrder, IsTerminal)
SELECT v.c, v.n, v.s, v.t FROM (VALUES
 ('PENDING',N'Pending',1,0),('IN_PROGRESS',N'In progress',2,0),('CORRECTION_REQUIRED',N'Correction required',3,0),
 ('CORRECTION_SUBMITTED',N'Correction submitted',4,0),('PENDING_CLARIFICATION',N'Pending clarification',5,0),
 ('CLARIFICATION_SUBMITTED',N'Clarification submitted',6,0),('SCREEN_OUT_PENDING_APPROVAL',N'Screen-out pending approval',7,0),
 ('RE_EVALUATING',N'Re-evaluating',8,0),('COMPLETE',N'Complete',9,1),('SCREENED_OUT',N'Screened out',10,1),
 ('ON_HOLD',N'On hold',11,0)) v(c,n,s,t)
WHERE NOT EXISTS (SELECT 1 FROM cfg.VerificationStatus x WHERE x.StatusCode = v.c);

INSERT cfg.PortfolioStatus (StatusCode, DisplayName, SortOrder, IsTerminal)
SELECT v.c, v.n, v.s, v.t FROM (VALUES
 ('PENDING',N'Pending',1,0),('IN_PROGRESS',N'In progress',2,0),('THIRD_REFEREE_REQUIRED',N'Third referee required',3,0),
 ('THIRD_ROUND_IN_PROGRESS',N'Third round in progress',4,0),('COMPLETE',N'Complete',5,1),
 ('SECOND_EVALUATION_REQUIRED',N'Second evaluation required',6,0),('SECOND_EVALUATION_IN_PROGRESS',N'Second evaluation in progress',7,0),
 ('ON_HOLD',N'On hold',8,0)) v(c,n,s,t)
WHERE NOT EXISTS (SELECT 1 FROM cfg.PortfolioStatus x WHERE x.StatusCode = v.c);

INSERT cfg.PortfolioRoundStatus (StatusCode, DisplayName, SortOrder)
SELECT v.c, v.n, v.s FROM (VALUES ('PENDING',N'Pending',1),('IN_PROGRESS',N'In progress',2),('COMPLETE',N'Complete',3),('ON_HOLD',N'On hold',4)) v(c,n,s)
WHERE NOT EXISTS (SELECT 1 FROM cfg.PortfolioRoundStatus x WHERE x.StatusCode = v.c);

INSERT cfg.AnnouncementStatus (StatusCode, DisplayName, SortOrder)
SELECT v.c, v.n, v.s FROM (VALUES
 ('PENDING',N'Pending',1),('READY_FOR_INITIAL_ANNOUNCEMENT',N'Ready for initial announcement',2),('ANNOUNCED',N'Announced',3),
 ('APPEAL_UNDER_REVIEW',N'Appeal under review',4),('READY_FOR_REANNOUNCEMENT',N'Ready for re-announcement',5),
 ('REANNOUNCED',N'Re-announced',6)) v(c,n,s)
WHERE NOT EXISTS (SELECT 1 FROM cfg.AnnouncementStatus x WHERE x.StatusCode = v.c);

INSERT cfg.PaymentStatus (StatusCode, DisplayName, SortOrder, IsTerminal)
SELECT v.c, v.n, v.s, v.t FROM (VALUES
 ('PENDING',N'Pending',1,0),('PAID',N'Paid',2,1),('FAILED',N'Failed',3,1),('CANCELLED',N'Cancelled',4,1),('UNKNOWN',N'Unknown',5,0)) v(c,n,s,t)
WHERE NOT EXISTS (SELECT 1 FROM cfg.PaymentStatus x WHERE x.StatusCode = v.c);

INSERT cfg.PaymentProvider (ProviderCode, DisplayName, IsEnabled)
SELECT v.c, v.n, 1 FROM (VALUES ('E_PAY',N'E-Pay'),('NETWORK_INTERNATIONAL',N'Network International')) v(c,n)
WHERE NOT EXISTS (SELECT 1 FROM cfg.PaymentProvider x WHERE x.ProviderCode = v.c);

INSERT cfg.ProgramCategory (CategoryCode, DisplayName)
SELECT v.c, v.n FROM (VALUES ('CERTIFICATE',N'Certificate'),('INTERNSHIP',N'Internship'),('RESIDENCY',N'Residency'),('FELLOWSHIP',N'Fellowship')) v(c,n)
WHERE NOT EXISTS (SELECT 1 FROM cfg.ProgramCategory x WHERE x.CategoryCode = v.c);
GO

-- Staff roles (BRD Business Roles BRO-02..BRO-09 plus the platform administrator). Candidates are not a staff role.
INSERT idn.AccessRole (RoleCode, DisplayName, IsStaffRole)
SELECT v.c, v.n, 1 FROM (VALUES
 ('ADMINISTRATOR',N'Administrator'),('ADMISSION_OFFICER',N'Admission officer'),('ADMISSION_SUPERVISOR',N'Admission supervisor'),
 ('CENTRAL_MONITOR',N'Central monitor'),('FINANCE_OFFICER',N'Finance officer'),('REFEREE',N'Referee'),
 ('THIRD_REFEREE',N'Third referee'),('SECOND_EVALUATION_REFEREE',N'2nd evaluation referee'),('SENIOR_REFEREE',N'Senior referee')) v(c,n)
WHERE NOT EXISTS (SELECT 1 FROM idn.AccessRole x WHERE x.RoleCode = v.c);

-- Reason categories = the lookup types of GET /v1/lookups/{lookupType} that are held in cfg.ReasonCode.
-- (Portfolio rejection reasons and classifications are per question in pfo.QuestionRejectionReason / pfo.QuestionClassification.)
INSERT cfg.ReasonCategory (CategoryCode, DisplayName)
SELECT v.c, v.n FROM (VALUES
 ('WITHDRAWAL_REASON',N'Withdrawal reason'),('CORRECTION_NOTE_TEMPLATE',N'Correction note template'),
 ('SCREEN_OUT_REASON',N'Screen-out reason'),('REINSTATEMENT_REJECTION_REASON',N'Reinstatement rejection reason')) v(c,n)
WHERE NOT EXISTS (SELECT 1 FROM cfg.ReasonCategory x WHERE x.CategoryCode = v.c);

-- US-1.2.4 withdrawal pop-up list. OTHER requires the free-text reason (app.WithdrawalRequest.OtherReasonText).
INSERT cfg.ReasonCode (CategoryCode, ReasonCode, DisplayName, CandidateMessage, SortOrder)
SELECT 'WITHDRAWAL_REASON', v.c, v.n, v.n, v.s FROM (VALUES
 ('NOT_MEETING_ELIGIBILITY_CRITERIA',N'Not meeting eligibility criteria',1),
 ('JOINING_ANOTHER_TRAINING_PROGRAM',N'Joining another training program',2),
 ('PERSONAL_REASONS',N'Personal reasons',3),
 ('FINANCIAL_REASONS',N'Financial reasons',4),
 ('SCHOLARSHIP_OPPORTUNITY',N'Scholarship opportunity',5),
 ('OTHER',N'Others',6)) v(c,n,s)
WHERE NOT EXISTS (SELECT 1 FROM cfg.ReasonCode x WHERE x.CategoryCode = 'WITHDRAWAL_REASON' AND x.ReasonCode = v.c);

-- BRD appendix "Application Screen Out Reasons" (10 reasons). The wording is sent to the candidate, so it is also the CandidateMessage.
INSERT cfg.ReasonCode (CategoryCode, ReasonCode, DisplayName, CandidateMessage, SortOrder)
SELECT 'SCREEN_OUT_REASON', v.c, v.n, v.n, v.s FROM (VALUES
 ('ADMISSION_CRITERIA_NOT_MET',N'Not meeting the published admission criteria',1),
 ('INCOMPLETE_APPLICATION',N'Submitting an incomplete application',2),
 ('CASPER_NOT_ATTENDED',N'Not attending CASPER',3),
 ('INTERVIEW_NOT_ATTENDED',N'Not attending the interview',4),
 ('OFFER_NOT_ANSWERED',N'Not responding to the offer by the stipulated deadline',5),
 ('INCOMPLETE_MISSING_ECE_REPORT',N'Submitting an incomplete application due to a missing ECE report',6),
 ('INCOMPLETE_MISSING_ENGLISH_CERTIFICATE',N'Submitting an incomplete application due to a missing English language certificate',7),
 ('ENGLISH_REQUIREMENTS_NOT_MET',N'Not meeting the English language admission requirements',8),
 ('LIMITED_SEATS',N'The limited number of seats available and the highly competitive candidate pool',9),
 ('SHORTLISTING_THRESHOLD_NOT_MET',N'Performance in the shortlisting phase, which did not meet the threshold required to progress further in this admissions cycle',10)) v(c,n,s)
WHERE NOT EXISTS (SELECT 1 FROM cfg.ReasonCode x WHERE x.CategoryCode = 'SCREEN_OUT_REASON' AND x.ReasonCode = v.c);
GO
