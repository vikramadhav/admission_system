import { Injectable, signal } from '@angular/core';

import { ApiProblemDetails } from './api.models';

/** The problem currently shown in the application's message area, with its trace id for support. */
@Injectable({ providedIn: 'root' })
export class ProblemNotificationService {
  private readonly currentProblem = signal<ApiProblemDetails | null>(null);

  readonly problem = this.currentProblem.asReadonly();

  show(problem: ApiProblemDetails): void {
    this.currentProblem.set(problem);
  }

  clear(): void {
    this.currentProblem.set(null);
  }
}
