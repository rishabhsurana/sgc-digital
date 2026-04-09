# QA API Smoke Collection

Use this as a minimal API smoke suite for each deployment. Replace placeholders before execution.

## Variables

- `BASE_URL` (example: `http://localhost:5001`)
- `APPLICANT_TOKEN`
- `ADMIN_TOKEN`
- `CONTRACT_ID`
- `CORRESPONDENCE_ID`
- `DRAFT_TYPE` (`contracts` or `correspondence`)
- `DRAFT_ID`
- `DOCUMENT_ID`

## Health

```bash
curl -sS "$BASE_URL/api/health"
```

## Auth

```bash
curl -sS -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"qa_applicant_basic@example.com","password":"<password>"}'
```

```bash
curl -sS "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $APPLICANT_TOKEN"
```

## Contracts

```bash
curl -sS "$BASE_URL/api/contracts/stats" \
  -H "Authorization: Bearer $APPLICANT_TOKEN"
```

```bash
curl -sS "$BASE_URL/api/contracts/$CONTRACT_ID" \
  -H "Authorization: Bearer $APPLICANT_TOKEN"
```

```bash
curl -sS -X PUT "$BASE_URL/api/contracts/$CONTRACT_ID/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}'
```

## Correspondence

```bash
curl -sS "$BASE_URL/api/correspondences/stats" \
  -H "Authorization: Bearer $APPLICANT_TOKEN"
```

```bash
curl -sS -X PUT "$BASE_URL/api/correspondences/$CORRESPONDENCE_ID/respond" \
  -H "Authorization: Bearer $APPLICANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"response":"Provided requested clarification."}'
```

## Drafts

```bash
curl -sS "$BASE_URL/api/drafts/$DRAFT_TYPE/$DRAFT_ID" \
  -H "Authorization: Bearer $APPLICANT_TOKEN"
```

## Documents

```bash
curl -sS "$BASE_URL/api/documents/$DOCUMENT_ID/download" \
  -H "Authorization: Bearer $APPLICANT_TOKEN" \
  -o /tmp/qa-download.bin
```

## Dashboard and Reports

```bash
curl -sS "$BASE_URL/api/dashboard/submissions" \
  -H "Authorization: Bearer $APPLICANT_TOKEN"
```

```bash
curl -sS "$BASE_URL/api/reports/summary" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Management

```bash
curl -sS "$BASE_URL/api/management/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

```bash
curl -sS "$BASE_URL/api/staff-requests" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Registers and History

```bash
curl -sS "$BASE_URL/api/registers/summary" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

```bash
curl -sS "$BASE_URL/api/management/history/contracts" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Pass Criteria for Smoke

- No endpoint returns 5xx.
- All protected endpoints enforce role restrictions correctly.
- Response shape is parseable JSON and required keys are present.
- Critical endpoints complete within acceptable smoke threshold.
