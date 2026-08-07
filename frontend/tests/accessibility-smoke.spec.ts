import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const htmlPages = [
  { path: '/', name: 'home' },
  { path: '/projects/', name: 'projects' },
  { path: '/projects/game-of-life/', name: 'Game of Life case study' },
  { path: '/projects/kubernetes-homelab/', name: 'Kubernetes case study' },
  { path: '/projects/multi-camera-reid/', name: 'ReID case study' },
  { path: '/projects/neovim-configuration/', name: 'Neovim case study' },
  { path: '/projects/random-projects/', name: 'project archive' },
  { path: '/projects/rust-password-manager/', name: 'password manager case study' },
  { path: '/projects/rust-portfolio-website/', name: 'portfolio case study' },
  { path: '/projects/rust-programming-lecture-series/', name: 'Rust lecture case study' },
  { path: '/research/', name: 'research' },
  { path: '/research/predecessor-existence-finite-game-of-life/', name: 'Game of Life paper' },
  { path: '/research/multi-camera-reidentification-and-tracking/', name: 'ReID report' },
  { path: '/about/', name: 'about' },
  { path: '/resume/', name: 'resume' },
] as const;

const primaryLinks = [
  { path: '/' },
  { path: '/projects/' },
  { path: '/research/' },
  { path: '/about/' },
] as const;

async function expectNoSeriousAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const violations = results.violations.filter(
    ({ impact }) => impact === 'critical' || impact === 'serious',
  );

  expect(
    violations,
    violations
      .map(({ id, impact, help, nodes }) => `${impact}: ${id} — ${help} (${nodes.length} nodes)`)
      .join('\n'),
  ).toEqual([]);
}

test.describe('page accessibility smoke', () => {
  for (const entry of htmlPages) {
    test(`${entry.name} has landmarks, one visible heading, no overflow, and no serious axe violations @a11y`, async ({
      page,
    }) => {
      const response = await page.goto(entry.path);

      expect(response?.ok(), `${entry.path} should return a successful response`).toBe(true);
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${entry.path} should not overflow the viewport horizontally`).toBeLessThanOrEqual(1);

      await expectNoSeriousAxeViolations(page);
    });
  }
});

test('desktop and mobile primary navigation reaches every key HTML section', async ({ page }) => {
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });

  for (const link of primaryLinks) {
    const navigationLink = navigation.locator(`a[href="${link.path}"]`);
    await expect(navigationLink).toBeVisible();
    const accessibleName =
      (await navigationLink.getAttribute('aria-label')) ?? (await navigationLink.textContent())?.trim();
    expect(accessibleName).toBeTruthy();
  }

  for (const link of primaryLinks.slice(1)) {
    await navigation.locator(`a[href="${link.path}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${link.path.replaceAll('/', '\\/')}$`));
    await expect(
      page.getByRole('navigation', { name: 'Main navigation' }).locator(`a[href="${link.path}"]`),
    ).toHaveAttribute('aria-current', 'page');
  }
});

test('theme choice persists across reloads and navigation', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('rr-theme')) localStorage.setItem('rr-theme', 'light');
  });
  await page.goto('/');

  const toggle = page.locator('[data-theme-toggle]');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');

  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('rr-theme'))).toBe('dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('portrait framing is identical on the home and about pages', async ({ page }) => {
  async function portraitPresentation(path: string) {
    await page.goto(path);
    const frame = page.locator('.portrait__frame');
    const image = frame.locator('img');
    await expect(frame).toBeVisible();

    const box = await frame.boundingBox();
    const styles = await image.evaluate((element) => {
      const computed = getComputedStyle(element);
      return { objectFit: computed.objectFit, objectPosition: computed.objectPosition };
    });

    expect(box).not.toBeNull();
    return { box: box!, styles };
  }

  const home = await portraitPresentation('/');
  const about = await portraitPresentation('/about/');

  expect(Math.abs(home.box.width - about.box.width)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(home.box.height - about.box.height)).toBeLessThanOrEqual(0.5);
  expect(home.box.width / home.box.height).toBeCloseTo(4 / 5, 2);
  expect(about.box.width / about.box.height).toBeCloseTo(4 / 5, 2);
  expect(home.styles).toEqual(about.styles);
});

test('research cards expose a named overview and PDF action', async ({ page }) => {
  await page.goto('/research/');
  const cards = page.locator('article.research-card');
  expect(await cards.count()).toBeGreaterThan(0);

  for (const card of await cards.all()) {
    const titleLink = card.getByRole('heading', { level: 3 }).getByRole('link');
    await expect(titleLink).toBeVisible();
    await expect(titleLink).toHaveAttribute('href', /^\/research\/[^/]+\/$/);
    await expect(card.locator('.research-card__authors')).not.toBeEmpty();
    await expect(card.getByRole('list', { name: 'Research topics' })).toBeVisible();
    await expect(card.getByRole('link', { name: 'Read overview' })).toHaveAttribute(
      'href',
      /^\/research\/[^/]+\/$/,
    );
    await expect(card.getByRole('link', { name: 'Download PDF' })).toHaveAttribute(
      'href',
      /^\/research\/[^/]+\.pdf$/,
    );
  }
});

test('browser-local Game of Life WASM initializes and responds', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/projects/game-of-life/');
  await expect(page.locator('#gridSizeDisplay')).toContainText('48x9');
  await expect(page.locator('#liveCellsDisplay')).not.toHaveText('Live cells: 0');
  await page.getByRole('button', { name: 'Step forward' }).click();
  await expect(page.locator('#lifeCanvas')).toBeVisible();

  expect(runtimeErrors).toEqual([]);
});

test('/resume/ resolves to an HTML page or PDF document', async ({ request }) => {
  const response = await request.get('/resume/');
  const contentType = response.headers()['content-type'] ?? '';

  expect(response.ok(), '/resume/ should resolve successfully').toBe(true);
  expect(contentType).toMatch(/^(?:text\/html|application\/pdf)(?:;|$)/);

  if (contentType.startsWith('text/html')) {
    const body = await response.text();
    expect(body).toMatch(/<main[\s>]/i);
    expect(body).toMatch(/<h1[\s>]/i);
  }
});
