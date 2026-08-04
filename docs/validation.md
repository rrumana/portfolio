# Validation and QA

Validation covers the generated frontend, Rust runtime, WASM build, content accuracy, browser behavior, accessibility, privacy, and release environment. A successful compile alone is not a production sign-off.

## Automated checks

Frontend:

```bash
cd frontend
npm ci
npm audit --audit-level=high
npm run check
npm run build
```

Rust and WASM source:

```bash
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --workspace
```

Container-equivalent validation targets:

```bash
docker build --file Dockerfile.staging --target backend-validator .
docker build --file Dockerfile.staging --target wasm-validator .
docker build --file Dockerfile.staging .
```

When Chrome and `wasm-pack` are available, also run:

```bash
wasm-pack test --headless --chrome wasm_game_of_life
```

## Playwright and axe

Install the locked frontend dependencies and the required browser, then run the browser suite against local output, staging, and the production candidate:

```bash
cd frontend
npm exec -- playwright install chromium
npm exec -- playwright test
PLAYWRIGHT_BASE_URL=https://staging.rcrumana.xyz npm exec -- playwright test
```

Accessibility specs must use `@axe-core/playwright` and fail on serious or critical violations. Cover at least home, projects, every project template variant, research index/detail, about, 404, theme changes, keyboard navigation, mobile navigation, PDF actions, and the WASM demonstration. If the repository has no Playwright configuration or axe-enabled specs, this gate is incomplete rather than implicitly passing.

Automated accessibility checks do not replace keyboard, zoom, reduced-motion, screen-reader landmark, and contrast review.

## Manual acceptance

- Compare names, dates, roles, numerical results, citations, PDFs, and repository links with their primary sources.
- Check light and dark themes at narrow mobile, tablet, laptop, and wide desktop viewports.
- Navigate without a mouse; confirm skip link, focus order, disclosure state, and controls.
- Confirm there is no horizontal overflow at 200% zoom.
- Confirm images have appropriate alternative text and decorative images are ignored.
- Test all internal routes, external actions, downloadable PDFs, sitemap, robots policy, 404 behavior, `/healthz`, and `/readyz`.
- Inspect the browser console and network panel for errors, unexpected third-party requests, visitor IDs, or retired API calls.
- Verify HTML and stable WASM revalidate while content-hashed Astro assets are immutable.

## Environment gates

Staging must return `noindex, nofollow` via an `X-Robots-Tag` response header, and should also disallow crawling in `robots.txt`. Do not rely on a meta tag alone for PDFs and other non-HTML assets.

```bash
curl -sSI https://staging.rcrumana.xyz/ | rg -i '^x-robots-tag:.*noindex.*nofollow'
curl -sS https://staging.rcrumana.xyz/robots.txt
```

Production must not inherit staging’s `noindex` header:

```bash
if curl -sSI https://rcrumana.xyz/ | rg -qi '^x-robots-tag:.*noindex'; then
  echo 'production is unexpectedly noindex' >&2
  exit 1
fi
```

Run the privacy checks in [security-privacy.md](security-privacy.md) before approving promotion.
