CURIO Academy PRO changes

- Academy redesigned for full-width, readable teaching layout.
- Removed the overlapping global Back button from Academy routes.
- Membership status is now informative in the dashboard profile.
- Replaced "Mark lesson complete" wording with learning checkpoints.
- PRO UI shows locked curriculum and ₹1 test offer.
- Checkout calls a Supabase Edge Function instead of granting access in the browser.
- `academy_entitlements` remains the only paid-access source.
- For inspecting all lessons locally before payment backend setup:
  VITE_ACADEMY_DEV_PREVIEW=true
  This only works when Vite is running in development mode.

Live ₹1 payment still requires a provider-specific Edge Function and signed webhook.
Use the included supabase/schema.sql and supabase/functions/README_PAYMENT_SETUP.md.
