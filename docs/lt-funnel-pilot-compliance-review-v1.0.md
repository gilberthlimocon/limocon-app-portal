# LT Funnel Pilot — Store & Legal Compliance Review and Proposed Amendments

**Document version:** 1.0
**Date:** 2026-07-14
**Prepared for:** Limocon Technologies — LT Funnel Pilot Phase 1
**Reviewed source:** `gilberthlimocon/LT-Funnel-Pilot` — Phase 1 Product Design Specification v1.0 and Implementation Plan & Tracker v1.0
**Reviewer role:** Compliance research and amendment proposal (Google Play, Apple App Store, US/EU legal)
**Status:** Research + proposal. Not legal advice.

> **Important:** This document is compliance-planning research. Items tagged **[ATTORNEY REVIEW]** must be signed off by qualified US advertising/privacy counsel and, for EU/UK, EEA data-protection counsel before launch. Every external requirement below was verified against official Google, Apple, and regulator/statute sources current as of July 2026 (see Appendix A for source URLs). Where a rule was recently litigated or changed, the current legal status is stated explicitly.

---

## 0. What LT Funnel Pilot is (compliance-relevant summary)

LT Funnel Pilot (Phase 1, engineering kickoff 2026-07-20) is an **Expo React Native + Supabase** app for business owners, marketing service providers, and funnel builders. Customers:

1. Generate marketing content with **AI** (brand profile, landing page, sales page, email drafts, SMS drafts, lead-reply suggestions).
2. **Publish public hosted landing/sales pages** and **capture lead-form submissions** (name, email, phone, free-text answers) from the general public.
3. Manage those leads in a **lightweight CRM** and later send **marketing SMS and email** to them through server-side providers (gated behind consent, disabled by default in Phase 1).
4. Pay via **recurring SaaS subscriptions** ($39–$299/mo plus annual plans and add-ons), currently planned against a generic "billing provider" (decision **D-002**).

Three characteristics drive most of the compliance exposure:

- **The platform is a data processor / service provider.** Lead PII belongs to third parties (the public) and is handled on behalf of customers (the controllers). This triggers Data Processing Agreement and service-provider-contract obligations that the current spec does not mention.
- **The product is a generative-AI content engine that publishes public UGC.** This triggers store GenAI policies, store UGC-moderation rules, and FTC rules on fabricated testimonials/reviews.
- **The product sends regulated marketing messages (SMS/email).** This triggers TCPA, A2P 10DLC, and CAN-SPAM. The spec's "disabled by default until gates pass" posture is the correct mitigation but the gates must be specified concretely.

---

## 1. Executive summary — prioritized findings

Severity key: **Blocker** = stops store submission or is an outright legal violation at launch · **High** = must fix before the related feature ships · **Medium** = real risk, plan now · **Low/Info** = monitor or note.

| # | Area | Platform | Severity | One-line gap |
|---|------|----------|----------|--------------|
| P-1 | Account deletion (in-app **+ public web URL**) | Play + iOS | **Blocker** | No deletion flow or public deletion URL specified; store-gating and Data safety field |
| P-2 | Target API level 35 (Android 15) | Play | **Blocker** | New 2026 app must target API 35; pin Expo SDK 52+ |
| P-3 | In-app subscription billing vs. store billing | Play + iOS | **Blocker/High** | Generic "billing provider" (Stripe-style) conflicts with Play/Apple billing rules outside narrow carve-outs |
| L-1 | GDPR Art. 28 DPA + SCCs (if EU/UK leads) | Legal | **Blocker** | No customer DPA, sub-processor list, or transfer mechanism |
| L-2 | TCPA consent/opt-out/quiet-hours (live SMS) | Legal | **Blocker** | Consent ledger, suppression list, timezone quiet-hours, STOP handling not specified |
| L-3 | A2P 10DLC brand+campaign registration (live SMS) | Legal | **Blocker** | Carriers hard-block unregistered traffic since Feb 2025; must gate live send on TCR approval |
| L-4 | FTC — no fabricated testimonials/reviews/proof points | Legal | **High→Blocker** | AI "proof points" generator must not invent testimonials/ratings (2024 Reviews Rule) |
| P-4 | Store Generative-AI policy | Play (+ iOS) | **High** | No in-app "report AI content", output filtering, or GenAI console declaration |
| P-5 | User-generated-content moderation | Play + iOS | **High** | Public pages + lead submissions need report/block/filter + published contact |
| L-5 | CCPA/CPRA + US state service-provider terms | Legal | **High** | No service-provider addendum or no-sale/no-share commitment |
| L-6 | CAN-SPAM (live email) | Legal | **High** | Physical address + honored unsubscribe + non-deceptive AI subject lines |
| L-7 | State auto-renewal laws (Limocon's own subs) | Legal | **High** | Standalone renewal consent + self-service cancel + reminders |
| L-8 | ePrivacy / cookie consent on public pages | Legal | **High** | No consent banner / default-no-tracker posture on funnel pages |
| P-6 | Data safety form (Play) / privacy nutrition label (iOS) | Play + iOS | **High** | Must declare lead-PII collection/sharing + name AI provider (Apple 5.1.2(i)) |
| A-1 | iOS UGC + account deletion + privacy label | iOS | **High** | Same as P-1/P-5/P-6 but for the eventual iOS build |
| P-7 | Subscription pre-purchase disclosure + cancel | Play | **Medium** | Off-store billing shifts disclosure/cancel burden into the app |
| A-2 | iOS "not a repackaged website" (4.2) | iOS | **Medium** | Must ship native value, not a WebView shell |
| L-9 | ADA / WCAG 2.1 AA on public pages | Legal | **Medium** | Templates + form builder must be accessible; no overlay safe-harbor |
| L-10 | AI transparency (EU AI Act Art. 50 + US state) | Legal | **Medium** | AI-content marking before 2 Aug 2026 if EU-facing; scope as model deployer |
| P-8 | SMS/Call-Log permissions (Android) | Play | **Low** | Ensure no SMS/Call-Log permission leaks into the manifest |
| A-3 | Sign in with Apple (4.8) | iOS | **Low/Info** | Not triggered while auth is email/password only |
| A-4 | App Tracking Transparency | iOS | **Low/Info** | Not triggered by first-party analytics; triggers if ad/MMP SDK added |

**The five decisions that should be made before build starts:** (a) **billing rail** per platform and per region (P-3); (b) **which markets/leads are in scope at launch** — EU/UK presence flips L-1/L-8 from "plan" to "blocker" (L-1); (c) **the AI content guardrail policy** for testimonials/claims (L-4); (d) **account-deletion + data model for captured leads** (P-1); (e) **the consolidated Data Protection Addendum + AUP** contract set (L-1/L-5).

---

## 2. Google Play findings

### P-1 — Account deletion (in-app + public web URL) — **Blocker**
**Policy:** [Understanding Google Play's app account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111) (part of the User Data policy).
**Requirement:** An app that supports account creation must provide **both** an in-app path to delete the account and associated data **and** a **web link, reachable without installing the app**, to request deletion. Answer the Data-deletion questions in the Data safety form (earns the Data deletion badge). Invalid/unreachable deletion URLs are a common rejection.
**Gap:** Spec §21.5 ("Account and Data Deletion") describes deletion generically but names **no in-app flow and no public URL**, and does not resolve what happens to the **captured lead PII** held inside a deleted workspace.
**Amendment:**
- Add requirement **FR-006x**: in-app "Delete account" and "Delete workspace" flows (spec already separates these in §7.19) that call a server endpoint performing real deletion/anonymization.
- Publish a **public deletion URL** (delivered in this repo — see §6: `/lt-funnel-pilot/account-deletion/`).
- Complete the Play **Data safety** Data-deletion questions with that URL.
- Document lead-data handling on deletion in the privacy policy and DPA (delete vs. return-to-controller vs. retain-for-legal-hold).

### P-2 — Target API level 35 (Android 15) — **Blocker**
**Policy:** [Meet Google Play's target API level requirement](https://developer.apple.com/) — verified at `developer.android.com/google/play/requirements/target-sdk`.
**Requirement (verbatim):** since **31 Aug 2025**, new apps and updates must target **Android 15 (API 35)** or higher to be submitted. A new 2026 app will be refused at upload otherwise.
**Gap:** Not addressed in the spec's architecture/foundation phase (P0).
**Amendment:** Add to **P0 / M0 Foundation**: pin **Expo SDK to a version whose Android build targets API 35** (SDK 52+), set `android.compileSdkVersion`/`targetSdkVersion = 35`, and verify the generated `build.gradle`/manifest after prebuild. Add to the release checklist.

### P-3 — In-app subscription billing vs. Google Play Billing — **Blocker/High**
**Policy:** [Payments policy](https://support.google.com/googleplay/android-developer/answer/10281818); [US policy update](https://support.google.com/googleplay/android-developer/answer/15582165); [alternative/choice billing](https://support.google.com/googleplay/android-developer/answer/16497028).
**Requirement:** Play-distributed apps that charge for in-app features **must use Google Play Billing** unless an exception applies. The covered-transactions list **explicitly names** "cloud software and services (such as data storage services, **business productivity software**, and financial management software)." **There is no general SaaS/B2B carve-out.** The "consumed outside the app" exception does **not** apply because subscribers use the AI features **inside** the app.
**Current relief (US only):** Under the Epic v. Google injunction, as of **29 Oct 2025** Google will not require Play Billing for **US users** and permits alternative in-app billing / out-links; developers had until **28 Jan 2026** to align with the associated program. The **billing-choice program** allows third-party billing with a service fee (reported **10% for auto-renewing subs / 25% otherwise** in the US). **For non-US users, billing an in-app SaaS subscription via Stripe without Play Billing is a policy violation and takedown risk.**
**Gap:** Decision **D-002** treats billing as "provider selection" with plan rates approved, but does **not** address the store-billing requirement. Note Limocon's own **Review Booster** app already bills via **Apple/Google Play + RevenueCat** — Funnel Pilot's spec should reflect the same reality.
**Amendment (D-002 expanded):** choose one, per region:
1. **US-only launch** relying on the injunction + enroll in **billing choice** (budget the service fee, keep remittance records); or
2. Integrate **Google Play Billing** (via RevenueCat, consistent with Review Booster) for any market where it is still mandatory.
Do not gate in-app functionality behind an out-of-Play payment outside the US. Entitlement checks (spec §8 P8-005) must work regardless of billing rail.

### P-4 — Generative-AI apps policy — **High**
**Policy:** [AI-Generated Content policy](https://support.google.com/googleplay/android-developer/answer/14094294); [safeguards best practices](https://support.google.com/googleplay/android-developer/answer/16353813).
**Requirement:** GenAI apps must (1) provide **in-app reporting/flagging of offensive AI content without leaving the app** and use those reports to improve moderation; (2) **prevent generation of Restricted Content**; (3) adopt SAIF/OWASP-aligned testing and complete the **Generative AI declaration** in Play Console → App content.
**Gap:** Spec §8.5 has good content-quality rules (no fabricated testimonials, disclaimers for regulated claims) but **no in-app "report AI output"**, no described input/output safety filtering, and no testing record for the console declaration.
**Amendment:**
- Add **FR-024x**: a "Report / flag this AI output" control on every AI Studio surface (§7.8) routed to a moderation queue.
- Add prompt/output **safety classifiers** blocking Restricted Content; extend §8.5 and §17 (prompt orchestration) with these gates and an error category `policy_blocked` (already present in §17.4).
- Produce a **SAIF/OWASP-aligned safety-testing memo** to support the Play Console GenAI declaration; add to M8/P9.

### P-5 — User-generated-content moderation — **High**
**Policy:** [User Generated Content policy](https://support.google.com/googleplay/android-developer/answer/9876937).
**Requirement:** Apps featuring UGC must moderate reasonably, including an **in-app system to report and block objectionable UGC and users**, and take **timely action**.
**Gap:** The app publishes **public pages** and captures **lead submissions** — both UGC surfaces — with no report/moderation/takedown mechanism in the spec. Spec §21.4 gives the platform admin an "emergency disable" for abuse but there is no reporter-facing path or SLA.
**Amendment:**
- Add a **"Report this page"** control on every published public funnel page footer and an in-app report path.
- Define a **moderation workflow with takedown SLA**; extend §21.4 Abuse Controls and the Platform Admin role (§2.2) with a review queue.
- Add lead-form spam/objectionable-submission handling (complements §21.4 rate-limiting/honeypot).

### P-6 — Data safety form — **High**
**Policy:** [Data safety section](https://support.google.com/googleplay/android-developer/answer/10787469); [User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311).
**Requirement:** Declare all data collected/shared (including by third-party SDKs): here **Personal info — name, email, phone** (account + leads), purposes, encryption in transit, account creation, and the deletion pathway. Classify each third party as **service provider** vs. **third-party sharing** correctly.
**Gap:** Not addressed; interacts with the processor role (lead PII collected on behalf of customers still must be declared).
**Amendment:** Maintain a **data-inventory map** (field → purpose → recipient) and complete the Data safety form from it; set a privacy-policy URL in Play Console consistent with the form. Add to M8/P9.

### P-7 — Subscriptions policy — **Medium**
**Policy:** [Subscriptions policy](https://support.google.com/googleplay/android-developer/answer/9900533).
**Requirement:** Clear pre-purchase disclosure of price, **billing cycle**, **auto-renewal**, trial terms; an **easy online cancel** and clear management path.
**Gap:** With off-Play (Stripe) billing, users cannot cancel via Google Play's UI, so the app carries the full disclosure/cancel burden.
**Amendment:** Add a **pre-purchase disclosure screen** per plan/add-on and an **in-app "Manage/Cancel subscription"** path (spec §7.20 Billing). Overlaps with L-7 (state ARLs) — build once, satisfy both.

### P-8 — SMS/Call-Log permissions — **Low**
**Policy:** [SMS/Call Log permission groups](https://support.google.com/googleplay/android-developer/answer/10208820).
**Requirement:** Restricted; may not be declared unless the app is the default SMS/Phone handler.
**Gap:** None by design (sending is server-side), but Expo/RN dependencies can leak a permission into the merged manifest.
**Amendment:** Add a **manifest audit** to P0/M8 confirming no `SEND_SMS`/`READ_SMS`/Call-Log permission is present. Keep all sending server-side.

---

## 3. Apple App Store findings

> **Context:** the spec **excludes native iOS from Phase 1** (§ "Explicit Phase 1 Exclusions"; §28.2 lists "Native iOS launch" post-Phase-1). But **Expo/EAS can build an iOS binary from the same code with no rewrite**, so an iOS launch is a realistic near-term option. These are **roadmap-shaping** items to bake in now — most (account deletion, UGC moderation, privacy disclosures) are needed for the web/Phase-1 product anyway. Primary source: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (Nov 13, 2025 revision).

### A-1 — Billing posture (Guideline 3.1.1 / 3.1.3) — **High (architecture-shaping now)**
**Rule:** 3.1.1 requires IAP to unlock in-app features/subscriptions. The relevant clean path is **3.1.3(f)**: a **free companion app to a paid web-based tool** needs no IAP **provided there is no purchasing and no purchase CTA inside the app** (outside the US storefront). The **Enterprise** carve-out 3.1.3(c) does **not** apply to self-serve single-user plans ("single user… sales must use in-app purchase"). 3.1.3(b) Multiplatform is **not** an exemption (requires parallel IAP). Post-**1 May 2025**, the **US storefront** allows external-purchase links/CTAs without the external-link entitlement (Epic v. Apple injunction).
**Amendment (add an "iOS billing posture" note to D-002):** ship iOS as a **free companion under 3.1.3(f)** — no in-app plan selection/pricing/CTA outside the US storefront; subscription lifecycle lives on the web; give non-subscribers a genuinely useful free tier or a neutral "account inactive" state (never a "go subscribe on our site" dead-end). Evaluate the US-storefront external-link path (confirm the current StoreKit External Purchase commission/reporting terms before relying on the reported ~27%/reduced-tier figures). Reject reliance on 3.1.3(c). If a global in-app upsell is ever required, budget for IAP + 15–30% commission.

### A-2 — In-app account deletion (5.1.1(v)) — **High** → mirrors P-1.
Native in-app deletion is mandatory and a top rejection reason. Build once for both stores (P-1).

### A-3 — UGC safeguards (Guideline 1.2) — **High** → mirrors P-5.
Apple requires **all four**: content filtering, a **report mechanism with timely response**, ability to **block abusive users**, and **published contact info**. Apple reviews **web-hosted** content too, so the public funnel pages are in scope. Build once for both stores (P-5).

### A-4 — Privacy labels + name the AI provider (Guideline 5.1 / new 5.1.2(i)) — **High**
**Rule:** The App Store Connect **privacy nutrition label** must enumerate every data type collected and each SDK's collection. **New 5.1.2(i) (Nov 13, 2025):** you must **clearly disclose where personal data is shared with third parties, including third-party AI, and obtain explicit permission** — generic "we use service providers" is treated as insufficient; **name the AI provider(s)**.
**Amendment:** the data-inventory map (P-6) also feeds the iOS privacy label; **name each third-party AI provider** in the in-app disclosure/consent and privacy policy; add explicit permission before personal data is sent to third-party AI; set the age rating for AI-generated content.

### A-5 — Minimum functionality / not a repackaged website (4.2) — **Medium**
**Rule:** 4.2/4.2.2 reject apps that are "repackaged websites"/"web clippings." Expo/RN native components help, but a WebView shell around the web dashboard invites rejection.
**Amendment:** spec the iOS app as **natively rendered** with ≥2–3 native capabilities beyond the web tool (push notifications on new lead capture, native lead inbox, native draft editing/preview). Forbid a pure-WebView shell. (Consistent with spec §29's native component library.)

### A-6 — Sign in with Apple (4.8) — **Low/Info**
Not triggered: auth is **email/password only**. **Add a spec note:** if any social/third-party login is later added, 4.8 triggers and Sign in with Apple (or equivalent) must be offered.

### A-7 — App Tracking Transparency (5.1.2) — **Low/Info**
Not triggered by **first-party anonymous analytics** (spec §22 uses anonymous IDs, no cross-app ad tracking). **Add a spec note:** adding any ad-attribution/MMP SDK or data-broker sharing makes ATT + updated labels mandatory. Keep analytics IDs first-party.

---

## 4. Legal / regulatory findings

### L-1 — GDPR / UK GDPR: Art. 28 DPA + SCCs — **Blocker if EU/UK leads in scope**
**Law:** GDPR (EU) 2016/679; UK GDPR + DPA 2018.
**Requirement:** Customer = controller, Limocon = processor. A written **Art. 28 Data Processing Agreement** is **mandatory** (instructions-only processing, confidentiality, security, sub-processor authorization + flow-down, assist with data-subject rights and breach, delete/return at end, audits). Data-subject rights (esp. **erasure**) must be technically fulfillable per lead. US processing needs a transfer mechanism: **EU–US Data Privacy Framework** self-certification **or** **SCCs Module 2/3**.
**Gap:** No DPA, sub-processor list, per-lead export/delete tooling, or transfer mechanism in the spec.
**Amendment:**
- **[ATTORNEY REVIEW]** Publish a customer-facing **DPA** with **SCCs Module 2/3** annex + a **sub-processor list** (Supabase, AI provider, Twilio, email/billing providers) + change-notification.
- Product: per-lead **export + hard delete** actions (reuse for CCPA rights); deletion propagation to sub-processors; retention controls (add to §14 CRM and §18 DB, e.g., a `data_deletion_requests`/retention field).
- Consider **DPF certification** for the US processing entity.
- **Decision to add — D-008:** "Are EU/UK leads in scope at launch?" If yes, L-1/L-8 are launch blockers.

### L-2 — TCPA (marketing SMS) — **Blocker for the live-SMS feature**
**Law:** TCPA 47 U.S.C. §227; 47 C.F.R. §64.1200.
**Requirement:** **Prior express written consent** before marketing SMS (discloses marketing purpose + seller, states consent is not a condition of purchase, notes msg/data rates); **revocation "in any reasonable manner"** honored within **10 business days** (effective 11 Apr 2025) — cannot mandate an exclusive opt-out method, must honor STOP/QUIT/END/UNSUBSCRIBE/etc. via any channel; **quiet hours** 8 a.m.–9 p.m. in the **recipient's** timezone. Damages **$500–$1,500/message**.
**Status note (get this right):** the FCC **one-to-one consent rule was vacated** by the 11th Circuit on **24 Jan 2025** and **formally repealed Sept 2025**. **Do not build to the one-to-one rule** — standard PEWC governs. Quiet-hours-for-consented-messages is an unresolved litigation wave; **enforce quiet hours regardless of consent** (conservative).
**Gap:** Spec §13.3 lists a live-SMS gate (provider, verified sender, recorded consent, billing, opt-out, approved copy) — good — but does not specify an **auditable consent ledger**, a **global suppression list**, a **timezone-aware quiet-hours scheduler**, or **automatic STOP/free-form revocation** handling.
**Amendment:** add these as concrete requirements under §13.3 and the DB (immutable consent-ledger table storing consent text/timestamp/IP/source page/lead id; suppression list honored ≤10 business days, ideally immediate; timezone quiet-hours send-window service; STOP auto-handler). Bake "consent is not a condition of purchase" into the lead-form SMS opt-in component (§10.3 consent config). **[ATTORNEY REVIEW]** of the opt-in template.

### L-3 — A2P 10DLC registration — **Blocker for the live-SMS feature**
**Requirement (carrier/CTIA):** application-to-person SMS over 10-digit long codes requires registering the **Brand** (legal entity + EIN) and each **Campaign** (use case) with The Campaign Registry via the provider. Since **Feb 2025** the major US carriers **block** unregistered traffic outright.
**Gap:** Not in the spec. In a multi-tenant SaaS where customers send under their own brand, each customer needs sub-brand/campaign registration.
**Amendment:** add an **SMS onboarding wizard** (collect brand legal name/EIN/website + campaign use case + sample messages) and a state machine that keeps a customer's SMS **disabled until TCR status = approved**; separate campaigns for marketing vs. transactional. Document that the Phase-1 "disabled by default" is enforced **at the provider-credential level**, not just the UI (strengthens §13.3 and env flag `ENABLE_LIVE_SMS`).

### L-4 — FTC endorsements + Reviews Rule (no fabricated proof) — **High → Blocker for the affected feature**
**Law:** FTC Act §5; Endorsement Guides 16 CFR Part 255 (rev. 2023); **Consumer Reviews & Testimonials Rule 16 CFR Part 465 (effective 21 Oct 2024)**.
**Requirement:** **fake or AI-generated reviews/testimonials, reviews from people who don't exist, and misrepresenting reviews' independence are prohibited**; civil penalties up to **~$51,744/violation**. Claims need substantiation before dissemination (esp. health/finance/earnings).
**Direct product risk:** spec §10.2 lists a "**Proof**" section (testimonials/facts/credentials) and §8.3/§9 generate persuasive copy. If the AI **invents** testimonials/ratings/statistics presented as real, the platform generates per-se-unlawful content. Spec §8.5 already says "must not fabricate testimonials" and §11.3 forbids fake scarcity/unprovided guarantees — good, but this must be enforced in the engine and UI, not just stated.
**Amendment:** the AI generator **must not fabricate testimonials, reviews, ratings, statistics, or proof points as if real**. Constrain outputs to (a) clearly-labeled **placeholder/sample** copy the user must replace with genuine, substantiated content, or (b) templates that only insert **customer-supplied real** testimonials. Add a **substantiation attestation** checkpoint to the publish checklist (§7.14) for proof/claims; flag health/finance/earnings claims. **[ATTORNEY REVIEW]** of guardrails + AUP clause prohibiting fabricated endorsements.

### L-5 — CCPA/CPRA + US state service-provider terms — **High (Blocker for CA agency customers)**
**Law:** CCPA/CPRA (Cal. Civ. Code §1798.100 et seq.; 11 CCR §7051) + ~19 other state laws (2025–2026).
**Requirement:** to be a **"service provider"** (not a "third party"), the customer contract must contain §7051 terms (process PI only for the business purpose, **no sale/share**, no combining, flow-down, assist with consumer rights, permit monitoring). Consumer rights: access/delete/correct/opt-out of sale/share; **sensitive PI** limits (lead phone/email/answers may qualify). CPPA's ADMT/risk-assessment/cyber-audit regs took effect **1 Jan 2026**; enforcement is active (a **$1.35M** settlement in Sept 2025 cited missing vendor contracts).
**Gap:** No service-provider terms or no-sale/no-share commitment; no consumer-rights tooling.
**Amendment:** **[ATTORNEY REVIEW]** a **US multi-state service-provider addendum** (unify with the GDPR DPA into one **Data Protection Addendum**) with §7051 terms + explicit **no-sale/no-share**; reuse the per-lead delete/access tooling from L-1.

### L-6 — CAN-SPAM (live email) — **High**
**Law:** CAN-SPAM 15 U.S.C. §7701 et seq. (FTC).
**Requirement:** accurate headers, non-deceptive subject lines, ad identification, **valid physical postal address**, clear **opt-out honored within 10 business days**; both the promoted business and the sending platform can be liable.
**Gap:** Spec §12.3/§12.4 require a "compliance footer **placeholder**" and unsubscribe "before bulk sending" — must become enforced behavior for live send.
**Amendment:** for live email: auto-append the customer's **physical postal address** + working **unsubscribe**; **block send** if no valid address; per-customer suppression list honored ≤10 business days; the AI subject-line generator must avoid deceptive subjects. Tie to env flag `ENABLE_LIVE_EMAIL`.

### L-7 — State automatic-renewal laws (Limocon's own subscriptions) — **High**
**Law:** California ARL (Bus. & Prof. Code §17600 et seq., amended by **AB 2863, eff. 1 Jul 2025**) + similar state ARLs.
**Requirement:** clear/conspicuous auto-renewal terms **before** purchase; **standalone affirmative consent to auto-renewal** (separate from ToS acceptance); acknowledgment + renewal/price-change reminders; **easy cancellation via the same medium used to enroll** (online sign-up → online cancel); retain consent records ≥3 years.
**Status note:** the FTC federal **"Click-to-Cancel" Negative Option Rule was vacated** by the 8th Circuit on **8 Jul 2025** and is **not in effect** (FTC signaled revival via a Jan 2026 ANPRM). **Comply via state ARLs + ROSCA + FTC Act §5**, which remain enforced.
**Gap:** Spec §7.20 Billing does not specify standalone renewal consent, reminders, or self-service cancel.
**Amendment:** **[ATTORNEY REVIEW]** checkout with a distinct, **logged "I agree to automatic renewal"** step; acknowledgment email with terms + cancel instructions; **self-service in-app cancel** (no phone/email-only gate); renewal/price-change reminders; 3-year consent retention. This also satisfies Play P-7's disclosure/cancel burden.

### L-8 — ePrivacy / cookie consent on public funnel pages — **High (Medium if pages ship tracker-free)**
**Law:** ePrivacy Directive 2002/58/EC + GDPR consent standard.
**Requirement:** prior opt-in before non-essential cookies/trackers on the public pages; equal-prominence accept/reject; no pre-ticked boxes; block non-essential scripts until consent. 2025 enforcement intensified (CNIL €325M Google, €150M Shein).
**Gap:** The public renderer (spec §15/§27) has no described consent-management banner; §22.3 notes "disclose cookie/analytics use where required" but provides no mechanism.
**Amendment:** ship a **built-in, geo-aware (EU/UK) consent banner** on published funnel pages (equal accept/reject, prior blocking of non-essential scripts); default templates to **no non-essential trackers** unless the customer enables and configures consent.

### L-9 — ADA / WCAG on public pages — **Medium**
**Law:** ADA Title III (courts apply WCAG **2.1 AA** as the benchmark). 2025 saw 3,000+ federal web-accessibility suits; overlay widgets are **not** a safe harbor.
**Gap:** Spec §29.3 already targets **WCAG AA for the app UI** — extend the same bar to the **published public pages and form builder**.
**Amendment:** build funnel **templates + form builder to WCAG 2.1 AA** (semantic markup, labels, contrast, keyboard nav, focus, alt-text prompts); do not rely on an accessibility overlay; provide customers an accessibility note.

### L-10 — AI transparency (EU AI Act Art. 50 + US state) — **Medium**
**Law:** EU AI Act (Reg. (EU) 2024/1689) **Art. 50** — GenAI outputs must be **machine-readable-marked and detectable as AI-generated**, applicable from **2 Aug 2026** (transitional grace to ~2 Dec 2026 for existing systems). US state: CA **AB 2013** (training-data transparency, eff. 1 Jan 2026 — targets model *developers*), CA **SB 942** (>1M users, operative Aug 2026), Colorado AI Act (eff. 1 Jan 2027), Utah AI Policy Act.
**Gap:** No AI-content marking; developer-vs-deployer status undocumented.
**Amendment:** adopt **AI-content marking/provenance** (metadata/C2PA for AI images; provenance for AI text where feasible) before the **2 Aug 2026** EU deadline if EU-facing; add a user-facing "AI-assisted" note; document that Limocon is a **deployer of third-party foundation models** (not a "developer") to scope out AB 2013 developer duties (**confirm the integration model** — decision **D-003** should record this); monitor SB 942's user threshold. **[ATTORNEY REVIEW]** of Art. 50 applicability once EU entry is decided.

---

## 5. Proposed amendments to the LT Funnel Pilot Phase 1 documents

These are concrete edits to the source spec/tracker. IDs like **FR-0xx** follow the spec's numbering.

### 5.1 Add a new PDS Section 31 — "Regulatory & Store Compliance"
A single section consolidating: store account-deletion (in-app + web URL), GenAI + UGC moderation, the billing posture per platform/region, the messaging-compliance gates (TCPA/A2P 10DLC/CAN-SPAM), the AI content-integrity rules (no fabricated proof), privacy roles + DPA/SCCs + service-provider terms, cookie consent, accessibility, and AI transparency. Each maps to the findings above.

### 5.2 New / amended functional requirements
| New/changed ID | Requirement |
|---|---|
| **FR-006x (Must)** | In-app account deletion and workspace deletion, backed by a server delete/anonymize endpoint; public web deletion URL published; Data-safety deletion fields completed. |
| **FR-024x (Must)** | In-app "report/flag AI output" control on every generation surface, routed to a moderation queue; input/output safety filtering for Restricted Content. |
| **FR-035x (Must)** | "Report this page" control on every published public page + moderation/takedown workflow with SLA; block/suspend publishing accounts. |
| **FR-062x (Must)** | Live SMS requires: auditable consent ledger, global suppression list honored ≤10 business days, timezone-aware quiet-hours scheduler, STOP/free-form revocation auto-handler, and **approved A2P 10DLC brand+campaign** before any send. |
| **FR-053x (Must)** | Live email auto-injects the customer's physical postal address + working unsubscribe; blocks send without a valid address; suppression list honored ≤10 business days. |
| **FR-020x (Must)** | AI content engine must not fabricate testimonials/reviews/ratings/statistics/proof points as if real; proof sections use labeled placeholders or customer-supplied real content; substantiation attestation at publish. |
| **FR-095x (Must)** | Per-lead data-subject/consumer-rights actions: export + hard delete, with propagation to sub-processors; retention controls. |
| **FR-096x (Should)** | Geo-aware cookie-consent banner on published public pages; templates default to no non-essential trackers. |
| **FR-097x (Should)** | Subscription checkout: standalone logged auto-renewal consent, acknowledgment + reminder emails, self-service in-app cancel. |

### 5.3 Amend existing sections
- **§21.5** (deletion): specify in-app flow + public URL + lead-data handling.
- **§13.3 / §12.4**: convert "placeholders" and gate lists into the enforced requirements above; enforce disabled-by-default at the credential level (`ENABLE_LIVE_SMS`/`ENABLE_LIVE_EMAIL`).
- **§8.5 / §10.2 / §11.3**: add the no-fabricated-proof enforcement + substantiation checkpoint.
- **§21.4 / §2.2**: add reporter-facing UGC report path + moderation queue for the Platform Admin.
- **§22.3 / §27**: add the cookie-consent mechanism to the public renderer.
- **§29.3**: extend WCAG 2.1 AA to public pages + form builder.
- **§30.1**: add env/config for AI provider naming, moderation, and 10DLC status; keep live-send flags default false.

### 5.4 Amend the blockers list (Implementation Plan "Global Blockers")
| ID | Decision | Required before |
|---|---|---|
| **D-002 (expand)** | Billing rail **per platform and per region** (Play Billing / billing-choice / US external link / iOS 3.1.3(f) companion) | Phase 8 |
| **D-006 (satisfy)** | Privacy, Terms, **and public Account-Deletion** URLs — **draft pages delivered in this repo (§6)** | Phase 5/9 |
| **D-008 (new)** | Are **EU/UK leads** in scope at launch? (flips L-1/L-8 to blockers) | Phase 6 |
| **D-009 (new)** | AI **model-integration posture** (deployer vs. developer) + provider naming for disclosures | Phase 4 |
| **D-010 (new)** | **A2P 10DLC** brand/campaign registration model (per-customer sub-brand) | Phase 8 |
| **D-011 (new)** | Consolidated **Data Protection Addendum + AUP** approved by counsel | Phase 9 |

### 5.5 Amend Phase 0 / M0 and the Release Candidate checklist
- **P0**: add "target API 35 (Expo SDK 52+)" and "manifest permission audit (no SMS/Call-Log)".
- **Release checklist additions**: in-app + web account deletion verified; Play Data-safety + GenAI declaration complete; iOS privacy label plan with AI provider named; UGC report/block/takedown working; live SMS blocked without consent-ledger + 10DLC approval; live email blocked without postal address + unsubscribe; AI cannot publish fabricated testimonials; DPA/SCCs + service-provider addendum + sub-processor list published; cookie-consent banner on public pages; WCAG 2.1 AA on public pages.

---

## 6. Draft legal pages delivered in this repo

Because blocker **D-006** requires published Privacy, Terms, and Account-Deletion URLs, and both stores gate on them, this branch also adds **draft** LT Funnel Pilot legal pages to the app portal, following the existing pattern used for LT Google Review Booster:

- `/lt-funnel-pilot/` — legal hub
- `/lt-funnel-pilot/privacy/` — Privacy Policy (covers processor role, lead PII, AI providers, SMS/email, sub-processors, deletion)
- `/lt-funnel-pilot/terms/` — Terms of Service (covers AUP, customer-obtained-consent reps, subscriptions/auto-renewal, AI content, disclaimers)
- `/lt-funnel-pilot/account-deletion/` — public account-deletion instructions (satisfies the store web-URL requirement)

**These are pre-launch drafts.** They describe the Phase-1 spec's intended behavior (live SMS/email disabled by default; AI drafts require user approval) and are written conditionally where features are gated. They **must be reviewed by counsel and reconciled with the final build** before deploying to production (`main`), and the DPA + service-provider addendum + sub-processor list (L-1/L-5) still need to be authored separately. They intentionally remain on this branch, not `main`, until then.

---

## Appendix A — Sources (verified July 2026)

**Google Play:** Payments policy `support.google.com/googleplay/android-developer/answer/10281818`; US payments update `/15582165`; alternative/choice billing `/16497028`; AI-Generated Content `/14094294`, `/13985936`, safeguards `/16353813`; UGC `/9876937`; account deletion `/13327111`; Data safety `/10787469`, User Data `/10144311`; SMS/Call-Log `/10208820`; Subscriptions `/9900533`; Target API `developer.android.com/google/play/requirements/target-sdk`.

**Apple:** App Review Guidelines `developer.apple.com/app-store/review/guidelines/`; User Privacy & Data Use `developer.apple.com/app-store/user-privacy-and-data-use/`; US external-link update `developer.apple.com/news/?id=9txfddzf`; Nov 13 2025 guideline update incl. 5.1.2(i) `developer.apple.com/news/?id=ey6d8onl`.

**Legal:** TCPA — *Ins. Marketing Coalition v. FCC* (11th Cir. 24 Jan 2025) vacatur; FCC one-to-one repeal (Sept 2025); April 2025 opt-out rule. A2P 10DLC — Twilio A2P docs; carrier blocking since Feb 2025. CAN-SPAM — FTC Compliance Guide. GDPR — Art. 28; EU Commission SCCs. CCPA — 11 CCR §7051; CPPA 2026 regs. FTC — Endorsement Guides 16 CFR 255; Reviews Rule 16 CFR 465; Negative Option vacatur *Custom Communications v. FTC* (8th Cir. 8 Jul 2025). CA ARL — AB 2863 (eff. 1 Jul 2025). ADA — Title III / WCAG 2.1 AA. EU AI Act — Art. 50 (from 2 Aug 2026); CA AB 2013 / SB 942. (Full URLs in the research working notes.)

---
*End of review v1.0.*
