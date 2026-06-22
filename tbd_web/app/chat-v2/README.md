# Chat V2 — Node routes (`/api/chat-v2`)

Implemented in this repo (Express `app` from `app/routes.js`).

## Routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/chat-v2/auth/supabase-token` | Return `{ supabase_token }` for Flutter `ChatV2SupabaseService` |
| POST | `/api/chat-v2/webhooks/new-message` | Supabase Database Webhook (messages INSERT); validates `X-Webhook-Secret` |

## Environment variables

Add to `tbd_web/.env` (see `.env.chat_v2.example` in this folder):

| Variable | Required for | Notes |
|----------|----------------|-------|
| `TBD_FLUTTER_API_KEY` | Token route | Must equal Flutter `ApiConstants.apiKey` |
| `SUPABASE_JWT_SECRET` | Token route | Supabase Dashboard → Settings → API → JWT Secret |
| `SUPABASE_URL` | Webhook fan-out | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhook fan-out | Service role; never expose to clients |
| `CHAT_V2_WEBHOOK_SECRET` | Webhook | Random string; set same in Supabase webhook headers |

## Flutter

Set `ApiConstants.chatV2NodeApiBaseUrl` in the Flutter app to the public origin that serves this Express app, ending with `/api/chat-v2/`.

After `npm install`, restart Node.
