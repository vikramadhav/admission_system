import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcTreeComponent, DahcTreeNode } from 'dahc-ui';

import { DocExampleComponent, EventLogComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-tree-page',
  templateUrl: './tree-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,DahcTreeComponent, EventLogComponent, PlaygroundPageComponent],
})
export class TreePageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show hierarchical data that people browse and choose from, such as specialties grouped by department.',
    'Keep the tree shallow; in a form use Tree select or Cascader to pick one value.',
    'Disable nodes that cannot be chosen rather than hiding them, so the structure stays clear.',
  ];
  protected readonly departments: readonly DahcTreeNode[] = [
    {
      label: 'Surgery',
      value: 'surgery',
      children: [
        { label: 'General Surgery', value: 'general-surgery' },
        { label: 'Orthopedics', value: 'orthopedics' },
      ],
    },
    { label: 'Pediatrics', value: 'pediatrics', children: [{ label: 'Neonatal care', value: 'neonatal' }] },
  ];
  protected readonly closedDepartments: readonly DahcTreeNode[] = [
    { label: 'Psychiatry', value: 'psychiatry' },
    { label: 'Dermatology (no intake)', value: 'dermatology', disabled: true },
  ];
  protected readonly openDepartments: readonly string[] = ['surgery', 'pediatrics'];
  protected readonly surgeryOpen: readonly string[] = ['surgery'];
  protected readonly chosenDepartment = signal<string>('orthopedics');

  protected readonly sourceFiles = [
    'data-display/tree/tree.component.ts',
    'data-display/tree/tree.component.html',
    'data-display/tree/tree.component.css',
  ];

  protected readonly value = signal<string>('');
  protected readonly expanded = signal<readonly string[]>(['medicine']);
  protected readonly events = signal<readonly string[]>([]);
  protected readonly items: readonly DahcTreeNode[] = [
    {
      label: 'Medicine',
      value: 'medicine',
      children: [
        { label: 'Internal Medicine', value: 'internal' },
        { label: 'Family Medicine', value: 'family' },
        {
          label: 'Fellowships',
          value: 'fellowships',
          children: [
            { label: 'Adult Cardiology', value: 'cardiology' },
            { label: 'Neonatology', value: 'neonatology' },
          ],
        },
      ],
    },
    { label: 'Dentistry', value: 'dentistry', children: [{ label: 'Orthodontics', value: 'orthodontics' }] },
    { label: 'Pharmacy (closed)', value: 'pharmacy', disabled: true },
  ];

  protected record(value: string): void {
    this.events.update(events => [`nodeSelected (${value})`, ...events]);
  }
}
