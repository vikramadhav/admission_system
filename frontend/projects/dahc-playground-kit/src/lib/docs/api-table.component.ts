import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { injectPlaygroundConfig } from '../config';
import { ComponentApi, parseComponentApi } from './api-parser';

/**
 * API reference generated from the component's real source files (the same files the Source
 * section shows): one block per component or directive with its inputs, two-way models and outputs.
 */
@Component({
  selector: 'dahc-api-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './docs.scss',
  template: `
    @if (sources.isLoading()) {
      <p class="pg-doc-muted" role="status">Loading the API…</p>
    }
    @for (api of apis(); track api.className) {
      <div class="pg-api">
        <h3 class="pg-api-heading"><code>{{ api.selector || api.className }}</code></h3>
        @if (api.description) {
          <p class="pg-doc-text">{{ api.description }}</p>
        }
        @if (api.inputs.length > 0) {
          <div class="pg-table-scroll" tabindex="0" role="region" [attr.aria-label]="(api.selector || api.className) + ' properties'">
            <table class="pg-table">
              <thead>
                <tr><th scope="col">Property</th><th scope="col">Description</th><th scope="col">Type</th><th scope="col">Default</th></tr>
              </thead>
              <tbody>
                @for (member of api.inputs; track member.name) {
                  <tr>
                    <td><code>{{ member.kind === 'model' ? '[(' + member.name + ')]' : '[' + member.name + ']' }}</code>@if (member.required) {<span class="pg-api-required"> required</span>}</td>
                    <td>{{ member.description || '—' }}</td>
                    <td><code>{{ member.type || '—' }}</code></td>
                    <td><code>{{ member.defaultValue || '—' }}</code></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
        @if (api.outputs.length > 0) {
          <div class="pg-table-scroll" tabindex="0" role="region" [attr.aria-label]="(api.selector || api.className) + ' events'">
            <table class="pg-table">
              <thead>
                <tr><th scope="col">Event</th><th scope="col">Description</th><th scope="col">Payload</th></tr>
              </thead>
              <tbody>
                @for (member of api.outputs; track member.name) {
                  <tr>
                    <td><code>({{ member.name }})</code></td>
                    <td>{{ member.description || '—' }}</td>
                    <td><code>{{ member.type }}</code></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    } @empty {
      @if (!sources.isLoading()) {
        <p class="pg-doc-muted">No component API in these files.</p>
      }
    }
  `,
})
export class ApiTableComponent {
  private readonly http = inject(HttpClient);
  private readonly sourceBaseUrl = injectPlaygroundConfig().sourceBaseUrl;

  /** TypeScript source files, relative to the library sources (sourceBaseUrl). */
  readonly files = input.required<readonly string[]>();

  protected readonly sources = rxResource({
    params: () => this.files().filter(file => file.endsWith('.ts')),
    stream: ({ params }) => forkJoin(params.map(file => this.http.get(`${this.sourceBaseUrl}${file}`, { responseType: 'text' }))),
  });

  protected readonly apis = computed<readonly ComponentApi[]>(() =>
    (this.sources.hasValue() ? this.sources.value() : []).flatMap(source => parseComponentApi(source)),
  );
}
