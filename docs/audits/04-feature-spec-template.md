# 04 — Feature Specification Template (just-in-time)

Write one spec per approved slice, only when it is next. Keep it to 2–4 pages. Save it as `docs/specs/<slice-id>-<name>.md`. Do not copy BRD text. Cite line numbers in `BRD/Addmission_System_BRD.md` and ids from `docs/audits/appendix-b-brd-inventory.md`.

---

```markdown
# <Slice id> — <Name>

Status: DRAFT | APPROVED   Owner: <dev>   Reviewers: <BA>, <tech lead>, <FE lead>
Requirements: US-x.y.z (AC-1..n), BR-nn, WF-nn          BRD: L<from>-L<to>

## 1. Goal and scope
In: …
Out (explicitly): …

## 2. Actors and permissions
| Actor (active role) | Operation | Resource scope (own / pool / all) | Read/Write | BRD ref |
Every row must cite the BRD or an approved decision. An unstated rule goes to §10 as a BLOCKER, never as an assumption.

## 3. Business rules and validations
| Id | Rule | Where enforced (service rule class / DB constraint) | Error code | BRD ref |

## 4. State transitions
| Status profile | From | To | Trigger / actor | Guard | Side effects (audit, notification, assignment) | BRD ref |
Statuses use the BRD's exact names (map to enum codes).

## 5. Data
Entities/columns added or changed, invariants and the mechanism that protects each (unique/filtered index, row version, lock), migration owner, reference data seed.

## 6. API contract (link to openapi.yaml PR)
| Method + path | Policy (active roles) | Request | Response | Error codes (status + code) | Idempotency / ETag |

## 7. Frontend
Screens, with a **BRD field inventory** for each form: field, type, required, validation, condition, source, BRD line.
Components reused from dahc-ui, new components needed (playground page + spec), i18n keys, RTL notes, visual reference used.

## 8. Dependencies
Other slices, decisions (DEC/B/A ids), external systems, reference data.

## 9. Acceptance criteria → tests
| AC | Test level (Service / Data (InMemory) / API (InMemory) / Playwright E2E / SQL Server release check V-nn) | Test name | Negative path? |
Include for every write: unauthorized role 403, another owner's record 404, stale version 412, invariant violation 409/422.
Engine-dependent behaviour (unique/filtered index, FK, concurrency token, sequence, transaction, raw SQL) is never claimed by an InMemory test: list it as a release check (plan §2.3).

## 10. Unresolved
| Id | Question | BLOCKER / ASSUMPTION / DEFERRED | Asked of | Due |
The spec cannot be APPROVED while any BLOCKER remains.
```
