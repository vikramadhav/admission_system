import { Observable, firstValueFrom } from 'rxjs';

/**
 * Bearer-authenticated files (attachments, evidence, exports) cannot be plain links: they are
 * fetched through HttpClient as a blob and handed to the browser through an object URL, which is
 * revoked again shortly after.
 */

/** Opens the file in a new tab. The tab opens synchronously so pop-up blockers allow it. */
export async function openBlobInNewTab(view: Window | null, download: Observable<Blob>): Promise<void> {
  if (!view) {
    return;
  }

  const tab = view.open('', '_blank');
  const blob = await firstValueFrom(download);
  const url = URL.createObjectURL(blob);

  if (tab) {
    tab.location.href = url;
  } else {
    view.open(url, '_blank', 'noopener');
  }

  view.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Saves the file under the given name (the browser's download). */
export async function saveBlob(document: Document, download: Observable<Blob>, fileName: string): Promise<void> {
  const blob = await firstValueFrom(download);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  document.defaultView?.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
