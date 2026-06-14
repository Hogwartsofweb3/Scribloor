# Solscribe Deployment Runbook

Follow these steps to deploy Solscribe to production.

## 1. Neon Postgres Setup
1. Create a project in [Neon](https://neon.tech).
2. Grab the connection strings.
   - Use the **Pooled** connection string for your `DATABASE_URL` (this ensures Next.js edge functions and serverless routes don't exhaust connections).
   - Use the **Unpooled** connection string for `DATABASE_URL_UNPOOLED` (used strictly for Drizzle migrations).
3. Run migrations locally to initialize the DB: `pnpm --filter solscribe-db db:push` (ensure `.env.local` has your unpooled URL).

## 2. Upstash Setup
1. **Redis**: Create a Redis database in [Upstash](https://upstash.com). Enable TLS. Copy the REST URL and Token to `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

## 3. Helius Webhook Configuration
1. Go to your [Helius Dashboard](https://dev.helius.xyz/).
2. Get your `HELIUS_API_KEY`.
3. Create a new Webhook:
   - **Type**: Enhanced Webhook
   - **Network**: Mainnet (or Devnet if testing)
   - **Webhook URL**: `https://yourdomain.com/api/webhooks/helius`
   - **Transaction Types**: `TRANSFER`
4. Define a secure, random string for your `HELIUS_WEBHOOK_SECRET` and enter it in Helius under the Auth header (e.g. `Authorization: Bearer <your-secret>`).

## 4. Privy Domain Verification
1. In the [Privy Dashboard](https://dashboard.privy.io), go to your App Settings > Domains.
2. Add `yourdomain.com`.
3. Configure custom auth URLs if you are using custom domains for emails.

## 5. Resend Email Deliverability Setup

> **Required before sending any transactional emails.** Without these records, a large fraction of
> your emails will land in spam.

### Step 1 — Add your sending domain in Resend
1. Log in to [resend.com](https://resend.com).
2. Go to **Domains → Add Domain**.
3. Enter your sending domain — we recommend a subdomain: `mail.yourdomain.com`.
4. Resend will generate three TXT records for you. Copy each one.

### Step 2 — Add DNS records at your registrar (Cloudflare, Namecheap, etc.)

Add **all three** of the following record types. Exact values are provided by Resend in their UI.

| Type  | Host / Name             | Value                                            | Purpose           |
|-------|-------------------------|--------------------------------------------------|-------------------|
| TXT   | `mail` (or subdomain)   | `v=spf1 include:amazonses.com ~all`             | SPF — authorize SES to send on your behalf |
| TXT   | `resend._domainkey.mail`| (DKIM public key provided by Resend)            | DKIM — cryptographic signature |
| TXT   | `_dmarc.mail`           | `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com` | DMARC — policy on failures |

> **Note:** DNS propagation can take up to 48 hours. Resend shows a ✓ once records are verified.

### Step 3 — Verify in Resend and grab API key
1. After adding DNS records, click **Verify** in Resend's Domains panel.
2. Once verified (status: **Active**), go to **API Keys → Create API Key**.
3. Scope it to `Sending access` for `mail.yourdomain.com` only.
4. Copy the key and set it as `RESEND_API_KEY` in your Vercel Environment Variables.

### Step 4 — Register the bounce/complaint webhook
Resend sends bounce, complaint, and delivery events to a webhook so Solscribe can suppress future
sends to problematic addresses and avoid being flagged as a spam source.

1. In Resend, go to **Webhooks → Add Endpoint**.
2. Enter: `https://yourdomain.com/api/webhooks/resend`
3. Select the following event types:
   - `email.bounced`
   - `email.complained`
   - `email.delivery_delayed`
4. Copy the **Signing Secret** (shown once). Set it as `RESEND_WEBHOOK_SECRET` in Vercel.

### Step 5 — Update your environment variables
Add to `.env.local` and Vercel:
```
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
EMAIL_FROM=Solscribe <noreply@mail.yourdomain.com>
```

## 6. Sentry Setup
1. Create a project in [Sentry](https://sentry.io).
2. Grab the `SENTRY_DSN` and set it in Vercel.
3. Grab the `SENTRY_AUTH_TOKEN` (from org settings) to allow source map uploads during build.

## 7. Vercel Deployment
1. Import the GitHub repository into Vercel.
2. The `vercel.json` file is already configured. Vercel will auto-detect Next.js and the Turborepo monorepo.
3. Paste all variables from `.env.production.example` into the Vercel Environment Variables UI.
4. Add your custom domain.
5. Deploy!

## 8. Post-Deployment Smoke Test
Once the Vercel build succeeds, run through this 8-point checklist:

- [ ] 1. Go to `https://yourdomain.com/api/health` and verify `status: ok` (checks DB, Redis, and Solana RPC).
- [ ] 2. Log in using Privy (both email and a fresh external wallet).
- [ ] 3. Create a publication in the Dashboard.
- [ ] 4. Draft a test post and publish it.
- [ ] 5. Navigate to the post via the public URL.
- [ ] 6. Copy the publication URL, load it in an incognito window.
- [ ] 7. Click **Subscribe**, connect a wallet, and complete the Solana transaction.
- [ ] 8. Wait 10-15 seconds. Ensure the webhook activates the subscription and you receive the Welcome Email.
