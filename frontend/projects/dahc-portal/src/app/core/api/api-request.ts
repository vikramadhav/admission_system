import { HttpContext, HttpContextToken } from '@angular/common/http';

/**
 * Set by callers that show API problems themselves (sign-in and session restore are shown
 * on the sign-in page), so the response interceptor neither navigates nor shows the message.
 */
export const DAHC_CALLER_HANDLES_PROBLEMS = new HttpContextToken<boolean>(() => false);

/** True only for URLs under the configured API base URL; the bearer token is never sent anywhere else. */
export function isDahcApiUrl(url: string, apiBaseUrl: string): boolean {
  const base = apiBaseUrl.replace(/\/+$/, '');

  return url === base || url.startsWith(`${base}/`) || url.startsWith(`${base}?`);
}

/** Context for a request whose caller shows any problem itself (dialogs, inline forms). */
export function callerHandlesProblems(): HttpContext {
  return new HttpContext().set(DAHC_CALLER_HANDLES_PROBLEMS, true);
}
