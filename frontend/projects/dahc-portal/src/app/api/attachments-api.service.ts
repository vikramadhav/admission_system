import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResult } from '../core/api/api.models';
import { DAHC_PORTAL_CONFIG } from '../core/config/portal-config';
import { AttachmentMetadata, AttachmentSlot } from './candidate-lifecycle.models';

/**
 * Attachment slots of an application (candidate-lifecycle.yaml): the server decides which slots
 * apply, their type and size limits, and whether they can be changed.
 */
@Injectable({ providedIn: 'root' })
export class AttachmentsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(DAHC_PORTAL_CONFIG).apiBaseUrl;

  /** GET /applications/{applicationId}/attachments. */
  listSlots(applicationId: string): Observable<ApiResult<AttachmentSlot[]>> {
    return this.http.get<ApiResult<AttachmentSlot[]>>(this.slotsUrl(applicationId));
  }

  /** PUT /applications/{applicationId}/attachments/{slotId} as multipart "file"; replaces any earlier file. */
  upload(
    applicationId: string,
    slotId: string,
    file: File,
    context: HttpContext = new HttpContext(),
  ): Observable<ApiResult<AttachmentMetadata>> {
    const body = new FormData();
    body.append('file', file, file.name);

    return this.http.put<ApiResult<AttachmentMetadata>>(this.slotUrl(applicationId, slotId), body, { context });
  }

  /** DELETE /applications/{applicationId}/attachments/{slotId}: returns the emptied slot. */
  remove(applicationId: string, slotId: string): Observable<ApiResult<AttachmentSlot>> {
    return this.http.delete<ApiResult<AttachmentSlot>>(this.slotUrl(applicationId, slotId));
  }

  /** GET …/attachments/{slotId}/content: the file itself, for preview. */
  download(applicationId: string, slotId: string): Observable<Blob> {
    return this.http.get(`${this.slotUrl(applicationId, slotId)}/content`, { responseType: 'blob' });
  }

  private slotsUrl(applicationId: string): string {
    return `${this.baseUrl}/applications/${encodeURIComponent(applicationId)}/attachments`;
  }

  private slotUrl(applicationId: string, slotId: string): string {
    return `${this.slotsUrl(applicationId)}/${encodeURIComponent(slotId)}`;
  }
}
