# T1D API Contract

Base path: `/api`

Machine-readable contract: `docs/openapi.yaml` (also served at `GET /api/openapi.yaml`).

All JSON responses include security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-Request-Id`, etc.).

Language: send `X-T1D-Lang: ru` (or `Accept-Language`) for localized auth and workspace payloads.

## Health

### `GET /api/health`

Returns service status.

Optional query: `?verbose=1` adds `version`, `node`, and `requestId`.

## Session

### `GET /api/session`

Returns `{ authenticated: false }` or `{ authenticated: true, user: { email, fullName, role, organization } }`.

## Access

### `POST /api/access/signup`

Body: `{ email, password, fullName?, role?, organization? }`

Creates account and session cookie.

### `POST /api/access/signin`

Body: `{ email, password }`

### `POST /api/access/signout`

Clears session cookie.

### `POST /api/access/password-reset/request`

Body: `{ email }`

### `POST /api/access/password-reset/confirm`

Body: `{ token, password }`

Rate limit: 12 requests/min per IP on auth routes.

## Workspace

### `GET /api/workspace`

Requires session. Returns full workspace payload (localized when `X-T1D-Lang` is set).

### `POST /api/household/setup`

Requires session. Creates or updates household profile.

### `POST /api/household/join`

Requires session. Body: `{ inviteCode }`.

### `POST /api/preferences`

Requires session. Updates safety preferences.

### `POST /api/action`

Requires session. Body: `{ action }` where action is a safety action id.

## Dexcom

### `POST /api/dexcom/connect`

### `POST /api/dexcom/disconnect`

### `POST /api/dexcom/poll`

### `POST /api/dexcom/oauth/start`

### `POST /api/dexcom/refresh-token`

### `GET /api/dexcom/oauth/callback`

OAuth redirect handler (browser flow).

## Operations

### `GET /api/cron/dexcom-sync`

Requires `Authorization: Bearer <CRON_SECRET>` when secret is configured.

### `POST /api/feedback`

Body: `{ message, rating?, email? }`

Stores beta feedback (max 200 entries). Requires non-empty `message`.

## Error shape

```json
{ "error": "Human-readable message" }
```

Common status codes: `400`, `401`, `404`, `409`, `429`.

## Workspace payload highlights

When `needsSetup: false`, workspace includes:

- `currentState` — glucose, trend, level, responder
- `dexcomHealth` — connection reason and guidance
- `dailyGuidance` — role-based daily copy
- `householdReadiness` — readiness summary
- `contextualSummary` — tone + headline + detail
- `quickActions` — allowed safety actions for role

Localized fields are applied server-side via `localizeWorkspacePayload`.
