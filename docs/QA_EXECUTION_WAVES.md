# QA Execution Waves and Release Gates

This runbook defines the order of execution, pass thresholds, and stop/go criteria for release testing.

## Wave 1: Critical Path (`P0`)

### Scope
- Auth and access control (`AUTH-*` critical paths).
- Contract submission end-to-end (`CON-*` critical paths).
- Correspondence submission end-to-end (`COR-*` critical paths).
- Dashboard data correctness (`DSH-01`, `DSH-05`).
- Core role restrictions across management and status actions.

### Execution Goal
- Validate that core business transactions are reliable and secure.

### Exit Criteria
- 100% pass on all `P0` cases.
- No open Sev-1 defects.
- No unauthorized-access defect unresolved.

## Wave 2: High Priority (`P1`)

### Scope
- Management portal workflows.
- Draft resilience and multi-tab conflict behavior.
- Document upload/download/delete robustness and visibility.
- Clarification and status lifecycle edge conditions.

### Execution Goal
- Validate operational workflows and high-impact edge cases.

### Exit Criteria
- >= 95% pass on selected `P1` cases.
- All Sev-1/Sev-2 defects fixed or release-blocked.
- Data consistency checks pass for register/history/dashboard linkage.

## Wave 3: Medium Priority (`P2` + remaining `P1`)

### Scope
- Case management transition hardening.
- Reporting accuracy under filter and volume conditions.
- Static/help/docs/contact coverage.

### Execution Goal
- Ensure broad regression confidence and non-critical module quality.

### Exit Criteria
- No unresolved Sev-1/Sev-2 defects in scoped modules.
- Remaining Sev-3 defects documented with mitigation.

## Wave 4: Full Regression and Release Validation

### Scope
- Re-run `@release-regression` tags from `QA_TEST_MATRIX.md`.
- API contract sanity for critical endpoints.
- Smoke checks post-fix for any defects resolved during Waves 1-3.

### Execution Goal
- Confirm no regressions were introduced by fixes and late merges.

### Exit Criteria
- 100% pass on all release-gate scenarios.
- Defect leakage trend acceptable to QA + engineering leads.
- Final sign-off artifact approved.

## Severity and Triage Policy

| Severity | Definition | Release Impact |
|---|---|---|
| Sev-1 | Data loss, security breach, total blocker on critical flow | Immediate release stop |
| Sev-2 | Major feature broken with no acceptable workaround | Release blocked until fixed or explicitly waived |
| Sev-3 | Partial feature issue with workaround | Can ship with mitigation and approval |
| Sev-4 | Cosmetic/minor usability issue | Can defer to backlog |

## Daily Execution Cadence

- Start of day: review blockers and environment health.
- Midday: complete triage loop and verify fixed defects.
- End of day: publish wave progress, pass rate, and defect summary.

## Entry Gate (Before Wave 1)

- Stable deployment for frontend and backend.
- Seed datasets loaded per `QA_ENV_DATA_PLAN.md`.
- Required role accounts confirmed active.
- Test matrix freeze for the cycle.

## Final Release Gate (After Wave 4)

- All release-critical tests passed.
- No open Sev-1/Sev-2.
- Signed residual-risk statement for deferred defects.
