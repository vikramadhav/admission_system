import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DahcIconComponent, DahcIconName, DahcIconSize } from 'dahc-ui';

import { injectPlaygroundConfig } from '../config';
import { InspectorChoiceComponent } from '../inspector/inspector-choice.component';
import { InspectorTextComponent } from '../inspector/inspector-text.component';

/** Icon foundations: every configured icon, searchable, at every size. */
@Component({
  selector: 'dahc-playground-icons-page',
  templateUrl: './icons-page.component.html',
  styleUrl: './foundations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent, InspectorChoiceComponent, InspectorTextComponent],
})
export class IconsPageComponent {
  private readonly config = injectPlaygroundConfig();

  protected readonly sizes: readonly DahcIconSize[] = ['xs', 'sm', 'md', 'lg'];
  protected readonly size = signal<DahcIconSize>('lg');
  protected readonly filter = signal<string>('');

  /** The configured groups, or one group of every icon; filtered by name, empty groups hidden. */
  protected readonly groups = computed(() => {
    const filter = this.filter().trim().toLowerCase();
    const groups = this.config.iconGroups.length > 0 ? this.config.iconGroups : [{ label: 'Icons', names: this.config.iconNames }];

    return groups
      .map(group => ({
        label: group.label,
        icons: group.names
          .filter(name => name.includes(filter))
          .map(name => ({
            // The configured names come from the design system's own icon registry.
            name: name as DahcIconName,
            directional: this.config.directionalIconNames.has(name),
          })),
      }))
      .filter(group => group.icons.length > 0);
  });

  protected readonly total = computed<number>(() => this.groups().reduce((sum, group) => sum + group.icons.length, 0));
}
