# Phase 2 — Lending Core: KYC, Tiers, Repayments

This phase wires three large systems on top of the existing landing + auth + dashboard shell. To keep quality high I'll ship it in three sequential sub-phases (each ends in a usable, demoable state). Confirm scope, then I'll start with **2A**.

---

## 2A. KYC Document Upload + Admin Review

**Database**
- `kyc_documents` table: `user_id`, `doc_type` (`id_front` | `id_back` | `selfie`), `storage_path`, `status` (`pending`/`approved`/`rejected`), `reviewed_by`, `review_notes`, `submitted_at`, `reviewed_at`.
- Private storage bucket `kyc-documents` with RLS: owner can upload/read their own files at `{user_id}/...`; admins can read all.
- `user_roles` table + `app_role` enum (`admin`, `borrower`) + `has_role()` security-definer function (per platform rules — never role on profile).
- Trigger on `kyc_documents` that flips `profiles.kyc_status` to `approved` only when all 3 docs are approved; back to `pending`/`rejected` accordingly.

**UI**
- Borrower: `/dashboard/kyc` — 3 dropzones (ID front, ID back, selfie), live preview, status badges, re-upload after rejection, rejection reason displayed.
- Admin: `/admin/kyc` — queue of pending submissions, signed URL previews, approve/reject with notes.

## 2B. Loan Tier Engine (Admin Configurable)

**Database**
- `loan_tiers` table: `name`, `min_amount`, `max_amount`, `min_term_days`, `max_term_days`, `interest_rate_pct`, `processing_fee_pct`, `activation_fee`, `eligibility_rules` (jsonb — e.g. `{ "min_kyc": "approved", "min_repaid_loans": 0 }`), `is_active`, `sort_order`.
- `profiles.tier_id` nullable FK — assigned on activation.
- RLS: borrowers read active tiers; only admins write.

**UI**
- Admin: `/admin/tiers` — full CRUD table, activate/deactivate toggle, drag-to-reorder, live preview of computed loan cost.
- Borrower dashboard: replaces hard-coded "K 0 limit" with the user's assigned tier's `max_amount`.

## 2C. Repayments via Flutterwave (Airtel, MTN, Bank Transfer) + Reconciliation

**Database**
- `loans` table (minimal for repayment flow): `borrower_id`, `tier_id`, `principal`, `interest`, `fees`, `total_due`, `disbursed_at`, `due_at`, `status` (`active`/`repaid`/`overdue`/`written_off`), `outstanding_balance`.
- `repayments` table: `loan_id`, `borrower_id`, `amount`, `channel` (`airtel_money`/`mtn_momo`/`bank_transfer`), `flutterwave_tx_ref`, `flutterwave_tx_id`, `status` (`initiated`/`pending`/`successful`/`failed`/`reconciled`), `paid_at`, `reconciled_at`, `receipt_number` (auto-generated), raw `provider_payload` jsonb.
- `late_fees` table: `loan_id`, `assessed_at`, `days_late`, `amount`, applied via a daily reconciliation job.
- Trigger: when a `repayments.status` becomes `successful`, decrement `loans.outstanding_balance`, mark `repaid` when zero, generate receipt number.

**Server functions / routes**
- `initiateRepayment` server fn → calls Flutterwave **Charge API** with `payment_options` set per channel (`mobilemoneyzambia` for Airtel/MTN, `banktransfer` for bank). Returns redirect / payment link.
- `POST /api/public/webhooks/flutterwave` server route — verifies `verif-hash` against `FLUTTERWAVE_SECRET_HASH`, fetches transaction via Flutterwave verify API using `FLUTTERWAVE_SECRET_KEY`, then upserts the repayment and runs reconciliation.
- `reconcileRepayment` admin server fn — manual reconcile for stuck/bank-transfer payments by `tx_ref`.
- Daily late-payment sweep via a server fn invoked from a cron URL (`/api/public/cron/late-fees`) — flags overdue loans, assesses configurable late fee, updates `loans.status = 'overdue'`.

**UI**
- Borrower: `/dashboard/loans/:id/repay` — channel picker (Airtel / MTN / Bank), amount, confirms via Flutterwave, returns to receipt page with downloadable PDF-style receipt.
- Borrower: `/dashboard/loans` list with outstanding balance, next due, late-fee warnings.
- Admin: `/admin/repayments` — table of all repayments with filters, reconcile button, raw payload drawer.

**Secrets I'll request after you approve** (via the secrets tool — never asked in chat):
- `FLUTTERWAVE_SECRET_KEY`
- `FLUTTERWAVE_PUBLIC_KEY`
- `FLUTTERWAVE_SECRET_HASH` (webhook signature)

---

## Technical notes
- All new public-schema tables ship with `GRANT` + RLS + policies in the same migration.
- Roles live in `user_roles`, checked via `has_role()` SECURITY DEFINER — never on `profiles`.
- KYC files served via signed URLs only; bucket is private.
- Flutterwave webhook always re-verifies the transaction server-side before trusting amount/status (industry standard, prevents spoofed callbacks).
- No country-specific hard-coding: channels, tiers, fees, and late-fee rules all DB-driven.

---

## Recommended execution
Ship **2A → 2B → 2C** in three turns. Each turn ends with a working, testable surface. Doing all three in one pass would mean ~15 files + 3 migrations + Flutterwave wiring in one shot — high risk of rough edges.

**Reply with one of:**
- "Go 2A" — start with KYC (recommended)
- "Go all" — attempt 2A+2B+2C in one pass (expect follow-ups)
- Any change you want to the plan above
