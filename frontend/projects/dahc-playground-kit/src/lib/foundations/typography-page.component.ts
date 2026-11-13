import { ChangeDetectionStrategy, Component, computed } from '@angular/core';

import { injectPlaygroundConfig } from '../config';
import { injectTokenNames, injectTokens } from './foundation-tokens';

interface TypeRole {
  readonly role: string;
  readonly size: string;
  readonly lineHeight: string;
  readonly weight: string;
  readonly transform: string;
}

const ROLE_PARTS = /-(size|line-height|weight|transform)$/;

/** Typography foundations: the base font in each weight and one row per type role token group. */
@Component({
  selector: 'dahc-playground-typography-page',
  templateUrl: './typography-page.component.html',
  styleUrl: './foundations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypographyPageComponent {
  private readonly config = injectPlaygroundConfig();
  private readonly names = injectTokenNames();
  private readonly typeTokens = injectTokens(this.config.typePrefix);

  protected readonly weights = ['regular', 'medium', 'bold'].map(weight => ({
    label: weight,
    value: this.names.cssVar(`font-weight-${weight}`),
  }));

  protected readonly roles = computed<readonly TypeRole[]>(() => {
    const values = new Map(this.typeTokens().map(token => [this.names.shortName(token, this.config.typePrefix), token.resolved]));
    const roleNames = new Set(Array.from(values.keys(), key => key.replace(ROLE_PARTS, '')));

    return Array.from(roleNames, role => ({
      role,
      size: values.get(`${role}-size`) ?? '',
      lineHeight: values.get(`${role}-line-height`) ?? '',
      weight: values.get(`${role}-weight`) ?? '',
      transform: values.get(`${role}-transform`) ?? '',
    }));
  });
}
