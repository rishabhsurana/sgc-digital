# QA Environment and Test Data Plan

This document defines stable environments, role accounts, and reusable datasets for executing the QA module matrix.

## 1) Environment Matrix

| Environment | Frontend | Backend | DB | Purpose | Data Policy |
|---|---|---|---|---|---|
| Local Dev | `sgc-digital` via `npm run dev` | `sgc-digital-backend` via `npm run dev` | Local/Dev MSSQL | Developer validation and bug reproduction | Resettable and disposable |
| QA/Staging | Built deployment branch | Deployed API build | Shared staging MSSQL | Full regression and UAT | Controlled seeded data only |
| Pre-Prod (optional) | Production-like build | Production-like build | Production-like MSSQL clone/anonymized | Final release confidence | Frozen dataset during sign-off |

## 2) Baseline Setup Checklist

- Confirm backend health endpoint: `GET /api/health`.
- Verify frontend-to-backend base URL alignment for the target environment.
- Ensure upload storage path is writable and cleaned between test cycles.
- Run backend seed command where needed: `npm run seed` in `sgc-digital-backend`.
- Apply any supplemental SQL fixtures from `sgc-digital/scripts` when required by scenario coverage.

## 3) Role-Based Test Accounts

Maintain non-personal, reusable QA accounts for each role class.

| Account Alias | Role | Core Access | Primary Module Coverage |
|---|---|---|---|
| `qa_applicant_basic` | submitter/applicant | public submit flows + dashboard | Auth, Correspondence, Contracts, Drafts, Dashboard |
| `qa_applicant_clarification` | submitter/applicant | clarification response flows | Correspondence/Contracts respond lifecycle |
| `qa_officer` | officer/manager-level | case-management/workqueue | Case Management/BPM, Activity |
| `qa_admin` | admin/super-admin | management + privileged APIs | Management portal, status actions, settings, users |
| `qa_auditor_readonly` | restricted/read-only (if supported) | reporting/read endpoints only | Reports, register/history read validation |

## 4) Reusable Dataset Packs

Prepare and refresh these dataset packs for deterministic test execution:

### Dataset A: Clean Applicant
- 1 applicant entity with no submissions and no drafts.
- Used for baseline create/submit happy paths.

### Dataset B: Draft-Heavy Applicant
- 1 applicant with:
  - 3+ contract drafts (varied completeness),
  - 3+ correspondence drafts,
  - at least one stale/deleted draft reference scenario.
- Used for draft recovery, list behavior, and conflict tests.

### Dataset C: Clarification Lifecycle
- 1 applicant with:
  - one correspondence and one contract in `returned_for_clarification`,
  - associated reviewer notes and prior documents.
- Used for respond/resubmit and timeline checks.

### Dataset D: Management Load
- 50-200 mixed submissions across statuses and ministries.
- 10+ management users with role variations.
- 5-20 staff requests in mixed states.
- Used for filters/pagination/reporting and management workflows.

### Dataset E: File Edge Cases
- Document set with:
  - valid small files,
  - near-limit size files,
  - invalid extension/mime examples,
  - intentionally missing file-on-disk records for error-path checks.
- Used for upload/download/delete robustness and security testing.

## 5) Data Refresh Rules

- Refresh Dataset A/B/C before each feature sprint regression cycle.
- Refresh Dataset D before release candidate testing.
- Rebuild Dataset E after any upload middleware or storage-path change.
- Never reuse production data directly; use anonymized or synthetic data only.

## 6) Ownership and Change Control

- QA owner maintains dataset scripts and account credentials in secured internal vault.
- Any schema or enum change must update:
  - seed scripts,
  - dataset definitions,
  - affected QA test cases in `QA_TEST_MATRIX.md`.
- Track dataset version using a simple label (`QA-DATA-v1`, `v2`, etc.) in test run logs.

## 7) Minimum Entry Gate for Execution

- Environments reachable and stable for 24h.
- Role accounts active and validated.
- Dataset version published for the run.
- Known blockers documented with workaround before execution starts.
