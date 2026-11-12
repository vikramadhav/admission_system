---
paths:
  - "frontend/**"
---

# Frontend rules

Follow `docs/angular-structure-and-guidelines.md`.

## Components and styling

- The portal is built only from `dahc-ui` components and tokens. Do not add third-party UI libraries or the Angular CDK.
- Every new `dahc-ui` component gets:
  - a playground page;
  - Playwright specs with axe;
  - support for LTR and RTL (en-AE, ar-AE) and both themes.

## Data and the API

- Screens are checked against the BRD field inventory (`docs/audits/appendix-b-brd-inventory.md` §6), never against the screenshots.
- Screens are driven by API responses. Never decode tokens, and never send roles, profile or identity data to the API.
- Contract first: an API change starts in `openapi.yaml`.
- The Playwright API mock is used only until the endpoint lands.

## Text and tests

- All user-visible text goes through `@angular/localize`. There is one build per locale.
- Playwright is the end-to-end test tool. Name specs by requirement: `test.describe('US-x.y.z …')`.

## Packages

- Approved packages are listed in the guidelines' decisions table.
- Versions in `package.json` are exact. Install with `npm ci` from the committed `package-lock.json`.
