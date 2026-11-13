// Hand-written from the contract schema PaymentRecord (OQ-08).

// Finance (US-1.3.13).

export type BillStatus = 'NA' | 'PENDING' | 'PAID' | 'FAILED';

export interface PaymentRecord {
  readonly applicationId: string;
  readonly applicationNumber: string;
  readonly candidateDisplayName?: string;
  readonly email?: string;
  readonly program: string;
  readonly feeType: string;
  readonly billStatus: BillStatus;
  /** AED. */
  readonly billAmount: number;
  readonly paymentDate?: string | null;
}

/** All optional; `from` and `to` are calendar dates (payment date), `to` on or after `from`. */
export interface PaymentFilters {
  readonly cycleId?: string | null;
  readonly programId?: string | null;
  readonly applicationNumber?: string | null;
  readonly from?: string | null;
  readonly to?: string | null;
}
