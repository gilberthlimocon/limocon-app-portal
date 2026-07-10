# Limocon App Portal

Static app portal page for Limocon Technologies.

Target domain:

- https://app.limocontechnologies.com

## Files

- `index.html` - portal page content and structure
- `styles.css` - layout, colors, and responsive behavior
- `assets/` - Limocon Technologies logo assets
- `wrangler.jsonc` - Cloudflare Workers static asset deployment config

## Deployment

This repository is intended to connect to Cloudflare Workers & Pages through GitHub.

Recommended Cloudflare settings:

- Git repository: `gilberthlimocon/limocon-app-portal`
- Production branch: `main`
- Build command: none
- Deploy command: `npx wrangler deploy`
- Static asset directory: repository root, configured in `wrangler.jsonc`

## Brand

Company tagline:

`Building Smart Digital Solutions for the Future`
