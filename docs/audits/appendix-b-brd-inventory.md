> Appendix B of the 2026-11-12 foundation audit (see README.md). BRD inventory with line citations into `BRD/Addmission_System_BRD.md`. Open questions here are the BRD-only view; their status after applying approved decisions is in `03-decisions-register.md`, which takes precedence.

# BRD Inventory — MBRU Unified Admission Platform, GME (Release 5), BRS v2.1

Source: `C:\Dev\Admissions\docs\brd\Addmission_System_BRD.md` (2515 lines, read in full).
Conventions: `Lxxx-yyy` = BRD line numbers. **FACT** = stated in BRD. **ASSUMPTION** = inference (labelled). **OMISSION** = needed for implementation, not stated.
Note: the markdown export lost heading numbers (every heading is a bare `#`). Section numbers below come from the Table of Contents (L17-133). Figures 1-7 (use case diagram, process flow, state diagrams) are embedded EMF images with no text (L314, L320, L328, L350, L373, L393, L407). Only the status tables can be analysed.

Scope (FACT, L197, L1816): the BRD covers the GME business unit only (Internship, Residency, Fellowship, plus Certificate). The MBRU track has a separate BRS. Release 5 is "Application Intake" and ends at initial announcement, screen-out or reannouncement. Shortlisting, interview, offer and ranking are Release 6.

---

## 1. Document structure

| # | Section (BRD heading) | Lines |
|---|---|---|
| — | Cover, TOC, Document Control, history, distribution, approvals | L1-183 |
| 1 | Introduction | L185-197 |
| 1.1 | Requirements Background (Situation / Current State / Future State) | L199-223 |
| 1.2 | Business Goals & Objectives to Achieve | L225-234 |
| 1.3 | Stakeholders | L236-263 |
| 1.4 | Dependencies on Existing Systems / Initiatives | L265-272 |
| 1.5 | References | L274-280 |
| 1.6 | Assumptions (numbered 1-4, 6-10; no item 5) | L282-292 |
| 2 | Functional Requirements | L295 |
| 2.1 | Business Roles (BRO-01..09) | L297-310 |
| 2.2 | Use Case Diagram (image only) | L312-316 |
| 2.3 | High-Level Process Flow (image only) | L318-322 |
| 2.4 | State Diagrams and Status Profiles | L324 |
| 2.4.1 | Application Status | L326-346 |
| 2.4.2 | Verification Status | L348-369 |
| 2.4.3 | Portfolio Status | L371-389 |
| 2.4.4 | Portfolio Round Status | L391-403 |
| 2.4.5 | Announcement Status | L405-419 |
| 2.5 | User Stories Backlog (Release 5) | L421-485 |
| 2.6 | Application Submission Epic [EPIC-01] | L487-1130 |
| 2.6.1 | Create Account and Login [STP-1.1] (US-1.1.1 L503-514; US-1.1.2 L516-522) | L489-522 |
| 2.6.2 | Access and View Dashboard [STP-1.2] (US-1.2.1 L540-574; 1.2.2 L576-582; 1.2.3 L584-590; 1.2.4 L592-606; 1.2.5 L608-621; 1.2.6 L623-629; 1.2.7 L631-644; 1.2.8 L646-659) | L524-659 |
| 2.6.3 | Prepare and Submit Application [STP-1.3] (US-1.3.1 L691-708; 1.3.2 L710-758; 1.3.3 L760-843; 1.3.4 L845-881; 1.3.5 L883-911; 1.3.6 L913-939; 1.3.7 L941-960; 1.3.8 L962-1006; 1.3.9 L1008-1035; 1.3.10 L1037-1073; 1.3.11 L1075-1081; 1.3.12 L1083-1102; 1.3.13 L1104-1130) | L661-1130 |
| 2.7 | Application Verification Epic [EPIC-02] | L1132-1570 |
| 2.7.1 | Access and View Dashboards [STP-2.1] (US-2.1.1 L1147-1153; 2.1.2 L1155-1204; 2.1.3 L1206-1227; 2.1.4 L1229-1292) | L1134-1292 |
| 2.7.2 | Retrieve and Manage Applications from Pool [STP-2.2] (US-2.2.1 L1310-1323; 2.2.2 L1325-1331; 2.2.3 L1333-1347) | L1294-1347 |
| 2.7.3 | Review and Verify Application [STP-2.3] (US-2.3.1 L1369-1375; 2.3.2 L1377-1392; 2.3.3 L1394-1400; 2.3.4 L1402-1408; 2.3.5 L1410-1416; 2.3.6 L1418-1432) | L1349-1432 |
| 2.7.4 | Escalate and Screen Out Application [STP-2.4] (US-2.4.1 L1450-1462; 2.4.2 L1464-1477; 2.4.3 L1479-1493; 2.4.4 L1495-1508; 2.4.5 L1510-1516) | L1434-1516 |
| 2.7.5 | Process Reinstatement Requests [STP-2.5] (US-2.5.1 L1531-1537; 2.5.2 L1539-1552; 2.5.3 L1554-1570) | L1518-1570 |
| 2.8 | Portfolio Scoring Epic [EPIC-03] | L1572-1812 |
| 2.8.1 | Access and View Referee Dashboard [STP-3.1] (US-3.1.1 L1588-1594; 3.1.2 L1596-1626; 3.1.3 L1628-1660) | L1574-1660 |
| 2.8.2 | Retrieve and Manage Portfolios from Pool [STP-3.2] (US-3.2.1 L1677-1683; 3.2.2 L1685-1702; 3.2.3 L1704-1718) | L1662-1718 |
| 2.8.3 | Review and Score Portfolio [STP-3.3] (US-3.3.1 L1743-1749; 3.3.2 L1751-1764; 3.3.3 L1766-1785; 3.3.4 L1787-1812) | L1720-1812 |
| 2.9 | Screening and Score Announcement Epic [EPIC-04] | L1814-2025 |
| 2.9.1 | Access and Monitor Screening Dashboard [STP-4.1] (US-4.1.1 L1828-1863) | L1818-1863 |
| 2.9.2 | Upload and Process CASPER Results [STP-4.2] (US-4.2.1 L1880-1915) | L1865-1915 |
| 2.9.3 | Announce Initial Screening Scores [STP-4.3] (US-4.3.1 L1931-1951; 4.3.2 L1953-1959) | L1917-1959 |
| 2.9.4 | Bulk Screen Out Applications [STP-4.4] (US-4.4.1 L1974-1989) | L1961-1989 |
| 2.9.5 | Reannounce Scores After Portfolio Appeal [STP-4.5] (US-4.5.1 L2003-2025) | L1991-2025 |
| 3 | Appendix | L2027 |
| 3.1 | Programs and Specialties (3.1.1 Certificate L2031-2036; 3.1.2 Fellowship L2038-2062; 3.1.3 Residency L2064-2089; 3.1.4 Internship L2091-2097) | L2029-2097 |
| 3.2 | Specialties Per Site Per Capacity: "TBC by business team" | L2099-2101 |
| 3.3 | Programs and Candidate Statuses | L2103-2114 |
| 3.4 | Terms and Conditions | L2116-2121 |
| 3.5 | Countries and Universities: "Extract from current system" | L2123-2128 |
| 3.6 | Accepted UAE Hospitals for Residency | L2130-2138 |
| 3.7 | Programs and Required University Degrees | L2140-2148 |
| 3.8 | Programs and Shortlisting Criteria and Weights | L2150-2160 |
| 3.9 | GPA Rubric | L2162-2193 |
| 3.10 | EMREE and EDREE Residency Exams Conversion Rules | L2195-2202 |
| 3.11 | SMLE and SDLE Residency Exams Conversion Rules | L2204-2210 |
| 3.12 | Email and SMS Templates: "TBC by business team" | L2212-2217 |
| 3.13 | Application Screen Out Reasons | L2219-2233 |
| 3.14 | Internship and Residency Portfolio Questions, Rejection Reasons and Customer-Facing Comments | L2235-2278 |
| 3.15 | Fellowship Portfolio Questions, Rejection Reasons and Customer-Facing Comments | L2280-2320 |
| 3.16 | Changes Tracker (Version 1.0), items 1-152 | L2322-2478 |
| 3.17 | Changes Tracker (Version 2.0), items 1-31 | L2480-2515 |

The document history lists v2.1 (L159), but no v2.1 changes tracker exists.

---

## 2. Modules

The BRD has no "module" concept. It is organised into Epics and Steps. The modules below group those Epics and Steps (ASSUMPTION about grouping). Content is FACT with line references.

| ID | Module | Purpose | BRD refs |
|---|---|---|---|
| MOD-01 | Identity & Access (IDAM/UAE PASS, role provisioning, role switcher, duplicate check, Candidate ID) | Delegated authentication; platform-side role/profile provisioning on first login; duplicate-account check; 9-digit Candidate ID | STP-1.1 L489-522; L268; US-2.1.1 L1147-1153; US-3.1.1 L1588-1594; L1110 n1; L1212 n1 |
| MOD-02 | Candidate Portal / Dashboard | Inbox of applications plus actions: Start, Resume, Discard, Withdraw, Reinstate, Edit Preferences, Exclude Training Site, Appeal; view scores | STP-1.2 L524-659; US-4.3.2 L1953-1959 |
| MOD-03 | Application Form (multi-tab) | Program/preference/site selection and all form sections, attachments, save draft, reminders, auto-archive | STP-1.3 L661-1081 |
| MOD-04 | Payment & Submission | Application Summary, payment gateway, receipt, Submitted transition, FileNet storage | US-1.3.12 L1083-1102 |
| MOD-05 | Finance Payments View | Read-only payment search and Excel export | US-1.3.13 L1104-1130; BRO-08 L309 |
| MOD-06 | Application Verification (Back office) | Officer/Supervisor dashboards, pools, retrieval, flag/notes, return for correction, complete, re-upload attachment, escalate, screen out, reassign | EPIC-02 L1132-1516 |
| MOD-07 | Reinstatement & ICP Refresh | Supervisor reinstatement queue and decisions; direct reinstatement of screened-out applications; ICP refresh/compare | STP-2.5 L1518-1570 |
| MOD-08 | Central Monitoring | Read-only cross-site dashboard and drill-down | US-2.1.4 L1229-1292; BRO-09 L310 |
| MOD-09 | Portfolio Scoring | Referee/Senior Referee dashboards, portfolio pools, rounds 1-4, COI, discrepancy, override, evidence re-upload | EPIC-03 L1572-1812 |
| MOD-10 | Screening & Announcement | Screening Dashboard, CASPER upload, initial announcement, bulk screen out, reannouncement | EPIC-04 L1814-2025 |
| MOD-11 | Appeals | Candidate appeal (48h window, once) feeding 2nd Evaluation | US-1.2.7 L631-644; L1792 AC12-13; STP-4.5 |
| MOD-12 | Notifications (Email/SMS/OTP) | Outbound comms through the Dubai Health gateway; OTP | L269; templates L2212-2217 (TBC) |
| MOD-13 | Document Management (FileNet) | Attachment storage, versioning, naming convention | L271; L1088 AC12; L1089 n8; L1423-1424; L1709-1710 |
| MOD-14 | Configuration / Reference Data (implied) | Programs, specialties, sites, cycles, deadlines, grace periods, fees, weights, reasons, templates, pool assignments | L223, L234, L553, L557, L1081 n4, L1316 n7, L1383 n3 ("edited by the admin"), L2437 ("Management Portal"). No user story covers it: OMISSION |
| MOD-15 | Audit Log | Logging of all actions and status changes | L590 n3, L1423-1424, L1470 n4, L1485, L1501, L1560, L1733, L1772 n4, L2009 n2 |
| MOD-16 | **Administration: roles, permissions and Staff management** (APPROVED DECISION AP-10, not BRD) | Configurable roles (create, rename, activate, deactivate); grant and revoke catalog permissions; Staff provisioning before and after first IDAM login, with verified binding; multiple role assignments; Staff activation and deactivation; security and administrative audit view; first-administrator bootstrap; last-administrator and escalation protection | Register AP-10, B-01 (resolved), B-06, B-07; design [05-rbac-design.md](05-rbac-design.md); slice S-ADM. Partly fills the MOD-14 "admin / Management Portal" omission for users and roles only. Reference-data configuration remains an OMISSION |

---

## 3. Actors / Roles

### 3.1 Roles defined in BRD (FACT, Business Roles table L299-310)

| ID | BRD ID | Actor | Internal/External | Definition summary | Provisioning (as stated) |
|---|---|---|---|---|---|
| ROLE-01 | BRO-01 | Candidate | External | Applies to a GME program (Internship, Residency, Fellowship). Creates the account via Dubai Health IDAM. Prepares/submits, tracks status, may withdraw, reinstate, edit preferences, correct returned items, appeal a portfolio score (L302). | Registers on IDAM (UAE PASS optional). "each user or candidate is provisioned with a platform-specific role and profile upon their first login" (L491). Platform runs its own duplicate check and creates a unique 9-digit Candidate ID (L508 AC4-7, L509 n5-6, L514). |
| ROLE-02 | BRO-02 | Admission Officer | Internal | Assigned to one or more program + first-preference specialty pools. Retrieves, verifies (portfolio excluded), flags, notes, returns for correction, completes verification, recommends screen out, escalates, "announces results, and handles post-appeal promotions" (L303). | "Admission Officer and Admission Supervisor roles are provisioned in the platform" (L1153 n2). "An officer's assigned pool(s) are configured" (L1316 n7). Who provisions or configures: not stated. |
| ROLE-03 | BRO-03 | Admission Supervisor | Internal | Oversees officers' and referees' workload, reassigns, decides escalations and recommended screen-outs, processes reinstatements, "reviews ranked lists, cuts shortlist by capacity" (L304). Also owns the Screening Dashboard, CASPER, announcements and bulk screen out (L1824), ICP refresh (US-2.5.3), and Replace Evidence (L1710 n1). | As ROLE-02 (L1153 n2). |
| ROLE-04 | BRO-04 | Referee (First and Second) | Internal | Assigned to program + first-preference specialty. Scores Round 1 or Round 2 (never both on the same portfolio). May return for Conflict of Interest (L305). | "Referee, Third Referee, 2nd Evaluation Referee, and Senior Referee roles are provisioned in the platform" (L1594 n2). Pool assignment mechanism not stated. |
| ROLE-05 | BRO-05 | Third Referee | Internal | Scores portfolios after an R1/R2 discrepancy. Never R1/R2 on the same portfolio. Score is final and replaces R1/R2 (L306). | L1594 n2 |
| ROLE-06 | BRO-06 | 2nd Evaluation Referee | Internal | Rescores appealed questions only. Never R1/R2/R3 on the same portfolio. Replaces the final Portfolio Score (L307). | L1594 n2 |
| ROLE-07 | BRO-07 | Senior Referee | Internal | Oversight. Views all portfolios, rounds, referees and audit detail. Can reassign, "return portfolios to the applicable pool", override a round score with mandatory justification (L308). Cannot retrieve to score (L1675). | L1594 n2 |
| ROLE-08 | BRO-08 | Finance Officer | Internal | Read-only payment records. Search by cycle, program, application ID, payment date range; export to Excel. Cannot open application details (L309, L1110). | "login process should follow a role-based approach, similar to the Admission Officer Login" (L1110 n1) |
| ROLE-09 | BRO-09 | Central Monitor | Internal | Read-only Central Monitoring Dashboard. Drill down to read-only list and read-only application details (L310). Cannot retrieve, assign, reassign, return or verify (L1145). | Not stated beyond role routing (L1234 AC1). |

| ROLE-10 | — (not in BRD) | **Administrator** | Internal | APPROVED DECISION AP-10 (2026-11-12), not a BRD fact. A system role (`ADMINISTRATOR`): manages roles, role-permission grants, Staff provisioning and role assignments, and Staff activation; views security and administrative audit history. It alone holds the protected system-administration permissions; it may delegate other administrative permissions to configurable Staff roles (DEC-17). It cannot modify its own roles or status, and the last authorized administrator cannot be removed | First administrator via controlled bootstrap (DEC-18). Others are assigned by an administrator. Never through self-registration |

**Roles as configuration (AP-10).** ROLE-02 to ROLE-09 become **configurable roles** stored in SQL Server, seeded with these names and with no permissions until their feature slice grants them (deny by default). ROLE-01 Candidate and ROLE-10 Administrator are **system roles**. Access is decided by the **active role's permissions**, never by role name.

### 3.2 Actors mentioned but not defined as roles
- **Admin** (L1383 n3: "note templates ... can be edited by the admin. TBD later"). **Management Portal** (L2437). No BRO, permissions or stories existed. **Now ROLE-10 by approved decision AP-10** for users, roles and permissions. Editing reference data and templates "by the admin" is still unspecified (MOD-14 OMISSION).
- **Admission team** as a notification recipient (L597 AC8, L651 AC9). Who exactly is notified for site exclusion is not stated.
- **Third-party CASPER assessment provider** (L1867). Interaction is file-based only.
- **Business Owners / stakeholders** (L238-263). These are not system users.

### 3.3 Candidate identity, provisioning and eligibility (FACT unless noted)
- IDAM is the only source of identity. There are no local accounts or credentials (L268, L491, L495).
- All registration and login behaviour follows Dubai Health IDAM rules (L496). Registration screens, fields and validations belong to IDAM (L509 n1, n4). Login, forgot password, remember me and account lockout are handled by IDAM (L522 n2).
- UAE PASS is an option through IDAM "for candidates inside the UAE who hold a valid EID" (L491). The platform delegates to UAE PASS through IDAM (L508 AC2). Login via UAE PASS grants access (L521 AC2).
- A candidate must complete IDAM registration before logging in and submitting (L497).
- The same IDAM account is used for any GME program across cycles (L499). All applications from this cycle and earlier cycles are linked to the candidate account (L501).
- **Duplicate accounts**: "Candidates shouldn't have duplicate accounts or submit multiple applications simultaneously under any circumstances" (L500, L509 n2). On return from IDAM with a new account, the platform does "another check" (L508 AC3). Using mobile number, EID or passport received from IDAM, it checks for duplicates (AC4). If confirmed, it notifies the candidate to use the original account (AC5) and records the pair "in a report for supervisor" (AC6). If unique, it creates a unique Candidate ID (AC7). "An additional duplication check is required on the platform side" (L509 n5).
  - Not stated: whether the duplicate account is blocked, disabled or merely warned. Not stated: matching rules (exact or fuzzy, any one or all identifiers). Not stated: where the supervisor report lives (no story or screen). OMISSION.
- **Candidate ID**: Numeric, System, 9 digits (L514). Unique per candidate and linked to applications across cycles in both GME and MBRU (L509 n6). It will be reused as the SIS student ID in PowerCampus in a later phase (L272). Generation algorithm: OMISSION.
- Account-created notification follows IDAM standards (L509 n3).
- **Eligibility to register**: none at the platform level. No rule restricts who may become a Candidate. Eligibility to apply per program is through **Candidate Status** (Appendix 3.3, L2105-2114): Dental Residency = MBRU GME Intern*, MBRU GME Resident*, Active Dubai Health Employee*, External Candidate. Medical Residency adds MBRU MD Student/Alumni*. Pharmacy Residency = Active Dubai Health Employee*, External Candidate. Internship = External Candidate only. Fellowship = MBRU MD Student/Alumni*, MBRU GME Resident*, Active Dubai Health Employee*, External Candidate. (* = ID Number required, L2105, L733.) Certificate is not listed. The ID Number is not stated to be validated against any source.
- Candidate role assignment: "provisioned ... upon their first login" (L491). The BRD does not say whether every IDAM user reaching the portal becomes a Candidate, or whether internal staff can also be Candidates. OMISSION (BLOCKER, see §10).
- Multiple roles: "Given the user holds multiple roles, when session starts, then platform shows a role switcher" (L1152 AC5, L1593 AC5).
- Users without the role are denied access (L1152 AC2, L1593 AC2).
- Session timeout causes a redirect to IDAM for re-authentication (L521 AC3, L1152 AC3, L1593 AC3). The candidate sees a note about the inactivity time-out period (L546 n3). The timeout value is not stated.
- **Account blocking/disabling**: only "account lockout ... handled by IDAM" (L522, L1153, L1594). No platform-level disable, deactivate or offboarding for any role. "If the assigned officer is no longer active" (L1408) implies an inactive state, which is otherwise undefined. OMISSION.
- ICP pre-population applies only to candidates who signed up and logged in through UAE PASS (L766 n2, L668).

---

## 4. Role-resource permission matrix (as stated)

Legend: V = view, C = create, E = edit, A = approve/decide, X = explicitly denied, — = BRD silent (gap). Cells cite lines.

| Resource / Action | Candidate | Adm. Officer | Adm. Supervisor | Referee (R1/R2) | Third Ref. | 2nd Eval Ref. | Senior Ref. | Finance | Central Monitor |
|---|---|---|---|---|---|---|---|---|---|
| Own applications list / dashboard | V (L545) | — | — | — | — | — | — | — | — |
| Start new application | C, unless an active application exists in the cycle (L530, L553) | — | — | — | — | — | — | — | — |
| Edit draft / form | E while Draft (L567); read-only after submit (L688) | X fields; may replace attachments only (L1364) | — (Refresh ICP updates fields, L1559) | — | — | — | — | X | X |
| Discard draft | E (L568, L589) | — | — | — | — | — | — | — | — |
| Pay & submit | C (L1088) | — | — | — | — | — | — | — | — |
| Withdraw (whole / site) | C with OTP (L533-535, L597) | — | — | — | — | — | — | — | — |
| Reinstatement request | C (L613) | — | V/A (L1526-1544); requests "visible only to supervisors" (L1525) | — | — | — | — | — | — |
| Edit preferences / Exclude site | E (L571-572) | X sites hidden (L1142) | — | — | — | — | — | — | — |
| Appeal | C once, within window (L538, L573) | — | — | — | — | — | — | — | — |
| Correct returned application | E flagged items only (L1407) | — | — | — | — | — | — | — | — |
| View application details (non-portfolio) | V read-only (L581) | V own retrieved only (L1141, L1374) | V all within "scope" (L1143) | Key info only (L1586, L1749) | same | same | V all portfolios (L1585) | X (L1110 n5) | V read-only via drill-down (L1234 AC12) |
| View training sites chosen | V | X "never ... under any circumstances" (L1161 n5, L1374 AC3) | — (not stated) | — (Fellowship: "program and specialties selected", L1749 n4) | — | — | — | X | V (charts by site) |
| View Portfolio section | V; one-time edit before submit (L671) | X (L1144, L1355, L1375). Conflicts with tracker #114 "Made the portfolio section visible" (L2440) | X "never visible for admission" (L1144) | V (L1748) | V | V appealed qs + appeal responses (L1738) | V all rounds (L1633 AC5) | X | — |
| Candidate identity on portfolio | — | — | — | X (L1586, L1726) | X | X | — (not stated) | — | — |
| Retrieve from pool | — | C, max 10, own pool (L1301-1302) | — | C max 10 (L1669) | C (third-ref pool) | C (appeal pool) | X (L1675) | X | X (L1145) |
| Flag / notes / return for correction | — | C (L1357, L1399) | — | — | — | — | — | — | X |
| Complete verification | — | C (L1415) | — | — | — | — | — | — | X |
| Re-upload application attachment | — | C with justification; not portfolio (L1423-1424) | — | — | — | — | — | — | — |
| Recommend screen out | — | C (L1453); cannot screen out directly (L1440) | A endorse/reject (L1484) | — | — | — | — | — | — |
| Escalate for clarification | — | C (L1469) | A return with guidance (L1500) | — | — | — | — | — | — |
| Reassign applications (officer) | — | — | A (L1338); eligible statuses In Progress, Correction Submitted, Clarification Submitted (L1339) | — | — | — | — | — | X |
| Workload panels | — | — | V Officers + Referees Workload (L1211 AC4-5) | — | — | — | V Referees Workload (L1633) | — | X (L1235 n2) |
| Direct reinstate screened-out | — | — | A (L1528, L1545 n1) | — | — | — | — | — | — |
| Refresh ICP data | — | — | A (US-2.5.3 L1554-1570) | — | — | — | — | — | — |
| Score portfolio / submit round | — | — | — | C (L1771, L1792) | C | C appealed qs only (L1737) | X | — | — |
| Return for COI | — | — | — | C (L1756) | C | C | — | — | — |
| Reassign portfolio | — | — | ? BRO-03 "reassigns" with "referees' workload" (L304); no story | — | — | — | A (L1690) | — | — |
| Override round score | — | — | — | — | — | — | A with justification (L1690 AC5-6) | — | — |
| Return portfolio to pool (manual) | — | — | — | — | — | — | BRO-07 says yes (L308); tracker #140 removed it (L2466). CONFLICT | — | — |
| Replace portfolio evidence | — | X (L1424 n4) | A (L1710 n1) | — | — | — | A (L1710) | — | — |
| Screening Dashboard / CASPER / Announce / Bulk Screen Out / Reannounce | V own scores after announcement (L1958) | X by L1824 "Only authorized admission supervisor". BRO-02 says officer "announces results" (L303). CONFLICT | A (L1824, L1885, L1936, L1979, L2008) | — | — | — | X "Announcement are not owned by Senior Referee" (L1634 n4) | — | — |
| Payments list + export | — | — | — | — | — | — | — | V + export (L1109) | — |
| Central Monitoring Dashboard | — | — | — | — | — | — | — | — | V (L1234) |
| Reinstatement history past cycles | — | — | V (L1537 n3) | — | — | — | — | — | — |
| Duplicate-account report | — | — | V "report for supervisor" (L508 AC6); no screen | — | — | — | — | — | — |
| Configuration (cycles, programs, sites, pools, fees, reasons, templates, user-pool mapping) | — | — | — | — | — | — | — | — | — |

### 4.1 Mapping to permissions (AP-10)

The matrix above is the BRD's statement of who may do what. Under AP-10, each cell that grants an action becomes one or more **permission codes** in the code catalog, granted to the configured role. The mapping is written in each slice's feature spec (template §2) and seeded with that slice's migration. Cells marked X or "—" are **never** granted by default. Permission codes are not invented ahead of their slice. Codes defined so far (05 §2, §7):

| Permission | Audience | Default grant | Covers |
|---|---|---|---|
| `applications.own.read` | Candidate | CANDIDATE | Own applications list, dashboard, view application (L545, L581) |
| `applications.own.create` | Candidate | CANDIDATE | Start new application (L530, L553) |
| `applications.own.update` | Candidate | CANDIDATE | Edit draft while Draft (L567) |
| `catalog.read` | Candidate and Staff | CANDIDATE; staff roles per slice | Programs, specialties, sites (US-1.3.1) |
| `roles.manage`, `role-permissions.manage` | Staff (administrative, **protected**) | ADMINISTRATOR only, never delegable | MOD-16 role administration |
| `roles.read`, `staff.read`, `staff.manage`, `staff-roles.manage` | Staff (administrative, delegable) | ADMINISTRATOR; delegable to configurable Staff roles by an Administrator (DEC-17) | MOD-16 Staff provisioning, activation, assignments |
| `audit.security.read` | Staff (administrative, delegable) | ADMINISTRATOR; delegable (DEC-17) | MOD-16 audit view |

The Candidate permissions are separate codes (`*.own.*`) from future staff codes, so Candidate and Staff audiences never share an executable permission. Resource rules (own records only, pool assignment, workflow status) are still enforced in the services.

Gaps: the entire configuration/admin row (users, roles and permissions now covered by MOD-16; reference data still open). Supervisor visibility of training sites. Senior Referee seeing candidate identity. Supervisor "scope" (L1143, "within scope") is undefined. Supervisor reassigning portfolios. Who receives "admission team" notifications.

---

## 5. Business processes and workflows

### 5.1 Status profiles (FACT; names exactly as BRD). "*" = visible to candidate (L346, L369, L389)

**Application Status (L332-346)**
| From | To | Trigger |
|---|---|---|
| (new) | Draft* | Candidate starts or saves (L335) |
| Draft* | Submitted* | Payment and submission succeed (L335, L1088 AC9) |
| Draft* | Archived* | Candidate discards (L589 AC5) or grace period passes (L335, L686) |
| Submitted* | Under Review* | Officer retrieves (L1315 AC5) or referee retrieves (L1682 AC7, "if its still Submitted") |
| Under Review* | Correction Required* | Officer confirms Return for Correction (L339, L1399 AC3) |
| Correction Required* | Correction Submitted* | Candidate resubmits (L340, L1407 AC5 uses "Corrections Submitted") |
| Correction Required* | Archived* | Correction grace period passes (L339, L1407 AC11) |
| Correction Submitted* | Review Completed / Screened Out / another correction cycle (L340) | — |
| Under Review* | Screened Out* | Supervisor endorses (L1484 AC4) |
| Under Review* | Review Completed* | Verification Complete AND Portfolio Complete (L342, L1792 AC14) |
| Review Completed* | Appeal Under Review* | Eligible appeal submitted (L342-343) |
| Appeal Under Review* | Review Completed* | 2nd evaluation completed (L343) |
| Review Completed* | Screened Out* | Bulk screen out (L1971, L1979 AC5); "capacity concerns or not attending CASPER" (L342) |
| Screened Out* | (previous status) | Supervisor reinstatement (L341, L1528) |
| any (non Withdrawn/Draft/Archived) | Withdrawn* | Candidate confirms with OTP (L344, L597 AC4) |
| Withdrawn* | (previous status) | Supervisor approves reinstatement (L344, L1526, L1544 AC3) |
| Archived* | — | Terminal (L336) |

Notes: Every status in the table carries "*", although Verification and Portfolio have hidden ones. Central Monitor charts use "Review Complete", "Corrections Submitted" and "Screen Out" (L1259-1261), which are naming variants.

**Verification Status (L354-369)**: Pending* → In Progress* (officer retrieves). In Progress → Correction Required* / Pending Clarification / Screen Out Pending Approval / Complete*. In Progress → Pending when overdue. Correction Required → Correction Submitted*, or the path ends on grace expiry. Correction Submitted → the same officer's decision (Complete, escalate, recommend screen-out, further correction). Pending Clarification → Clarification Submitted (supervisor guidance). Clarification Submitted → officer decision point. Screen Out Pending Approval → Screened Out* (endorse) or Re-evaluating (reject). Re-evaluating → standard actions. Complete* is terminal. Screened Out* is terminal, with reinstatement by the supervisor. On Hold* on withdraw/archive, which reverts to the previous status "if it was not Complete" (L367). Naming variants: "Pending Screen Out Approval" (L1173, L1183, L1224) and "Screen Out" (L1187, L1221).

**Portfolio Status (L377-389)**: Pending* → In Progress* (≥1 referee retrieves a standard round). In Progress → Pending if both assignments are overdue. In Progress → Complete* (R1 = R2) or → Third Referee Required (discrepancy). Third Referee Required → Third Round In Progress (retrieval). Third Round In Progress → Complete, or → Third Referee Required on overdue. Complete → 2nd Evaluation Required (eligible appeal). 2nd Evaluation Required → 2nd Evaluation In Progress*. 2nd Evaluation In Progress → Complete, or → 2nd Evaluation Required on overdue. On Hold* on screen-out, archive or withdraw, reverting if not Complete. The field is also called "Portfolio Score Status" (L337, L1088 AC14, L1291).

**Portfolio Round Status (L397-403)**, per round (Round 1, 2, 3, 4 / 2nd Evaluation): Pending → In Progress (retrieval). In Progress → Complete (submit), or → Pending (overdue or COI return). On Hold reverts if not Complete. Round status "will directly update Portfolio status" (L1683 n5). They "must not be combined" (L1793 n2).

**Announcement Status (L412-419)**: Pending (enters Screening Dashboard) → Ready for Initial Announcement (readiness passes) → Announced (supervisor Initial Announcement). The table's next-status column says "Initially Announced" (L415-416) but the status row is named "Announced": naming conflict. Announced → Appeal Under Review (eligible appeal) → Ready for Reannouncement (2nd eval complete) → Reannounced (terminal until next phase). Verification screen-out endorsement sets Announced (L1484 AC10). Bulk screen out sets Announced (L1971).

**Reinstatement request status**: Submitted, Approved, Rejected (L1225-1227, L1552).
**Bill Status**: N/A, Pending, Paid (L1101). Payment status is tracked independently of application status (L1089 n6).
**CASPER Attendance Status**: N/A, Attended, Absent (L1848). **Appealed**: Yes/No (L1849).

### 5.2 Workflows

| ID | Workflow | Actors | Steps / rules (FACT) | Refs |
|---|---|---|---|---|
| WF-01 | Candidate registration | Candidate, IDAM, UAE PASS | Redirect to IDAM → optional UAE PASS → return → platform duplicate check (mobile/EID/passport) → duplicate: notify + supervisor report; unique: create 9-digit Candidate ID → account-created notification per IDAM | L503-514 |
| WF-02 | Login & routing | All | IDAM auth → role check (deny if no role) → role switcher if multiple → role-specific dashboard; timeout → IDAM re-auth | L516-522, L1147-1153, L1588-1594, L1110, L1212, L1234 AC1 |
| WF-03 | Start application & select program/preferences/sites | Candidate | Start New Application (disabled if an active application exists, no program open, or status blocks) → Program category (programs without active specialties omitted) → Preference 1 (+ Preference 2 for Medical/Dental Residency and Fellowship) → ≥1 site per preference, orderable; no duplicate site within a specialty; P1 ≠ P2 → creates application record (Draft), opens the correct form | L691-708, L545, L553 |
| WF-04 | Complete form & save draft | Candidate | Tabs navigable freely (L689). T&C acceptance before proceeding (L670). Save without validation; auto-save at a configurable interval (e.g. 3 min); reminders every N days, at 3 days and at 1 day before the grace deadline; auto-archive after grace with email | L1075-1081, L683-686 |
| WF-05 | Manage draft | Candidate | Resume; Discard (confirm) → Archived; Start New becomes enabled | L584-590 |
| WF-06 | Pay & submit | Candidate, Payment GW, FileNet | Summary + payment details → validate all (block and highlight) → confirm → gateway → success: receipt → Submitted, submission date, notify candidate, attachments to FileNet, Verification = Pending, Portfolio = Pending, routed to program + first-preference-specialty pools; failure: stay Draft, Retry | L1083-1102, L1300 |
| WF-07 | Withdraw | Candidate | Withdraw → reason (list/Other) → confirmation incl. non-refundable fee → OTP to registered email + mobile (resend with cooldown) → Withdrawn → email to candidate + admission team (handling officer and supervisor). Verification/Portfolio/Round → On Hold | L592-606, L367, L387, L403, L1682 AC13 |
| WF-08 | Exclude training site (partial withdrawal) | Candidate | Only when Edit Preferences is disabled and multiple sites exist → select site(s) → ≥1 site must remain per specialty → excluding reason → remove; status unchanged; notify admission team. Allowed until academic year start | L646-659, L572 |
| WF-09 | Edit preferences | Candidate | Until grace-period deadline; non-Draft/Withdrawn/Archived; Residency and Fellowship only (L571). Reorder/remove/replace preferences and sites; validate; status unchanged | L623-629 |
| WF-10 | Reinstatement request & decision | Candidate, Supervisor | Candidate: Reinstate (only Withdrawn, same cycle, blocked if another active application) → mandatory justification → email to supervisor. Supervisor queue (ascending by request date; shows withdrawal reason, justification, prior status/notes, history across cycles) → Approve (note) → request Approved, application restored to exact pre-withdrawal status/pool, email; or Reject (reason + note) → Rejected, stays Withdrawn, email with reason | L608-621, L1518-1552 |
| WF-11 | Officer pool retrieval & due dates | Officer, Supervisor, System | Retrieve random (oldest→newest) up to cap 10 (configurable per pool) → Under Review / In Progress, retrieval date, due = +5 working days (configurable per pool). Overdue (In Progress past due) → auto back to pool (not retrievable by the previous officer). Due-date rule stops once sent to candidate/supervisor; returns go to the same officer. Pool threshold 35 unprocessed → notify assigned officers | L1294-1323 |
| WF-12 | Supervisor reassign (officer apps) | Supervisor | Workload panel → select officer → multi-select apps (In Progress, Correction Submitted, Clarification Submitted) → target officer (same pool) + justification (≤200) → notify target officer. Tracker #110: due date not reset (L2436) | L1325-1347 |
| WF-13 | Verify application | Officer | Read-only view (sites hidden, ICP data highlighted, GPA/Exam scores shown) → flag field/sub-section/section/attachment with template note (≤500) → Return for Correction (≥1 flag) → Correction Required (both statuses), email with notes, only flagged sub-sections editable → candidate re-submits → Correction(s) Submitted, same officer. Or Complete Verification → Complete, removed from inbox, no candidate notification | L1349-1416 |
| WF-14 | Correction reminders & archive | System | Every N days; warning at 3 days; final at 1 day before grace deadline; archive after; email | L1360-1363, L1407 AC8-12 |
| WF-15 | Officer re-upload attachment | Officer | Replace → justification → file validated → new active version in FileNet, previous retained, audit (name, date, time, justification). No status change; never portfolio | L1418-1432 |
| WF-16 | Recommend screen out | Officer → Supervisor | Reason (DDL) + optional note → Screen Out Pending Approval → supervisor queue + notification → removed from officer inbox. Supervisor: Endorse (reason editable, no note) → Verification and Application Screened Out, candidate notified with reason, Announcement = Announced, portfolio On Hold; or Reject (mandatory note) → Re-evaluating, back to the same officer, officer notified | L1434-1493 |
| WF-17 | Escalate for clarification | Officer → Supervisor | Mandatory note → Pending Clarification → supervisor queue + notification. Supervisor returns with mandatory guidance note → Clarification Submitted → officer notified. Supervisor does not decide | L1464-1508 |
| WF-18 | Handle supervisor feedback | Officer | Sees note → actions: Return for Correction, Complete Verification, Recommend Screen Out, Escalate | L1510-1516 |
| WF-19 | Direct reinstatement of screened-out | Supervisor | With justification → restore previous application, verification and portfolio statuses; portfolio returns to referee pool. Tracker v2 #19: "if reinstated before the deadline" (L2503); the deadline is undefined | L1528, L1545 n1, L1173 |
| WF-20 | ICP refresh | Supervisor, ICP | Refresh on any application → side-by-side current vs latest ICP (ICP fields only), differences highlighted → Update All or per-field → confirm → update + audit (field, old, new, user, time). Failure: message, no update | L1554-1570 |
| WF-21 | Referee retrieval | Referee (all types) | Random from oldest, cap 10 (configurable), due +2 working days (configurable). Round status → In Progress (R1/R2/R3/R4). R3 → Portfolio Third Round In Progress; R4 → 2nd Evaluation In Progress. Application Under Review if still Submitted. Overdue → auto back to pool (even if partially saved, L1772 n2). Never the same portfolio twice in any round. Pool threshold 80 → notify referees | L1662-1683 |
| WF-22 | Score & submit round | Referee | Accept/Reject per question. Points-system questions: Classification → mapped points. Reject: ≥1 reason → mapped candidate comment, zero points. Save as draft. Submit (all answered) → Round Complete. After R1+R2: compare totals and per-question decisions → equal: Portfolio Complete; else discrepancy recorded (details stored) → Third Referee Required → R3 final. Special: Internship/Residency Q1 accepted ⇒ Q2 accepted by default. On Portfolio Complete + Verification Complete → Application Review Completed; recompute weighted Portfolio Score | L1720-1812 |
| WF-23 | COI return | Referee | Mandatory reason (≤500) → saved answers discarded → referee permanently excluded → back to the standard / Third Referee / 2nd Evaluation pool by round | L1751-1764 |
| WF-24 | Senior Referee reassign / override | Senior Referee | Reassign (only portfolios in a referee's inbox; target in same pool, not scored/COI) → notify, reset retrieval + due dates. Override Score (Round 1/2/3/2nd Evaluation, new score, justification ≤200) → recompute final | L1685-1702 |
| WF-25 | Replace portfolio evidence | Senior Referee, Admission Supervisor | Same as WF-15. Does not reopen/recompute; corrections go through override | L1704-1718 |
| WF-26 | Appeal | Candidate → 2nd Eval Referee | Within window (default 48h from initial announcement, configurable), once, not after screen-out. Flag only questions answered "Yes" without full score → mandatory response (≤200) per flagged → confirm → Application Appeal Under Review, Portfolio 2nd Evaluation Required, Announcement Appeal Under Review, Appealed = Yes → 2nd Eval rescores appealed questions only → replaces final score → Portfolio Complete → Ready for Reannouncement. No new attachments | L631-644, L538, L1792 AC12-13, L2008 |
| WF-27 | CASPER upload | Supervisor | Excel only → structure validated (whole file rejected if invalid) → new upload version → match on Application ID → store raw data, Attended, weighted CASPER score, recompute Shortlisting Score. Unmatched applications → Absent (highlighted), score N/A. Exceptions: no match, duplicates, missing/invalid values. Summary. Re-upload: latest valid values current. Not revealed to candidates | L1865-1915 |
| WF-28 | Initial announcement | Supervisor | Filter/select → readiness (Verification + Portfolio Complete; CASPER not required) → block not-ready → summary + confirm → Announced; record date/time/type/apps; reveal scores (no round scores); email + SMS; appeal window opens. "in one batch" (L1937 n2, tracker v2 #24) vs "one or more batches" (L1919) | L1917-1959 |
| WF-29 | Bulk screen out | Supervisor | Select (single/multi/all filtered) → mandatory reason → confirm → Application Screened Out, Announcement Announced, reason recorded, email + SMS. Already screened-out highlighted. No appeal | L1961-1989 |
| WF-30 | Reannouncement | Supervisor | Filter Ready for Reannouncement → validate → summary (previous/updated portfolio + shortlisting, Score Changed) → Reannounced; record; reveal; email + SMS; no further appeal | L1991-2025 |
| WF-31 | Finance reconciliation | Finance Officer | Filters (Cycle default current, Program, Application ID, From/To payment date) → read-only results (no navigation) → Export displayed results to Excel; bill status refreshed from gateway | L1104-1130 |
| WF-32 | Central monitoring | Central Monitor | Dashboard (default current cycle, all programs/sites) → filters cycle/program/site → charts → drill-down list → read-only details | L1229-1292 |

**Not in Release 5 (FACT)**: shortlisting, interview, offer (L1816). Ranking (BRO-03 "reviews ranked lists, cuts shortlist by capacity" L304; Screening Dashboard is "not a final ranked list" L1834). Matching: not mentioned. Seat reservation fee 5,000 AED for dental interns is "next release" (L1089 n4). Withdrawal "even after accepting the offer" (tracker #18, L2344) refers to the future offer stage.

**Cycles (FACT)**: Admission Cycle format YYYY/YYYY, system-set to "The active cycle for the selected program" (L726). The submission window runs from an opening date to a deadline configured at program level (L553, L557). A "grace period" deadline exists beyond the deadline (L532, L571, L686). A configurable reinstatement cut-off per cycle is deferred (L570, L614). Cycle entity/lifecycle definition: OMISSION.

---

## 6. Candidate application form inventory

Global rules: visibility/mandatory rules depend on program, residency status, nationality and similar attributes (L667). Tooltips and highlighting apply on all screens (L697 n7). Attachment behaviour applies on all screens (L716 n5): max 2 MB (configured), configured format, Preview, Delete, conditional required/optional/hidden (L715 AC12-19). PDF except photo (T&C L2121). Viewer can rotate and zoom (L1749 n5). Changing program or specialty with data present triggers a data-loss warning (L715 AC20). Once submitted, all tabs are read-only (L688). Read-only view = same form with inputs disabled (L582). Dates use DD/MM/YYYY.

### 6.1 Screen mapping

| BRD section (story) | Lines | UI screen | Applies to |
|---|---|---|---|
| Candidate Dashboard + action pop-ups (US-1.2.1-1.2.8, US-4.3.2) | L540-659, L1953-1959 | **Dashboard** | All |
| Program Selection (US-1.3.1) | L691-708 | **Program and preferences** | All |
| Application Information (US-1.3.2) incl. preference fields, T&C, Application Attachments | L710-758 | **Application information**. Preference/site fields repeat here (L727-731); ASSUMPTION they may be shown/edited on Program and preferences | All |
| Personal Information (US-1.3.3): Identity, Contact, Next of Kin, Identification Attachments | L760-843 | **Personal information** | All |
| Academic Information: University Grades (US-1.3.4) | L845-881 | **University grades** | All (Fellowship: ASSUMPTION also, no exclusion stated) |
| Academic Information: English Proficiency (US-1.3.5) | L883-911 | **English proficiency** | All; optional for Fellowship |
| Professional Experience: Internship Information (US-1.3.6) | L913-939 | **Internship information** | Residency (except Pharmacy), Fellowship |
| Professional Experience: Residency Information (US-1.3.7) | L941-960 | **Residency information** (Fellowship's prior residency, NOT the entrance exam) | Fellowship |
| Professional Experience: Board and License (US-1.3.8) | L962-1006 | **Board and license** | Fellowship |
| Residency Entrance Exam (US-1.3.9) | L1008-1035 | **NO SCREEN** | Residency (Medical/Dental/Pharmacy) |
| Portfolio Information (US-1.3.10) | L1037-1073 | **NO SCREEN** | All |
| Application Summary and Payment (US-1.3.12) | L1083-1102 | **NO SCREEN** | All |
| Correction mode (US-2.3.4) | L1402-1408 | Reuses form screens (ASSUMPTION) | — |
| Appeal panel (US-1.2.7) | L631-644 | **NO SCREEN** (Dashboard action panel) | — |

The BRD also names a "Preferences tab" for reordering (L697 n6, L707, L730). n6 points at US-1.3.11, which is actually Save Draft. ASSUMPTION: the "Preferences tab" = the **Program and preferences** screen.

### 6.2 Program and preferences (US-1.3.1, L703-708)
| Field | Type | Req | Rules / source |
|---|---|---|---|
| Program | DDL | Yes | Certificate, Internship, Medical Residency, Dental Residency, Pharmacy Residency, Fellowship (L704). Programs without active specialties omitted (L696 AC2) |
| Preference 1 | DDL | Yes | Specialties of the program (Appendix 3.1). Specialties with no active sites omitted |
| Preference 1 Training Sites | DDL (multi) | ≥1 | Shown when specialty selected. Site list "to be provided in the appendix", but Appendix 3.2 is TBC (L2101). Orderable. No duplicate site within a specialty. No limit on count (tracker v2 #11, L2495) |
| Preference 2 | DDL | No | Only if the program has two preferences (Medical/Dental Residency, Fellowship, L697 n4). Internship and Pharmacy Residency have one (n3). Must differ from P1 |
| Preference 2 Training Sites | DDL (multi) | ≥1 if P2 | Same site allowed across different specialties (L629 n4) |
Certificate (Medical Laboratory) follows Internship (Dental) logic, rules, validations and weights (L697 n1).

### 6.3 Application information (US-1.3.2, L722-758)
| Field | Type | Req | Rules |
|---|---|---|---|
| Application ID | Text, System, disabled | Yes | "Unique ID assigned when the form is opened". Format `Candidate ID-G(Admission Cycle)`, e.g. `123456789-G27` (L723) |
| Application Creation Date | Date, System | Yes | Form open date |
| Application Submission Date | Date, System | Yes | Empty until submission |
| Admission Cycle | DDL, System, disabled | Yes | YYYY/YYYY; active cycle for program |
| Program | DDL | Yes | From US-1.3.1. Marked "Enabled" |
| Preference 1 / Sites, Preference 2 / Sites | DDL | as 6.2 | Duplicated here |
| Candidate Status | DDL | Yes | Populated per program + specialty (Appendix 3.3, L2110-2114) |
| ID Number | Text | Yes unless External Candidate | Shown unless External Candidate. One field for all ID types (L733). Format: not stated |
| Will an external entity or your employer sponsor your training? | Radio Yes/No | Yes | — |
| Sponsor Type | DDL | If sponsored | Governmental, Non-Governmental |
| Sponsor Name | Text | If sponsored | — |
| Q1: Are you currently employed? | Radio | Yes | Residency and Fellowship only |
| Employment Letter | File PDF | If Q1 Yes | — |
| Q2: Are you currently registered in MBRU Residency Program? | Radio | Yes | Residency and Fellowship only |
| No Objection Letter | File PDF | If Q2 Yes | — |
| Have you ever been denied a medical license or had your license revoked, limited, restricted, or suspended? | Radio, default No | Yes | All programs |
| Have you ever been placed on academic probation in a training program? | Radio, default No | Yes | All |
| Have you ever been dismissed from an appointment to residency, fellowship or professional employment? | Radio, default No | Yes | All |
| Do you have any pending or previous professional misconducts? | Radio, default No | Yes | All |
| Terms and Conditions Text | Label | — | Appendix 3.4 (L2121) |
| Acceptance Statement | Label | — | "I, <Candidate Full Name>, hereby confirm..." |
| Acceptance Checkbox | Checkbox | Yes | Must be checked to proceed |
| Personal Statement – 1st Preference | File | One per P1 site | Slots regenerated on preference/site change (L716 n6) |
| Personal Statement – 2nd Preference | File | One per P2 site | When 2 preferences |
| CV | File | Yes | — |
| Recommendation Letter – 1st Preference | File | Residency and Fellowship | — |
| Recommendation Letter – 2nd Preference | File | When 2 preferences | — |
"Yes" answers to the four disciplinary questions have no stated consequence or attachment. OMISSION.

### 6.4 Personal information (US-1.3.3, L774-843)
ICP rules (L765-766): with UAE PASS and a valid EID, ICP fields are pre-filled, disabled and highlighted. ICP data is not fetched when: EID expired; duplicate ICP profiles; ICP unavailable (must not block). An expired ICP passport makes those fields editable. Blank ICP fields stay editable. Names are capitalised per part (L775).

Identity:
| Field | Type | Src | Req | Condition / validation |
|---|---|---|---|---|
| English First Name | Text | User/ICP | Yes | ICP disabled; language validation; "as per passport" |
| English Middle Name | Text | User/ICP | No | ICP 2nd-4th names joined |
| English Last Name | Text | User/ICP | Yes | Symbols allowed |
| Arabic First/Middle/Last Name | Text | User/ICP | No | Always enabled; language validation |
| Date of Birth | Date | User/ICP | Yes | Past |
| Gender | Radio | User/ICP | Yes | Male, Female |
| Marital Status | DDL | User/ICP | Yes | Single, Married, Divorced, Widowed; enabled even with ICP |
| Nationality | DDL | User/ICP | Yes | Current-system list mapped to ICP |
| Are you a child of a UAE National mother who holds a Family Book? | Radio | User | If non-UAE | Yes ⇒ Birth Certificate + Mother Family Book required |
| Do you have Marsoom? | Radio, default No | User | If non-UAE | — |
| Country of Residence | DDL | User/ICP | Yes | ICP default UAE |
| UAE City of Residence | DDL (emirates) | User | If residence UAE | — |
| Do you have an Emirates ID? | Radio | User/ICP | Yes | ICP: Yes; non-ICP shown if residence UAE |
| Emirates ID Number | EID format | User/ICP | If EID Yes | — |
| Emirates ID Date of Expiry | Date | User/ICP | If EID Yes | — |
| Visa Unified Number | Number | User/ICP | EID Yes && nationality not UAE/GCC | — |
| Visa File Number / Visa Place of Issue (DDL) / Visa Expiry Date | — | User/ICP | "Yes, if Country of Residence is UAE", while visibility is "EID Yes && not UAE/GCC" | Mandatory vs visibility conflict (L793-795) |
| Passport Number | Text | User/ICP | Yes | Enabled |
| Passport Country of Issue | DDL | User/ICP | Yes | ICP list |
| UAE Passport City of Issue | DDL | User/ICP | If country UAE | — |
| Other Passport City of Issue | Text | User | If not UAE | — |
| Passport Date of Issue | Date | User/ICP | Yes | — |
| Passport Date of Expiry | Date | User/ICP | Yes | Later than today |
| Family Book City Number | Number | User | If UAE national | Not in ICP (L2387) |
| Family ID | Number | User/ICP | If UAE national | ICP `khulasitQaidNo` |
| Passport Unified Number | Number | User/ICP | If UAE national | ICP "UN ... (TBC)" |
| Country of Birth | DDL | User/ICP | Yes | ICP list |

Contact: Registered Email (IDAM, disabled), Registered Mobile Number (IDAM, disabled, country code + flag), Contact Email (default = registered; OTP if changed), Contact Mobile Number (default "Copied from Contact Mobile Number", a typo, presumably Registered; OTP if changed) (L812-815).

Next of Kin (all User): First Name (Req), Middle Name(s) (opt), Surname (Req), Relationship to Candidate (DDL from current system, Req), Primary Telephone Contact (Req, selectable country code), Primary Email (Req), Confirm Primary Email (must match), Area of Residence (Req) (L822-829).

Identification Attachments: Personal Photo (Req). Colored Copy of the Passport (Req). Colored copy of Family Book (UAE national). Colored copy of the Emirates ID (Both Sides) (EID Yes). Colored copy of a Marsoom (Marsoom Yes). Mother Family Book and Birth Certificate (child of UAE mother Yes). Colored Residency Visa (EID Yes && not UAE/GCC) (L836-843). "Disabled/Hidden = Yes" on Photo/Passport is ambiguous.

### 6.5 University grades (US-1.3.4, L860-881)
| Field | Type | Req | Rules |
|---|---|---|---|
| Country | DDL | Yes | Current-system list (Appendix 3.5, extract) |
| University | DDL | Yes | Filtered by country; includes "Other" |
| Other University | Text | If Other | — |
| Degree | DDL | Yes | Filtered by program (Appendix 3.7) |
| Graduation Year | DDL | Yes | ≤ current year |
| Graduation Month | DDL | Yes | 1..12 |
| GPA Type | Radio, default Percentage | If UAE | Percentage / Scale of 4 |
| UAE University GPA Scale of 4 | Numeric | If Scale of 4 | 0.00-4.00 |
| UAE University GPA Percentage | Numeric | If Percentage | 0..100 |
| ECE GPA | Number | If non-UAE | 0.00-4.00 |
| Original GPA | Text | If non-UAE | Any format |
| GPA Result | Label | — | Percentage, rubric (GPA × 25, no rounding, L2164) |
| GPA Shortlisting Score | Label | — | `X.XX / Y`, Y = program GPA weight |
Attachments: Graduation Certificate or Letter of Completion (Req). Official Academic Transcript (Req). ECE General with Grade Average (non-UAE). Out-of-range GPA shows a warning (L850 AC9).

### 6.6 English proficiency (US-1.3.5, L897-911)
Title of Exam (DDL: Academic IELTS, TOEFL iBT, OET, EmSAT-English). Date Taken (Date). Result (Numeric; IELTS ≥6.0-9.0, TOEFL iBT ≥80-120, EmSAT ≥1252; the "?" characters in the BRD are encoding loss, ASSUMPTION "≥"). OET Reading/Writing/Listening/Speaking Result (if OET; each ≥300 / C+). All are required except for Fellowship (optional) and where nationality or university country is USA, UK, Canada, Australia, New Zealand or Ireland (optional) (L889). Attachment: English Proficiency Exam Certificate (required if entry required). Validation is unclear: does a result below minimum block submission or only warn? OMISSION.

### 6.7 Internship information (US-1.3.6, L927-939)
Organization Name (DDL: MBRU, Dubai Health Authority, Emirates Health Services, Department of Health AD, Gulf Medical University, Ajman University, others). Other Organization Name. Location (DDL; UAE and disabled for MBRU/DHA/EHS/DoH/Ajman/GMU per L930, while AC4 L918 lists only MBRU/DHA/EHS/DoH). From Date (past). To Date (> From; may be future). Attachment: Internship Certificate or Enrollment Letter. Single entry (ASSUMPTION; no multi-entry stated).

### 6.8 Residency information (US-1.3.7, L955-960, Fellowship)
Specialty (DDL; mapped to residency specialty groups, Appendix 3.1.2 "Required Residency specialization"). Training Hospital (DDL, Appendix 3.6 + Other). Other Training Hospital (marked Mandatory "Yes" but shown only if Other). Training Country (UAE and disabled for MBRU/DHA/GMU/EHS/DoH hospitals). Completion Date. No attachments listed.

### 6.9 Board and license (US-1.3.8, L976-1006, Fellowship)
Board entries: repeatable, ≥1 (L967). AC4 requires "applicable Tier" selection, but **no Tier field exists in the data dictionary** (OMISSION). Fields: Board Name (DDL, current system); Did you sit the final written exam? (Y/N); Scheduled Exam Date (if No, future); Exam Date, Exam Result (Pass/Fail), Written Exam Attempt Number (1-4), OSCE Exam Date, OSCE Exam Attempt Number (1-4) (if Yes); Resit Date (if Fail, future).
License (all optional): Authority (DHA, EHS, DoH, Other), Other Authority, License Number, Job Title (Resident, Specialist, Consultant, Other), Other Job Title. AC9 says Authority makes number + job title required; the dictionary says "No". Conflict.
Attachments: Board Certificate / Letter of Completion / Enrollment Letter (Req). Second written exam passing letter from PD or DIO (Req if passed). Transcript from training center/PD (opt). Valid Specialist/Consultant License (opt).

### 6.10 Residency Entrance Exam (US-1.3.9, L1022-1035) — no UI screen
Type (Medical: EMREE, SMLE; Dental: EDREE, SDLE; Pharmacy: EPREE). Attempt (First / Second / Third and Beyond; for EMREE/EPREE/EDREE). Examination Date (past). Percentile Rank (0-100; EMREE/EPREE/EDREE). Score (EMREE 60-100, EPREE 55-100, EDREE 65-100, SDLE/SMLE 560-800). AC7 says SMLE/SDLE require "Exam Date and Score" only. Entrance Exam Shortlisting Score label (`X.XX / Y`). Attachment: Exam Statement of Result. Out-of-range values show a warning.

### 6.11 Portfolio (US-1.3.10, L1047-1073) — no UI screen
One-time submission warning, then a confirmation pop-up listing question/answer/attachments. Not editable even on correction (L671, L1043 n3). Each question: Yes ⇒ details + evidence required.
- **Fellowship Q1-Q6** (5 points each): Q1/Q2 publication (Research Link, Journal, Article Title, Date of Publication; Manuscript). Q3 teaching, Q4 leadership (Activity Name, Role, From, To; one Certificate). Q5 system-based practice (Provider, Activity, Role, Date; Certificate). Q6 additional qualifications (Certificate).
- **Internship & Residency Q1-Q10**: points vary by Medical Internship / Dental Internship / Residency. Q3 (presentation type: Oral 4 / other 3) and Q8 (Dean's List/Honors 6 or 5 / others 4) have variable points. Q9/Q10 are not shown for Internship. Fields/attachments per L1064-1073. Certificate uses the Dental Internship scale (L697 n1, ASSUMPTION).

### 6.12 Application Summary & Payment (US-1.3.12, L1095-1102) — no UI screen
Application Number (e.g. `20260000014`). Create Date. Submit Date. Status. Bill Amount (AED, program fee config: Internship 230, Residency/Fellowship 650 per L1089 n3; Certificate not stated). Bill Status (N/A, Pending, Paid). Payment Date.

### 6.13 Dashboard pop-ups (Dashboard screen)
- Withdrawal Reason (List: Not Meeting Eligibility Criteria, Joining Another Training Program, Personal Reasons, Financial Reasons, Scholarship Opportunity, Others). Other Reason (≥3 letters; reject words like "Reason"/"NA") (L605-606).
- Reinstatement Justification (same validation, L621).
- Appeal Description (Response) ≤200 chars, per flagged question (L644).
- Excluding Reason (Text, required if sites excluded, L659).
- Dashboard inbox fields L553-574: Application ID, Creation/Submission Date, Submission Deadline, Announcement Date, Program, Training Site(s), Preference(s), Application Status, Portfolio Final Score, GPA Score, Entrance Exam Score, Shortlisting Score, Appeal Deadline, buttons.

---

## 7. Business rules

| ID | Rule (FACT unless noted) | Ref |
|---|---|---|
| BR-01 | IDAM is the only identity source; no local accounts | L495, L268 |
| BR-02 | IDAM registration is required before login/submission | L497 |
| BR-03 | Same IDAM account across programs/cycles; all applications linked to the account | L499, L501 |
| BR-04 | No duplicate accounts. Platform-side duplicate check on mobile / EID / passport. Duplicate → notify + supervisor report | L500, L508-509 |
| BR-05 | Candidate ID: 9-digit numeric, unique across GME and MBRU and cycles | L514, L509 n6 |
| BR-06 | Application ID format `<CandidateID>-G<cycle 2-digit>` e.g. `123456789-G27`. CONFLICTS with Application Number `20260000014` (L1096) and CASPER "Application ID: Numeric" (L1893) | L723 |
| BR-07 | One active application per cycle (L530, L669, L1081 n6 says "per program per cycle": conflict) | L530, L669, L1081 |
| BR-08 | Start New Application is disabled for any status other than Withdrawn/Archived while the window is open, and when no program is open | L545, L553 |
| BR-09 | Submission window = opening date → deadline configured per program; grace period deadline after it | L553, L557 |
| BR-10 | T&C accepted before filling/submitting | L670 |
| BR-11 | Program has 1 preference (Internship, Pharmacy Residency, Certificate per ASSUMPTION) or 2 (Medical/Dental Residency, Fellowship). P1 is the reference; P2 is optional and different | L697 |
| BR-12 | ≥1 site per preference; unlimited sites; no duplicate site per specialty; same site allowed across specialties | L696, L629 n4, L2495 |
| BR-13 | Section applicability: Internship Information = Residency (non-Pharmacy) + Fellowship. Residency Information = Fellowship. Board & License = Fellowship. Entrance Exam = Residency | L672-675 |
| BR-14 | Entrance exams: Medical EMREE/SMLE; Dental EDREE/SDLE; Pharmacy EPREE | L676-678 |
| BR-15 | ECE GPA (4.0) mandatory for non-UAE institutions; UAE accepts % or 4.0 | L679-680 |
| BR-16 | GPA % = GPA × 25, no rounding | L2164 |
| BR-17 | EMREE/EDREE score = %Score×w + Percentile×w with w = 10% / 8% / 6% by attempt (formula text names only EMREE); EPREE formula: none | L2200-2202 |
| BR-18 | SMLE/SDLE conversion = ((Result−200)/2)/300 × 100; cut score 560, max 800. Tracker #77 says SDLE cutoff 542 (L2403): conflict | L2209-2210 |
| BR-19 | Weights per Appendix 3.8: Intern Medical GPA 50 / Portfolio 30 / Shortlisting 80 / CASPER 20; Intern Dental 50/–/20/70/–/Interview 30; Resident Medical 35/35/30/100/20/30; Resident Dental 35/35/30/100/–/40; Fellowship –/–/30/30/–/70; Certificate 50/–/20/70/–/30 | L2154-2160 |
| BR-20 | Shortlisting Score = sum of applicable weighted components; recomputed on any input change | L1854 |
| BR-21 | Portfolio Score = "Total Points � Portfolio Weight per program" (operator garbled) | L1740, L1793 |
| BR-22 | English required except Fellowship (optional) and listed nationalities / university countries | L889 |
| BR-23 | Attachments ≤2 MB (configurable); configured format; PDF except photo | L715, L2121 |
| BR-24 | Personal statement per specialty × site | L716 n6 |
| BR-25 | Draft reminders: every N days (configurable per program) after last activity; warning 3 days and final 1 day before grace deadline; auto-archive after grace + notify | L683-686, L1080-1081 |
| BR-26 | Auto-save at configurable interval (e.g. 3 min); Save Draft without validation | L1081 |
| BR-27 | Payment mandatory; fees Internship 230 AED, Residency/Fellowship 650 AED; non-refundable | L1089, L598 n4, L2121 |
| BR-28 | On submit: Verification + Portfolio = Pending; attachments to FileNet with naming convention | L1088, L1089 n8 |
| BR-29 | Preference edits only until grace-period deadline; not in Withdrawn/Draft/Archived; Residency and Fellowship only | L532, L571, L629 |
| BR-30 | Exclude site only when Edit Preferences is disabled; ≥1 site remains per specialty; until academic-year start | L572, L652 |
| BR-31 | Withdraw anytime in cycle (L533) / until academic year begins (L2352); whole or per site; OTP to registered email + mobile | L533-535, L597 |
| BR-32 | Reinstatement: Withdrawn status only, same cycle, no other active application, supervisor approval; restores exact pre-withdrawal status and pool | L536-537, L614, L1526-1529, L1545 n2 |
| BR-33 | Appeal: once, after publication, within configurable window (default 48h from initial announcement); only "Yes" questions without full score; no new attachments; not for screened-out | L538, L573-574, L637, L1444 |
| BR-34 | Pool = program + first-preference specialty (verification and portfolio) | L1300, L1668 |
| BR-35 | Officer cap 10 (configurable per pool); due 5 working days (configurable per pool); overdue auto-return; not retrievable by previous officer; random oldest→newest | L1301-1309, L1316 |
| BR-36 | Officer pool notification threshold 35 (L1315-1316) vs 80 (tracker #105, L2431): conflict | — |
| BR-37 | Officer cannot see sites or the portfolio | L1142, L1144, L1161 n5 |
| BR-38 | Only flagged sub-sections editable on correction; resubmission goes to the same officer | L1358-1359 |
| BR-39 | Officer may only replace attachments, not edit fields; never portfolio | L1364, L1424 n4 |
| BR-40 | Officer cannot screen out directly; supervisor endorsement required; rejection/guidance note mandatory, endorsement note not | L1440-1442 |
| BR-41 | Screened-out candidate notified immediately; no appeal | L1444-1445 |
| BR-42 | Verification Complete alone does not progress; both workstreams must complete → Review Completed | L1365-1367, L1416 |
| BR-43 | Referee cap 10, due 2 working days, auto-return, never same portfolio twice, COI permanent exclusion | L1669-1674 |
| BR-44 | Discrepancy = totals differ OR any question decision differs. Note L1792 AC8 mentions totals only | L1735, L1793 n7 |
| BR-45 | R2 blind to R1; R3 blind to R1/R2; R3 final; 2nd Eval replaces final | L1734-1739 |
| BR-46 | All-or-nothing scoring vs points system; "Only 2 questions" from Internship/Residency use points (tracker v1 said 3). ASSUMPTION: Q3 and Q8 | L1728-1729, L2467, L2507 |
| BR-47 | Internship/Residency: Q1 accepted ⇒ Q2 accepted by default | L1772 n6 |
| BR-48 | Rejection reasons multi-select; candidate comment auto-mapped (Appendix 3.14/3.15) | L1731-1732 |
| BR-49 | Screened-out/withdrawn during scoring → On Hold | L1741 |
| BR-50 | Initial announcement manual; ready = verification + portfolio complete; CASPER not required; round scores hidden; appeal window from timestamp | L1923-1929 |
| BR-51 | CASPER: Excel; Application ID is the key; required for shortlisting eligibility; weight per program; unmatched = Absent; invalid structure rejected wholly; valid rows applied | L1871-1878, L1886 |
| BR-52 | Bulk screen out: mandatory reason applied to all; sets Screened Out + Announced; email + SMS; no appeal | L1967-1972 |
| BR-53 | Reannouncement required for every completed appeal even without change; only Ready for Reannouncement; no further appeal | L1997-2001 |
| BR-54 | Candidate-visible statuses only those marked *; hidden statuses keep the previous visible status | L346, L1366 |
| BR-55 | Finance: read-only, no navigation to details, export only current results | L1110, L1122-1123 |
| BR-56 | Central Monitor counting rules: occurrence (site × specialty), unique application-site, unique application per program | L1235 n4-7 |
| BR-57 | Free-text validation: ≥3 letters, reject "Reason"/"NA" | L606, L621 |
| BR-58 | Supervisor reassign: target officer same pool; justification ≤200; due date not reset (tracker #110) | L1339, L1347, L2436 |
| BR-59 | Senior Referee reassign resets retrieval and due dates; target excludes scorers/COI | L1690-1691 |

---

## 8. Notifications, documents, reports, integrations, NFRs

### 8.1 Notifications (templates: "TBC by business team", L2217)
| ID | Event | Channel | Recipient | Ref |
|---|---|---|---|---|
| NTF-01 | Account created | Per IDAM standards | Candidate | L509 n3 |
| NTF-02 | Duplicate account: use original | not stated | Candidate | L508 AC5 |
| NTF-03 | Draft reminders (N days / 3 days / 1 day) | Email | Candidate | L1080 |
| NTF-04 | Draft auto-archived | Email | Candidate | L1080 AC8 |
| NTF-05 | Application submitted | not stated | Candidate | L1088 AC10 |
| NTF-06 | Withdrawal OTP | Email + SMS (registered) | Candidate | L597 AC3 |
| NTF-07 | Withdrawal completed | Email | Candidate; admission team (handling officer + supervisor) | L597 AC7-8, L598 n1 |
| NTF-08 | Reinstatement requested | Email | Supervisor | L613 AC5 |
| NTF-09 | Reinstatement approved / rejected (with reason) | Email | Candidate | L1544 |
| NTF-10 | Site excluded | not stated | Admission team | L651 AC9 |
| NTF-11 | Contact email/mobile changed | OTP | Candidate | L765 AC11 |
| NTF-12 | Returned for correction incl. notes | Email | Candidate | L1383 n2, L1399 AC5 |
| NTF-13 | Correction reminders / auto-archive | Email | Candidate | L1407 AC8-12 |
| NTF-14 | Pool threshold (35/80 officers; 80 referees) | not stated | Assigned officers / referees | L1315 AC9, L1682 AC14 |
| NTF-15 | Reassignment | Email (template in appendix) | Target officer / referee | L1338-1339, L1690 |
| NTF-16 | Screen-out recommended / escalated | not stated | Supervisor | L1453, L1469 |
| NTF-17 | Screen-out endorsed (with reason) | not stated | Candidate | L1484 AC5 |
| NTF-18 | Screen-out rejected / guidance returned | not stated | Officer | L1484 AC9, L1500 AC5 |
| NTF-19 | Initial announcement / reannouncement / bulk screen-out | Email + SMS | Candidate | L1936 AC11, L2008 AC12, L1979 AC8 |
None on verification completion (L1416 n2). None to officer on resubmission (L2444). None to team on submission; a daily-updated counter of new applications replaces it (L1089 n2).

### 8.2 Documents / attachments
Full list in §6. Storage in FileNet with naming convention (L1089 n8). Versioning on replacement with previous retained (L1423, L1709). Download/preview, rotate, zoom (L1374 AC7, L1749 n5). Portfolio attachments are immutable for officers. Naming convention itself: OMISSION.

### 8.3 Reports / dashboards
| ID | Report / dashboard | Ref |
|---|---|---|
| RPT-01 | Candidate Dashboard (inbox) | L540-574 |
| RPT-02 | Admission Officer Dashboard: Pool Insights (Submitted, Under Verification, Pending With Candidate, Screened Out, Completed), Personal Queue (8 counters), Inbox | L1163-1204 |
| RPT-03 | Supervisor Dashboard: All Pools Insights, Personal Queue (7 counters), Inbox, Officers Workload, Referees Workload; filter cycle/program/specialty | L1206-1227, L1325-1331 |
| RPT-04 | Central Monitoring Dashboard: All Pools Insights, Training Site Interest by Specialty (bar), Site Applications by Status (7 pies), Site Applications by Program (5 pies; no Certificate pie), Applications List | L1229-1292 |
| RPT-05 | Referee Dashboard (Portfolios in Pool, Pending My Action, Complete, Returned for COI; inbox) | L1596-1626 |
| RPT-06 | Senior Referee Dashboard (6 pool counters; Referees Workload Panel) | L1628-1660 |
| RPT-07 | Screening Dashboard | L1836-1863 |
| RPT-08 | Finance Payments List + Excel export | L1112-1130 |
| RPT-09 | Duplicate-account pair report for supervisor | L508 AC6 (no spec) |
| RPT-10 | CASPER upload summary + exception list | L1885, L1899-1915 |
| RPT-11 | Reinstatement queue (incl. historical) | L1531-1537 |
Goal 7 "centralized reporting and a real-time dashboard ... across both tracks" (L233) has no further specification.

### 8.4 Integrations
| ID | System | Purpose | Ref |
|---|---|---|---|
| INT-01 | Dubai Health IDAM | Registration, login, session, lockout; source of registered email/mobile | L268, L489-522, L812-813 |
| INT-02 | UAE PASS (via IDAM) | Citizen identity option | L268, L491, L508 |
| INT-03 | ICP | Pre-populate identity (UAE PASS users); supervisor refresh; exception handling | L267, L765-805, L1554-1570 |
| INT-04 | Email & SMS gateway (Dubai Health Notifications) | Outbound notifications | L269 |
| INT-05 | Dubai Health OTP flow | Withdrawal and contact-change OTP | L598 n3, L765 AC11 |
| INT-06 | Payment Gateway | Fee collection; status updates; "current payment experience preserved" | L270, L1088-1089, L1109 AC10 |
| INT-07 | FileNet | Document repository | L271 |
| INT-08 | PowerCampus SIS | Later phase: create student accounts using Candidate ID | L272 |
| INT-09 | CASPER provider | Manual Excel upload (not an API) | L1867 |
| INT-10 | Legacy GME system | Data migration (historical records, attachments) and reference lists "extracted from current system" | L289, L784, L2128 |
DHA licensing: mentioned only in T&C (L2121) and board rule (L968). No integration. ICP API contract, IDAM protocol (OIDC/SAML) and claims: OMISSION.

### 8.5 Non-functional requirements
| ID | NFR | Ref |
|---|---|---|
| NFR-01 | Hosting: Dubai Health on-premises | L219, L227 |
| NFR-02 | Security: delegated auth, role-based access, deny without role, session timeout re-auth | L1140, L1152 |
| NFR-03 | Data minimisation / blinding: officers never see sites/portfolio; referees never see identity | L1142-1144, L1586 |
| NFR-04 | Audit: all application data/status actions with user and timestamp; replacements; ICP updates with old/new; referee answers with name/user/email; escalations; announcements | L590 n3, L1424, L1470, L1560, L1733, L1936 AC8, L2009 |
| NFR-05 | Resilience: ICP outage must not block submission | L766 |
| NFR-06 | Configurability without code: forms, fields, validations, deadlines, templates, workflows | L223, L234 |
| NFR-07 | Real-time workload monitoring; refresh on page load | L1331 |
| NFR-08 | Classification "Shared confidential" | L13 |
| NFR-09 | Localization: Arabic name fields only. Arabic UI / RTL / bilingual notifications: not stated | L778-780 |
| NFR-10 | UX: "enhanced UI/UX"; Mockups in Mednix (not in BRD) | L221, L230, L290 |
| NFR-11 | Performance, availability, scalability, accessibility, data retention, backup, encryption, privacy/consent: NOT STATED (OMISSION) | — |

---

## 9. Cross-module dependencies

- MOD-01 → all: role and identity. Candidate ID is required for the Application ID format (L723).
- MOD-14 Config → MOD-03/04/06/09/10: cycles, programs, specialties, sites (Appendix 3.2 TBC), candidate statuses, fees, weights, reminders, caps, due dates, thresholds, reasons, note templates, officer/referee pool assignment.
- MOD-03 → MOD-04: completion validation gates Pay & Submit.
- MOD-04 → MOD-06 + MOD-09: submission creates Verification/Portfolio Pending and routes to pools. MOD-04 → MOD-05 payment records. MOD-04 → MOD-13 FileNet.
- MOD-06 ⇄ MOD-09: parallel. Both Complete → Application Review Completed (L1792 AC14). Verification screen-out → portfolio On Hold. Reinstatement → portfolio returns to pool (L1545).
- MOD-06/09 → MOD-10: entry to the Screening Dashboard at Review Completed (L1844). Verification screen-out sets Announcement Announced (L1484).
- MOD-10 → MOD-11 → MOD-09 → MOD-10: announcement opens appeal → 2nd Eval → Ready for Reannouncement.
- MOD-02 ⇄ MOD-07: candidate requests → supervisor queue.
- MOD-03/07 ↔ INT-03 ICP. MOD-12 used by 02/03/06/07/09/10.
- MOD-15 audit used by all.
- External: MBRU track BRS shares the platform and Candidate ID (L197, L509 n6).

---

## 10. Open questions / omissions

Tags: **BLOCKER** = prevents correct foundation/first-slice implementation. **ASSUMPTION** = proceed with stated inference pending confirmation. **DEFERRED** = out of Release 5 or safe to postpone.

| # | Tag | Question / omission | Ref | Rationale |
|---|---|---|---|---|
| OQ-01 | **RESOLVED** (AP-10, register B-01) | ~~How are internal roles assigned? Who is the admin?~~ Platform administrators assign configurable roles through the admin API and UI; IDAM groups and claims are never used. Follow-ons: B-06 (binding attribute), B-07 (identity linking) | L491, L1153 n2, L1594 n2, L1383 n3 | Authorization foundation; no Admin role exists |
| OQ-02 | BLOCKER | Who becomes a Candidate? Is any authenticated IDAM user with no internal role auto-provisioned as Candidate on first login? Can internal staff also be Candidates (role switcher)? | L491, L1152 AC5 | Defines the provisioning rule |
| OQ-03 | BLOCKER | Duplicate account outcome: block access, block applying, or warn only? Matching keys (any one of mobile/EID/passport? normalisation?) Non-UAE PASS users may lack EID. Where is the supervisor report? | L508-509 | First-login flow |
| OQ-04 | BLOCKER | Candidate ID generation (sequential, random, check digit?), and when it is created relative to the duplicate check | L514 | Needed for Application ID |
| OQ-05 | BLOCKER | Application identifier: `123456789-G27` (L723) vs `20260000014` (L1096) vs numeric CASPER key (L1893). Are these one identifier or two? Is "G27" derived from cycle end year? | L723, L1096, L1893 | Entity key |
| OQ-06 | BLOCKER | Admission Cycle model: per program or global? Opening, deadline and grace-period fields; grace duration; correction grace period; academic year start date (for exclusion/withdrawal) | L553, L557, L726, L1363, L652 | Gates Start New Application |
| OQ-07 | BLOCKER | One active application per cycle (L530, L669) vs one active draft per program per cycle (L1081 n6) | — | Core constraint |
| OQ-08 | BLOCKER | Officer/referee pool assignment: data model and who maintains it; supervisor "scope" (L1143, L1585 "within scope") | L1316 n7 | Row-level authorization |
| OQ-09 | BLOCKER | Account disable/deactivation for any role (e.g. "officer no longer active", L1408); effect on queued work | L522, L1408 | Lifecycle of users |
| OQ-10 | BLOCKER | IDAM integration contract (protocol, claims incl. mobile/EID/passport, logout, timeout value) | L268, L508 AC4 | Login slice |
| OQ-11 | ASSUMPTION | Officer portfolio visibility: BRs say hidden (L1144, L1355); tracker #114 says "visible" (L2440). Assume hidden | — | Latest body text |
| OQ-12 | ASSUMPTION | BRO-02 says officer "announces results, and handles post-appeal promotions" (L303); EPIC-04 restricts to supervisor (L1824). Assume supervisor only | — | — |
| OQ-13 | ASSUMPTION | Senior Referee "return portfolios to pool" (L308) removed per tracker #140. Assume removed | L2466 | — |
| OQ-14 | ASSUMPTION | Can Admission Supervisor reassign portfolios (BRO-03 L304, Referees Workload L1211)? Assume view-only; reassign = Senior Referee | — | — |
| OQ-15 | ASSUMPTION | Officer pool threshold 35 (story) vs 80 (tracker #105). Assume 35, configurable | L1315, L2431 | — |
| OQ-16 | ASSUMPTION | Referee retrieval "can't retrieve more until batch completed" (L1664) vs tracker #133 "any time, max 10". Assume cap of 10 concurrent | — | — |
| OQ-17 | ASSUMPTION | Announcement naming "Initially Announced" vs "Announced"; Verification "Screen Out Pending Approval" vs "Pending Screen Out Approval"; "Correction(s) Submitted"; "Screen Out" vs "Screened Out". Use status-table names | L415-416, L363, L1173 | — |
| OQ-18 | BLOCKER (for scoring slice) | Portfolio Score operator garbled ("�"); max points per program (e.g. Residency sums to 31, Medical Internship 37) vs weight 30 | L1740, L1793, L1812 | Formula undefined |
| OQ-19 | ASSUMPTION | GPA Shortlisting Score = GPA% × weight/100; Exam Shortlisting Score mapping of formula outputs to weight 35; EPREE formula missing; SDLE cut 560 vs 542 | L872, L2200-2210, L2403 | — |
| OQ-20 | ASSUMPTION | Shortlisting weights: Resident Medical totals 100 + CASPER 20; is CASPER inside the Shortlisting Score? | L2154-2160, L1854 | — |
| OQ-21 | ASSUMPTION | Points-system questions = Q3 and Q8 (variable points); classification values per Appendix | L1729, L1066, L1071 | — |
| OQ-22 | BLOCKER (for form slice) | Training sites list and site-specialty mapping: Appendix 3.2 "TBC" | L2101 | Program and preferences screen cannot be built without it |
| OQ-23 | DEFERRED | Reference lists "extracted from current system" (countries, universities, degrees, boards, relationships, nationalities) | L784, L861-863, L977, L2128 | Seed later; placeholder data |
| OQ-24 | ASSUMPTION | Certificate program: fee, candidate statuses (absent in Appendix 3.3), Central Monitor pie, entrance/internship applicability. Assume follows Internship (Dental) | L697 n1 | — |
| OQ-25 | ASSUMPTION | Board "Tier" selection required by AC4 but missing from the data dictionary; License required-ness conflict | L967, L992-996 | — |
| OQ-26 | ASSUMPTION | Visa File Number/Place/Expiry mandatory condition vs visibility condition conflict | L793-795 | — |
| OQ-27 | ASSUMPTION | Disciplinary questions answered Yes: any consequence or attachment? | L741-744 | — |
| OQ-28 | ASSUMPTION | English results below threshold: block vs warn | L900 | — |
| OQ-29 | ASSUMPTION | Edit Preferences eligibility: "Residency and fellowship" (L571) vs "program has multiple specialty preferences" (L629). Pharmacy Residency? | — | — |
| OQ-30 | ASSUMPTION | Withdrawal window: "any point within the same cycle" (L533) vs "until academic year begins" (L2352) | — | — |
| OQ-31 | DEFERRED | Reinstatement cut-off per cycle | L570, L614 | Explicitly later |
| OQ-32 | ASSUMPTION | "Reinstated before the deadline" for screen-out reinstatement: which deadline? | L1173, L2503 | — |
| OQ-33 | DEFERRED | Email/SMS templates TBC; notification channels unspecified for several events | L2217 | — |
| OQ-34 | DEFERRED | Note/comment templates, screen-out reasons, rejection reasons admin maintenance ("TBD later") | L1383 n3 | — |
| OQ-35 | DEFERRED | Ranking, shortlisting by capacity, interview, offers, seat reservation fee, matching | L1816, L304, L1089 n4 | Release 6 |
| OQ-36 | DEFERRED | PowerCampus SIS integration | L272 | Later phase |
| OQ-37 | OMISSION | NFRs: performance, availability, accessibility, data retention, encryption, privacy/consent, Arabic UI/RTL and bilingual communications | — | Needed before production; not first slice |
| OQ-38 | OMISSION | FileNet naming convention; payment gateway contract; ICP field mapping ("UN ... (TBC)") | L1089 n8, L804 | — |
| OQ-39 | ASSUMPTION | "Preferences tab" referenced (L697 n6, L707) = Program and preferences screen; US-1.3.11 reference is wrong (that story is Save Draft) | — | — |
| OQ-40 | OMISSION | UI screens missing for Residency Entrance Exam, Portfolio, Summary & Payment, Appeal panel, and correction mode | §6.1 | Screen inventory gap |
| OQ-41 | ASSUMPTION | Reassign due date: tracker #110 not reset (officer) vs Senior Referee resets (L1690). Keep different per actor | — | — |
| OQ-42 | OMISSION | Status visibility: every Application Status is "*" visible. Confirm whether Under Review shows on Correction Submitted resubmissions etc. | L346 | — |
| OQ-43 | OMISSION | Data migration of historical candidates: how migrated candidates get Candidate IDs and link to IDAM accounts | L289, L501 | Affects duplicate check |
| OQ-44 | OMISSION | Application lifecycle across cycles: what happens to non-terminal applications when a cycle closes | — | — |
| OQ-45 | ASSUMPTION | Supervisor visibility of training sites (only officers are explicitly blocked) | L1142 | — |
