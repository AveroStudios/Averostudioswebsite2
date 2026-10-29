# Avero Studios website
Flat project: no folders, no build step. Upload every file to GitHub, then connect to Cloudflare Pages
(Framework preset: None, Build command: empty, Build output directory: `/`).
`_worker.js` handles the quote form. Add these secrets in Cloudflare Pages > Settings > Variables and Secrets:
RESEND_API_KEY, QUOTE_TO_EMAIL (daniel@averostudios.co.za), QUOTE_FROM_EMAIL (e.g. Avero Studios <quotes@averostudios.co.za>), then redeploy and send a test enquiry.
