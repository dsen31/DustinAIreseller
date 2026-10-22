# NXT Workspace

An independent technology-procurement workspace for comparing products, building quotes, and organizing purchase plans. The original checkout and database are untouched.

## Run

Node 24 and npm 11 were used for validation.

```sh
npm ci
npm run dev
```

Vite uses port 8081. Run `npm run build` for a production build; `npm run preview` serves it.

## Included

- Responsive overview with totals calculated from saved quotes and projects.
- BoBo advisor with explicitly labeled, rule-based demo guidance.
- Searchable example catalog with device, security, and networking categories.
- Transparent supplier cost, 10% service markup, and quote totals.
- Quantity validation, project assignment, saving and deleting quotes.
- Project creation and quote totals by project.
- CSV export with supplier cost, service markup, and total separated.
- Local browser persistence, mobile navigation, keyboard focus handling, and system Helvetica/Arial fonts.

This is an interactive first version. Catalog entries and prices are examples, not live distributor offers. The advisor is not connected to an AI model. Authentication, shared database storage, live inventory, payments, email delivery, business-case generation, and production backend integrations are not implemented. Data stays in the current browser and is not synchronized across devices. No secrets or original customer data are included.

## Validate

With the app running in another terminal:

```sh
npm run build
npm run test:smoke
```

Smoke tests use system Chromium at `/usr/bin/chromium`; set `CHROMIUM_PATH` if needed, and `APP_URL` to override the test URL. They check rendering, project creation, catalog filters/search, quantity validation, quote totals, persistence after reload, CSV contents, advisor guidance, deletion, mobile overflow, and browser runtime errors. Test data is isolated to a fresh browser context. Screenshots and exported CSV are written under `/tmp`.

## GitHub

Public source repository: https://github.com/dsen31/DustinAIreseller

The app is separate from the original `dsen31/nxt-ai-advisor` repository. Work in this checkout and push to its origin; do not change the original application.

## Design

NXT has its own light, product-focused visual system with an information-dense workspace layout. It does not use imagery, copy, or runtime dependencies from aCTOr Advisory.
