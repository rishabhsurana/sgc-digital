# QA Module Inventory

This inventory maps feature modules across frontend and backend so test execution can be tracked module by module.

## Frontend Feature Modules (`sgc-digital`)

| Module | Primary Routes | Core Files |
|---|---|---|
| Public onboarding/auth | `/`, `/login`, `/register` | `app/page.tsx`, `app/login/page.tsx`, `app/register/page.tsx` |
| Public support/docs | `/help`, `/docs`, `/contact` | `app/help/page.tsx`, `app/docs/page.tsx`, `app/contact/page.tsx` |
| Correspondence submission | `/correspondence` | `app/correspondence/page.tsx`, `components/file-upload.tsx` |
| Contracts submission | `/contracts` | `app/contracts/page.tsx`, `components/contracts-submit-guard.tsx`, `lib/constants/taxonomy.ts` |
| Applicant dashboard | `/dashboard`, `/dashboard/corrections/[id]` | `app/dashboard/page.tsx`, `components/dashboard-submission-detail-dialog.tsx`, `lib/dashboard-api.ts` |
| Management portal | `/management/*` | `app/management/page.tsx`, `app/management/users/page.tsx`, `app/management/mda/page.tsx`, `app/management/reports/page.tsx`, `app/management/contracts-register/page.tsx`, `app/management/correspondence-register/page.tsx`, `app/management/activity/page.tsx` |
| Case management/BPM | `/case-management/*` | `app/case-management/page.tsx`, `app/case-management/correspondence/workqueue/page.tsx`, `app/case-management/contracts/workqueue/page.tsx` |
| Reporting views | `/reports`, `/management/reports` | `app/reports/page.tsx`, `app/management/reports/page.tsx` |

## Backend API Modules (`sgc-digital-backend`)

| Module | Base Path | Route Files | Key Capabilities |
|---|---|---|---|
| Health/bootstrap | `/api/health` | `src/index.ts` | API availability and server bootstrap checks |
| Authentication | `/api/auth` | `src/routes/auth.routes.ts` | Register, login, admin-login, current user |
| Correspondence | `/api/correspondences` | `src/routes/correspondence.routes.ts` | CRUD, submit, status updates, clarification response, stats |
| Contracts | `/api/contracts` | `src/routes/contract.routes.ts` | CRUD, submit, status updates, clarification response, stats |
| Drafts | `/api/drafts` | `src/routes/draft.routes.ts` | Draft CRUD by type |
| Applicant documents | `/api/documents` | `src/routes/document.routes.ts` | Upload, download, delete |
| SGC documents | `/api/sgc-documents` | `src/routes/sgc-document.routes.ts` | Upload/list/download internal docs |
| Dashboard/activity | `/api/dashboard`, `/api/activity` | `src/routes/dashboard.routes.ts`, `src/routes/activity.routes.ts` | Submission rollups and activity feeds |
| Registers/history | `/api/registers`, `/api/management/history` | `src/routes/register.routes.ts`, `src/routes/management-history.routes.ts` | Register lists/summaries and historical details |
| Reporting | `/api/reports` | `src/routes/report.routes.ts` | Summary and analytical aggregations |
| Users and MDA | `/api/users`, `/api/mdas`, `/api/management/users`, `/api/management/mda` | `src/routes/user.routes.ts`, `src/routes/mda.routes.ts`, `src/routes/management-users.routes.ts`, `src/routes/management-mda.routes.ts` | User lifecycle and ministry/department setup |
| Staff requests | `/api/staff-requests` | `src/routes/staff-request.routes.ts` | Request submission + admin approval/rejection |
| Settings/constants | `/api/settings`, `/api/constants` | `src/routes/setting.routes.ts`, `src/routes/constant.routes.ts` | Configuration and reference data |
| Transactions | `/api/transactions` | `src/routes/transaction.routes.ts` | Transaction listing and controls |

## Cross-Cutting Modules

- Auth/session state and API client behavior: `lib/auth.ts`, `lib/api-client.ts`, `lib/services/auth-service.ts`.
- Role/access middleware: `src/middlewares/auth.middleware.ts`, `src/middlewares/role.middleware.ts`.
- File upload mechanics: `components/file-upload.tsx`, `src/middlewares/upload.middleware.ts`.
- Data integrity/audit trail: register/history/transaction controller flows under `src/controllers`.
