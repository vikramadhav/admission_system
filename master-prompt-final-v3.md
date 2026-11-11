# Master Prompt (FINAL v3): Admissions Platform: Planning and AI-Native SDLC Foundation

**Purpose of this run:** produce the Markdown documentation, Claude Code configuration, design-first contract skeleton, the architecture of our own Angular UI framework (Part C, extracted from Figma) and the story backlog from which the team starts implementing user stories, one at a time. **This run does not implement the system or the UI framework, and installs nothing.**

<!--
BEFORE YOU RUN (operator notes, not part of the prompt; v3 + Part C: custom Angular UI framework driven by Figma MCP):
1. Git with GitHub. Make sure `main` is up to date (`git switch main && git pull`), commit or stash local changes, then create a branch: `git switch -c chore/sdlc-foundation`. When the run is done, ask Claude to commit and push if you want it to, then open the PR and merge it yourself in GitHub.
2. Inputs stay where they are. The repo root already contains: `ADO_Import/`, `BRD/`, `Contracts/`, `Database Schema/`, `Design_System/`, `User-Stories/`, `README.md`. There is no `_input/` folder; do not create one or move anything. Phase 0 reads all of them first.
   - Put the team coding standard at `docs/development/coding-standards.md` before starting (create the folders). It replaces the legacy MVC standards skill. Nothing else goes under `docs/` yet.
3. Install the toolset (you, not Claude; Claude never installs anything). Verify each prerequisite against the plugin's README:
   - Language servers on PATH: the C# language server named in the csharp-lsp README (e.g. `dotnet tool install --global csharp-ls`) and `npm install -g typescript-language-server typescript`.
   - In Claude Code:
     /plugin install csharp-lsp@claude-plugins-official
     /plugin install typescript-lsp@claude-plugins-official
     /plugin install security-guidance@claude-plugins-official
     /plugin marketplace add dotnet/skills
     /plugin install <plugin>@dotnet-agent-skills   (browse with /plugin; install ONLY the core, EF Core/data access and testing plugins)
   - From the repo root, outside Claude Code: `npx skills add https://github.com/angular/skills` (choose project scope so the skills are committed and shared; note the commit/version it installed).
   - Restart Claude Code afterwards.
   - Connect the Figma MCP server (follow Figma's current MCP setup docs, or authorize the claude.ai Figma connector) and confirm with `/mcp` that it is connected and can read the design files.
   - List every Figma file that forms the design system and the screen designs (URL, purpose, owner) in `docs/design/figma-files.md`. Do NOT install Playwright yet: it is proposed in an ADR and installed only after approval (Part C).
4. Decide the roles (asked for at Gate 2): Product Owner, Tech Lead, and policy owners for security/data protection, API standards and UX (the UX owner also signs off the Figma-to-token mapping and component specs). Also decide who builds the process core (track 1) and who builds the UI framework (Part C) while the others start on features.
5. Start Claude Code in plan mode with the strongest available model: `claude --permission-mode plan`.
6. Paste everything below the line. Expect 7 stops: Gates 0, 1, 2, 3, 3B (catalog), 3B (skills) and 4. You may `/clear` between phases; every phase resumes from files on disk.
7. After Phase 3: run `/context` (check startup size, including plugin and vendor-skill descriptions) and `/doctor prompt-audit` (v2.1.283+).
-->

---

# PART A: Role, playbook alignment, process

## Role

Act as principal architect (ASP.NET Core 10, SQL Server, Angular), database architect, design-system and UI framework architect (Angular, TypeScript, HTML, SCSS, accessibility, theming), technical reviewer and Claude Code configuration specialist.

Implement Anthropic's **AI-Native SDLC Playbook** (https://claude.com/resources/articles/the-ai-native-sdlc-playbook) as it applies to this team. Do not simply agree with these instructions: challenge weak points with alternatives and justification. Humans stay accountable for every judgment call.

## Playbook alignment (the design contract for everything below)

### Principles

1. **Every stage ends by committing an artifact that the next stage reads.** The chain on each story branch (story → spec → plan → diff + tests), followed by the GitHub PR with Claude's review findings and human approval, is the audit trail: who asked, what the agent produced, who approved.
2. **Nothing is implemented without an accepted plan.** Plans are made in **plan mode** and committed as `plan.md`.
3. **Institutional knowledge lives in files the agent reads.** `CLAUDE.md` holds facts needed every session. **Policy skills** hold standards that must be applied consistently, including while writing specs. **Architecture skills** encode the approved, recurring implementation patterns of the finalized architecture. Path-scoped rules hold code-level constraints. Every project skill follows one authoring standard (`/create-skill`). **Vendor plugins and skills** (see "Approved toolset") supply generic platform knowledge; project files override them.
4. **Skills are advisory; hooks and permissions are deterministic.** Any policy that must always hold is backed by a hook or permission rule.
5. **Every session verifies its own work** (build, tests, lint, visual check) and pastes the evidence. A bug fix starts with a failing test that the agent cannot edit.
6. **Review runs in layers.** The `security-guidance` plugin flags risky patterns while editing; Claude runs bugs, security and compliance passes from `REVIEW.md`; a human code owner approves. The agent that wrote the code never approves it.
7. **One named source of truth per artifact**, in Git and GitHub. Stories, specs, plans, contracts and requirements link to each other by key; PRs carry the story key.
8. **The configuration is code.** Changes to `CLAUDE.md`, `.claude/**` (including installed vendor skills) and `REVIEW.md` go through a GitHub PR. When Claude repeats a mistake twice, the fix goes into `CLAUDE.md` or the relevant rule or skill.
9. **Figma decides the design; we own the code.** Every design token and component specification traces to a Figma node. Claude never invents a design decision that Figma specifies; where Figma is silent or contradictory, it raises a question for the UX policy owner. All UI components, styles, utilities and layout code are our own (Part C); no third-party UI library or CSS framework.

### Stage mapping

| Playbook stage | This project | Artifact (committed) | Approver |
|---|---|---|---|
| Plan | BRD analysis (system); backlog as feature and story files (Phase 4); `story.md` is each change's intent | `docs/requirements/**`, `docs/stories/**/feature.md`, `story.md` | Product Owner |
| Design | `/write-spec`, applying the policy skills and flagging concerns | `spec.md` | Product Owner (+ policy owner for flagged concerns) |
| Build | `/plan-story` in plan mode, then `/implement-story` | `plan.md`, diff + tests | Developer; Tech Lead if high-risk |
| Test | Feedback loop, `verifier` subagent, bug-first tests, guard hook | Pasted evidence in the PR description | Code owner |
| Deploy (review only) | `/review-story`, `REVIEW.md`, GitHub branch protection | PR with findings | Human reviewer approves; **user merges the PR in GitHub** |
| Maintain | Bugs, incidents and change requests start again as a new `story.md` (via `/write-spec "…"`) | `story.md` | Product Owner |

Out of scope for now (document as follow-ups):
- CI evals
- Claude GitHub Actions / automated PR review, CI pipelines, Azure DevOps (the existing `ADO_Import/` folder is input only; see Phase 0)
- Deployment automation
- Managed settings
- Monitoring loops

Claude never deploys. Production releases need a human release authorization.

### Sources of truth

| Artifact | Source of truth | Linkage |
|---|---|---|
| Original BRD | `BRD/` (read-only; version and date recorded) | Extracted sections in Git cite page and section |
| Requirements (REQ/BR/WF/ROLE) | Git (`docs/requirements/`) | Stories list their REQ IDs |
| Legacy stories and ADO export | `User-Stories/`, `ADO_Import/` (read-only history once migrated) | Migrated stories keep their old IDs in `legacy_ids` |
| Features and stories: content, state, owner, dependencies, approvals | Git (`feature.md` and `story.md` front matter in `docs/stories/**`) | One folder per feature (`F-<MOD>-NN`) holding one folder per story; story keys `S-<MOD>-NNN`, `WF-P<N>` or `B-NNN` |
| Spec, plan, review, ADRs, standards, configuration | Git | Contain the story key and REQ IDs |
| Design system foundations and component specs | **Figma** (primary; files listed in `docs/design/figma-files.md`; read via Figma MCP; changes only via the UX policy owner) | Extracted per node into `docs/ui-framework/figma/`; every token and component cites its Figma file and node ID |
| `Design_System/` (repository copy) | `Design_System/` (read-only reference) | Compared with Figma in Phase 0/1; where they differ, **Figma wins** and the difference is listed for the UX policy owner |
| Screen designs (Figma) | Figma, referenced per story in `ui:` | Not available for every story yet (see `ui: pending`) |
| Design tokens in code | The committed token source in the UI framework (format per ADR), generated from Figma variables | SCSS variables and CSS custom properties are **generated** from it; never hand-edited |
| UI framework components | Git (the UI framework library, Part C) | Each component links its Figma node and its `S-UIK-NNN` story; docs, API tables and copy-paste source are generated from the library source |
| Existing database schema | `Database Schema/` (read-only reference) | Verified against the BRD; new schema only through EF migrations in stories |
| API contract (design-first OpenAPI) | Git (`Contracts/openapi/`) | Stories list the operationIds they add or change |
| Story dependency map (edges, waves, ready list) | Git (`docs/stories/story-map.md`), **generated** from the story front matter | Never hand-edited |
| Review findings, approvals, merge | GitHub PR | PR title and branch name carry the story key |

### Roles and risk tiers

- **Product Owner (PO):** answers BRD questions; approves stories (`story.md`) and `spec.md`; decides whether a story with no screen design may be built by composing from the design system.
- **Tech Lead:** approves architecture, ADRs, high-risk `plan.md`, configuration changes and vendor plugin/skill updates; assigns or reassigns features when needed.
- **Feature owner (developer):** owns a feature end to end (contract, database, API, Angular UI, tests) across all its stories; approves routine `plan.md` for those stories.
- **Reviewer (another developer, not the author):** approves the PR in GitHub. Reviewers rotate so every developer learns every area; high-risk PRs go to a developer who has worked on the process core. **The user merges it in GitHub.**
- **Policy owners:** sign off changes to their policy skill. The UX policy owner also owns `Design_System/`, answers Figma questions, and approves the Figma-to-token mapping, component specs and visual baseline changes.
- **High-risk changes:** process core (lifecycle, coordination, assignment, configuration versioning), authentication/authorization, schema and migrations, concurrency and assignment, audit, PII handling, cross-module or public API contracts, and the UI framework's public surface (token contract, theme engine, component inputs/outputs once consumed).
  - Tech Lead approves the plan.
  - Review runs with `security`/`concurrency` focus.
- **Routine changes:** everything else.

## Approved toolset (plugins and vendor skills)

Installed by the operator before this run. Claude never installs, updates or removes them; it verifies them in Phase 0 and configures their use.

| Tool | Source | Purpose in this project |
|---|---|---|
| `csharp-lsp` | Anthropic (`claude-plugins-official`) | C# code intelligence: go-to-definition, find references, diagnostics. Use instead of text search for symbol navigation. |
| `typescript-lsp` | Anthropic (`claude-plugins-official`) | The same for the Angular code. |
| `security-guidance` | Anthropic (`claude-plugins-official`) | Flags injection, XSS, secrets, IDOR and auth-bypass patterns while Claude edits. First review layer; does not replace `security-policy` or the `REVIEW.md` security pass. |
| .NET skills: core, EF Core/data access, testing | Microsoft (`dotnet/skills`, marketplace `dotnet-agent-skills`) | Current .NET, EF Core and testing practice. No other plugins from this marketplace. |
| Angular official skills | Angular team (`angular/skills`, via `npx skills add`) | Current Angular practice: Signals, standalone components. |
| Figma MCP server | Connected by the operator (`/mcp`) | **Read-only** inspection of the design files: variables and modes, styles, components and variants, annotations, node screenshots. Primary design source of truth (Part C). |
| Playwright Test | Microsoft (`@playwright/test`) | **Planned, not installed.** UI and component behaviour, accessibility and visual validation against the docs/playground app (Part C §C7). Proposed in an ADR; installed by the operator only after approval, in the first UI framework phase. |

Rules:
- **Precedence:** hooks and permissions → `CLAUDE.md` non-negotiables and accepted ADRs → policy skills → path rules and `docs/development/coding-standards.md` → project architecture skills → vendor plugins and skills. When vendor guidance conflicts with a project file (e.g. a store library, a repository pattern, MediatR, InMemory tests), the project file wins; record the conflict in the "Vendor overrides" list in `docs/development/workflow.md`.
- **Link, don't duplicate:** project skills and rules never restate generic .NET, EF Core, testing or Angular guidance that a vendor skill already provides; they hold only the project-specific decisions and link to the vendor skill by name.
- **Vendor skill files are read-only.** They are updated only by re-running the install command in a `chore/` PR approved by the Tech Lead, followed by the trigger-overlap check (Phase 3B).
- **LSP is not verification.** LSP diagnostics help navigation and early feedback; build, test and lint output remain the evidence.
- **Figma MCP is read-only for Claude.** Claude never creates, edits or deletes Figma nodes, variables, styles or comments, and never runs code in Figma, unless the UX policy owner explicitly asks in that conversation. Write and execute tools of the Figma server are denied in `settings.json`. Record which Figma MCP server and tools are used in the toolset ADR.
- **No third-party UI.** Vendor skills that suggest Angular Material, CDK-based components, Tailwind or any other UI library are overridden by Part C; record each case in "Vendor overrides".
- These are developer tooling, not runtime dependencies; record them in one ADR ("Claude Code toolset: plugins and vendor skills", status `Accepted` by operator instruction, approved at Gate 2) with versions, install scope, precedence and update procedure.

## Git, GitHub and docs-based stories

- **Branching:**
  - Every story, core phase or bug gets its **own branch, created from the latest `main`**:
    - `feature/<key>-<slug>` for stories and core phases
    - `fix/B-NNN-<slug>` for bugs
    - `chore/<slug>` for configuration and docs
  - When the work is done, it goes to `main` through a **pull request on GitHub**. The **user merges the PR in GitHub**.
  - The next story starts again from the updated `main`.
- **Claude never commits, pushes or opens a PR unless the user explicitly asks in that conversation.** It never merges, never force-pushes, and never commits to `main`. Settings permissions and the guard hook enforce this.
- Stories, specs and plans are Markdown in `docs/stories/` and travel with the story's branch, so each PR contains the whole chain: story → spec → plan → code + tests.
- **Story folders**, one per story, core phase or bug:

  ```text
  docs/stories/
    README.md                       # how stories work (≤60 lines)
    story-map.md                    # GENERATED from story front matter; never hand-edited
    core/WF-P<N>-<slug>/            story.md  spec.md  plan.md
    <module>/F-<MOD>-NN-<slug>/     feature.md                     # feature intent (≤30 lines)
      S-<MOD>-NNN-<slug>/           story.md  spec.md  plan.md
    bugs/B-NNN-<slug>/              story.md  spec.md  plan.md
  ```

  `spec.md` and `plan.md` are created on the story branch when the story is started; Phase 4 creates only `feature.md` and `story.md`.
- **Features are the unit of ownership; stories are the unit of change.**
  - Every developer works full-stack. A feature (a capability or user journey within one module, 3–8 stories) is owned end to end by one developer: contract, database, API, Angular UI and tests.
  - `feature.md` (≤30 lines) holds flat front matter (`key: F-<MOD>-NN`, `title`, `module`, `requirements`, `depends_on` on other features or core phases with type, optional `owner`) and a body with the goal, the stories in build order and the UI coverage. It holds no state; feature state is derived from its stories.
  - Each story is still one branch and one PR, so reviews stay small. Stories are vertical slices that deliver working behaviour through every layer they touch.
  - **Feature claim:** a feature is claimed while any of its stories is claimed or `done` and not all are `done`. Its owner is the `owner:` in `feature.md` if the Tech Lead set one; otherwise the `owner` of its done stories or the author of its claiming branch. Only the owner picks further stories from a claimed feature.
- **`story.md` is the intent.**
  - Its front matter is the **single source** for state, owner, dependencies and links.
  - Its body holds the user statement ("As a / I want / so that"), Given/When/Then AC (including permission-denied and invalid-state cases), process and UI notes, and out of scope (≤40 lines).
  - Keep the front matter flat so a dependency-free script can parse it. Format example only:

  ```yaml
  ---
  key: S-ADM-012
  title: Save application draft
  module: admissions
  feature: F-ADM-03      # the feature folder this story lives in
  type: story            # story | contract | data | core | spike | bug
  layers: [contract, db, api, ui]   # layers this slice touches
  size: M                # S | M (≤3 developer-days; split anything larger)
  risk: routine          # routine | high
  state: draft           # draft | ready | spec-approved | plan-approved | in-progress | in-review | done | blocked
  owner:
  ui: compose            # none | figma:<frame-ref> | compose | pending
  components: [button, text-field, form-field]   # UI framework components the slice uses
  depends_on: [S-ADM-010:contract, WF-P2:core, S-UIK-004:component]
  conflicts_with: [S-ADM-015]
  requirements: [REQ-ADM-004, BR-ADM-002]
  operations: [saveApplicationDraft]
  tables: [Application]
  legacy_ids: []         # IDs from User-Stories/ or ADO_Import/, for traceability
  approvals: []          # appended by skills, e.g. story:<PO name>:<date>
  ---
  ```

  Every `depends_on` entry is `key:type`, where type is `contract`, `data`, `core`, `component`, `functional`, `permission` or `external`. A `component` dependency points to the UI framework story (`S-UIK-NNN`) that delivers a component the slice needs. The body has a short "Dependencies" table giving the reason for each.
- **UI designs are partial.** Screen designs do not exist for every story yet; the design system foundations and component specs live in Figma (Part C).
  - `ui: figma:<ref>`: a screen design exists; build to it with UI framework components.
  - `ui: compose`: the PO accepted building the screen from existing UI framework components and design-system patterns (`ux-standards` rules for screens without Figma apply).
  - `ui: pending`: a screen design is expected but missing. A story that touches `ui` and has `ui: pending` is **not ready**. Split the UI part into its own story so the rest of the feature can proceed; the PO moves the story to `compose`, or the designer supplies the reference.
  - `ui: none`: the story has no UI layer (contract, data, core, or a backend-only slice).
- **State transitions:**

  | From → To | Who approves | Set by |
  |---|---|---|
  | draft → ready | PO | Phase 4 / `/prepare-backlog` |
  | ready → spec-approved | PO (policy owner for flagged concerns) | `/write-spec` (first creates the story branch from the latest `main`) |
  | spec-approved → plan-approved | Developer (Tech Lead if high-risk) | `/plan-story` |
  | plan-approved → in-progress | Developer takes ownership | `/implement-story` |
  | in-progress → in-review | Claude review complete | `/review-story` |
  | in-review → done | Reviewer approves the PR; user merges in GitHub | `/complete-story` sets `done` as the last change on the branch, so `main` shows `done` exactly when the PR is merged |
  | any → blocked | Anyone, with the reason in the body | Any skill |

  Skills change `state` and append to `approvals` only when the named approver confirms in chat. Changes are committed only when the user asks.

  **In progress = a branch exists.** Story state on `main` stays `ready` until the PR is merged. A story counts as **claimed** when a `feature/<key>-*` or `fix/<key>-*` branch exists locally or on `origin` (after `git fetch`). This stops two developers from picking the same story. Features are claimed as described under "Features are the unit of ownership".
- **Generated story map:** `.claude/skills/prepare-backlog/scripts/build-story-map.mjs` (Node, no dependencies, ≤150 lines).
  - It reads every story's front matter and writes `story-map.md` with:
    - A feature table (key, title, owner, stories done/total, wave) and a story table (key, feature, title, state, owner, ui, wave)
    - **Waves** (topological levels; wave 0 = no dependencies)
    - The critical path
    - Conflict groups
    - Mermaid graphs: per module at story level grouped by feature, plus a cross-module graph at feature level
    - The current **ready** list: unclaimed features whose hard predecessors are `done` (pickable by any developer), and for each claimed feature its next ready stories (pickable by its owner). A story is ready when it is `ready` on `main`, its hard predecessors are `done` on `main`, no branch claims it, no conflict-group member is claimed, and, if it touches `ui`, its `ui` is not `pending`. The script reads branch names and branch authors with read-only git commands.
    - A **UI-pending** list: stories waiting for a screen design, so the PO and designer can prioritise.
  - It exits non-zero on cycles, unknown keys or missing fields. `--check` validates without writing.
  - Claude always runs the script instead of editing the map.
- **Pull request flow:**
  1. `/review-story` writes the PR description draft to `.work/pr/<key>.md` (gitignored), using `.github/pull_request_template.md`. It includes Claude's findings in the `REVIEW.md` format, verifier evidence and test output.
  2. `/complete-story` checks the Definition of Done and sets `done`. When the user asks, it commits and pushes the branch, then opens the PR (`gh pr create --title "<key>: …" --body-file .work/pr/<key>.md`); otherwise it hands the user the title and body.
  3. A reviewer who is not the author reviews and approves in GitHub, and the **user merges in GitHub**. Claude never merges.
  4. After the merge, the next story starts from the updated `main`.

## Output contract (what this run may and may not produce)

This run is planning and setup only. Its end state: **every developer can pick a ready story and start it with `/pick-story` → `/write-spec`**, using only the files this run produced.

- **Allowed outputs:**
  - Markdown files
  - These non-Markdown files, and no others:
    - `.claude/settings.json` (including the plugin marketplace and enabled-plugin declarations)
    - `.claude/hooks/pre-edit-guard.mjs`
    - Skill check scripts, only where Phase 3B approves them
    - `.gitignore` additions
    - `.editorconfig` (from the appendix of `docs/development/coding-standards.md`) and the matching edit to that file
    - `.github/pull_request_template.md`
    - `Contracts/openapi/openapi.yml` + `common/*.yml` (shared components only)
    - `.claude/skills/prepare-backlog/scripts/build-story-map.mjs` (the story-map generator)
- **Never produced:**
  - Application or process-core source code
  - UI framework source: components, SCSS, token files, theme engine, utilities, docs/playground app, Playwright config or tests (Figma extraction is recorded as Markdown only; code comes in UI framework stories after approval)
  - Any change to Figma files
  - Solution or project files, including `Directory.Build.props` and `Directory.Packages.props` (they come with scaffolding in the first core phase, as the coding standard describes)
  - Package manifests or installs (including plugin installs and `npx skills add`)
  - Migrations or SQL scripts
  - Module API operations
  - CI or deployment configuration
  - Any change to existing source code
  - Any edit to `BRD/`, `ADO_Import/`, `User-Stories/`, `Database Schema/`, `Design_System/` or installed vendor skills
- **Existing files:** read first, reused and updated in place. Never silently overwritten, never deleted without approval (Phase 0).

## Scope of this run

- **In scope:**
  - Complete BRD analysis and the clarification loop
  - Claude Code configuration: `CLAUDE.md`, settings (including plugin declarations), guard hook, rules, skills, agents
  - Integration of the approved toolset: precedence, overlap checks, documentation
  - `REVIEW.md` and the GitHub PR template
  - Architecture docs and ADRs
  - Business process management design (Part B)
  - Core phase specs and roadmap
  - Feature and user-story breakdown for every module, as files in `docs/stories/` (migrating and verifying the existing `User-Stories/` and `ADO_Import/` content), with a generated dependency map and waves showing which stories can be picked independently
  - Design-first OpenAPI contract skeleton (`Contracts/openapi/`: shared components only)
  - **UI framework (Part C):** read-only Figma inspection and extraction of foundations and component specs into Markdown; the UI framework architecture, conventions, theming, documentation/playground and Playwright validation design; its ADRs; its features and stories (`F-UIK-*`, `S-UIK-*`) and roadmap
  - Evals README
- **Out of scope until Gate 4 and a per-phase approval:**
  - Application or process-core code
  - UI framework code, Angular workspace/library scaffolding, and installing Playwright or any other dependency
  - Solution and project scaffolding
  - Migrations
  - GitHub Actions, CI pipelines and Azure DevOps

## Fixed context

- **Team:** 3 full-stack developers, all using Claude Code with the approved toolset. Each developer takes a feature and builds it end to end (contract, database, API, Angular UI, tests). There are no backend or frontend lanes. The process core (track 1) is backend-only work; the UI framework (Part C) is frontend-only enabler work; who builds each, and what the others do meanwhile, is decided at Gate 2 (see B17 and C9).
- **Mandatory stack:** .NET 10, C#, ASP.NET Core 10 Web API, EF Core 10, SQL Server, Angular + TypeScript + HTML + SCSS (latest stable the environment supports; record it in an ADR), our own Angular UI framework (Part C), Playwright for UI validation (after approval), Git with GitHub (one branch per story from `main`; PRs merged by the user in GitHub). Stories, specs and plans are Markdown in `docs/stories/`.
- **Banned UI packages:** third-party UI component libraries and CSS frameworks, including Bootstrap, Angular Material, NG-ZORRO, PrimeNG, Tailwind CSS and equivalents (e.g. Ant Design, Kendo UI, DevExtreme, Clarity, Bulma, Foundation, Ionic components), and their CSS, themes and component wrappers. Whether the first-party Angular CDK (behaviour primitives only, no styles) is allowed is a Gate 2 decision recorded in an ADR; until accepted, it is banned too.
- **Repository root as found** (all inputs; read in Phase 0):

  | Folder | Expected content | Treatment |
  |---|---|---|
  | `BRD/` | The BRD (all pages) | Read-only. Sole authority for business rules. |
  | `User-Stories/` | Existing user stories | Read-only draft; verified against the BRD, then migrated into `docs/stories/` (Phase 4). |
  | `ADO_Import/` | Azure DevOps import/export of work items | Read-only draft; same as `User-Stories/`. ADO is not a source of truth unless Gate 0 decides otherwise. |
  | `Contracts/` | Existing API contracts | Becomes the contract home: the design-first contract lives in `Contracts/openapi/`. Existing files are classified in Phase 0. |
  | `Database Schema/` | Existing schema (DDL, diagrams or model) | Read-only reference; verified against the BRD and Part B in Phases 1–2; input to `04-database-design.md`. Never edited. |
  | `Design_System/` | Design system: tokens, components, patterns | Read-only reference. Compared with Figma; Figma wins on differences. Indexed by `docs/design/design-system.md`. |
  | Figma (external, via MCP) | Design foundations, component specs, screen designs | Read-only, primary design source of truth. Files listed by the operator in `docs/design/figma-files.md`. |
  | `docs/design/figma-files.md` | Figma file list (URL, purpose, owner) | Written by the operator; Claude adds file keys and versions found in Phase 0. |
  | `README.md` | Project readme | Update in place only with Gate 0 approval. |
  | `docs/development/coding-standards.md` | Team C# coding standard (owner: Tech Lead) | Current and authoritative for C# code style; rules and skills link to it. Phase 2 checks it against the design; Phase 3 moves its `.editorconfig` appendix into a real `.editorconfig`. |

- **Paths and platform:** the team works on Windows; CI may run on Linux.
  - `Contracts/` already exists with an uppercase C. Use `Contracts/openapi/` everywhere (rules, hook, scripts, docs) with exactly that casing; never create a lowercase `contracts/` (it collides on case-insensitive file systems and splits on Linux).
  - `Database Schema/` contains a space: quote it in every command and glob.
  - The hook and scripts normalize `\` to `/` and match paths case-insensitively.
- **Hosting:** multiple stateless API instances behind load balancers, reverse proxies and firewalls; enterprise authentication; restricted network.
- **Sandbox:** no access to the final identity provider.
- **No new infrastructure, and no third-party workflow, orchestration, scheduling or messaging packages** (Elsa, Workflow Core, Flowable, Temporal, Logic Apps for core processes, BPMN or scripting engines, Hangfire, Quartz, MassTransit, MediatR). Any other runtime dependency needs a `Proposed` ADR. The approved toolset is developer tooling, covered by its own ADR.
- **Architecture direction:** hybrid business process management with explicit C# process services (Part B). This is to be validated against the BRD, not assumed.
- The BRD is the sole authority for business rules. Existing stories, contracts and schema are drafts to verify. Examples in this prompt are illustrative only.

## Gated process (do not skip, merge or reorder)

| Phase | Output | Gate and approver |
|---|---|---|
| 0. Read existing files, inspect Figma, verify toolset | Inventory + Figma inventory + reuse plan + toolset status (chat) | **Gate 0 (Tech Lead):** reuse plan approved |
| 1. Full BRD analysis + Figma extraction | Requirement files, Figma foundations and component specs + open questions | **Gate 1 (PO + Tech Lead; UX owner for Figma questions):** no blocking questions left open |
| 2. Fit and design proposal (incl. UI framework architecture and roadmap) | Chat only | **Gate 2 (Tech Lead; UX owner for the UI framework):** proposal approved; roles named |
| 3. Generate foundation and architecture | Configuration, hook, policy skills, architecture and process docs 01–07 | **Gate 3 (Tech Lead; PO for scope; policy owners for their skills):** approved |
| 3B. Architecture skills | Skill catalog, then architecture skills generated from the approved architecture | **Gate 3B (Tech Lead; policy owners where relevant):** catalog approved, then skills approved |
| 4. Plans and backlog | Core phase specs, implementation plan, feature and story breakdown + dependency map + waves, roadmap | **Gate 4 (Tech Lead + PO):** approved, then stop |

At each gate: summarize in ≤40 lines what is decided, open and risky, then **stop and wait**.

---

## Phase 0: Read the existing files first (before anything else)

The folder already contains files. Understand them before creating anything.

### 0.1 Inventory

List every file. Skip `bin/`, `obj/`, `node_modules/`, `dist/`, `.git/` and binaries other than the BRD, diagrams, design-system assets and work-item exports. Read in full every:
- Markdown and text document, including the root `README.md`
- `CLAUDE.md`, `AGENTS.md`, `CLAUDE.local.md` (if present)
- Everything under `.claude/`, including vendor skills installed by `npx skills add` (record their folder names and installed version; they are not reviewed against the project authoring standard)
- Everything in `BRD/`, `User-Stories/`, `ADO_Import/` (CSV/XLSX/JSON exports included), `Contracts/`, `Database Schema/` and `Design_System/`
- Any ADR, plan, backlog, requirement or analysis file
- Workflow diagram references and Figma references, wherever they appear

For `Design_System/`: read token files and documentation in full; list image and binary assets without reading them. Build a first **screen-coverage table**: which modules or stories have a Figma reference and which do not.

For **Figma** (read-only, via the Figma MCP server, files from `docs/design/figma-files.md`): list each file's key, version or last-modified date, pages, variable collections and modes (light/dark/brand), style counts (color, text, effect, grid), and component sets with variant counts. Do not extract details yet (that is Phase 1.5). Note where `Design_System/` and Figma visibly disagree, and any Figma file that cannot be read.

For `Database Schema/`: record whether it describes an applied database (facts that constrain the design) or a draft design (to verify). Ask if unclear.

For `Contracts/`: record the format (OpenAPI version, YAML/JSON, single or multi-file) and which operations exist.

**If source code exists:** inspect only its structure (solution and project files, top-level folders, existing EF migrations, public API surface) to understand what is already built. Never modify it.

### 0.2 Verify the toolset (read-only)

Report, without installing anything:
- Which of `csharp-lsp`, `typescript-lsp`, `security-guidance` and the `dotnet-agent-skills` plugins are installed and enabled, and their versions. Flag any extra plugin from `dotnet-agent-skills` beyond core, EF Core/data access and testing.
- Whether the C# and TypeScript language servers resolve on PATH.
- Which Angular vendor skills are present, where (project or user scope) and at which version.
- Which Figma MCP server is connected, which of its tools are read-only and which write or execute code (the latter go on the deny list), and whether every listed Figma file is readable.
- Whether any banned UI package (see "Fixed context") already appears in an existing `package.json`, stylesheet or import; report it as a conflict.
- Confirm Playwright is **not** installed yet (expected); if it is, record the version.
- For anything missing, the exact command for the operator to run.

### 0.3 Classify each relevant file

`path | type | summary (1 line) | status: current / outdated / conflicting / duplicate | action: keep / update in place / merge into <target> / migrate into <target> / supersede (keep as history) / retire (only with approval) | target in the default file set`

Rules:
- If an existing file serves the same purpose as a default-set file, **it becomes that file** (update it in place; rename or move only with approval). Never create a second file for the same purpose.
- Existing `CLAUDE.md` and `.claude/**` are **merged**: keep valid team instructions, show what changes, and resolve conflicts explicitly. Never overwrite them wholesale. Vendor skills are never edited.
- `User-Stories/` and `ADO_Import/` are **drafts to verify**: they are migrated into `docs/stories/` in Phase 4 only after Phase 1 verifies them against the BRD. Originals stay read-only as history; their IDs go into `legacy_ids`. Where the two sources disagree, list the differences.
- Existing contracts in `Contracts/`: shared components are verified and moved into `Contracts/openapi/common/` (with approval); existing module operations are **not** rewritten in this run. They become input to the Contract enabler stories, whose specs cite them.
- Existing BRD analysis, requirement lists or backlogs are verified against the BRD in Phase 1, page by page via the coverage ledger. Never trust them blindly, and never redo work that has been verified.
- Existing ADRs keep their numbers. New ADRs continue the sequence. Changed decisions get a superseding ADR, never an edited history.
- Existing code and migrations constrain the architecture: record them as facts in the inventory.
- `BRD/`, `User-Stories/`, `ADO_Import/`, `Database Schema/` and `Design_System/` are read-only.
- `docs/development/coding-standards.md` is current: keep it, and list any conflict with this prompt for Phase 2.

### 0.4 Gate 0 (chat, ≤60 lines), then STOP

Present:
- The inventory summary, including the screen-coverage summary (modules with designs vs without)
- The Figma inventory summary and the visible `Design_System/` vs Figma differences
- The toolset status (including Figma MCP and Playwright) and any operator commands still needed
- The classification table for the relevant files
- Conflicts between existing files and this prompt, each with a recommendation (for example: ADO as a tracker vs Git stories; existing contract layout vs the multi-file layout; schema decisions vs Part B)
- Conflicts between `docs/development/coding-standards.md` and this prompt, if any
- What already exists vs what Phases 1–4 will create

Wait for approval. Write the approved table to `docs/development/existing-assets.md` (≤60 lines). Later phases follow it, and the final report confirms each action was carried out.

## Phase 1: Read and analyze the entire BRD (playbook Plan + Design at system level)

Goal: a complete, detailed understanding of every page before any design. Thoroughness beats token savings here, but write findings to files as you go so nothing depends on chat memory.

### 1.1 Prepare

1. Use the approved Phase 0 inventory; do not re-scan the repo. If an expected document is unavailable, report it explicitly and never assume its contents. Existing analysis is verified and extended, never duplicated.
2. Write `.claude/skills/analyze-brd/formats.md` (≤60 lines), defining:
   - The ID scheme: `REQ-<MOD>-NNN`, `BR-<MOD>-NNN`, `ROLE-<NAME>`, `WF-<NAME>`, `Q-NNN`, `ASSUMPTION-NNN`. IDs are stable and never reused.
   - Every table format below.
3. Convert the BRD from `BRD/` to `docs/requirements/brd/sections/NN-<slug>.md` with page markers (`<!-- p.23 -->`). Record the BRD file name, version and date in `docs/requirements/brd/index.md`.
4. Render and view every page with diagrams, flowcharts, screenshots or complex tables; transcribe each as a structured description. Text extraction misses workflow diagrams.
5. Create `docs/requirements/brd/coverage.md`: `page | section | text read | visuals viewed | extracted`.

### 1.2 Pass 1: holistic read (main session, every page, in order)

Read in chunks of about 10 pages. After each chunk, update:
- `coverage.md`
- `brd/index.md`: section → pages → candidate module → one-line summary
- `docs/requirements/glossary.md`
- `open-questions.md` (append immediately)

The aim is the whole picture: modules, actors, end-to-end journeys, workflow shapes, cross-references.

### 1.3 Pass 2: detailed extraction (per module, every in-scope page re-read)

Split any file over ~300 lines.

- `docs/requirements/modules/<module>.md`:
  - REQ entries
  - BR entries: business rules and validations
  - Data captured
  - Notifications
  - SLAs and deadlines
  - Reports
  - Audit needs
  - Dependencies
  - Every row cites `p.<page> §<section>`
- `roles-permissions.md`: role × action × resource × workflow state; human vs system or external actors.
- `workflow-inventory.md`, one block per `WF-*` (≤40 lines each), listing:
  - Purpose, trigger and entry conditions
  - Required input data
  - Stages and activities
  - Transitions: action, actor, guard, outcome
  - Review patterns: reviewer count, slot eligibility, independence, comparison, adjudication, super-review
  - Sequential and parallel parts; joins
  - Child processes and their completion rules
  - Conditional decisions
  - Approval, rejection, return, escalation, clarification and rework paths; cancellation; reopening
  - Completion criteria
  - Dependencies on other processes
  - Suspension, withdrawal and resumption rules
  - Timers and SLAs
  - Audit and reporting needs
  - Exceptions and recovery
  - BRD references
  - Every row marked `Confirmed (ref)`, `Assumption (ASSUMPTION-NNN)` or `Proposed enhancement`. Never omit exceptional paths.
- `process-map.md`: the **Business Process Matrix** (one row per process) and the **Process Dependency Map** (Mermaid).
- `requirement-matrix.md` (traceability): `REQ ID | module | summary | BRD ref | priority | status | process | story key | AC | test`. Later columns are filled as work progresses.
- `nfr.md`: performance, volume, availability, retention, security, compliance and accessibility, with references. If volumes are missing, say so.

### 1.4 Pass 3: verification and cross-check

1. Run independent verification with general-purpose subagents, one per module, in parallel. Each re-reads its BRD sections against the extracted file and reports only omissions, misreadings and unsupported items. Fix all findings.
2. In the main session, do a cross-module pass covering:
   - Contradictions
   - Undefined terms
   - Roles without permissions
   - Transitions without an actor or guard
   - Unreachable or dead-end states
   - Missing SLA or timer behaviour
   - Unclear withdrawal and resume semantics
   - Retention gaps
3. **Cross-check the existing drafts against the extraction** (findings only; nothing is migrated yet):
   - `User-Stories/` and `ADO_Import/`: stories with no BRD basis, BRD requirements with no story, and stories that contradict a BR. Write `docs/requirements/legacy-stories-check.md` (≤100 lines, split per module if larger).
   - `Database Schema/`: entities or columns with no BRD basis, BRD data with no home, and conflicts with Part B (e.g. status columns updated directly, no rowversion, JSON runtime state). Record in `open-questions.md` or as Phase 2 input.
   - `Contracts/`: operations with no BRD basis or that conflict with roles and permissions.
4. Confirm 100% page coverage; list any page that could not be processed.

### 1.5 Figma extraction (design foundations and component specs; read-only)

Follow Part C §C2. Inspect every Figma file listed in `docs/design/figma-files.md` through the Figma MCP read tools and write `docs/ui-framework/figma/` (index with coverage, foundations, one spec per component, gaps). Use node screenshots for visual reference; describe what you see, never guess values that the MCP can return exactly. Figma questions go into `open-questions.md` with resolver `UX owner`. One general-purpose subagent per Figma file or component group is allowed; each reports its node IDs so the main session can verify.

### 1.6 Open questions and Gate 1

`open-questions.md` columns: `Q-ID | BRD ref | question | impact | options | recommendation | blocking (Y/N) | resolver (PO / policy owner / Tech Lead) | status | answer + date`.

Mark a question blocking if it affects workflow semantics, authorization, data model or scope. A missing screen design is **not** blocking (it becomes `ui: pending`); a missing UI behaviour rule in the BRD may be. A missing or contradictory Figma foundation (token, mode, breakpoint) is blocking for the UI framework track only; a missing component spec is blocking only for that component.

**Gate 1 output:**
- Coverage confirmation (BRD pages and Figma files/pages)
- Figma summary: token counts per tier and mode, component count, gaps, `Design_System/` differences
- Module and workflow counts
- Legacy story, schema and contract cross-check summary
- Top risks
- Blocking questions grouped by module, most impactful first

Stop. Record each answer, re-check the affected extractions, and repeat until no blocking question is open, or the PO explicitly accepts an `ASSUMPTION-NNN`.

**Never invent requirements. Unknown means a question.**

---

## Phase 2: Fit and design proposal (chat only, ≤150 lines), then Gate 2

1. **Process fit:** classify every `WF-*` as follows. Also classify each Part B capability as required by the BRD, required by reusability, or not needed now.
   - **Clean:** fits the explicit process service + reusable components + database configuration model.
   - **Needs component X:** justified by at least 2 processes, or by one process with a correctness trap.
   - **Doesn't fit:** explain why and propose an alternative.
2. **Architecture challenge:** answer Part B §B16 concisely, with a recommendation for each item.
3. **Configuration storage:** relational vs JSON vs hybrid, as a comparison table with a recommendation (B3).
4. **Components and extensibility** (B2), and the **version-stamping strategy** for in-flight cases (B3).
5. **Gap analysis against existing assets:** a table of `item | current doc/decision (in Contracts/, Database Schema/, User-Stories/, ADO_Import/, README) | keep / change / remove | reason | affected files`. For the existing schema, state which tables are kept, reshaped or replaced by the Part B design, and why.
6. **Foundation design:**
   - File tree with budgets (start from the default set)
   - Coding standard check: conflicts between `docs/development/coding-standards.md` and the approved design, each with a resolution (the standard changes only with Tech Lead approval)
   - Solution layout for rule `paths:` and hook paths
   - Which standards become policy skills and which become path rules
   - **Toolset integration:** what each vendor plugin or skill covers, which project rules and skills shrink to project-specific deltas because of it, and known conflicts with project decisions (these become the "Vendor overrides" list)
7. **UI framework architecture (Part C):** answer §C10 concisely; propose the library and docs/playground layout, the token pipeline and theme engine, API conventions, accessibility target, Playwright validation approach, and the UI framework roadmap (foundations first, then components in the order feature stories need them). State which design decisions come from Figma and which are open questions.
8. **Timeline reality check:** split the work into the tracks (B17 and C9), say what fits in 10 days for the core and for the UI framework foundations, and what moves to hardening. Note the effect of partial UI designs, of components not yet built, and of full-stack feature ownership (three developers in parallel, more migration and shared-file contention) on the schedule.
9. Up to 16 decisions needing approval, each with your recommendation, **including the names of the PO, Tech Lead and policy owners**, the toolset ADR, the core-track and UI-framework staffing (B17, C9), Angular CDK yes/no, in-repo library vs separate repository, the component prefix, RTL/i18n needs, browser support, and the ADO question from Gate 0 if still open.

Stop.

## Phase 3: Generate, validate, then Gate 3

Generate in this order. Don't re-read files you just wrote.

1. `.gitignore` additions and `.editorconfig` (copied from the appendix of `docs/development/coding-standards.md`; then replace that appendix with a one-line link to `.editorconfig`, so the file is the single source)
2. `settings.json` + guard hook
3. `CLAUDE.md`
4. Rules
5. `/create-skill` (the authoring standard; every later project skill must conform to it)
6. Policy skills
7. `REVIEW.md` + `.github/pull_request_template.md` + `docs/stories/README.md`
8. Agents
9. Workflow skills
10. `docs/architecture/*` and ADRs, including **"Explicit C# process services instead of a generic workflow engine"** (rejected alternatives: configurable engine, Elsa and similar engines, Logic Apps, saga frameworks), **"Claude Code toolset: plugins and vendor skills"** (including Figma MCP and its read-only use), and the UI framework ADRs: **"Own Angular UI framework; no third-party UI libraries or CSS frameworks"** (rejected alternatives: Angular Material, PrimeNG, NG-ZORRO, Bootstrap, Tailwind; Angular CDK per Gate 2), **"Design token pipeline and theme engine"** (token source format, generator, Figma update flow), **"UI validation with Playwright"** (Proposed: browsers, visual baselines, accessibility scan tool), and **"Accessibility target"** (recommend WCAG 2.2 AA)
11. `docs/workflow/01–07`
12. Design, development and evals docs, and `docs/ui-framework/*` (Part C §C11)
13. The `Contracts/openapi/` skeleton, as specified in "Design-first OpenAPI contract (YAML)" below: `README.md`, `.claude/rules/contracts.md`, root `openapi.yml` and `common/*.yml`. Shared components only. Write **no** module operations; those come from contract stories.

Add a `Proposed` ADR covering contract tooling and the mock strategy: design-first OpenAPI, Angular client generator, mock approach and drift test. No new dependency without approval.

Do **not** create architecture skills in this phase: they are derived only after the architecture is approved (Phase 3B).

**Validation (fix everything found):**
- `wc -l` against budgets
- Frontmatter parses; `settings.json` parses
- Referenced paths exist, with exact casing (`Contracts/`, `Design_System/`, `"Database Schema/"`)
- Rule globs and hook paths match the layout
- No `@` imports
- No standard stated in two files (`docs/development/coding-standards.md` owns C# style; rules and skills link to it)
- No project rule or skill restating generic guidance a vendor skill provides
- Gates and approvers identical in `CLAUDE.md`, the skills and `docs/development/workflow.md`
- Authentication and authorization separated
- No business logic tied to an identity provider
- Every core capability traces to a `WF`/`REQ` ID or an approved reusability decision
- Every critical invariant appears in the invariant protection matrix
- No JSON workflow definitions, interpreter or definition publishing anywhere
- No invented business content
- No invented design content: every token and component spec in `docs/ui-framework/` cites a Figma node, a `Q-NNN` or an approved `Proposed` item
- No banned UI package named as allowed anywhere; `frontend.md`, `ui-framework.md`, `ux-standards` and the ADRs agree
- Figma write/execute tools are on the `settings.json` deny list
- **Hook smoke test:** pipe sample JSON into the hook with `node` and confirm block and allow cases, including a Windows-style path (`Contracts\openapi\dist\x.yml`), a read-only input folder, a vendor skill file, and an allowed `Contracts/openapi/common/schemas.yml` edit. Confirm `security-guidance` and the guard hook both run on an edit.
- **Skill standard check:** every project skill created so far passes the checklist in `create-skill/authoring-standard.md`.
- **Policy skill trigger check:** list 3 differently phrased test prompts per policy skill in the report, for humans to run in a fresh session, and note any vendor skill that might trigger on the same prompt.

**Gate 3 output:** files with line counts, key decisions, items still `Proposed`. Stop.

## Phase 3B: Architecture skills (only after Gate 3 approves the architecture)

Goal: turn the **finalized** architecture into skills, so that every developer and every Claude session implements the recurring patterns in the same way. This is the playbook's "skills as institutional knowledge" play: write a skill for knowledge that must be applied consistently; do not write one for content that belongs in `CLAUDE.md`, a rule, a vendor skill or a one-off prompt.

### Source material

Use only approved sources: accepted ADRs, `docs/architecture/*`, `docs/workflow/01–07`, the rules and the policy skills. If an ADR is still `Proposed`, any skill depending on it waits. Vendor skills are consulted for overlap, never as the source of a project decision.

### Step 1: Skill catalog (chat only, ≤40 lines), then STOP for the catalog part of Gate 3B

Derive candidates from the approved design and the core phases and application modules it implies.

**Include a pattern only if all four hold:**
- It recurs (expected ≥3 times across core phases or BRD modules).
- It spans several files or layers, or carries a non-obvious correctness trap (concurrency, authorization, migrations, audit).
- It is not already fully covered by a rule or policy skill.
- It is not already fully covered by a vendor skill (.NET core, EF Core/data access, testing, Angular). Where a vendor skill covers the generic part, the project skill keeps only the project-specific steps and names the vendor skill.

**Merge overlapping candidates. Cap the catalog at 10 skills;** anything more needs justification.

Candidates to evaluate (keep, merge or drop according to the final architecture, and do not invent patterns the architecture lacks):

| Area | Candidate skills |
|---|---|
| Application | `add-use-case` (endpoint → application service → authorization → validation → persistence → tests); `add-entity-and-migration` (including the two-developer migration sequencing protocol; generic EF Core practice comes from the vendor skill); `add-report-query` (projection, index review, pagination) |
| Process management | `add-process-service` (process service, version stamp, transition tests); `add-process-component` (a new kind of activity with the conformance suite); `add-operational-policy` (versioned database configuration + validation); `add-policy` (C# decision, comparison or eligibility policy) |
| Contract and frontend | `update-api-contract` (add or change YAML path, parameter, schema and example files + index line → lint and bundle → breaking-change check → regenerate the Angular client → mocks from examples → drift test); `add-angular-feature` (project-specific: feature folder, lazy route, generated client, typed form, states; generic Angular practice comes from the Angular skills); `build-screen` (two modes: from a Figma frame with the visual verification loop, or `compose` from UI framework components when no design exists) |
| UI framework (Part C) | `add-ui-component` (Figma spec → API per conventions → tokens only → a11y → docs page with playground controls and copy-paste source → unit + Playwright tests → Figma parity check); `sync-design-tokens` (read Figma variables via MCP → update token source → regenerate SCSS/CSS → contrast check → visual baseline review); `add-theme` (custom theme against the semantic token contract + contrast check + Playwright visual run) |
| Testing | `write-concurrency-test` (SQL Server race-test harness pattern); `write-playwright-test` (component and journey tests against the playground: behaviour, keyboard, a11y scan, visual per theme and breakpoint) |

With full-stack feature ownership, consider merging `add-use-case` and `add-angular-feature` into one `add-vertical-slice` skill (contract → migration → API → UI → tests) when their steps always run together.

For each catalog entry give:
- Name
- Trigger description (draft)
- Pattern summary
- Source (ADR, doc or section)
- Recurrence evidence (which phases or modules use it)
- Overlapping vendor skill, if any, and what the project skill adds
- Invocation mode
- Deterministic check
- Owner
- Status: `Draft` if the pattern has no implemented exemplar yet, otherwise `Active`

### Step 2: Generate approved skills with `/create-skill`

Follow `create-skill/authoring-standard.md` exactly. In particular:

- **Exemplars over embedded code.** Point to real code paths once they exist. Until then, a `reference.md` holds a minimal skeleton (≤60 lines) marked `EXEMPLAR PENDING`, and the skill status is `Draft`.
- **Deterministic check.** Where a mistake in the pattern can be detected mechanically, add `scripts/check-<name>.mjs` (Node, no dependencies, ≤80 lines). The skill tells Claude to run it and paste the output. Examples: a new endpoint has an authorization policy and uses ProblemDetails; a process component is registered and has a conformance test; a migration name and owner follow the protocol. Scripts that need code which does not exist yet are written when the pattern is first implemented.
- **Link, don't restate.** Rules, policy skills, ADRs and vendor skills are linked by path or name, never copied.

### Step 3: Validate, then STOP for skill approval (rest of Gate 3B)

- Budgets and frontmatter.
- No two skill descriptions (project or vendor) would trigger on the same request in a way that gives conflicting guidance; no skill duplicates a rule, policy skill or vendor skill.
- Every step cites an approved source.
- **Trigger test list:** 3 should-trigger prompts and 1 should-not-trigger prompt per skill, for humans to run in a fresh session.

### Lifecycle (record in `docs/development/workflow.md`)

- **Draft → Active:** the first story or core phase that implements a pattern replaces `EXEMPLAR PENDING` with real exemplar paths, adds the check script, and sets the status to `Active`, all in the same PR. `/plan-story` and `/complete-story` enforce this.
- **When an ADR changes,** update the affected skills in the same PR. The Tech Lead and the skill owner approve.
- **When a mistake repeats twice,** update the skill (or rule) and add an eval case.
- **When a vendor plugin or skill is updated,** re-run the overlap and trigger checks and review the "Vendor overrides" list in the same `chore/` PR.
- **New patterns later:** create them with `/create-skill` under the same standard and approval.

## Phase 4: Plans, then Gate 4

1. **Core phase stories.** For each core phase, write `docs/stories/core/WF-P<N>-<slug>/story.md` (front matter + goal) and `spec.md` (≤80 lines, using the spec template). Each spec contains:
   - Goal and the REQ/WF links
   - The exact design sections to read (paths and headings)
   - Files and tables owned
   - Architecture skills to apply (and any `Draft` skill this phase must finalize); vendor skills that apply
   - Acceptance criteria and required tests
   - Flagged concerns
   - Out of scope

   Do **not** write `plan.md` now: each phase session creates its own plan in plan mode via `/plan-story`.
2. **`docs/workflow/08-implementation-plan.md`:**
   - Phase order and dependencies
   - Ownership: the developers assigned to the core at Gate 2, on separate files and schema areas; what the other developer builds meanwhile
   - Risk tier per phase
   - Realistic 10-day schedule for track 1; tracks 2 and 3 sequenced after it
   - Non-deferrable work (B17), placed in the right phases
   - Concurrency and recovery tests in the phase that introduces the behaviour
   - What moves to hardening
3. **Feature and story breakdown for every module.** Run the `/prepare-backlog` procedure module by module: first group the module's requirements into features (`docs/stories/<module>/F-<MOD>-NN-<slug>/feature.md`), then write one `S-<MOD>-NNN-<slug>/story.md` per story inside its feature folder (state `draft`). One general-purpose subagent per module is allowed; each reads only its module files, `roles-permissions.md`, `process-map.md`, the core phase specs, `legacy-stories-check.md` and that module's items in `User-Stories/` and `ADO_Import/`. Follow the breakdown standard in `prepare-backlog/backlog-format.md` (see the skill spec below).
   - **Migrating existing stories:** every verified legacy story maps to one or more new story files (`legacy_ids` filled); legacy stories with no BRD basis are not migrated but listed as questions for the PO; BRD requirements with no legacy story get new stories. Never copy legacy AC unverified.
   - **UI:** set `ui:` per story from the screen-coverage table in `docs/design/design-system.md`. Where no design exists, propose `compose` or `pending` per story for the PO to decide at Gate 4.
   - Core phases `WF-P*` appear as **Enabler Features**, so business stories depend on them explicitly.
   - **UI framework module** (`docs/stories/ui-framework/`, key prefix `UIK`): enabler features `F-UIK-NN` with stories `S-UIK-NNN` per Part C §C9 (foundations, then components in the order feature UI stories need them). Every business story that touches `ui` lists its `components:` and depends (type `component`) on the `S-UIK-*` story delivering each component not yet built.
   - Then write `build-story-map.mjs` and run it (`/prepare-backlog --map`) to generate `docs/stories/story-map.md` with:
     - The dependency table
     - Mermaid graphs: one per module at story level, plus one cross-module graph at feature level
     - **Waves**, computed as topological levels (wave 0 = independently pickable now)
     - The critical path
     - Conflict groups (stories that touch the same tables or contract files)
     - The UI-pending list
     - A suggested feature assignment per wave for developers A, B and C, balancing load and keeping their conflict groups apart (this goes in `roadmap.md`, because the map is generated)
   - Reject cycles by splitting stories.
   - Flag every story with more than 3 hard predecessors for possible splitting.
4. **`docs/development/roadmap.md` (≤80 lines):** waves mapped to sprints; features per developer per sprint; track 2 order; the UI framework track (foundations, theme engine, docs/playground, Playwright harness, then components by need); what the developer not on the core does while track 1 runs (UI framework, app shell built on it, features that do not need the core, against mocks where needed); the order in which pending screen designs and missing Figma component specs are needed, so the designer can work ahead of feature work.
5. **Gate 4 approval:** the PO approves features and stories, by module, by feature or individually, and decides `compose` vs `pending` for stories without designs. The Tech Lead confirms each developer's first feature (optional `owner:` in `feature.md`). Approved stories move to `ready`, approvals are recorded in their front matter, and the map is regenerated.
6. **Final report (≤60 lines):**
   - Every file created or updated, with line counts
   - Confirmation that each Phase 0 reuse action was carried out, including the legacy story migration counts
   - Toolset status and the "Vendor overrides" list
   - **Ready to start:** the wave 0 features, each with its first story and a suggested developer, and the exact command (`/write-spec S-<MOD>-NNN`)
   - The UI-pending stories, in the order designs are needed
   - The UI framework: first `S-UIK-*` story, open Figma questions, and the operator steps still needed before it starts (Playwright install after ADR approval)
   - The critical path
   - Which `Draft` architecture skills each phase finalizes
   - How to run a phase or story: `/pick-story` → `/write-spec` → `/plan-story` → `/implement-story` → `/review-story` → `/complete-story`
   - How to regenerate the map, record approvals, and take a story from branch to PR

Stop. Implementation happens later: one approved change per fresh session.

---

## Output budget (hard limits; Phase 1 requirement files are data, kept terse and split per module)

Write for an agent reader: imperative bullets, no preambles, no rationale outside ADRs, no restating. Every fact lives in one file; other files link to it by path. Do not create files outside the default set without asking.

| File | Max lines | File | Max lines |
|---|---|---|---|
| `CLAUDE.md` (playbook: under a page) | 80 | each ADR (≤14 ADRs) | 35 |
| `REVIEW.md` | 40 | `docs/architecture/overview.md`, `security.md` | 120 each |
| `.github/pull_request_template.md` | 40 | `docs/workflow/01` / `02` / `05` | 120 / 150 / 120 |
| each rule | 50 | `docs/workflow/03` / `04` / `06` (09: 150) | 250 / 250 / 200 |
| each project `SKILL.md` (workflow or policy) | 70 | `docs/workflow/07` / `08` | 150 / 150 |
| each skill supporting file | 60 | `story.md` / `spec.md` / `plan.md` | 40 / 80 / 60 |
| each agent | 45 | `docs/development/workflow.md` | 150 |
| guard hook script | 100 | any other doc, incl. `evals/README.md` | 100 (evals 40) |
| skill check script (`scripts/*.mjs`) | 80 | `authoring-standard.md` | 80 |
| `docs/stories/README.md` | 60 | `build-story-map.mjs` | 150 (`story-map.md` is generated) |
| `feature.md` | 30 | `docs/development/coding-standards.md` | 300 (after its appendix moves to `.editorconfig`) |
| `Contracts/openapi/README.md` / root `openapi.yml` | 40 / 120 | `backlog-format.md` | 60 |
| each contract path file / `common/*.yml` file | 150 / 150 | each module `schemas/*.yml` file | 200 (split above that) |
| `docs/ui-framework/overview.md` | 150 | other `docs/ui-framework/*.md` | 100 each |
| `docs/ui-framework/figma/components/<component>.md` | 100 | other `docs/ui-framework/figma/*.md` (data) | 300 (split above that) |

Vendor skills are outside these budgets; their descriptions still count toward startup context, so check `/context` after Phase 3.

## Claude Code mechanics to respect (current as of late 2026)

- `CLAUDE.md` loads every session. `@` imports load eagerly and do not save tokens, so reference files as plain paths in backticks. HTML comments are stripped from `CLAUDE.md`.
- `.claude/rules/*.md`: `paths:` is the only frontmatter field. Unscoped rules load every session, so scope every rule.
  - Path rules load only when Claude reads or edits matching files, so they **do not apply while writing specs**.
  - Standards needed at spec time are therefore **policy skills**.
- Skills: `.claude/skills/<name>/SKILL.md` with `name` and `description`. The full authoring practice for project skills is defined once, in `create-skill/authoring-standard.md`.
  - **Workflow skills** use `disable-model-invocation: true` (run only via `/name`; descriptions stay out of context).
  - **Policy skills** stay model-invocable, with precise trigger descriptions, and are also listed as required reads in the workflow skills.
  - Use `$ARGUMENTS` for input. Templates go in supporting files inside the skill folder.
- Plugins: declare the team's marketplaces and enabled plugins in `.claude/settings.json` (`extraKnownMarketplaces`, `enabledPlugins`) so every developer is prompted for the same set; verify the current keys and syntax in the docs. Plugin skills, hooks and LSP servers come from the plugin; never copy them into the repo.
- LSP: with `csharp-lsp` and `typescript-lsp` enabled, Claude uses LSP navigation (definitions, references, diagnostics) for symbol-level questions in C# and TypeScript, and the built-in Explore subagent for broad discovery.
- Subagents: `.claude/agents/<name>.md` with `name`, `description`, `tools`. Use the built-in Explore subagent for code discovery.
- Hooks: registered in `.claude/settings.json`.
  - `PreToolUse` hooks receive the tool input as JSON on stdin; exit code 2 blocks and sends stderr to Claude.
  - Every block message states the reason **and** the route to approval.
  - Write hooks in **Node.js** (ES module, no dependencies): Node is already required by Angular and runs on Windows, macOS and Linux.
  - Keep hooks fast and scoped to the file being changed. Verify current tool names and the hook input schema in the docs.
  - Plugin hooks (e.g. from `security-guidance`) run alongside project hooks; they do not replace the guard hook.
- Permissions in `settings.json` are enforced; `CLAUDE.md` and skills are advisory.
- MCP tools are named `mcp__<server>__<tool>` and can be allowed or denied in `settings.json` like other tools; verify the exact names with `/mcp`.
- `AGENTS.md`: do not create it. If needed later, move the shared content into it and start `CLAUDE.md` with `@AGENTS.md`.

## Default file set

```text
README.md                          # existing; update in place only if approved at Gate 0
BRD/  User-Stories/  ADO_Import/  "Database Schema/"  Design_System/   # existing inputs; read-only
CLAUDE.md
REVIEW.md
.editorconfig                      # created from the coding standard appendix
.gitignore                         # + CLAUDE.local.md, .claude/settings.local.json, .work/
.github/pull_request_template.md
.claude/
  settings.json                    # permissions, hooks, plugin marketplaces and enabled plugins
  hooks/    pre-edit-guard.mjs
  rules/    backend.md database.md frontend.md testing.md process.md contracts.md ui-framework.md
  agents/   requirements-analyst.md code-reviewer.md verifier.md
  skills/
    <vendor Angular skills>/                                  # installed by npx skills add; read-only
    create-skill/{SKILL.md,authoring-standard.md}             # meta skill (/create-skill only)
    security-policy/ api-standards/ ux-standards/               # policy skills (model-invocable)
    <architecture skills>/{SKILL.md,reference.md,scripts/}    # Phase 3B, from the approved catalog
    analyze-brd/{SKILL.md,formats.md}  prepare-backlog/{SKILL.md,backlog-format.md,feature-template.md,story-template.md,scripts/build-story-map.mjs}
    write-spec/{SKILL.md,spec-template.md}  review-story/
    plan-story/{SKILL.md,plan-template.md}
    implement-story/  complete-story/  pick-story/               # workflow skills (/name only)
docs/
  requirements/  README.md glossary.md requirement-matrix.md roles-permissions.md
                 workflow-inventory.md process-map.md nfr.md open-questions.md legacy-stories-check.md modules/
                 brd/{index,coverage}.md brd/sections/
  architecture/  overview.md security.md decisions/{_template.md,0001-…}
  workflow/      01-requirements.md 02-architecture.md 03-process-model.md 04-database-design.md
                 05-security-audit.md 06-api-contracts.md 07-testing-performance.md 08-implementation-plan.md
                 (09-human-tasks.md only if 03 exceeds its budget)
  stories/       README.md story-map.md (generated) core/ ui-framework/ <module>/F-<MOD>-NN-<slug>/ bugs/   # feature.md per feature; one folder per story: story.md spec.md plan.md
  design/        design-system.md  # index into Figma + Design_System/ + screen-coverage table
                 figma-files.md    # operator-written Figma file list
  ui-framework/  overview.md api-conventions.md tokens-and-theming.md layout-and-responsive.md
                 accessibility.md docs-playground.md testing-playwright.md component-inventory.md
                 figma/{index,foundations,gaps}.md figma/components/<component>.md   # Phase 1.5 extraction
  development/   coding-standards.md workflow.md collaboration.md roadmap.md existing-assets.md
Contracts/                             # existing folder; other existing files per Gate 0
  openapi/                             # design-first contract, YAML only (.yml)
    README.md
    openapi.yml                        # root: info, servers, security, tags, sorted path index ($ref only)
    common/  parameters.yml responses.yml schemas.yml headers.yml security.yml
    modules/<module>/
      paths/<resource>.yml             # one file per resource (its path items and operations)
      parameters.yml  responses.yml    # module-specific, only when needed
      schemas/<aggregate>.yml          # request/response schemas, grouped by aggregate
      examples/<operationId>.yml       # request/response examples per operation
    dist/                              # generated bundle; never hand-edited
evals/README.md
# Created later by UI framework stories, not by this run (layout confirmed at Gate 2):
#   projects/<prefix>-ui/        the library (tokens source, generated styles, theme engine, components)
#   projects/<prefix>-ui-docs/   documentation and playground app (Playwright target)
#   e2e/ or projects/<prefix>-ui-docs/e2e/   Playwright tests and visual baselines
```

Separation of concerns:
- **ADRs:** decision + rationale.
- **Architecture and workflow docs:** the design.
- **Policy skills:** standards applied at spec, code and review time.
- **`docs/development/coding-standards.md`:** C# code style, enforced where possible by `.editorconfig`.
- **Rules:** code-level constraints by path.
- **Workflow skills:** procedures.
- **Vendor plugins and skills:** generic platform practice; overridden by everything above.
- **Hook and permissions:** what must always hold.
- **`CLAUDE.md`:** index, commands, non-negotiables, Definition of Done.
- `docs/workflow/01-requirements.md` cites REQ/WF IDs only; it never copies BRD text.

## Foundation file specifications

### `CLAUDE.md` (≤80 lines)

Sections:

1. **Project** (2 lines) and stack.
2. **Repo map**, including the read-only input folders.
3. **Commands** (`TODO` until scaffolding; then refresh with `/init` and cut back). One command each for build, test and lint per area, each with an example of healthy output.
4. **Verifying your work:**
   - Run build, test and lint for every area the story touches (a full-stack story means both .NET and Angular) before reporting done, and paste the output. LSP diagnostics are not evidence.
   - If a test fails, fix the code, not the test.
   - UI work: compare a screenshot against the Figma frame and iterate; for `ui: compose` stories, check against UI framework components and `ux-standards`. UI framework work: run its unit and Playwright tests (behaviour, a11y, visual per theme) and paste the output.
5. **Sources of truth:** link to the playbook section of `docs/development/workflow.md`.
6. **Workflow:** one line per skill, with its gate and approver.
7. **Standards, policy skills and toolset:** `docs/development/coding-standards.md` for C# (read before the first C# edit in a session); policy skill names and when they apply; the approved plugins and vendor skills in one line each; the precedence order in one line.
8. **Non-negotiables** (≤12):
   - No business rule without an approved REQ; ambiguity → ask.
   - No code without an approved `plan.md`.
   - One branch per story from the latest `main`; never edit on `main`. Commit, push or open a PR only when the user explicitly asks; never merge, never force-push, never deploy.
   - Never apply migrations outside local and test databases.
   - The backend enforces all authorization.
   - No secrets or PII in code, logs, tests or audit.
   - Never weaken tests or validations.
   - Stay in scope; no new packages or plugins without approval; no banned packages, including any third-party UI library or CSS framework.
   - Never invent a design decision Figma specifies; never write to Figma.
   - Project ADRs, rules and policy skills override vendor plugin and skill guidance.
   - Never edit `BRD/`, `User-Stories/`, `ADO_Import/`, `Database Schema/`, `Design_System/` or vendor skills.
   - Update `plan.md` in the same commit when implementation departs from it.
   - State what is incomplete or unverified.
9. **Context rules** (≤7):
   - One change per session; `/clear` between changes.
   - Read the story folder (`story.md`, `spec.md`, `plan.md`) and its `feature.md`, not the BRD.
   - For API work, read `Contracts/openapi/common/` + the module's contract files, never `dist/`.
   - For UI work, read the component's `docs/ui-framework/figma/components/<component>.md`, then query Figma MCP only for the specific node.
   - Use LSP for C#/TypeScript symbol navigation before text search; targeted reads.
   - Subagents for broad search, verification and review.
   - Update the Handoff section in `plan.md` before pausing.
10. **Things Claude gets wrong:** empty list; grows by the "mistake twice" rule.
11. **Definition of Done** (≤12 checkboxes; authoritative): "compiles" is never done.

### `.claude/settings.json`

- **allow:** build, test and format (`dotnet`, `ng`/`npm run`, and `npx playwright test` once Playwright is installed); read-only git; the Figma MCP server's read tools.
- **ask:** `git commit`, `git push` (feature, fix and chore branches only), `git switch`/`git checkout`, `git pull --ff-only` (on `main` only), `git rebase`, `gh pr create`, `dotnet ef *`, adding packages (`dotnet add package`, `npm install <pkg>`), `npx skills *`. Claude uses these only after an explicit request.
- **allow:** also `git fetch` and `gh pr view`/`gh pr list` (read-only).
- **deny:** `git push --force*` / `-f`, any push to `main`, `git merge`, `gh pr merge`, `git reset --hard`, `git remote add/remove`; reading `.env*`, `*.pfx`, `*.key`, secrets and user-secrets files; every Figma MCP tool that creates, edits, deletes, comments or executes code (list them by exact name from Phase 0.2).
- **ask:** also `npx playwright install` and `--update-snapshots` runs (visual baselines change only with a stated reason).
- **hooks:** `PreToolUse` on the file-editing tools → `node .claude/hooks/pre-edit-guard.mjs`.
- **plugins:** `extraKnownMarketplaces` for `dotnet/skills` (and the official marketplace if required); `enabledPlugins` for `csharp-lsp`, `typescript-lsp`, `security-guidance` and the approved `dotnet-agent-skills` plugins (core, EF Core/data access, testing) only.

Use the current syntax for every key; verify it in the docs.

### `.claude/hooks/pre-edit-guard.mjs` (≤100 lines, Node, no dependencies)

Normalize `\` to `/` and compare paths case-insensitively. Blocks with an explanatory message when:

1. **Editing an existing, committed migration file.** Route: create a new migration.
2. **Hand-editing generated code** (the generated Angular API client, `Contracts/openapi/dist/**`, OpenAPI documents generated by the build, `docs/stories/story-map.md`, and, once they exist, the UI framework's generated token styles and generated docs snippets/API tables; exact paths in a constant at the top of the hook). Route: regenerate with the documented command. The design-first files in `Contracts/openapi/` **are** editable; they change through contract stories.
3. **New content matches secret patterns** (passwords in connection strings, private keys, bearer tokens, API keys). Route: use user-secrets or the configuration provider.
4. **Editing test files while `.work/fix-mode` exists.** This is the bug-fix lock from the playbook. Route: the developer removes the marker if the test itself is wrong.
5. **Any file edit while the current branch is `main`** (read with `git rev-parse --abbrev-ref HEAD`). Route: start the story with `/write-spec`, which creates the branch from the latest `main`.
6. **Editing a controlled input folder:** `BRD/`, `User-Stories/`, `ADO_Import/`, `Database Schema/`, `Design_System/`. Route: these are owned inputs (PO for BRD and stories, Tech Lead for schema, UX policy owner for the design system); the owner changes them in a human-made `chore/` PR.
7. **Editing a vendor skill** (folder names listed in a constant at the top of the hook, taken from `docs/development/existing-assets.md`). Route: re-run the vendor install command in a `chore/` PR approved by the Tech Lead.

The hook must not block anything else, and it allows all edits when it cannot parse its input. Log nothing sensitive.

### Rules (path-scoped, code-level constraints only)

Each rule holds only project-specific constraints; generic .NET, EF Core, testing and Angular practice comes from the vendor skills and is not restated. C# code style lives in `docs/development/coding-standards.md`; rules link to it and never restate it.

- **`backend.md`:**
  - Before the first C# edit in a session, read `docs/development/coding-standards.md`: it is the C# standard. This rule adds only what the standard does not cover.
  - Module layout and boundaries per `docs/architecture/overview.md`; a module never touches another module's entities, `DbContext` or tables.
  - Where a vendor skill contradicts the coding standard (for example MediatR, generic repositories, `_field` naming, primary constructors for services), the coding standard wins.
  - API or auth code → also apply `api-standards` / `security-policy`.
- **`database.md`:**
  - Entity configurations; migration naming; one migration per story; never edit applied migrations.
  - Rowversion; UTC; explicit indexes.
  - Projections and `AsNoTracking`; no N+1.
  - Short transactions; deadlock retry per `04-database-design.md`.
  - Parameterized SQL only where design docs justify it.
  - `Database Schema/` is reference only; schema changes happen through migrations.
- **`frontend.md`:**
  - Standalone components, feature folders, lazy routes.
  - Generated typed client.
  - Typed reactive forms.
  - Signals + RxJS; no store library without an ADR (even if a vendor skill suggests one).
  - Loading, error and empty states.
  - No PII in browser storage.
  - UI only from our UI framework's public API (components, tokens, utilities); no deep imports, no third-party UI library or CSS framework, no literal colours, sizes or fonts in feature SCSS. A missing component → a UI framework story, never an ad-hoc styled component in a feature folder; app-specific composites are composed from framework components.
  - Feature code stays in its feature folder. Shared files (routes, navigation, shared components) are conflict hotspots: change them in small, separate commits and follow `docs/development/collaboration.md`.
  - UI work → apply `ux-standards`.
- **`testing.md`:**
  - Business-rule unit tests.
  - Transition and authorization matrix tests.
  - SQL Server integration tests (never InMemory) for persistence, locking and concurrency.
  - **Contract drift test:** the OpenAPI document generated from the API must match the bundled contract in `Contracts/openapi/dist/` (no undocumented or missing operations, parameters, schemas or status codes).
  - Playwright E2E and visual checks for critical app journeys only; UI framework components get full Playwright coverage per `docs/ui-framework/testing-playwright.md`.
  - Tests reference REQ IDs; test code style per `docs/development/coding-standards.md`.
  - Bug fix = failing test first, committed before the fix.
  - Never weaken assertions.
- **`process.md`** (process core and process service paths):
  - Routing lives in process services.
  - Every state change goes through the lifecycle component; no direct status updates.
  - Invariants are enforced as the invariant protection matrix says.
  - Never COUNT-then-INSERT for limits.
  - Audit in the same transaction.
  - Process and configuration versions are stamped on every instance.
  - No domain types in the core.
  - No reflection dispatch.
  - New processes and components follow `03-process-model.md` and pass the conformance suite.
- **`ui-framework.md`** (`paths:` the UI framework library and docs app, per Gate 2):
  - Conventions per `docs/ui-framework/api-conventions.md`; tokens and theming per `tokens-and-theming.md`; never restate them.
  - Domain-agnostic: no admissions terms, API clients, business rules or app imports.
  - Components consume semantic or component tokens only; no primitives or literal values; generated token files are never hand-edited.
  - Every value and state traces to the component's Figma spec; anything not in Figma → stop and raise a question for the UX owner.
  - Every component change updates its docs page, playground controls, unit and Playwright tests in the same PR; public API changes follow semver and the changelog.
  - Banned UI packages per `CLAUDE.md`; Angular CDK only if its ADR is accepted.
  - UI work → apply `ux-standards`.

### Policy skills (model-invocable, ≤70 lines each)

Each has `Owner: <policy owner>` and `Source: <policy document>` in the body. Changes need the owner's approval on the PR.

- **`security-policy`:**
  - Separation of authentication and authorization.
  - Actor resolved from the validated identity; never from client-supplied IDs, roles or channel.
  - Resource + action + workflow-state authorization; deny by default.
  - Service identities get explicit grants.
  - PII classification and redaction.
  - Secrets handling.
  - Audit-worthy events.
  - Relationship to `security-guidance`: the plugin's warnings are acted on or explicitly dismissed with a reason in the PR; the plugin never replaces this policy.
  - Links to `docs/architecture/security.md`.
  - Description triggers: writing specs, endpoints, auth, data access, logging, reviews.
- **`api-standards`:**
  - REST naming, methods and status codes.
  - Versioning per ADR.
  - ProblemDetails with stable codes: business validation (422) vs concurrency (409/412) vs infrastructure (5xx).
  - Pagination, filtering, sorting.
  - Idempotency keys.
  - ETag/If-Match ↔ rowversion.
  - Correlation ID.
  - **Design-first contract:**
    - `Contracts/openapi/` (YAML, multi-file) is the API source of truth. Its conventions live in `.claude/rules/contracts.md`; don't restate them here.
    - Every operation has a stable `operationId`, request and response examples, ProblemDetails errors and an authorization note.
    - Within a version, changes are additive only. A breaking change needs a new version + Tech Lead approval.
    - The implementation must pass the drift test.
  - No EF entities in contracts; no mass assignment.
  - Contracts not shaped around Angular screens.
- **`ux-standards`:**
  - Figma is the design source of truth; `Design_System/` is a reference copy. Tokens only; reuse UI framework components; never invent what Figma specifies.
  - Rules for screens without Figma (`ui: compose`): compose from existing UI framework components and design-system patterns; a new pattern → designer review; `ui: pending` stories are not built.
  - Accessibility target per ADR (keyboard, focus, ARIA patterns, contrast in every theme, reduced motion).
  - Responsive behaviour across the Figma breakpoints; light, dark and custom themes.
  - Validation message patterns.
  - Visual verification loop against Figma (or against the UI framework components for `compose`).
  - Links to `docs/design/design-system.md` and `docs/ui-framework/overview.md`.
  - Description triggers: writing UI specs, screens, components, styles, themes, tokens, accessibility, reviews.

### Design-first OpenAPI contract (YAML)

The contract is split into small `.yml` files so that Claude Code reads and edits only what a story touches. For API work, Claude reads `common/*.yml` plus the module's own files and never the bundle. It lives under the existing `Contracts/` folder; other existing files there are handled per Gate 0.

**`.claude/rules/contracts.md`** (`paths: Contracts/openapi/**`, ≤50 lines) is the single home for contract conventions. It loads automatically whenever a contract file is read or edited, and covers:

- **Format:**
  - OpenAPI 3.1 (matches ASP.NET Core 10's built-in generator; confirm in the contract ADR).
  - YAML only, `.yml` extension, 2-space indentation.
  - Kebab-case file names; PascalCase schema names.
  - `operationId` in camelCase verb-noun form, unique, never renamed once published.
- **Structure:**
  - `openapi.yml` holds only metadata, tags, security and a **sorted** `paths:` index of `$ref`s to `modules/<module>/paths/<resource>.yml`.
  - Path files contain operations only. **No inline schemas, parameters or error responses**: everything is a relative `$ref`.
  - Shared building blocks live in `common/` and are always reused, never copied:
    - Pagination, sort and filter parameters; the `{id}` pattern
    - `If-Match`, `Idempotency-Key`, `X-Correlation-Id`
    - ProblemDetails responses: 400, 401, 403, 404, 409, 412, 422, 429, 500
    - `PagedResult`
    - The error-code enum
    - Security schemes
- **Boundaries:** a module may reference `common/` and its own files only. Cross-module schema references need Tech Lead approval, because they couple modules.
- **Legacy contracts:** pre-existing operations elsewhere in `Contracts/` are inputs for Contract enabler stories; they are never referenced from `openapi.yml` until a story migrates them.
- **Every operation has:**
  - Summary and module tag
  - Security requirement
  - Request and response schemas
  - Examples in `examples/<operationId>.yml`
  - All applicable error responses
  - `x-authorization` (policy, resource, allowed workflow states)
  - `x-requirements` (REQ IDs)
  - `x-story` (story key)
- **Compatibility:**
  - Within a version, changes are additive only: new optional fields, new operations.
  - Removing or renaming anything, or changing a type or a required field, is breaking: it needs a new version + Tech Lead approval.
- **Validation loop:** after any edit, run the documented lint and bundle commands and paste the output; fix and repeat until clean. The build regenerates `dist/` and the Angular client; never edit those by hand.

**`Contracts/openapi/README.md`** (≤40 lines, for people):
- Purpose
- The layout tree
- Commands: lint, bundle, regenerate the client, run the drift test
- "How to add an operation" in 5 steps
- A link to the rule (conventions are not repeated)

**Tooling:** multi-file YAML needs a bundling and linting step. Propose one dev-only tool in the contract ADR, preferably one that does both, and confirm the Angular client generator resolves the bundle. No tool is installed without approval.

### `REVIEW.md` (≤40 lines, playbook format)

- **Passes:**
  - **Bugs:** logic errors, edge cases, regressions.
  - **Security:** per `security-policy`; confirm every `security-guidance` warning raised during the session was fixed or dismissed with a reason.
  - **Compliance:** the diff matches `spec.md`, `plan.md`, ADRs and policy skills; no unapproved business rules; no vendor guidance applied against a project rule.
  - **Workflow and concurrency integrity.**
  - **Data and migrations.**
  - **Contract compatibility.**
  - **UI conformance:** UI framework tokens and components only; no third-party UI or CSS framework; matches the Figma frame or the `compose` rules; for UI framework changes, Figma parity, a11y, all themes, docs/playground and Playwright coverage updated.
  - **Test quality.**
- **Severity:** "Important" means it would break behaviour, leak data or breach a policy. Everything else is a nit. Report at most 5 nits; summarize the rest as a count.
- **Do not report:** generated files, anything compilers, analyzers, linters or LSP diagnostics already enforce.

### `.github/pull_request_template.md` (≤40 lines)

- Title convention: `<key>: <summary>`
- Story key, feature key, REQ IDs and legacy IDs
- Links to `story.md`, `spec.md` and `plan.md` in the branch
- Summary
- Risk tier
- Test evidence (pasted output)
- Migration and contract notes; breaking-change statement
- Claude review findings (`REVIEW.md` format) and how each was resolved; `security-guidance` warnings dismissed and why
- Screenshots for UI changes (light and dark); Figma reference or "composed from UI framework"; Playwright output; reason for any visual baseline update
- Checklist: `plan.md` matches the diff; Definition of Done met; story state set to `done`

### Agents

- **`requirements-analyst`:**
  - Tools: Read, Grep, Glob.
  - Used for BRD revisions, verification and the legacy story cross-check.
  - Every item cites page and section; unknowns become questions.
  - Output ≤150 lines.
- **`code-reviewer`:**
  - Tools: Read, Grep, Glob, Bash (`git diff`/`log` only; no edits).
  - Inputs: area and an optional `security`/`concurrency` focus.
  - Applies `REVIEW.md` and the policy skills.
  - Output: findings table (severity, file:line, policy/REQ reference, suggestion) + verdict, ≤60 lines.
- **`verifier`:**
  - Tools: Read, Bash.
  - Runs a fresh-context final check once the session believes the work is done: builds, runs the relevant tests, exercises the changed behaviour and its nearest neighbouring flows.
  - Reports what it ran, what it saw, and anything that does not match `plan.md` or the acceptance criteria.
  - Report only; never fixes.

### `/create-skill <name> "<pattern or policy>"` (meta skill, `disable-model-invocation: true`)

The single source of the skill-authoring practice for project skills. It is used in Phase 3 and 3B and whenever a developer later needs a new skill. Vendor skills are exempt from it but are checked for overlap.

`authoring-standard.md` (≤80 lines) defines:

1. **When a skill is justified:** the inclusion criteria from Phase 3B (including the vendor-overlap criterion); otherwise use `CLAUDE.md`, a rule, a vendor skill or a prompt.
2. **Structure:**
   - `.claude/skills/<name>/SKILL.md` (≤70 lines)
   - Optional `reference.md` (≤60 lines) with exemplars and skeletons
   - Optional `checklist.md`
   - Optional `scripts/`
   - References one level deep; Claude reads them only when needed (progressive disclosure)
3. **Frontmatter:**
   - `name`: lowercase-hyphen, verb-first for task skills; never the same name as a vendor skill.
   - `description`: third person; says **what** the skill does **and when** to use it, with the concrete terms a developer would type; ≤3 lines. A vague description means the skill does not trigger.
   - `disable-model-invocation: true` for skills with side effects or gates (workflow, meta, publishing). Policy and architecture skills stay model-invocable.
   - `allowed-tools` only when it narrows access.
4. **Body sections, in order:**
   - Metadata line: `Owner | Source (ADR IDs, docs) | Status (Draft/Active) | Last reviewed`
   - When to use / when not to use (name any vendor skill that covers the generic part)
   - Preconditions: architecture skills run only inside an approved `plan.md`
   - Steps as a numbered checklist with exact paths
   - Invariants, linked to rules and policies, never restated
   - Verification: commands and check scripts; paste the output
   - Done criteria
5. **Writing style:**
   - Concise; assume Claude is competent.
   - Imperative.
   - Consistent terminology (the glossary's terms).
   - No time-sensitive statements.
   - Strict steps for fragile operations (migrations, concurrency, authorization); more freedom for low-risk ones.
   - Include a validate → fix → re-validate loop.
   - Prefer a small utility script over asking Claude to generate the same check code each time.
6. **Testing:** 3 should-trigger and 1 should-not-trigger prompts, run in a fresh session; check against overlapping descriptions, including vendor skills; add an eval case for the skill to `evals/` when evals start.
7. **Governance:**
   - Created and changed only through a PR.
   - The Tech Lead approves; the owner signs off.
   - Update in the same PR as any ADR or policy change it depends on.
   - Retire skills that are no longer used.

`SKILL.md` steps:
1. Check the request against the inclusion criteria; stop with a recommendation if it fails.
2. Check for overlap with existing skills (project and vendor), rules and `CLAUDE.md`.
3. Draft the skill.
4. Self-check against the standard.
5. Output the trigger test list.
6. **STOP for approval.**

### Workflow skills (all `disable-model-invocation: true`)

Each `SKILL.md` contains: purpose, input, preconditions, exact required reads, steps, output, gate and approver, and "do not" items. They point to rules and policies; they never restate them.

- **`/analyze-brd [revision|module]`:** the Phase 1 procedure, applied as a delta for BRD revisions placed in `BRD/`.
- **`/prepare-backlog <module> | --map | --check`:**
  - **`<module>`** writes one `feature.md` per feature (from `feature-template.md`) and one `story.md` per story inside its feature folder (from `story-template.md`, state `draft`), using the verified legacy stories from `User-Stories/` and `ADO_Import/` as input.
    - Epic is recorded as an `epic:` front-matter field; features are folders with a `feature.md`.
    - Re-running the skill updates existing story files in place. It never renumbers keys, and it never changes a story past `ready`.
  - **`--map`** runs `scripts/build-story-map.mjs` to regenerate `story-map.md`.
  - **`--check`** runs the script in validation mode.
  - **Gate:** PO approves the features, stories and `ui` decisions; Tech Lead approves the dependencies and the suggested feature assignments.
  - **`backlog-format.md` defines the breakdown standard:**
    - **Story fields:**
      - Permanent key `S-<MOD>-NNN` (never reused). The fields below map onto the `story.md` front matter and body defined in "Git, GitHub and docs-based stories".
      - Title
      - Type: Story, or Enabler (`Contract`, `Data`, `Core`), or Spike
      - "As a / I want / so that" for user-facing stories
      - Given/When/Then AC, including permission-denied and invalid-state cases
      - REQ/BR/WF references; legacy IDs
      - Feature key; layers touched (contract, db, api, ui)
      - Size (≤3 developer-days, otherwise split)
      - Risk tier
      - **Contract impact:** operationIds added or changed, and which contract file; or "none"
      - **Data impact:** tables and schema area; migration yes/no
      - **Process impact:** process service or component; required `WF-P*`
      - **UI impact:** `ui:` value (`figma:<ref>`, `compose`, `pending` or `none`) and the screens involved
      - **Depends on:** key + type (`Contract` / `Data` / `Core` / `Functional` / `Permission` / `External`) + a one-line reason
      - **Conflicts with:** keys touching the same tables or contract files; never run these concurrently
      - Unblocks and wave (computed by `build-story-map.mjs`, never written by hand)
    - **Feature rules:**
      - A feature is a coherent capability or user journey within one module, 3–8 stories, ownable by one developer end to end in about one to two weeks.
      - Draw feature boundaries so three developers can work at once: minimise cross-feature dependencies, shared tables and shared contract files.
      - `feature.md` lists its stories in build order and its dependencies on other features or core phases.
    - **Splitting rules (stories):**
      - Vertical, independently testable slices (INVEST) through every layer the behaviour needs: contract → migration → API → UI → tests. No backend-only or frontend-only stories inside a feature, except as below.
      - Split the UI part into its own story when its screen design is `pending`, or when the slice would exceed 3 developer-days.
      - A **Contract enabler** story exists only when another feature needs the operations before the owning feature delivers them (the YAML path, parameter, schema and example files, errors and the authorization note); otherwise the contract change is the first step of the story that implements it.
      - Shared tables get a **Data enabler** only when more than one feature needs them first.
      - E2E checks for a critical journey go in the feature's last story.
      - Prefer feature boundaries that increase wave 0.
      - No cycles.

- **`/pick-story [feature-key]`** (read-only):
  - Runs `build-story-map.mjs` first, so the map reflects the current front matter (the single source of state), then reads the ready list and conflict groups.
  - Without an argument: if the current developer (`git config user.name`) owns an unfinished feature, lists that feature's next ready stories; otherwise lists unclaimed features whose hard predecessors are done, ordered by critical path, each with its first ready story. With a feature key: lists that feature's ready stories. A developer finishes a feature before claiming another unless the Tech Lead says otherwise.
  - A story is ready when:
    - It is `ready` on `main`, and all hard predecessors are `done` on `main` (merged PRs). A `contract` dependency is satisfied once the contract story's PR is merged.
    - No branch claims it, and no conflict-group member is claimed.
    - Its feature is unclaimed or owned by the current developer.
    - If it touches `ui`, its `ui` is not `pending`.
  - Lists **blocked** stories with their blocker (including "waiting for screen design"), and which stories each in-progress item will unblock.
  - Changes no files other than the regenerated map.
- **`/write-spec <story-key | "free-text idea/bug/incident">`** (playbook Plan + Design):
  - **Story key:** reads `story.md` and its `feature.md`. The story must be `ready` and unclaimed, and its feature unclaimed or owned by the current developer. **Stops** if a hard predecessor is not `done` on `main`, or if the story touches `ui` and has `ui: pending`.
  - **Branch first:** the working tree must be clean (otherwise stop). With the user's OK, Claude switches to `main`, pulls (`--ff-only`), and creates `feature/<key>-<slug>`. Everything for this story happens on that branch.
  - **Free text** (new idea, bug, incident): creates the branch (`fix/B-NNN-<slug>` for bugs), then the story folder with a `draft` `story.md`, and stops for PO approval to `ready` before writing the spec.
  - Writes `spec.md` in the story folder:
    - Requirements and design
    - **Contract changes:** the operationIds to add or change, the exact `.yml` files to create or edit (path, parameters, schemas, examples, and the `openapi.yml` index line), errors, whether the change is breaking, and any legacy contract in `Contracts/` it migrates
    - Data and UI impact (Figma reference, or the UI framework components to compose from; missing components and their `S-UIK-*` dependency)
    - Acceptance criteria
    - **Flagged concerns**, especially conflicts between policies, and between vendor guidance and project rules
    - The skills applied (project and vendor), plus the commit SHA of `.claude/` at generation time (the governance record)
  - Applies all three policy skills and reads the linked REQs, ADRs and design sections, never the whole BRD.
  - **STOP:** the PO approves after resolving flagged concerns with policy owners. State moves to `spec-approved` and the approval is recorded.
- **`/plan-story <id>`** (run in plan mode):
  - Requires an `Approved` spec.
  - Uses LSP for precise C#/TypeScript navigation and Explore for broad, targeted code inspection.
  - Writes `plan.md`:
    - Files that change
    - Order of work
    - Vertical-slice order:
      1. Edit the contract (or confirm the Contract enabler is merged).
      2. Regenerate the Angular client.
      3. Migration, if any.
      4. API implementation, passing the drift test.
      5. UI against the generated client (mocks from the examples only if the UI is built before the API).
      6. Tests for each AC, backend and frontend.
    - Migration steps, respecting conflict groups
    - Tests that prove each AC
    - Risks
    - Alternatives rejected
    - Risk tier
    - Handoff section
  - Lists the **architecture, policy and vendor skills that apply** and follows their steps, with project skills taking precedence. If a needed pattern has no skill and will recur, it proposes one via `/create-skill` instead of improvising.
  - If the change is the first implementation of a `Draft` skill, the plan includes finalizing that skill (exemplar paths, check script, status `Active`).
  - Interrogates itself: what could this break, which step is riskiest, what was not chosen and why.
  - Iterates until an engineer who never saw the conversation could implement it from the plan alone.
  - **STOP:** developer approval (Tech Lead for high-risk). State moves to `plan-approved` and the approval is recorded.
- **`/implement-story <id>`:**
  - Refuses unless the state is `plan-approved` and the current branch is the story's branch. Sets `owner` and `in-progress`.
  - If `main` moved, Claude suggests rebasing; it runs the rebase only when asked.
  - For bugs:
    1. Write the reproducing test.
    2. Run it and confirm it fails for the expected reason.
    3. Ask the user to commit the test, or commit it if they request it.
    4. Create `.work/fix-mode`.
    5. Fix the code.
    6. Remove the marker.
  - Implements in plan order, with tests, running the feedback loop until green. Uses LSP diagnostics for fast feedback, then build and tests for evidence.
  - Acts on every `security-guidance` warning: fixes it, or records why it does not apply for the PR.
  - The API implements the contract and passes the drift test. The UI calls the API only through the regenerated client and uses only UI framework tokens and components.
  - Any contract change not in the plan → **stop**: other features may depend on it, so it needs re-approval.
  - Any deviation → stop and ask, then update `plan.md` in the same commit.
  - Calls `verifier` before reporting done.
  - Updates Handoff.
- **`/review-story <id>`:**
  - Runs `code-reviewer` per touched area in parallel, with `security`/`concurrency` focus for high-risk work.
  - Workflow matrix check.
  - Writes the merged findings + verdict into the PR description draft (`.work/pr/<key>.md`) and sets `in-review`.
  - Fixes only when instructed.
  - Compliance pass includes the steps and invariants of the architecture skills listed in `plan.md`, plus their check scripts.
  - Repeated mistakes → propose the `CLAUDE.md`, rule or skill change; repeated vendor-guidance conflicts → propose an entry in "Vendor overrides".
- **`/complete-story <key>`:**
  - Checks the Definition of Done.
  - Confirms that any `Draft` skill this change was meant to finalize is now `Active`.
  - Sets `done` (merging the PR is what makes it `done` on `main`).
  - Regenerates the map on the branch.
  - Finalizes the PR title and body. Lists the stories and features this PR will **unblock**, flags contract changes that other features consume, and notes when this PR completes its feature.
  - **Only if the user explicitly asks:** commit, push the branch, and open the PR with `gh pr create`. Otherwise it gives the user the commands, title and body.
  - Never merges. The user merges in GitHub, and the next story starts from the updated `main`.

### Other docs

- **`docs/architecture/overview.md`:** modular monolith; layout; module boundaries; the domain-agnostic process core (own schema) vs process services in business modules; channel-independent APIs; relationship to the existing `Database Schema/`; exclusions with links to ADRs.
- **`docs/architecture/security.md`:**
  - Sandbox dev authentication: Development-only + explicit flag + a startup guard that fails elsewhere; switchable test users.
  - Target: OIDC Authorization Code + PKCE behind a replaceable adapter.
  - BFF as a `Proposed` ADR.
  - Actor resolution for humans and services.
  - The authorization model.
  - External clients get explicit grants only.
- **`docs/design/design-system.md`:** an index into Figma (files from `figma-files.md`) and `Design_System/` (where foundations, components and patterns live; data is not copied), a link to the extraction in `docs/ui-framework/figma/`, the **screen-coverage table** (module → story → Figma reference, `compose` or `pending`), and the designer handoff for missing screens and component specs. The rules live in `ux-standards`; the framework design lives in `docs/ui-framework/`.
- **`docs/development/workflow.md` (the playbook in practice):**
  - Stage mapping, sources of truth, roles and risk tiers (the authoritative copy of the tables at the top of this prompt).
  - Gate table.
  - **Git and GitHub flow:** one branch per story from `main`; the story lifecycle and states; how approvals are recorded; the PR flow (the user merges in GitHub); claiming by branch; commit and push only on request.
  - Context management.
  - Developer quick start, including toolset setup (language servers, plugins, vendor skills) for a new machine.
  - **Autonomy progression:** start with default permissions + plan mode; allow auto-accept only for routine changes once the hook, tests and `CLAUDE.md` have matured.
  - **Configuration governance:** changes through PRs; Tech Lead approves; policy owners sign off their skills; monthly `REVIEW.md` tuning; `/doctor prompt-audit`.
  - **Skill catalog and lifecycle:** table of skills (name, type: workflow / policy / architecture / vendor, owner, status, source ADRs or vendor version); the Draft → Active rule; ADR change → skill update in the same PR; new project skills only via `/create-skill`; vendor update procedure.
  - **Vendor overrides:** known cases where a vendor plugin or skill conflicts with a project decision, and which file wins.
  - **Metrics** (from git history, story front matter and GitHub PRs): time from story → spec → plan → merge; first-pass build/test success; rework cycles; plan-vs-diff match; repeated mistakes; review findings citing a policy (should trend to zero); time stories spend `ui: pending`; feature lead time (first story claimed → last story merged).
  - **Maintain loop:** bugs, incidents and change requests enter via `/write-spec`.
  - Claude never deploys.
- **`docs/development/collaboration.md`:**
  - Branches: `feature/<key>-<slug>`, `fix/B-NNN-<slug>`, `chore/<slug>`. Always created from the latest `main`, short-lived, one story per branch, deleted after merge.
  - Commit messages start with the story key.
  - **GitHub branch protection on `main`** (configured by the user):
    - PR required
    - At least 1 approval from someone other than the author
    - Conversations resolved
    - Status checks once CI exists
    - No direct pushes or force pushes
    - CODEOWNERS per module, once usernames are known (including `Design_System/` → UX owner, `BRD/` and `User-Stories/` → PO)
  - The user merges PRs in GitHub; squash or merge commit per team choice.
  - **Feature ownership:** one developer per feature, end to end; derived from story claims or assigned in `feature.md` by the Tech Lead; reassignment only by the Tech Lead. Process-core area ownership is separate.
  - **Contract-first flow (within a feature):**
    1. The story's first step edits its module's contract files; the Angular client is regenerated, and the API and UI are built against it on the same branch, verified by the drift test.
    2. When another feature needs the operations early, a Contract enabler story is merged first, and the developer of the consuming feature reviews it.
    3. One open PR per contract path file at a time. Index lines in `openapi.yml` stay sorted, so parallel additions rarely conflict.
  - **Design handoff:** how a designer delivers a missing screen (Figma reference added to the screen-coverage table and the story's `ui:` in a `chore/` PR the PO approves).
  - **Picking work:** finish your feature, then run `/pick-story` to claim the next. Never start a story with unmet hard dependencies, an active conflict, another developer's feature, or a pending design for its UI.
  - Migration sequencing protocol between all three developers (any of them may add a migration).
  - Cross-cutting changes announced first, including shared Angular files (routes, navigation, shared components) and the backend composition root.
  - **Parallel sessions:** 2–3 per developer using `claude --worktree <name>`, only for changes that touch different files.
- **`evals/README.md` (≤40 lines):**
  - Eval case format: prompt, base commit, checks (tests pass, lint clean, policy followed).
  - Seed 20–50 cases from the first sprints' real tasks; add one per escaped defect and one per vendor override.
  - Run headless (`claude -p`) locally whenever `CLAUDE.md`, `.claude/**`, `REVIEW.md` or the vendor toolset change, and later in GitHub Actions.

---

# PART B: Business process management requirements (hybrid: explicit C# process services)

Design these in Phase 2 and document them in Phase 3 (`docs/workflow/01–08`). Every capability must trace to a `WF`/`REQ` ID or to an approved reusability decision. Where `Database Schema/` already models a concept, reuse or reshape it explicitly and record the decision; never silently inherit a design that breaks an invariant below.

**The BRD decides; the architecture serves it.** Build only what is needed, and build it correctly.

## B1. Decision and principles

**Direction:** hybrid, database-driven business process management with explicit C# process services.

Validate this against the BRD before treating it as final. If a documented workflow cannot be implemented cleanly this way, explain why and propose a practical alternative. If the design becomes more complex than a dedicated engine would be, document that risk. Never rebuild a generic workflow engine through gradual abstraction.

- **Process structure and routing → C#.** One explicit process service per business process, composing reusable components. No giant service that holds every process.
- **Configurable operational rules → database** (see B3).
- **Business-specific decisions → C# policies**, registered explicitly.
- **Execution state → relational SQL Server tables.** Never store the whole runtime state in JSON.
- **Scheduled operations → .NET `BackgroundService`** over a persisted work table.
- **Audit and reporting → SQL.**

**Excluded:**
- Elsa, Flowable, Workflow Core and Temporal
- Azure Logic Apps for core process management
- Saga or orchestration frameworks
- BPMN interpreters
- Scripting or expression engines
- Reflection-heavy dispatch
- Redis, RabbitMQ and Kafka, unless an approved ADR justifies them

**Structure:**
- A domain-agnostic **process core** module with its own schema (e.g. `bpm`). It owns: lifecycle, parent-child coordination and joins, human tasks and assignment, versioned configuration, audit, scheduled work, and reporting foundations.
- **Business modules** own the process services and policies.
- Recommend the minimal project structure; never one project per component.
- Status queries, work-pool listings and reports never execute process logic or reconstruct whole hierarchies.

## B2. Reusable components and extensibility (new processes and new kinds of activity)

Build only the components the BRD needs. Likely candidates:
- **Lifecycle:** start, guarded transition, suspend/resume, complete, cancel.
- **Human review stage** with slots.
- **Clarification or rework round.**
- **Child-process launch + join**, using BRD completion rules.
- **Timer and escalation.**
- **Findings.**

Each component has:
- A small explicit C# contract
- Typed settings read from versioned database configuration
- Defined behaviour on suspend, resume, withdraw and return
- Its own audit events
- A pass on the shared **component conformance test suite**: idempotency, concurrency, suspend/resume, return, audit

How the system grows:
- **New process** = a new process service + configuration rows + tests. The core does not change.
- **New kind of activity** = a new component + conformance tests. The lifecycle core does not change.
- Components and policies are registered explicitly (DI, keyed services); no assembly scanning.
- Document "How to add a process" and "How to add a component" (≤40 lines each) in `03-process-model.md`.

## B3. Configuration and versioning

- **Database-configurable values** (as the BRD requires):
  - Reviewer counts
  - Roles and permissions
  - Per-slot eligibility
  - Assignment expiry
  - Escalation deadlines
  - Review thresholds
  - Optional reviews
  - Policy parameters

  Never hardcode values the BRD says are configurable.
- Evaluate relational tables vs JSON vs hybrid **for configuration storage**, with a comparison table and recommendation.
- **Configuration rules:** validated before activation; versioned and effective-dated; changes audited; editable only by authorized roles.
- **Version stamping:** every process instance records the **process version** (code) and the **configuration version** it runs under.
  - Changes never silently alter active cases unless an approved migration policy says so.
  - Because routing is in code, cases can run for up to 6 months across deployments. Routing changes must be version-aware, or applied through an explicit, approved migration of running instances.

## B4. Human review, pools and assignment

- **Stage requirements:**
  - One reviewer, or N independent reviewers
  - Same or different roles
  - Permission-based eligibility
  - Conditional extra reviewers
  - Senior or super-reviewer
  - Comparison of evaluations per a configured policy
  - On disagreement: adjudication, then proceed, return, escalate or reject
- **Pools:** exposed by role or permission. Slots are claimed or checked out, with eligibility per slot.
- **Eligibility factors to consider:** department, organization, conflict of interest, prior participation, independence.
- **Claiming rules:**
  - A reviewer may not hold independent slots on the same unit unless explicitly allowed.
  - A unit with all slots filled is no longer claimable.
- **Leases:** expire after a configured period. Expired, incomplete slots are released. Completed evaluations are preserved when other reviewers' leases expire or are reassigned.
- **Supervisors** can reassign or release, with history retained.
- **Critical:** slot limits and independence are guaranteed at the database level across all instances. With two slots, simultaneous claims never produce three active assignments.
  - **Hypothesis to evaluate:** pre-materialized slot rows + one atomic conditional `UPDATE … OUTPUT`, plus a unique filtered index for independence.
  - Never COUNT-then-INSERT.
- **Access:** reviewers see only work and data permitted by their authorization and assignment. Changing an ID or action name in a request never grants access.

## B5. Transitions and actions

- **Actions, as the BRD requires:** approve, reject, return, proceed, escalate, request clarification, submit evaluation, reassign, withdraw, resume, suspend, complete.
- **Validation:** every action is checked against the process version and service, current state, permissions, assignment, and policies.
- **Rejection:** invalid, stale, duplicate and replayed actions are rejected safely, using idempotency records and rowversion.
- **History:** returns and reopening never overwrite history. Repeatable stages use explicit execution **rounds**.
- **No arbitrary status updates:** every state change goes through explicit lifecycle rules.

## B6. Nested and parallel processes

- **Structure:** multi-level parent-child hierarchies; independent child state; parallel and conditional child activation.
- **Completion:** follows the BRD's rules. Do not assume every child must finish before the parent progresses.
- **Concurrency guarantees:**
  - No duplicate process or stage activation.
  - Simultaneous parallel completion triggers the next step exactly once.
  - Returning or suspending one branch never resets unrelated branches.

## B7. Withdrawal, suspension and resumption

Analyze, per the BRD:
- Which states allow withdrawal.
- Whether withdrawal is temporary or terminal.
- Where resumption is allowed.
- What happens to active assignments and deadlines.
- Whether completed reviews stay valid.
- Whether application changes trigger re-evaluation.
- How parents and children suspend.
- How parallel branches resume.
- How withdrawal racing a review submission is resolved.

Resumption never restarts completed work. Full history is preserved.

## B8. Findings and clarifications

- Comments, findings and clarification requests against host-defined section or field identifiers.
- Resolution status; candidate and reviewer responses.
- Links to rounds and tasks.
- A reference to the reviewed version of the application data.
- No domain forms inside the core.

## B9. Audit

- **Append-only business audit,** written in the same transaction as the business operation.
- **Fields:** actor, action, UTC time, process, parent/child references, stage, round, previous and resulting state, decision, reason, assignment details, correlation ID, entity references.
- **Excluded:** payloads, tokens and unnecessary personal data.
- Kept separate from technical logs.
- Access to audit history is controlled.

## B10. Reporting

Analyze the BRD's reporting requirements. Likely areas:
- Status, pending reviews, available vs assigned work, workload
- Time per stage, overdue cases and SLA breaches
- Escalations, rejections, disagreements, returns and rounds
- Withdrawals and resumptions
- Completion rates and parent-child progress
- Full case history

Approach:
- Serve reports from relational queries and indexes.
- Add read models or projection tables only where justified, updated in the same transaction.
- Evaluate `READ_COMMITTED_SNAPSHOT` (needs DBA approval) so reports never block operations.

## B11. Database design

**Conceptual responsibilities** (not mandatory table names):
- Process configuration and instances; stage instances
- Parent-child relationships and dependencies
- Tasks, slots and assignments
- Decisions; findings and clarifications
- Transitions; withdrawal and resumption
- Scheduled actions
- Audit; idempotency
- Outbox / integration events
- Reporting

**Define:** primary and foreign keys, unique and filtered indexes, query indexes, concurrency tokens, transaction boundaries, state invariants, and history-preservation rules. Avoid unnecessary entities and over-normalization. Map each responsibility to the existing `Database Schema/` where it already exists (keep / reshape / replace, with reason).

**Concurrency:** for highly concurrent operations, evaluate atomic SQL, isolation levels, constraints and stored procedures, with documented justification.

**Invariant protection matrix** (in `04-database-design.md`): one row per critical invariant, stating whether it is protected by a **database constraint**, a **transaction** or an **application service**, and how. Optimistic concurrency alone never protects multi-row invariants. Cover at least:
- Slot limits
- Independence
- Single activation of a stage or child process
- Join completion
- Duplicate commands
- Withdrawal racing a submission
- Lease expiry
- Worker claiming
- Audit atomicity

## B12. Non-functional requirements (highest priority)

- **Scale:**
  - Stateless, horizontally scaled APIs behind load balancers
  - Short transactions; async I/O; efficient connection use
  - Index-friendly, server-side paginated queries
  - No N+1
  - Minimal locking
- **Reliability:**
  - Idempotent commands
  - Deadlock handling with bounded retries
  - Durable scheduled actions
  - Multi-instance-safe worker claiming (e.g. `READPAST`/`UPDLOCK` leases) or an enforced single active worker, with failover limits documented
  - No duplicate processing
  - Safe recovery after restarts
- **Protocols:** plain HTTPS REST only; no WebSockets, SignalR or long polling.
- **Performance:**
  - Don't invent capacity guarantees.
  - If `nfr.md` has no traffic figures, list the metrics to collect and propose placeholder targets.
  - Load-test scenarios: competing claims, simultaneous submissions, parallel completion, active and suspended mixes, heavy status polling.

## B13. Security

- **Authentication:** enterprise SSO/OIDC behind a replaceable adapter; sandbox auth per `docs/architecture/security.md`.
- **Authorization:**
  - Policy-based and resource-level.
  - Eligibility, assignment ownership and independence enforced server-side.
  - Protection against unauthorized transitions and replays.
- **Data:**
  - Configuration changes secured and audited.
  - Least-privilege data access.
  - Sensitive data protected.
- **Logging:** structured, with correlation IDs.

## B14. APIs

Versioned REST endpoints for:
- Starting a process
- Status
- Permitted actions for the current user
- Eligible pools
- Claim, release and reassign
- Submit evaluation and complete
- Return and escalate
- Clarifications
- Withdraw and resume
- History
- Reports

Identity always comes from server context. Every endpoint is defined design-first in `Contracts/openapi/` as the first step of the story that implements it (or in a Contract enabler story when another feature needs it first), and verified by the drift test.

## B15. Testing and traceability

**Traceability chain:** BRD requirement → process / feature → user story (with legacy IDs) → implementation task → acceptance criteria → test. Kept in `requirement-matrix.md` using the columns from Phase 1.

**Testing:** xUnit; real SQL Server for concurrency-critical behaviour, never InMemory. Cover actual BRD scenarios, including exceptional paths:
1. Concurrent claims of the last slot
2. Reviewer independence
3. Simultaneous submissions
4. Duplicate process or stage activation
5. Parallel completion
6. Nested completion per BRD rules
7. Matching and mismatching evaluations, adjudication
8. Return and repeated rounds with preserved history
9. Withdrawal during active review
10. Resume after withdrawal
11. Lease expiry and reassignment
12. Unauthorized actions
13. Duplicate and replayed requests
14. Worker restart and recovery
15. Audit consistency
16. Reporting accuracy across rounds and children
17. Version stamping across a configuration change
18. The component conformance suite

## B16. Architecture challenge (answer in Phase 2)

- Can every BRD workflow be represented cleanly?
- Are process services becoming coupled?
- Are stages and statuses modelled consistently?
- Is parent-child coordination reliable?
- Can parallel completion avoid duplicate actions?
- Are claims concurrency-safe?
- Do returns preserve history?
- Does withdrawal work across nested processes?
- Can SQL Server sustain the load?
- Are reports efficient without blocking writes?
- Is it safe across multiple instances?
- Does the worker recover correctly?
- Does it stay maintainable as processes are added?
- How are in-flight code and configuration versions handled?
- Does the existing `Database Schema/` support these guarantees, or what must change?
- Is the 2-week core scope achievable?

## B17. Timeline, tracks and Definition of Done

**Three tracks** (plus the UI framework enabler track, Part C §C9):
1. **Core reusable component** (~10 working days with Claude Code; staffing decided at Gate 2, recommended: two developers on separate files and tables, while the third builds the UI framework foundations and components, the Angular shell on top of it, and features that do not need the core): lifecycle, coordination and joins, slots and assignment, versioned configuration, audit, scheduled worker, reporting foundations.
2. **Business-specific implementation:** features derived from the BRD, each owned end to end (process service, policies, contract, API, UI, tests) by one developer, sequenced by dependency and screen-design availability.
3. **Production hardening:** load validation, failover, monitoring, security approval, operational acceptance.

**Non-deferrable work**, landing in the phase that introduces the behaviour:
- Atomic claim
- Idempotent transitions
- Single activation and join deduplication
- Audit in the transaction
- Worker lease and recovery
- Server-side authorization and eligibility
- Version stamping

State what does not fit in 2 weeks.

**Every core phase follows the playbook artifact chain:**
1. `spec.md` (written in Phase 4)
2. `plan.md` in plan mode, approved by the Tech Lead (core work is high-risk)
3. Diff + tests, with pasted evidence
4. `verifier` check
5. `/review-story` with `concurrency`/`security` focus
6. PR approved by a developer who did not write it; merged by the user in GitHub

**Core Definition of Done (initial release):**
- A representative BRD process runs end to end, including nested and parallel parts.
- Every invariant in the matrix is protected and tested on SQL Server.
- Eligibility, slots and independence hold under concurrent claims.
- Policies and adjudication work.
- Return, escalation, withdrawal and resume keep state consistent.
- Audit history is accurate and queryable.
- Reports are correct.
- The system survives restarts.
- Duplicate commands are handled safely.
- Security-critical checks happen server-side.
- A second process or a new component was added without modifying the lifecycle core.
- Initial load and concurrency benchmarks are documented.

Production readiness additionally requires validated infrastructure, failover, security, monitoring and operational acceptance.

---

# PART C: Custom Angular UI framework (owned, Figma-driven, reusable)

Design in Phase 2, document in Phase 3 (`docs/ui-framework/*`), plan in Phase 4. It is implemented later through `S-UIK-*` stories with the same artifact chain as everything else. **No implementation and no dependency installs until the architecture is approved (Gate 2, then Gate 3) and the per-phase plan is approved.**

The goal is a fully functional, professional, independently owned Angular UI framework that the admissions platform consumes and that can be reused across multiple enterprise applications.

## C1. Decision and principles

- Built from scratch with Angular, TypeScript, HTML and SCSS. We develop and own every component, CSS utility, layout system and style.
- **Banned:** third-party UI libraries and CSS frameworks (see "Fixed context"). Angular CDK only if its ADR is accepted at Gate 2; weigh the cost of building overlays, focus trapping and live announcements ourselves against the dependency.
- **Domain-agnostic:** no admissions terms, business rules, API clients or app imports. The admissions app consumes the framework through its public API like any other application.
- **Figma is the source of truth** for colours, typography, spacing, layouts, components and specifications. Translate Figma into our own tokens, SCSS variables, CSS custom properties and components. Never invent a design decision Figma specifies; where Figma is silent or contradictory, raise a `Q-NNN` (resolver: UX owner) or mark a `Proposed` item for UX owner approval.
- **Reusable, configurable, accessible and responsive** by default; consistent APIs across all components.
- **Packaging (propose at Gate 2):** an Angular workspace library with secondary entry points per component for tree-shaking, plus a documentation/playground app built with the framework itself. Recommend keeping it in this repository now behind a strict boundary so it can be extracted into its own repository and package later; record the decision, prefix and versioning (semver) in an ADR.

## C2. Figma extraction (Phase 1.5, read-only)

Write to `docs/ui-framework/figma/`; every row cites `file key + node ID` and is marked `Confirmed (Figma node)`, `Question (Q-NNN)` or `Proposed (UX owner)`.

- **`index.md`:** files, keys, versions/last-modified, pages, extraction date, coverage `file | page | inspected | extracted`.
- **`foundations.md`** (split per category above 300 lines): `token | Figma variable or style (collection, mode, ID) | value per mode | type | tier | proposed CSS custom property | SCSS name`, covering colour (primitive and semantic), typography, spacing, sizing, radius, borders, elevation, opacity, motion, z-index, breakpoints, grids and layout, iconography.
- **`components/<component>.md`** (≤100 lines): Figma node, anatomy, variants and properties → proposed inputs, states (default, hover, focus-visible, active, disabled, readonly, error, loading, selected), sizes, tokens used, layout and spacing, responsive behaviour, accessibility annotations, content guidance, open questions.
- **`gaps.md`:** values not bound to variables, inconsistent tokens, missing states or modes (e.g. no dark values, no focus state), missing component specs, Figma vs `Design_System/` differences.

## C3. Design tokens and theme engine

- **Tiers:** primitive (raw palette and scales) → semantic (purpose, e.g. surface, text, border, danger) → component (per component). Components consume semantic or component tokens only; never primitives or literal values.
- **Pipeline (ADR):** one committed token source generated from Figma variables (propose a format, e.g. W3C Design Tokens JSON) → a dependency-free Node generator produces SCSS variables/maps and CSS custom properties. Generated files are never hand-edited (guard hook). Token updates from Figma go through `sync-design-tokens` in a PR the UX owner reviews.
- **Themes:** light and dark from Figma modes; **custom themes** override semantic tokens and are validated against the semantic token contract (every required token defined, contrast met).
- **Runtime:** theme applied via an attribute on the root element and CSS custom properties; switchable at runtime through a signal-based theme service; respects `prefers-color-scheme`; no flash of the wrong theme on load; optional persistence of the user's choice (no PII).
- **Contrast:** every semantic foreground/background pair meets the accessibility target in every theme, checked by a script and a Playwright test.

## C4. Base styles, layout and responsive utilities

- Our own reset/base styles and typography from Figma text styles.
- Layout primitives (container, stack, cluster/inline, grid, split, spacer) as components and/or a small set of token-generated utility classes with a documented prefix; no utility-first framework.
- Breakpoints from Figma; responsive SCSS mixins; container queries where they fit; touch targets per the accessibility target.
- Logical CSS properties throughout so RTL can be supported; whether RTL/Arabic is required is a Gate 2 decision from the BRD and Figma.

## C5. Component library

- **Inventory** (`docs/ui-framework/component-inventory.md`): the components Figma specifies, each with Figma node, consuming stories, priority (from the screen-coverage table) and status `Planned / Draft / Beta / Stable`. Build only what Figma specifies and the applications need; typical groups: actions, form controls (with form field and validation messages), feedback, overlays, navigation, data display, layout.
- **API conventions** (`docs/ui-framework/api-conventions.md`): standalone, `OnPush`, signal inputs/`model()`/outputs; consistent names (`variant`, `size`, `disabled`, `loading`, …); form controls implement `ControlValueAccessor` and work with typed reactive forms; content projection for slots; host class and selector prefix; encapsulation and documented styling hooks (public CSS custom properties) per ADR; no `::ng-deep`; no hardcoded user-visible text (labels and ARIA text are inputs, i18n-ready); no runtime dependencies.
- **Accessibility** (`docs/ui-framework/accessibility.md`): target per ADR (recommend WCAG 2.2 AA); semantic HTML first; WAI-ARIA Authoring Practices patterns; full keyboard support; focus management, trapping and return; visible focus; reduced motion; screen-reader names and live announcements.
- **Component Definition of Done:** source (TS, HTML, SCSS) using tokens only; matches its Figma spec in every state, size, theme and breakpoint; unit tests; Playwright tests (C7); docs page with playground and copy-paste source (C6); public API documented; changelog entry; Figma node linked.
- **Versioning:** semver; breaking changes to inputs, outputs, tokens or theme contract need Tech Lead approval, a changelog entry and migration notes.

## C6. Documentation and playground

An Angular app in the workspace, built with the framework itself. Developers can preview, configure, test and copy every component.

- **Per component page:** overview and Figma link; live preview; interactive controls for every input (variant, size, state, content) bound to the preview; theme (light, dark, custom) and viewport switchers; generated code snippet for the current configuration; the **full copy-and-paste source** (TS, HTML, SCSS) with a copy button; API table (inputs, outputs, slots, CSS custom properties); keyboard map and ARIA notes; usage do's and don'ts.
- **Foundation pages:** tokens rendered from the token source, colour with contrast values per theme, typography, spacing, icons, layout utilities, and a theming guide (how to create a custom theme).
- **No drift:** snippets, source views and API tables are generated from the library source at build time, never hand-copied. The copied source states which foundations (tokens, base styles) it needs to work in another project.
- Stable test routes and selectors so the playground is the Playwright target.

## C7. Validation with Playwright

- Playwright Test (ADR, `Proposed`; installed by the operator after approval) runs against the docs/playground app.
- **Per component:** behaviour (inputs, outputs, states), keyboard interaction, focus management, ARIA attributes, an automated accessibility scan (tool proposed in the ADR), and visual regression screenshots per theme (light, dark, one custom) and per key breakpoint.
- **Figma parity:** during development, compare the playground screenshot with the Figma node screenshot (via MCP) and iterate; record remaining differences in the PR.
- **Determinism:** animations disabled, fonts loaded, fixed viewports; browsers per the supported-browser decision.
- Baselines are committed; updating one needs a stated reason in the PR and UX owner review.
- App-level E2E for critical admissions journeys reuses the same setup.

## C8. Integration with the admissions app

- The app imports only the framework's public entry points; no deep imports, no copies of framework code inside feature folders.
- A feature story that needs a component that does not exist yet depends (type `component`) on the `S-UIK-*` story that delivers it, or raises one; it never builds an ad-hoc styled component.
- App-specific composites live in the app and are composed from framework components and tokens.

## C9. Plan and track

- Module `ui-framework`, key prefix `UIK`: features `F-UIK-NN`, stories `S-UIK-NNN`, written in Phase 4 like any other module.
- **Wave 0 foundations:** workspace library and docs app scaffolding; token source + generator + contrast check; theme engine; base styles, typography, layout and responsive utilities; docs/playground shell with generated source views; Playwright harness.
- **Then components,** ordered by the earliest feature UI stories that need them (from the screen-coverage table and `components:` fields), so feature work is not blocked.
- Staffing decided at Gate 2 (recommended: the developer not on the process core). State what fits in the first 10 days alongside track 1.

## C10. Architecture challenge (answer in Phase 2)

- Does Figma cover every foundation and component the BRD screens need? What is missing, and who supplies it?
- Are Figma values bound to variables with light/dark modes, or hardcoded?
- Angular CDK: allowed (behaviour only) or not? Cost and risk of building overlays and accessibility primitives ourselves.
- In-repo library vs separate repository and package registry; selector prefix; versioning.
- Token pipeline format, generator, and how Figma changes flow into code.
- Encapsulation strategy and public theming hooks.
- RTL/Arabic, i18n and supported browsers.
- How copy-paste source and API docs stay in sync with the code.
- Realistic component count before the first feature UI stories need them.

## C11. Documents (Phase 3, `docs/ui-framework/`)

`overview.md` (packaging, layout, boundaries, public API, versioning, how to add a component and a theme), `api-conventions.md`, `tokens-and-theming.md`, `layout-and-responsive.md`, `accessibility.md`, `docs-playground.md`, `testing-playwright.md`, `component-inventory.md`, plus the Phase 1.5 `figma/` extraction. Each fact lives in one file; rules and skills link to them.

---

## Critical restrictions (all phases)

Do not:
- Implement the system. This run produces documentation, configuration, the contract skeleton and the backlog only (see Output contract).
- Create, overwrite, rename or delete existing files except as approved at Gate 0.
- Edit anything in `BRD/`, `User-Stories/`, `ADO_Import/`, `Database Schema/`, `Design_System/` or installed vendor skills.
- Create a lowercase `contracts/` folder or an `_input/` folder.
- Install, update or remove plugins, language servers, vendor skills or packages (including Playwright and browsers).
- Use, propose as allowed, or copy code or styles from any third-party UI library or CSS framework (Bootstrap, Angular Material, NG-ZORRO, PrimeNG, Tailwind CSS and equivalents).
- Invent design decisions (tokens, values, states, breakpoints, component behaviour) that Figma specifies, or write to Figma.
- Implement UI framework components, tokens, the theme engine or the docs/playground before the UI framework architecture is approved and a per-phase plan is approved.
- Let vendor plugin or skill guidance override an ADR, rule, policy skill or `CLAUDE.md`.
- Skip pages, gates or questions.
- Invent requirements, roles, states, volumes or screen designs.
- Migrate a legacy story or contract without verifying it against the BRD.
- Claim full coverage unless `coverage.md` is 100%.
- Scaffold or implement before Gate 4 and a per-phase approval.
- Modify migrations or deployment configuration, or install dependencies, during planning.
- Remove existing working functionality.
- Create a parallel plan when an existing one can be updated.
- Commit, push or open a PR unless explicitly asked. Never merge, force-push, edit on `main`, or start a story on a branch not created from the latest `main`.
- Apply migrations to shared or production databases.
- Couple business logic or the process core to an identity provider, or the core to the admissions domain.
- Duplicate content across files.
- Trade correctness, security or test quality for fewer tokens.
