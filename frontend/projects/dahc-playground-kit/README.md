# dahc-playground-kit

A reusable component playground for Angular design systems built on DAHC-UI. It provides:

- the shell: header, theme switcher, right-to-left switch, and navigation grouped by section
- token-driven Foundations pages: colour (with live WCAG contrast checks), typography, layout and elevation, and icons
- the building blocks of a component page: `dahc-playground-page` (preview, properties, states, accessibility, source) and the inspector controls (`dahc-inspector-text`, `-choice`, `-toggle`, `dahc-event-log`)
- a source viewer that serves the component's real files, copied into the build, so examples are never maintained by hand

A project supplies only its configuration and its component pages.

## Use in a project

1. Depend on `dahc-ui` and `dahc-playground-kit` (in this workspace: the `paths` in `tsconfig.json`).

2. In `angular.json`, give the playground app the DAHC-UI and kit stylesheets, the icons, and the library sources for the source viewer:

   ```json
   "styles": ["<dahc-ui>/styles/dahc-ui.scss", "<kit>/styles/playground.scss"],
   "assets": [
     { "glob": "*.svg", "input": "<dahc-ui>/assets/icons", "output": "dahc-ui/icons" },
     { "glob": "**/*", "input": "<your library>/src/lib", "output": "source/lib" }
   ]
   ```

3. Describe the design system once:

   ```ts
   export const PLAYGROUND_CONFIG: PlaygroundConfig = {
     title: 'My UI playground',
     titleSuffix: 'My UI',
     tokenPrefix: '--dahc-',           // custom property prefix the Foundations pages read
     groups: ['Components'],
     contrastPairs: [{ foreground: 'text-primary', background: 'surface', minimum: 4.5 }],
     iconNames: DAHC_ICON_NAMES,
     entries: [
       { path: 'button', title: 'Button', group: 'Components',
         loadComponent: () => import('./pages/button-page.component').then(m => m.ButtonPageComponent) },
     ],
   };
   ```

4. Bootstrap the shell:

   ```ts
   bootstrapApplication(PlaygroundShellComponent, {
     providers: [
       providePlayground(PLAYGROUND_CONFIG),
       provideRouter(playgroundRoutes(PLAYGROUND_CONFIG), withComponentInputBinding()),
       provideHttpClient(withFetch()),
     ],
   });
   ```

   with `<dahc-playground-shell></dahc-playground-shell>` in `index.html`.

5. Write one page per component with `dahc-playground-page`, as in `projects/dahc-playground/src/app/pages`.

## Documentation site (NG-ZORRO style)

The shell is a documentation site: a header with search ("/" or Ctrl+K), Docs and Components sections, a grouped side menu, a components overview (`/components/overview`), and component pages with a table of contents.

- **Config:** `version` (shown in the header), `homePath` (for example `docs/introduce`), `docsGroups` (default `['Docs', 'Foundations']`; every other group is a component group), and `pageSourceBaseUrl` (default `source/pages/`).
- **Entries:** optional `description` and `selector` appear in search results and on the overview cards.
- **Component page** (`<dahc-playground-page>`): `heading`, `description`, `sourceFiles`, plus `selector`, `whenToUse` (bullets), `apiFiles` and `exampleColumns`. Its sections are:
  - When To Use
  - Examples: the interactive Playground card from `[preview]` and `[inspector]`, the `[states]` card, then `[examples]`
  - API, generated from the `.ts` source files
  - Accessibility (`[accessibility]`)
  - Source
- **Example card:** `<dahc-doc-example examples exampleId="sizes" heading="Sizes" description="…" template="button-page.component.html">…</dahc-doc-example>`. "Show code" reads the page's own template, so the app must copy its page templates into the build:

  ```json
  { "glob": "*.html", "input": "projects/<app>/src/app/pages", "output": "source/pages" }
  ```

- **API table:** `parseComponentApi(source)` reads signal `input()`, `input.required()`, `model()` and `output()` members with their doc comments, types and defaults. `<dahc-api-table [files]>` renders them.
- **Docs pages:** a project's own docs pages (Introduction, Getting started) can use the global `pg-doc-*` classes (`pg-doc-article`, `pg-doc-title`, `pg-doc-lead`, `pg-doc-section`, `pg-doc-h2`, `pg-doc-list`, `pg-doc-code`, `pg-doc-features`).

## Token conventions the Foundations pages read

| Page | Tokens (after `tokenPrefix`) |
|---|---|
| Colour | primitives declared with a literal `#hex`; semantic roles under `colorPrefix` (default `color-`) |
| Typography | `font-weight-regular`, `-medium`, `-bold`; roles under `typePrefix` (default `type-`) as `<role>-size`, `-line-height`, `-weight`, `-transform` |
| Layout and elevation | `space-*`, `size-*`, `radius-*`, `shadow-*`, `motion-*`, `z-*`; breakpoints from the configuration |
| Icons | the configured `iconNames`, rendered with `dahc-icon` |

The kit's own chrome uses DAHC-UI tokens and components, so DAHC-UI must be loaded.

## Production

The playground is a separate application. It is never part of a product's bundle and has no route in a product, so no development tooling reaches production.
