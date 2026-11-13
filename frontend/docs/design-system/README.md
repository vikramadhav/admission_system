# DAHC-UI design system: Phase 1 analysis

Status: **draft for review**. Nothing here is implemented yet. Phase 2 starts only after the decisions in [06-gaps-risks-recommendations.md](06-gaps-risks-recommendations.md) are answered.

DAHC-UI is the shared Angular design system and component library for Dubai Health applications. The GME admission portal is its first consumer, not its definition.

## Sources

| Source | Role | Figma file key |
|---|---|---|
| [DH Design System REF](https://www.figma.com/design/FozlGvhO1ZjI2GbklegqFf/DH-Design-System-REF?node-id=0-1) (Dubai Health Standard UI) | **Primary.** Tokens, component styles and patterns come from here. | `FozlGvhO1ZjI2GbklegqFf` |
| [GME](https://www.figma.com/design/49e9Tehx9N8XupCFJC98cW/GME?node-id=0-1) (candidate admission application) | **Consumer.** Used only to find shared component needs and variations. | `49e9Tehx9N8XupCFJC98cW` |
| `Design_System/UIUX/*.png` (repository) | Older GME screens. Superseded by the GME Figma file. | n/a |
| `frontend/projects/dahc-ui` (current code) | Existing library: 11 components, with tokens sampled from the PNGs rather than from Figma. | n/a |

Both Figma files were inspected **read-only** through Figma MCP on 2026-11-12. Nothing in Figma was changed.

## Documents

| # | Document | Deliverable |
|---|---|---|
| 1 | [01-dh-standard-ui-analysis.md](01-dh-standard-ui-analysis.md) | Figma analysis: Dubai Health Standard UI |
| 2 | [02-gme-analysis.md](02-gme-analysis.md) | Figma analysis: GME |
| 3 | [03-design-tokens.md](03-design-tokens.md) | Proposed DAHC-UI design tokens |
| 4, 5 | [04-component-inventory.md](04-component-inventory.md) | Shared component inventory, with variants and interaction states |
| 6, 7, 8 | [05-architecture.md](05-architecture.md) | Angular architecture, folder structure, playground architecture |
| 9 | [07-implementation-roadmap.md](07-implementation-roadmap.md) | Implementation roadmap |
| 10 | [06-gaps-risks-recommendations.md](06-gaps-risks-recommendations.md) | Gaps, risks, recommendations, and the decisions needed |
| raw | [figma-extracts/](figma-extracts/) | Full extraction notes with exact values and node ids for every item. They are the evidence behind the documents above. |

## Summary

1. **The DH file is a style guide with some components, not a complete component library.** The foundations are solid: Dubai font, navy palette, 8 secondary hues with tints, 4 shadows and about 200 icons. It has 19 real component sets, but most of the "Content Components" page is page examples built from frames.
2. **The DH file has no semantic tokens, no dark mode, and no spacing, radius, breakpoint or motion tokens.** DAHC-UI has to add a semantic layer on top of the Figma palette (03).
3. **No component in either file has a focus state, and several core colours fail WCAG 2.2 AA:**
   - Secondary Blue #32AFFC: 2.42:1 against white.
   - Red #FF8F8A: 2.2:1.
   - Placeholder #8099B2: 2.95:1.

   Figma already proposes the replacement link colour #037BC5 (4.52:1) in an annotation. Accessible fixes need sign-off from the UX owner.
4. **Several requested components are absent from both files:** datepicker (the DH page is empty), time picker, switch, textarea, drawer, avatar, a data table, action menu, toast, progress and skeleton. Following your instruction, they're listed as gaps that need design and aren't invented (04).
5. **GME isn't linked to the DH library and drifts from it.** Its buttons are 40/44/48 px with 14–16 px labels, where the DH buttons use 18 px labels. Cards use radius 16 against 12 in DH, and inputs use radius 10. GME also has its own type sizes (13 and 15 px). Who wins in each conflict needs a decision.
6. **GME needs a few patterns the DH file lacks:** a vertical stepper with sub-steps, a file upload, a wizard action bar, a key/value grid and stat tiles. They're proposed as DAHC-UI components because they're generic. The ranked preference picker and portfolio question card stay in the app.
7. **Architecture:** keep the existing Angular 22 workspace (`dahc-ui` library, `dahc-playground` app, `dahc-portal` app). Restructure `dahc-ui` into foundations, core primitives and component groups. The playground stays a separate app that is never deployed with the portal, which meets the requirement that development tools never reach production.
