const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));

    const base = process.env.BASE_URL || 'http://localhost:5199';
    await page.goto(base, { waitUntil: 'networkidle', timeout: 40000 });
    await page.waitForTimeout(1200);

    const results = [];
    const record = (name, ok, detail = '') => results.push({ name, ok, detail });
    const screenshots = path.resolve(process.cwd(), 'screenshots');
    fs.mkdirSync(screenshots, { recursive: true });

    // 1) No SplashCursor (Aurora+Particles+GradientWaves = 3 canvas)
    const splashRef = await page.evaluate(() => {
      const cls = [...document.querySelectorAll('*')].filter(
        (el) => (el.className && String(el.className).toLowerCase().includes('splash')) || (el.id && String(el.id).toLowerCase().includes('splash'))
      );
      return cls.length;
    });
    const canvasCount = await page.$$eval('canvas', (c) => c.length);
    record('1. No SplashCursor', splashRef === 0 && canvasCount === 3, `splashRef=${splashRef} canvas=${canvasCount}`);

    // 2) BorderGlow cards
    const glowCount = await page.locator('.border-glow-card').count();
    record('2. BorderGlow cards', glowCount >= 3, `count=${glowCount}`);

    // 3) TiltCard: parent preserve-3d + transform berubah dari identity saat hover
    const card = page.locator('.border-glow-card').first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const cb = await card.boundingBox();
    const parentStyle = await page.evaluate(() => {
      const el = document.querySelector('.border-glow-card').parentElement;
      const cs = getComputedStyle(el);
      return { ts: cs.transformStyle };
    });
    await page.mouse.move(cb.x + cb.width * 0.8, cb.y + cb.height * 0.2);
    await page.waitForTimeout(700);
    const tiltAfter = await page.evaluate(() => {
      const el = document.querySelector('.border-glow-card').parentElement;
      const t = getComputedStyle(el).transform;
      const identity = /^matrix\(1, 0, 0, 1, 0, 0\)$|^matrix3d\(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1\)$/.test(t);
      return { t: t.slice(0, 70), changed: t !== 'none' && !identity };
    });
    record('3. TiltCard 3D bekerja', parentStyle.ts === 'preserve-3d' && tiltAfter.changed, `ts=${parentStyle.ts} tr=${tiltAfter.t}`);

    // 4) BorderGlow: edge-proximity naik saat hover
    const proxBefore = await page.evaluate(() => {
      const c = document.querySelector('.border-glow-card');
      return c ? parseFloat(getComputedStyle(c).getPropertyValue('--edge-proximity')) : -1;
    });
    await page.mouse.move(cb.x + cb.width / 2, cb.y + 3);
    await page.waitForTimeout(120);
    const proxAfter = await page.evaluate(() => {
      const c = document.querySelector('.border-glow-card');
      return c ? parseFloat(getComputedStyle(c).getPropertyValue('--edge-proximity')) : -1;
    });
    record('4. edge-proximity naik', proxAfter > proxBefore && proxAfter > 40, `${proxBefore} -> ${proxAfter}`);

    // 5) Edge-light opacity (perlu waktu transisi 0.75s)
    await page.waitForTimeout(900);
    const edge = await page.evaluate(() => {
      const el = document.querySelector('.border-glow-card .edge-light');
      return el ? parseFloat(getComputedStyle(el).opacity) : -1;
    });
    record('5. Edge-light menyala', edge > 0.2, `opacity=${edge}`);

    // 6) Screenshot glow
    await page.mouse.move(cb.x + cb.width / 2, cb.y + 5);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshots, 'cards-hover.png'), clip: { x: cb.x - 30, y: cb.y - 60, width: cb.width + 60, height: cb.height + 120 } });

    // 7) Hero gradual blur
    const gf = await page.evaluate(() => {
      const sec = [...document.querySelectorAll('section')].find((s) => s.className.includes('bg-slate-900'));
      const blur = sec && sec.querySelector('div[aria-hidden]');
      if (!blur) return null;
      const cs = getComputedStyle(blur);
      return { backdrop: cs.backdropFilter, mask: cs.maskImage || cs.webkitMaskImage };
    });
    record('7. Hero gradual blur', !!(gf && /blur/.test(gf.backdrop) && /gradient/.test(gf.mask)), JSON.stringify(gf));

    // 8) Footer seamless
    const foot = await page.evaluate(() => {
      const f = document.querySelector('footer');
      if (!f) return null;
      const cs = getComputedStyle(f);
      return { bt: cs.borderTopWidth, bg: cs.backgroundImage };
    });
    record('8. Footer seamless', !!(foot && foot.bt === '0px' && /gradient/.test(foot.bg)), JSON.stringify(foot));

    await page.screenshot({ path: path.join(screenshots, 'footer.png') });

    // 9) konsol bersih
    record('9. Tanpa console/page error', errors.length === 0, errors.slice(0, 5).join(' | '));

    console.log('\n===== HASIL VERIFIKASI =====');
    let okCount = 0;
    for (const r of results) {
      console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  -> ' + r.detail : ''}`);
      if (r.ok) okCount++;
    }
    console.log(`\nTotal: ${okCount}/${results.length} PASS`);
    await browser.close();
    process.exit(okCount === results.length ? 0 : 1);
  } catch (e) {
    console.error('ERROR:', e.message);
    if (browser) await browser.close();
    process.exit(1);
  }
})();