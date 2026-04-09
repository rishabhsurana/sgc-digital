# Detailed QA Test Matrix by Module

Use this matrix to execute module-by-module coverage across UI and API. Priority levels: `P0` critical, `P1` high, `P2` medium.

## 1) Authentication and Access Control

| ID | Type | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| AUTH-01 | Functional | Register a new applicant with valid details | Account created, user can log in, session initialized | P0 |
| AUTH-02 | Functional | Login with valid applicant credentials | Redirect to user area, token/session stored, `/api/auth/me` succeeds | P0 |
| AUTH-03 | Functional | Admin login via management login route | Redirect to management landing, admin-only APIs become accessible | P0 |
| AUTH-04 | Negative | Invalid password login | API returns unauthorized error, UI displays failure state | P0 |
| AUTH-05 | Security | Access `/management/*` as non-admin | Redirect/block; no sensitive data rendered | P0 |
| AUTH-06 | Security | Call admin-only endpoint with basic user token | `403` forbidden | P0 |
| AUTH-07 | Security | Token tampering and expired token replay | Request rejected with auth error | P1 |
| AUTH-08 | Regression | Logout after mixed-page navigation | Session fully cleared, protected pages blocked after logout | P1 |

## 2) Correspondence Module

| ID | Type | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| COR-01 | Functional | Create correspondence draft from UI | Draft persisted and appears in dashboard | P0 |
| COR-02 | Functional | Resume draft by ID and edit content | Changes persist and previous fields prefill correctly | P0 |
| COR-03 | Functional | Submit valid correspondence with docs | Status becomes submitted, register/history entries created | P0 |
| COR-04 | Functional | Respond to returned-for-clarification item | Response recorded, status transitions back to submitted | P0 |
| COR-05 | Negative | Submit missing required fields | Validation error shown, no final submission created | P0 |
| COR-06 | Negative | Double-submit same pending draft rapidly | Single final submission, no duplicates | P1 |
| COR-07 | Data integrity | Verify history/register consistency after submit/status update | Timeline, register row, status all match | P0 |
| COR-08 | Regression | Filter/search correspondence history in management | Correct results and accurate total counts/pagination | P1 |

## 3) Contracts Module

| ID | Type | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| CON-01 | Functional | Select classification and load checklist | Checklist reflects selected nature/category/instrument | P0 |
| CON-02 | Functional | Upload all required documents and submit | Successful submit, required-doc validation passes | P0 |
| CON-03 | Functional | Clarification response with additional docs | Response accepted and workflow state updated | P0 |
| CON-04 | Negative | Submit with missing required doc and no reason | Submission blocked with explicit error | P0 |
| CON-05 | Negative | Invalid checklist key or type mismatch in payload | API validation/business-rule rejection | P1 |
| CON-06 | Security | Attempt status update as non-admin | API denies action (`403`) | P0 |
| CON-07 | Data integrity | Confirm draft doc relink to final submission on submit | Final contract links correct document set | P0 |
| CON-08 | Regression | Autosave during form edits + final submit | No stale overwrite; latest values are persisted | P1 |

## 4) Draft Management Module

| ID | Type | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| DRF-01 | Functional | Create draft for correspondence and contract types | Draft records created under correct type namespaces | P0 |
| DRF-02 | Functional | Update existing draft repeatedly | Most recent update is retrievable and correct | P1 |
| DRF-03 | Negative | Fetch draft with invalid/missing draft ID | Proper not-found or validation error response | P1 |
| DRF-04 | Security | Access another user’s draft ID | Access denied / no data leakage | P0 |
| DRF-05 | Data integrity | Delete draft then attempt resume from UI URL | UI handles missing draft gracefully, no crash | P1 |
| DRF-06 | Regression | Multi-tab edits on same draft | Conflict outcome is deterministic and non-destructive | P1 |

## 5) Documents and File Handling Module

| ID | Type | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| DOC-01 | Functional | Upload valid file set (size/type allowed) | Files stored and metadata linked to submission context | P0 |
| DOC-02 | Functional | Download existing uploaded file | Correct file content and headers returned | P0 |
| DOC-03 | Functional | Delete owned uploaded file | File removed from disk and DB metadata deleted | P1 |
| DOC-04 | Negative | Upload oversized or unsupported extension file | Rejected with clear error message | P0 |
| DOC-05 | Security | Attempt to download/delete unowned document | Request rejected; no file disclosure | P0 |
| DOC-06 | Security | Path traversal style identifier attacks | Sanitized/rejected; no arbitrary file access | P0 |
| DOC-07 | Data integrity | Simulate missing file on disk for existing DB row | Controlled error handling, no server crash | P1 |
| DOC-08 | Regression | Clarification upload visibility flags to submitter | Visibility rules honored in dashboard/detail views | P1 |

## 6) Dashboard and Applicant Tracking Module

| ID | Type | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| DSH-01 | Functional | Load submissions list and summary stats | Counts and list entries align with backend data | P0 |
| DSH-02 | Functional | Search/filter by type/status/date | Results and pagination are accurate | P0 |
| DSH-03 | Functional | Open submission detail dialog and timeline | Full detail data shown without schema errors | P1 |
| DSH-04 | Negative | API returns partial/no data | UI shows empty/error state without breaking | P1 |
| DSH-05 | Data integrity | Compare dashboard counts to register/report totals | Variance investigated and reconciled | P0 |
| DSH-06 | Regression | Apply filter then paginate then clear filter | Pagination resets correctly and totals remain valid | P1 |

## 7) Management Portal Module

| ID | Type | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| MGT-01 | Functional | List management users/MDAs/settings/constants | Data loads with expected pagination/filter behavior | P1 |
| MGT-02 | Functional | Create/update management user and MDA records | Changes persist and are visible in subsequent reads | P1 |
| MGT-03 | Functional | Approve/reject staff request | Status changes correctly, audit/history updates | P0 |
| MGT-04 | Security | Non-admin attempts management mutations | Forbidden response and no DB changes | P0 |
| MGT-05 | Negative | Invalid update payload (missing key fields) | Validation error without partial data corruption | P1 |
| MGT-06 | Data integrity | Management status action updates register/history in sync | All linked stores reflect same final state | P0 |
| MGT-07 | Regression | Bulk settings update then refresh | Updated values persist and are reflected in UI behavior | P1 |

## 8) Case Management/BPM Module

| ID | Type | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| BPM-01 | Functional | Intake to workqueue assignment flow | Case appears in correct queue with assigned owner | P1 |
| BPM-02 | Functional | Transition through valid stage sequence | State transitions succeed and timeline records are correct | P1 |
| BPM-03 | Negative | Attempt illegal transition (skip stage/backdoor) | Action blocked with explicit error | P0 |
| BPM-04 | Security | Officer without role permission performs restricted action | Request/UI action denied | P0 |
| BPM-05 | Data integrity | Concurrent updates by two officers | Conflict handled; final state remains consistent | P1 |
| BPM-06 | Regression | Cross-module status parity (case-management vs register/dashboard) | No drift in displayed status/stage | P1 |

## 9) Reporting and Analytics Module

| ID | Type | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| RPT-01 | Functional | Load summary, status, trend, top-ministry widgets | All widgets render expected numbers | P1 |
| RPT-02 | Functional | Apply date and ministry filters | Aggregates update correctly across widgets | P1 |
| RPT-03 | Negative | Empty date range/no records | Graceful empty states with zero-safe calculations | P1 |
| RPT-04 | Data integrity | Reconcile reports with raw register data sample | Reported metrics match source dataset | P0 |
| RPT-05 | Performance | High-volume aggregate endpoint response | Meets agreed smoke threshold; no timeout | P1 |
| RPT-06 | Regression | Compare management report vs public report view | Consistent values for shared KPI definitions | P2 |

## 10) Static/Help/Docs/Contact Module

| ID | Type | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| SUP-01 | Functional | Load `/help`, `/docs`, `/contact` | Pages render fully and navigation links work | P2 |
| SUP-02 | Functional | Basic responsive checks mobile/tablet/desktop | Layout remains usable at key breakpoints | P2 |
| SUP-03 | Negative | Broken anchor/link target | User receives fallback behavior/no dead end | P2 |
| SUP-04 | Regression | Content updates do not break route rendering | No hydration/runtime errors | P2 |

## Cross-Cutting Regression Suite Tags

- `@smoke-auth`: AUTH-01/02/04/05/06
- `@smoke-submit`: COR-03, CON-02, DOC-01, DSH-01
- `@smoke-admin`: MGT-03/04, AUTH-03
- `@security-core`: AUTH-06/07, DOC-05/06, BPM-04
- `@data-integrity`: COR-07, CON-07, DSH-05, MGT-06, RPT-04
- `@release-regression`: all `P0` + selected `P1` from each module
