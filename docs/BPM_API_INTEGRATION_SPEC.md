# BPM API Integration Spec (Contracts & Correspondences)

Defines the minimum payload contracts for BPM-triggered APIs in SGC Digital.

## Scope

This spec covers these integration events:

1. Contracts - Stage Update API (all stages)
2. Contracts - Update Contract API (number/start/end/value generation)
3. Contracts - Correction Request API
4. Correspondences - Stage Update API (all stages)
5. Correspondences - Correction Request API

## Cross-Cutting API Standards

### Transport and Authentication

- Protocol: HTTPS only
- Content type: `application/json`
- Authentication: `Authorization: Bearer <token>` (service token/JWT)
- Optional source tracking header: `X-Source-System: BPM`

### Idempotency and Tracing

- `event_id` is required for all requests and must be unique per BPM event.
- Server should reject duplicate `event_id` as no-op and return success with existing state.
- `correlation_id` should be passed for traceability across BPM and SGC logs.

### Time and Format Rules

- Timestamps: ISO 8601 in UTC (`YYYY-MM-DDTHH:mm:ss.SSSZ`)
- Dates: `YYYY-MM-DD`
- Currency amounts: decimal number with up to 2 fraction digits
- All identifiers are case-sensitive strings unless noted

### Common Request Envelope

All APIs should accept this shared envelope:

```json
{
  "event_id": "uuid",
  "correlation_id": "uuid-or-trace-id",
  "event_time": "2026-04-08T09:30:00.000Z",
  "source_system": "BPM",
  "actor": {
    "user_id": "bpm-user-id",
    "user_name": "BPM User",
    "role": "PROCESS_ENGINE"
  },
  "payload": {}
}
```

### Standard Success Response

```json
{
  "success": true,
  "message": "Processed successfully",
  "data": {
    "module": "contracts",
    "entity_id": "12345",
    "event_id": "uuid",
    "processed_at": "2026-04-08T09:30:01.234Z"
  }
}
```

### Standard Error Response

```json
{
  "success": false,
  "error": "Validation failed",
  "message": "stage_code is required",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "payload.stage_code",
      "issue": "required"
    }
  ],
  "event_id": "uuid"
}
```

## 1) Contracts - Stage Update API

Used when BPM moves a Contract through any stage.

### Endpoint

- Method: `POST`
- Path: `/api/integrations/bpm/contracts/stage-update`

### Request Properties (`payload`)

- `contract_id` (string, required): SGC contract primary identifier
- `contract_reference` (string, optional): external/business reference
- `stage_code` (string, required): machine-readable stage key from BPM
- `stage_name` (string, required): display name of stage
- `previous_stage_code` (string, optional)
- `previous_stage_name` (string, optional)
- `stage_status` (string, optional): e.g. `IN_PROGRESS`, `COMPLETED`, `REJECTED`
- `effective_at` (string, required): stage effective timestamp (ISO datetime)
- `remarks` (string, optional): audit comments from BPM
- `attachments` (array, optional): supporting files
  - `name` (string, required)
  - `url` (string, required)
  - `mime_type` (string, optional)

## 2) Contracts - Update Contract API

Used when BPM generates contract number, start date, end date, and value.

### Endpoint

- Method: `POST`
- Path: `/api/integrations/bpm/contracts/update-contract`

### Request Properties (`payload`)

- `contract_id` (string, required)
- `contract_number` (string, required)
- `contract_start_date` (string, required): `YYYY-MM-DD`
- `contract_end_date` (string, required): `YYYY-MM-DD`
- `contract_value` (number, required): total contract amount
- `currency_code` (string, required): ISO 4217 (example: `SGD`, `USD`)
- `value_breakdown` (object, optional):
  - `base_value` (number, optional)
  - `tax_value` (number, optional)
  - `other_charges` (number, optional)
- `awarded_vendor_id` (string, optional)
- `awarded_vendor_name` (string, optional)
- `effective_at` (string, required): update effective timestamp
- `remarks` (string, optional)

### Additional Validation

- `contract_end_date` must be greater than or equal to `contract_start_date`
- `contract_value` must be greater than or equal to 0

## 3) Contracts - Correction Request API

Used when BPM requests correction for a Contract item.

### Endpoint

- Method: `POST`
- Path: `/api/integrations/bpm/contracts/correction-request`

### Request Properties (`payload`)

- `contract_id` (string, required)
- `correction_request_id` (string, required): unique correction identifier in BPM
- `reason_code` (string, required): machine-readable reason
- `reason_description` (string, required): human-readable explanation
- `requested_fields` (array of string, required): fields needing correction
- `due_date` (string, optional): `YYYY-MM-DD`
- `priority` (string, optional): `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- `requested_by` (object, optional):
  - `user_id` (string, optional)
  - `user_name` (string, optional)
  - `department` (string, optional)
- `effective_at` (string, required)
- `remarks` (string, optional)

## 4) Correspondences - Stage Update API

Used when BPM moves a Correspondence through any stage.

### Endpoint

- Method: `POST`
- Path: `/api/integrations/bpm/correspondences/stage-update`

### Request Properties (`payload`)

- `correspondence_id` (string, required): SGC correspondence primary identifier
- `correspondence_reference` (string, optional)
- `stage_code` (string, required)
- `stage_name` (string, required)
- `previous_stage_code` (string, optional)
- `previous_stage_name` (string, optional)
- `stage_status` (string, optional)
- `effective_at` (string, required)
- `remarks` (string, optional)
- `attachments` (array, optional):
  - `name` (string, required)
  - `url` (string, required)
  - `mime_type` (string, optional)

## 5) Correspondences - Correction Request API

Used when BPM requests correction for a Correspondence item.

### Endpoint

- Method: `POST`
- Path: `/api/integrations/bpm/correspondences/correction-request`

### Request Properties (`payload`)

- `correspondence_id` (string, required)
- `correction_request_id` (string, required)
- `reason_code` (string, required)
- `reason_description` (string, required)
- `requested_fields` (array of string, required)
- `due_date` (string, optional): `YYYY-MM-DD`
- `priority` (string, optional): `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- `requested_by` (object, optional):
  - `user_id` (string, optional)
  - `user_name` (string, optional)
  - `department` (string, optional)
- `effective_at` (string, required)
- `remarks` (string, optional)

## HTTP Status Mapping

- `200 OK`: event accepted and applied (or duplicate safely ignored)
- `400 Bad Request`: payload format/validation issue
- `401 Unauthorized`: missing/invalid token
- `403 Forbidden`: token valid but not allowed for integration scope
- `404 Not Found`: target contract/correspondence not found
- `409 Conflict`: stage transition conflict or invalid current state
- `422 Unprocessable Entity`: business rule failure
- `500 Internal Server Error`: unexpected processing failure

## Audit and Persistence Expectations

- Persist raw request envelope for audit (`event_id`, `correlation_id`, payload snapshot).
- Record integration status: `RECEIVED`, `PROCESSED`, `FAILED`, `IGNORED_DUPLICATE`.
- Capture error reason/code for replay and support triage.

## Open Items to Confirm

- Final endpoint naming (current paths are proposed integration endpoints).
- Canonical stage code dictionary for Contracts and Correspondences.
- Whether attachments are URLs only or also need metadata/hash.
- Correction SLA defaults when `due_date` is not provided.
