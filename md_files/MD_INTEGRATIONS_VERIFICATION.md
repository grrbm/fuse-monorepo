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

Configure MD webhook to `POST /webhook/orders` with shared `APP_WEBHOOK_SECRET`. Verify signatures and that events are processed (see logs).

## 4) Messaging and Files (optional)

- `GET /messages`, `POST /messages` for clinician chat.
- `POST /md-files` to upload, then `GET /md-files/:fileId`.

## 5) Troubleshooting

- Missing `mdPatientId`: ensure `/md/cases` endpoint can sync patient; check envs.
- No offering: set `MD_INTEGRATIONS_OFFERING_ID` or sandbox equivalent.
- 401 from MD: confirm client id/secret and scope.
