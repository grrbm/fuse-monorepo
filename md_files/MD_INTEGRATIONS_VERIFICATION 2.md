# MD Integrations Verification Guide

This guide verifies sandbox/production switching, patient sync, case creation, and message/file flows.

## 1) Environment Setup

Add to `.env.local` (backend):

```bash
MD_INTEGRATIONS_ENV=sandbox # or production
MD_INTEGRATIONS_SCOPE=*
MD_INTEGRATIONS_CLIENT_ID=...
MD_INTEGRATIONS_CLIENT_SECRET=...
MD_INTEGRATIONS_SANDBOX_CLIENT_ID=...
MD_INTEGRATIONS_SANDBOX_CLIENT_SECRET=...
MD_INTEGRATIONS_BASE_URL=
MD_INTEGRATIONS_OFFERING_ID=
MD_INTEGRATIONS_SANDBOX_OFFERING_ID=
# Webhooks
MD_INTEGRATIONS_WEBHOOK_SECRET= # required in prod; if empty, signature check is skipped (dev)
MD_INTEGRATIONS_WEBHOOK_SIGNATURE_HEADER=x-md-signature # optional override
API_PUBLIC_URL=https://api.yourdomain.com # for docs and production URL composition
```

Restart API.

## 2) Checkout and Case Creation

Flow:

- Complete questionnaire and checkout.
- Payment is authorized (manual capture).
- Frontend calls `POST /md/cases` with `orderId`.
- Backend ensures MD patient, then creates case via `/partner/cases`.

Verify:

1. `payment_intent.created` appears in Stripe dashboard (manual capture).
2. Backend logs show `MD case created` and `order.mdCaseId` populated.
3. In sandbox, confirm case in MD portal.

## 3) Webhooks

Configure MD Integrations to call our webhook:

- URL paths:
  - Local: `http://localhost:3001/md/webhooks`
  - Ngrok (dev alt): `https://foxhound-bursting-kodiak.ngrok-free.app/md/webhooks`
  - Production: `${API_PUBLIC_URL}/md/webhooks`

- Signature verification:
  - Header: `x-md-signature` (or `MD_INTEGRATIONS_WEBHOOK_SIGNATURE_HEADER`)
  - Value: hex HMAC SHA256 of the raw JSON request body using `MD_INTEGRATIONS_WEBHOOK_SECRET`
  - If `MD_INTEGRATIONS_WEBHOOK_SECRET` is unset, signature verification is skipped (dev only)

- What you’ll see in logs:
  - `[MD-WH] reqId=... received { event_type, case_id, patient_id, signature_valid }`
  - `[MD-WH] 🩺 offering_submitted start ...` then `[MD-WH] ✅ order approved ...` when applicable
  - `[MD-WH] 🔍 unhandled event type: ...` for events without handlers
  - Errors include event_type/ids and stack trace

### 3.1 Test via cURL

General form (replace placeholders and compute signature over EXACT body):

```bash
BODY='{"event_type":"offering_submitted","case_id":"<CASE_ID>","timestamp":1712345678,"offerings":[]}'
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$MD_INTEGRATIONS_WEBHOOK_SECRET" -binary | xxd -p -c 256)
curl -X POST ${API_PUBLIC_URL}/md/webhooks \
  -H 'Content-Type: application/json' \
  -H "x-md-signature: $SIG" \
  -d "$BODY"
```

Local example:

```bash
BODY='{"event_type":"offering_submitted","case_id":"<CASE_ID>","timestamp":1712345678,"offerings":[]}'
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$MD_INTEGRATIONS_WEBHOOK_SECRET" -binary | xxd -p -c 256)
curl -X POST http://localhost:3001/md/webhooks \
  -H 'Content-Type: application/json' \
  -H "x-md-signature: $SIG" \
  -d "$BODY"
```

Ngrok example:

```bash
BODY='{"event_type":"offering_submitted","case_id":"<CASE_ID>","timestamp":1712345678,"offerings":[]}'
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$MD_INTEGRATIONS_WEBHOOK_SECRET" -binary | xxd -p -c 256)
curl -X POST https://foxhound-bursting-kodiak.ngrok-free.app/md/webhooks \
  -H 'Content-Type: application/json' \
  -H "x-md-signature: $SIG" \
  -d "$BODY"
```

## 4) Messaging and Files (optional)

- `GET /messages`, `POST /messages` for clinician chat.
- `POST /md-files` to upload, then `GET /md-files/:fileId`.

## 5) Troubleshooting

- Missing `mdPatientId`: ensure `/md/cases` endpoint can sync patient; check envs.
- No offering: set `MD_INTEGRATIONS_OFFERING_ID` or sandbox equivalent.
- 401 from MD: confirm client id/secret and scope.
- 401 from webhook: invalid signature – ensure signature is computed over the exact raw JSON body and header name matches `MD_INTEGRATIONS_WEBHOOK_SIGNATURE_HEADER`.
