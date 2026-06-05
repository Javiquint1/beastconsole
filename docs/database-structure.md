# Database Structure

This MVP uses localStorage as a browser-side data store, but the code is shaped around table-like collections so it can move to a real database later.

## Collections

- `users`: login identity, password hash, role, and account status.
- `clients`: business profile and client metadata.
- `client_blocks`: enabled dashboard blocks per client.
- `google_ads_reports`: manual Google Ads report data per client.
- `email_reports`: manual email campaign report data per client.
- `ai_generations`: generated AI copy history per client.
- `payments`: payment/access status per client.

## Example `client_blocks`

```json
{
  "id": "northstar-google-ads",
  "clientId": "northstar-dental",
  "blockType": "google-ads",
  "enabled": true,
  "status": "active",
  "createdAt": "2026-06-04T00:00:00.000Z",
  "updatedAt": "2026-06-04T00:00:00.000Z"
}
```

## Implementation Files

- `lib/database-schema.ts`: collection record types.
- `lib/database-seed.ts`: seed database data.
- `lib/database.ts`: helpers that map database collections to current app models.
- `lib/storage.ts`: localStorage persistence and migration.
