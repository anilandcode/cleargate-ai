# Deployment Checklist

## Required For Seeded Demo

No environment variables are required. The judge workspace remains usable on Vercel.

## Required For Live Bright Data Review

```txt
BRIGHTDATA_LIVE=1
BRIGHTDATA_API_TOKEN
BRIGHTDATA_SERP_ZONE
BRIGHTDATA_UNLOCKER_ZONE
BRIGHTDATA_COUNTRY=us
BRIGHTDATA_TIMEOUT_MS=12000
```

## Optional Scraping Browser Fallback

```txt
BRIGHTDATA_BROWSER_ENABLED=1
BRIGHTDATA_BROWSER_USERNAME
BRIGHTDATA_BROWSER_PASSWORD
BRIGHTDATA_BROWSER_MAX_PER_REVIEW=1
```

## Optional AI/ML API Extraction

```txt
AIMLAPI_ENABLED=1
AIMLAPI_API_KEY
AIMLAPI_MODEL
AIMLAPI_BASE_URL=https://api.aimlapi.com/v1
```

## Optional Slack Delivery

```txt
SLACK_WEBHOOK_URL
```

## Pre-Deploy

1. Run `node scripts/validate-all.js`.
2. Run `npm run build`.
3. Confirm `dist/index.html`, `dist/app.js`, `dist/styles.css`, and `dist/assets/` exist.
4. Confirm `.env.example` contains placeholders only.
5. Confirm no screenshots or local secret files are staged.
6. Deploy to Vercel.

## Vercel Project Settings

- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: static or other/manual
- Do not use `node local-server.js`, `npm run local`, or a start command as the Vercel build/start command.
- Keep `api/` routes as file-based serverless functions.

## Incognito Verification

1. Open `https://cleargate-ai.vercel.app/` in incognito.
2. Confirm 11 tools appear without clicks.
3. Open Otter.ai and run the Agent Room.
4. Confirm the Band room shows six agents, a handoff timeline, a recommendation, and an audit hash.
5. Run live verification.
6. Confirm live records say `LIVE`, seeded records say `SEEDED`, and cached records say `CACHED SNAPSHOT`.
7. Inspect one finding and verify URL, excerpt, timestamp, policy mapping, and SHA-256.
8. Export a memo and confirm the Band collaboration proof appears.
9. Test Slack delivery only if configured; otherwise confirm draft download.
10. Check Settings for truthful integration states.
