# DAHC-UI recommendations from the candidate portal

These are gaps found while building the portal. They are composed inside the portal for now and not implemented in DAHC-UI.

- **Icon tile with a value and caption** (Figma admission-cycle tiles: a 40 px tinted rounded icon, a bold value and a caption). It is composed in `features/candidate/dashboard` from `dahc-icon` and the category surface tokens. It would make a small `dahc-icon-tile` component.
- **Character counter on `dahc-form-field`.** The appeal response (200 characters) puts the count in `hint`. A built-in counter with live announcement would be better.
- **OTP input** (one-time code with resend countdown). It is composed in the withdraw dialog from `dahc-form-field` + `dahcInput` + a link button. It recurs in the contact-verification flow.
- **Card with an eyebrow but no heading.** `dahc-card` renders the header only with an eyebrow or a heading. A question card with its own `<p>` prompt works, but a "content heading" slot would be cleaner.
- **Links inside `dahc-alert`.** The default link colour fails 4.5:1 on the info surface (found by axe on My account). The portal styles such links with `--dahc-color-info-text`, bold and underlined; DAHC-UI should style `a` inside alerts for every variant.
- **Icons the GME screens need are missing:** `link` (portfolio research link field), `plus` (add another board), `bell` (header notifications, already noted in Phase 7).
