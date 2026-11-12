# DAHC — Project Guidelines and Claude Code Prompts

This bundle includes **four updated Markdown files** for the existing ASP.NET Core 10 / Angular / SQL Server application.

1. `dotnet-engineering-standards.md` — authoritative backend engineering standards, local-only SFA, deployed OIDC and Candidate-only automatic provisioning.
2. `angular-structure-and-guidelines.md` — Angular foundation requirements, authentication and **UI visual-reference-only** policy.
3. `claude-code-sdlc-planning-prompt.md` — incremental BRD-driven planning, four-developer coordination and visual-reference precedence.
4. `claude-code-foundation-audit-prompt.md` — audit existing foundation and propose targeted remediation before implementing; includes visual-reference policy.

## Recommended order

- Commit/tag the current existing foundation.
- Provide the ~80-page BRD, approved visual reference screens and standards in the Claude Code project workspace.
- Run **foundation audit** first (no destructive changes).
- Have humans approve remediation and cross-cutting architecture decisions.
- Run **SDLC planning** to catalog requirements and organize feature-by-feature work, then implement approved slices.

## Source-of-truth precedence

- BRD: business function, fields, validations, permissions, workflows.
- UI screenshots: **visual look and feel only**, never form completeness.
- .NET / Angular standards: implementation and architecture constraints.
- Explicit project decisions: approved exceptions, including local SFA and Candidate-only auto-provisioning.

Existing source files were preserved as the basis; policies were inserted without wholesale rewriting.
