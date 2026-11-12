// Hand-written from Contracts/openapi/openapi.yaml (components ApiResponse,
// ApiListResponse, Page, Problem, ValidationIssue). OpenAPI code generation is not
// approved yet (OQ-08), so these types are kept in step with the contract by review.

/** Cursor pagination returned with every collection. */
export interface ApiPage {
  readonly limit: number;
  readonly nextCursor: string | null;
}

/** Success envelope as sent by the API (D-02). */
export interface ApiResponseBody<T> {
  readonly data: T;
  readonly messageCode?: string | null;
  readonly message?: string | null;
  readonly pagination?: ApiPage;
}

/**
 * Typed success result produced by the API response interceptor from the envelope,
 * with the ETag header when the operation returns one (draft reads and writes).
 */
export interface ApiResult<T> {
  readonly data: T;
  readonly messageCode: string | null;
  readonly message: string | null;
  readonly pagination: ApiPage | null;
  readonly etag: string | null;
}

export interface ApiValidationIssue {
  readonly code: string;
  readonly detail: string;
  readonly pointer?: string;
}

/** RFC 7807 Problem Details with the DAHC dotted business code and trace id. */
export interface ApiProblemDetails {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly code: string;
  readonly traceId: string | null;
  readonly detail?: string;
  readonly instance?: string;
  readonly errors?: readonly ApiValidationIssue[];
}
