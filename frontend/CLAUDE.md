# Frontend guardrails

- Write only inside `frontend/`. Other folders (BRD/, User_Stories/, Contracts/, docs/, Design_System/, Database_Schema/, backend/, the root standards files) are read-only references. If a change outside `frontend/` seems necessary, stop and ask.
- Follow `dahc-engineering-standards (2).md` Part 2 and `frontend/README.md`: standalone components, OnPush, signals, strict TypeScript, `dahc-` / `Dahc` prefixes.
- No third-party UI libraries, CSS frameworks or Angular CDK. Components use semantic design tokens (`var(--dahc-*)`) only, never raw colour, spacing or size values.
- Don't add or upgrade npm packages without asking. Don't commit or push unless asked.
- Figma MCP is read-only. Never create or edit anything in Figma.
- Design system source of truth: `frontend/docs/design-system/` (tokens, component inventory, architecture, open decisions). Cite Figma node ids for every token and component. Mark values Figma doesn't define as "DAHC proposal" or "A11y fix".
- Current priority (owner decision 2026-11-12, later the same day): complete DAHC-UI by porting every component of `C:\Users\Aichel\Development\dubai-health-ui` (read-only reference) as closely as possible. Don't change `projects/dahc-portal` during this work. Ported components live in their group folder under `projects/dahc-ui/src/lib/` and are exported through `src/lib/ported/<group>.ts`; their playground pages are registered in `projects/dahc-playground/src/app/entries/<group>.entries.ts`.
- End each phase with: files changed, commands run and their results, open questions. Then stop for approval.
