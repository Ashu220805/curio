# CURIO ₹1 Razorpay + Supabase setup

The two Edge Function folders now contain real `index.ts` handlers:

- `create-academy-checkout/index.ts` creates a Razorpay Payment Link for ₹1 and returns the provider's secure checkout URL.
- `payment-webhook/index.ts` verifies the Razorpay webhook signature, records the event idempotently and activates the Academy entitlement only after a valid paid event.

## 1. Run the database schema

Open Supabase → SQL Editor and run `supabase/schema.sql`.

## 2. Configure secrets

From the project root:

```bash
supabase secrets set APP_URL=https://your-domain.com
supabase secrets set RAZORPAY_KEY_ID=rzp_live_or_test_key_id
supabase secrets set RAZORPAY_KEY_SECRET=your_razorpay_key_secret
supabase secrets set RAZORPAY_WEBHOOK_SECRET=a_long_random_webhook_secret
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are provided to deployed Supabase Edge Functions by the platform. Do not put the service-role key in Vite `.env` or browser code.

For local testing use Razorpay test keys and an HTTPS tunnel if Razorpay must reach your local webhook.

## 3. Deploy

```bash
supabase functions deploy create-academy-checkout
supabase functions deploy payment-webhook
```

## 4. Razorpay dashboard

Create a webhook pointing to:

`https://YOUR_PROJECT_REF.supabase.co/functions/v1/payment-webhook`

Subscribe to `payment_link.paid` and use the exact same value as `RAZORPAY_WEBHOOK_SECRET`.

## 5. Test

1. Sign in to CURIO.
2. Open `/academy/checkout`.
3. Click the ₹1 payment button.
4. Complete a Razorpay test payment.
5. Confirm the webhook is received.
6. Confirm `academy_entitlements.access_status` becomes `active`.
7. Reload the Academy. Access should unlock.

Never unlock paid access from the browser callback URL. The webhook is the source of truth.
