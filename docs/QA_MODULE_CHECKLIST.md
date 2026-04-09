# QA Module Execution Checklist

Use this checklist during execution cycles. Mark each box after evidence is captured (screenshots, API logs, DB proof where needed).

## Authentication and Access Control

- [ ] AUTH-01 Register valid applicant
- [ ] AUTH-02 Login valid applicant
- [ ] AUTH-03 Admin login path
- [ ] AUTH-04 Invalid credential rejection
- [ ] AUTH-05 Non-admin blocked from `/management/*`
- [ ] AUTH-06 Non-admin blocked on admin API endpoints
- [ ] AUTH-07 Token tamper/expiry negative checks
- [ ] AUTH-08 Logout session cleanup regression

## Correspondence

- [ ] COR-01 Create draft
- [ ] COR-02 Resume and update draft
- [ ] COR-03 Submit valid correspondence
- [ ] COR-04 Clarification response lifecycle
- [ ] COR-05 Required field validation errors
- [ ] COR-06 Double-submit prevention
- [ ] COR-07 Register/history consistency validation
- [ ] COR-08 Search/filter/pagination regression

## Contracts

- [ ] CON-01 Dynamic checklist loads by classification
- [ ] CON-02 Submit with complete required docs
- [ ] CON-03 Clarification response with document updates
- [ ] CON-04 Missing required doc blocked
- [ ] CON-05 Invalid classification/checklist payload rejection
- [ ] CON-06 Non-admin status update denied
- [ ] CON-07 Draft-document relink integrity
- [ ] CON-08 Autosave and submit race regression

## Draft Management

- [ ] DRF-01 Draft creation by type
- [ ] DRF-02 Draft update persistence
- [ ] DRF-03 Invalid draft ID handling
- [ ] DRF-04 Cross-user draft access denied
- [ ] DRF-05 Deleted draft resume handling
- [ ] DRF-06 Multi-tab collision behavior

## Document Handling

- [ ] DOC-01 Valid upload set
- [ ] DOC-02 Download existing document
- [ ] DOC-03 Delete document ownership path
- [ ] DOC-04 Invalid extension/size rejection
- [ ] DOC-05 Unowned document access blocked
- [ ] DOC-06 Path traversal hardening
- [ ] DOC-07 Missing-disk-file robustness
- [ ] DOC-08 Clarification visibility regression

## Dashboard

- [ ] DSH-01 Submission list and summary correctness
- [ ] DSH-02 Search/filter/pagination correctness
- [ ] DSH-03 Detail dialog content validity
- [ ] DSH-04 Empty/partial data handling
- [ ] DSH-05 Cross-module metric reconciliation
- [ ] DSH-06 Filter + pagination reset regression

## Management Portal

- [ ] MGT-01 Management list pages load and paginate
- [ ] MGT-02 User/MDA create-update lifecycle
- [ ] MGT-03 Staff request approval/rejection lifecycle
- [ ] MGT-04 Unauthorized management mutation blocked
- [ ] MGT-05 Invalid payload rejection path
- [ ] MGT-06 Register/history sync for admin actions
- [ ] MGT-07 Bulk settings persistence regression

## Case Management/BPM

- [ ] BPM-01 Intake to queue assignment flow
- [ ] BPM-02 Valid stage transitions
- [ ] BPM-03 Illegal transition blocked
- [ ] BPM-04 Role-restricted action blocked
- [ ] BPM-05 Concurrent update handling
- [ ] BPM-06 Cross-module status parity regression

## Reporting and Analytics

- [ ] RPT-01 Summary/status/trends widgets
- [ ] RPT-02 Filter combinations and recalculation
- [ ] RPT-03 Empty-range safety behavior
- [ ] RPT-04 Metric reconciliation with source data
- [ ] RPT-05 High-volume performance smoke
- [ ] RPT-06 Public vs management KPI consistency

## Static and Support Pages

- [ ] SUP-01 Help/docs/contact route rendering
- [ ] SUP-02 Responsive behavior at key breakpoints
- [ ] SUP-03 Broken link/anchor handling
- [ ] SUP-04 Static content regression/hydration sanity
