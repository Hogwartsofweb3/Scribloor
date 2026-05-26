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

## 5. Resend Domain Verification
1. In [Resend](https://resend.com), go to Domains.
2. Add your sending domain (e.g., `mail.yourdomain.com`).
3. Add the provided DNS records to your registrar.
4. Set `EMAIL_FROM` to use this verified domain.

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
