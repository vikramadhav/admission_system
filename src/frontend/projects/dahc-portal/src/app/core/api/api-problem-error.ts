import { ApiProblemDetails } from './api.models';

/** Error raised for every failed API call, carrying the Problem Details the API returned. */
export class ApiProblemError extends Error {
  readonly problem: ApiProblemDetails;

  constructor(problem: ApiProblemDetails) {
    super(problem.code);
    this.name = 'ApiProblemError';
    this.problem = problem;
  }

  get status(): number {
    return this.problem.status;
  }

  get code(): string {
    return this.problem.code;
  }
}

export function isApiProblemError(error: unknown): error is ApiProblemError {
  return error instanceof ApiProblemError;
}
