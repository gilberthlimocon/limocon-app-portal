# LIMOCON TECHNOLOGIES App Portal

Static app portal page for LIMOCON TECHNOLOGIES.

Target domain:

- https://app.limocontechnologies.com

## Files

- `index.html` - portal page content and structure
- `ledgerloop-privacy.html` - LT Ledger Loop app-specific privacy policy
- `ledgerloop-terms.html` - LT Ledger Loop app-specific terms and conditions
- `lt-wallet/` - LT Wallet app-specific marketing page
- `lt-wallet-privacy/` - LT Wallet app-specific privacy policy
- `lt-google-review-booster/` - LT Google Review Booster legal hub
- `lt-google-review-booster/privacy/` - LT Google Review Booster privacy policy
- `lt-google-review-booster/terms/` - LT Google Review Booster terms of service
- `lt-google-review-booster/account-deletion/` - LT Google Review Booster account deletion instructions
- `styles.css` - layout, colors, and responsive behavior
- `assets/` - LIMOCON TECHNOLOGIES logo assets
- `wrangler.jsonc` - Cloudflare Workers static asset deployment config

## App-specific legal URLs

- `https://app.limocontechnologies.com/ledgerloop-privacy/`
- `https://app.limocontechnologies.com/ledgerloop-terms/`
- `https://app.limocontechnologies.com/lt-wallet/`
- `https://app.limocontechnologies.com/lt-wallet-privacy/`
- `https://app.limocontechnologies.com/lt-google-review-booster/`
- `https://app.limocontechnologies.com/lt-google-review-booster/privacy/`
- `https://app.limocontechnologies.com/lt-google-review-booster/terms/`
- `https://app.limocontechnologies.com/lt-google-review-booster/account-deletion/`

## Deployment

This repository is intended to connect to Cloudflare Workers & Pages through GitHub.

Recommended Cloudflare settings:

- Git repository: `gilberthlimocon/limocon-app-portal`
- Production branch: `main`
- Build command: none
- Deploy command: `npx wrangler deploy`
- Static asset directory: repository root, configured in `wrangler.jsonc`

## Brand

LIMOCON TECHNOLOGIES tagline:

`Building Smart Digital Solutions for the Future`
