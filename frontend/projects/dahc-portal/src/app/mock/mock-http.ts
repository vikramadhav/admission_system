import { ApiProblemDetails } from '../core/api/api.models';

/** Reply and error shapes shared by the mock routers. */
export interface MockReply {
  readonly status: number;
  readonly body: unknown;
  readonly etag?: string;
}

export class MockProblem extends Error {
  constructor(readonly problem: ApiProblemDetails) {
    super(problem.title);
  }
}

export function problem(status: number, code: string, detail: string, errors?: ApiProblemDetails['errors']): MockProblem {
  return new MockProblem({
    type: `https://api.dahc.example/problems/${code}`,
    title: detail,
    status,
    code,
    detail,
    traceId: `00-mock${Math.random().toString(16).slice(2, 18)}-01`,
    ...(errors ? { errors } : {}),
  });
}

export const ok = (data: unknown, etag?: string, status = 200): MockReply => ({
  status,
  body: { data },
  ...(etag ? { etag } : {}),
});

