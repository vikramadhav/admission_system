import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';

import { PermissionService } from './permission.service';
import { DahcPermission } from './permissions';

/**
 * Renders its element only when the active role has the permission, for example
 * `<button *dahcIfPermitted="'admission.pool.retrieve'">`. A usability aid only: the API still
 * authorizes the request behind the button.
 */
@Directive({ selector: '[dahcIfPermitted]' })
export class DahcIfPermittedDirective {
  readonly dahcIfPermitted = input.required<DahcPermission>();

  private readonly template = inject(TemplateRef);
  private readonly container = inject(ViewContainerRef);
  private readonly permissions = inject(PermissionService);
  private shown = false;

  constructor() {
    effect(() => {
      const permitted = this.permissions.has(this.dahcIfPermitted());

      if (permitted && !this.shown) {
        this.container.createEmbeddedView(this.template);
        this.shown = true;
      } else if (!permitted && this.shown) {
        this.container.clear();
        this.shown = false;
      }
    });
  }
}
