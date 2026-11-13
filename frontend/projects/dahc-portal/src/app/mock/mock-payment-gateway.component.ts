import { ChangeDetectionStrategy, Component, DOCUMENT, computed, inject, input } from '@angular/core';
import { DahcAlertComponent, DahcButtonComponent, DahcCardComponent, DahcDetailListComponent } from 'dahc-ui';

import { MockBackendService } from './mock-backend.service';

/**
 * Stands in for the Dubai Health payment gateway (E-Pay / Network International) in the mock
 * build. The real gateway calls the API through the payment adapter and returns the browser to
 * the portal; here the buttons do both.
 */
@Component({
  selector: 'dahc-mock-payment-gateway',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcCardComponent, DahcDetailListComponent],
  styles: `
    :host { display: block; max-inline-size: 40rem; margin-inline: auto; padding: var(--dahc-space-8) var(--dahc-space-4); }
    .gateway-title { margin-block: 0 var(--dahc-space-6); }
    .gateway-actions { display: flex; flex-wrap: wrap; gap: var(--dahc-space-3); margin-block-start: var(--dahc-space-6); }
  `,
  // Mock-only page, never shipped or translated.
  template: `
    <!-- eslint-disable @angular-eslint/template/i18n -->
    <h1 class="gateway-title">Payment gateway (mock)</h1>
    <dahc-card eyebrow="Dubai Health payments" heading="Application fee" [headingLevel]="2">
      <dahc-alert variant="info">This page simulates the payment gateway. No card details are needed.</dahc-alert>
      <dahc-detail-list
        [columns]="2"
        [items]="[
          { label: 'Amount', value: amount() },
          { label: 'Reference', value: paymentSessionId() }
        ]" />
      <div class="gateway-actions">
        <button dahc-button type="button" (click)="finish('PAID')">Pay now</button>
        <button dahc-button type="button" variant="danger-outline" (click)="finish('FAILED')">Simulate a failed payment</button>
        <button dahc-button type="button" variant="secondary" (click)="finish('CANCELLED')">Cancel payment</button>
      </div>
    </dahc-card>
  `,
})
export class MockPaymentGatewayComponent {
  private readonly backend = inject(MockBackendService);
  private readonly document = inject(DOCUMENT);

  readonly applicationId = input<string>('');
  readonly paymentSessionId = input<string>('');

  protected readonly amount = computed<string>(() => {
    const session = this.backend.paymentAmount(this.applicationId(), this.paymentSessionId());

    return session ? `${session.currency} ${session.amount}` : '—';
  });

  protected finish(outcome: 'PAID' | 'FAILED' | 'CANCELLED'): void {
    this.backend.completePayment(this.applicationId(), this.paymentSessionId(), outcome);
    const returnUrl = `/candidate/applications/${encodeURIComponent(this.applicationId())}/payment-return?paymentSessionId=${encodeURIComponent(this.paymentSessionId())}`;
    this.document.location.assign(returnUrl);
  }
}
