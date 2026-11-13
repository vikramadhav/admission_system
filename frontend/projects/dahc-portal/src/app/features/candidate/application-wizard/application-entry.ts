import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/** /candidate/applications/:id opens the application at its first step (edit or view mode follows the status). */
export const applicationEntryRedirect: CanActivateFn = route => {
  const applicationId = route.paramMap.get('applicationId') ?? '';

  return inject(Router).createUrlTree(['/candidate/applications', applicationId, 'steps', 'program']);
};
