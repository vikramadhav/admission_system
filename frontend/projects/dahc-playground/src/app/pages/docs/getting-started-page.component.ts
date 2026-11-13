import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Docs › Getting started: add DAHC UI to an Angular application. Code samples live here as strings. */
@Component({
  selector: 'dahc-getting-started-page',
  templateUrl: './getting-started-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class GettingStartedPageComponent {
  protected readonly angularJson = `"styles": [
  "projects/dahc-ui/src/styles/dahc-ui.scss",
  "src/styles.scss"
],
"assets": [
  { "glob": "*.svg", "input": "projects/dahc-ui/src/assets/icons", "output": "dahc-ui/icons" },
  { "glob": "*.svg", "input": "projects/dahc-ui/src/assets/logo", "output": "dahc-ui/logo" }
]`;

  protected readonly tsconfig = `"paths": {
  "dahc-ui": ["./projects/dahc-ui/src/public-api.ts"]
}`;

  protected readonly component = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DahcButtonComponent, DahcSwitchComponent } from 'dahc-ui';

@Component({
  selector: 'app-settings',
  imports: [DahcButtonComponent, DahcSwitchComponent, ReactiveFormsModule],
  template: \`
    <dahc-switch [formControl]="notifications">E-mail notifications</dahc-switch>
    <button dahc-button type="button" (click)="save()">Save</button>
  \`,
})
export class SettingsComponent {
  protected readonly notifications = new FormControl(true, { nonNullable: true });
  protected save(): void {}
}`;

  protected readonly forms = `form = new FormGroup({
  email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
});

<form [formGroup]="form">
  <dahc-form-field label="E-mail" [required]="true">
    <input dahcInput type="email" formControlName="email" />
  </dahc-form-field>
</form>`;

  protected readonly providers = `export const appConfig: ApplicationConfig = {
  providers: [
    provideDahcConfig({ locale: 'ar-AE' }), // optional: language, direction, reduced motion
    { provide: DAHC_ICON_BASE_URL, useValue: '/assets/dahc-icons/' }, // only if icons are served elsewhere
  ],
};`;
}
