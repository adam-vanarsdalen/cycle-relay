const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const SS_DIR = 'media/screenshots';
const VID_DIR = 'media/video';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForGeneration(page, timeout = 90000) {
  await page.waitForFunction(
    () => {
      const t = document.body.innerText;
      // Stop waiting if output appeared OR if an error banner appeared
      return !t.includes('No message generated yet') || !!document.querySelector('[class*="text-red"]');
    },
    { timeout }
  );
  await sleep(800);
}

async function loadPage(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await sleep(800);
}

async function captureScreenshots(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const results = {};

  try {
    // 1. hero.png
    process.stdout.write('  [1/10] hero.png ... ');
    await loadPage(page);
    await page.screenshot({ path: `${SS_DIR}/hero.png`, fullPage: true });
    console.log('done');
    results.hero = true;

    // 2. demo-patient-loaded.png — click Sarah M.
    process.stdout.write('  [2/10] demo-patient-loaded.png ... ');
    await page.click('button:has-text("Sarah M.")');
    await sleep(700);
    await page.screenshot({ path: `${SS_DIR}/demo-patient-loaded.png`, fullPage: true });
    console.log('done');
    results.demoPatient = true;

    // 3. generating.png — click Generate, capture loading state immediately
    process.stdout.write('  [3/10] generating.png ... ');
    await page.click('button[type="submit"]');
    await sleep(250);
    await page.screenshot({ path: `${SS_DIR}/generating.png`, fullPage: true });
    console.log('done');
    results.generating = true;

    // 4. output-full.png — wait for generation
    process.stdout.write('  [4/10] output-full.png ... ');
    await waitForGeneration(page);
    await page.screenshot({ path: `${SS_DIR}/output-full.png`, fullPage: true });
    console.log('done');
    results.outputFull = true;

    // 5. patient-message-closeup.png
    process.stdout.write('  [5/10] patient-message-closeup.png ... ');
    const patientPanel = page.locator('span:text-is("Patient Message")').locator('xpath=ancestor::div[contains(@class,"rounded-lg")][1]');
    await patientPanel.screenshot({ path: `${SS_DIR}/patient-message-closeup.png` });
    console.log('done');
    results.patientMessage = true;

    // 6. coordinator-summary-closeup.png — output section right panel viewport clip
    process.stdout.write('  [6/10] coordinator-summary-closeup.png ... ');
    // Use the right-half output section for a richer screenshot
    const summaryClip = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('span')).find(s => s.textContent.trim() === 'Coordinator Summary');
      if (!el) return null;
      const panel = el.closest('[class*="rounded-lg"]');
      if (!panel) return null;
      const r = panel.getBoundingClientRect();
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    });
    if (summaryClip && summaryClip.width > 100) {
      await page.screenshot({ path: `${SS_DIR}/coordinator-summary-closeup.png`, clip: summaryClip });
    } else {
      await page.screenshot({ path: `${SS_DIR}/coordinator-summary-closeup.png`, fullPage: false });
    }
    console.log('done');
    results.coordinatorSummary = true;

    // 7. clinical-flags.png — Michelle T. (beta negative, always flags)
    process.stdout.write('  [7/10] clinical-flags.png ... ');
    await page.click('button:has-text("Michelle T.")');
    await sleep(500);
    await page.click('button[type="submit"]');
    await waitForGeneration(page);
    // Try to screenshot the flags panel; fall back to full page if not found
    try {
      const flagsPanel = page.locator('text=Clinical Flags').locator('xpath=ancestor::div[contains(@class,"rounded-lg")][1]');
      await flagsPanel.screenshot({ path: `${SS_DIR}/clinical-flags.png` });
    } catch {
      // flags might not appear if model didn't return them — capture full output
      await page.screenshot({ path: `${SS_DIR}/clinical-flags.png`, fullPage: true });
    }
    console.log('done');
    results.clinicalFlags = true;

    // 8. audit-log.png — expand log and capture viewport area
    process.stdout.write('  [8/10] audit-log.png ... ');
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
    await sleep(600);
    await page.click('button:has-text("Audit Log")');
    await sleep(800);
    // Capture bottom area of page (audit log section) as a viewport clip
    const auditRect = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Audit Log'));
      if (!btn) return null;
      const parent = btn.closest('[class*="rounded-lg"]') || btn.parentElement.parentElement;
      const r = parent.getBoundingClientRect();
      return { x: r.left, y: r.top, width: r.width, height: Math.min(parent.scrollHeight, 500) };
    });
    if (auditRect && auditRect.width > 100) {
      await page.screenshot({ path: `${SS_DIR}/audit-log.png`, clip: auditRect });
    } else {
      await page.screenshot({ path: `${SS_DIR}/audit-log.png`, fullPage: false });
    }
    console.log('done');
    results.auditLog = true;

    // 9. ollama-toggle.png — hover Ollama pill, capture top 280px viewport (includes tooltip)
    process.stdout.write('  [9/10] ollama-toggle.png ... ');
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await sleep(400);
    await page.hover('button:has-text("Ollama")');
    await sleep(800);
    await page.screenshot({ path: `${SS_DIR}/ollama-toggle.png`, clip: { x: 0, y: 0, width: 1440, height: 280 } });
    console.log('done');
    results.ollamaToggle = true;

    // 10. mobile-view.png
    process.stdout.write('  [10/10] mobile-view.png ... ');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await sleep(600);
    await page.screenshot({ path: `${SS_DIR}/mobile-view.png`, fullPage: true });
    console.log('done');
    results.mobileView = true;

  } catch (err) {
    console.error('\nScreenshot error:', err.message);
  } finally {
    await context.close();
  }

  return results;
}

async function captureVideo(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: VID_DIR, size: { width: 1440, height: 900 } }
  });
  const page = await context.newPage();
  const videoObj = page.video();

  try {
    // Landing page — 2s pause
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await sleep(2000);

    // Click Sarah M. — 1s pause
    await page.click('button:has-text("Sarah M.")');
    await sleep(1000);

    // Scroll through form
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
    await sleep(1200);
    await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'smooth' }));
    await sleep(1200);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await sleep(700);

    // Click Generate — show loading
    await page.click('button[type="submit"]');
    await sleep(1200);

    // Wait for output
    await waitForGeneration(page);

    // Scroll through output
    await page.evaluate(() => window.scrollTo({ top: 350, behavior: 'smooth' }));
    await sleep(1500);
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'smooth' }));
    await sleep(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await sleep(600);

    // Expand audit log
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
    await sleep(800);
    await page.click('button:has-text("Audit Log")');
    await sleep(1200);

    // Ollama toggle
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await sleep(500);
    await page.hover('button:has-text("Ollama")');
    await sleep(2000);
    // Click Claude back
    await page.click('button:has-text("Claude")');
    await sleep(600);

    // Michelle T. (beta negative)
    await page.click('button:has-text("Michelle T.")');
    await sleep(700);
    await page.click('button[type="submit"]');
    await sleep(1000);
    await waitForGeneration(page);

    // Scroll to show flags
    await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
    await sleep(2500);

  } finally {
    await context.close();
    await sleep(1500); // Let video finalize
  }

  // Rename video
  try {
    const tmpPath = await videoObj.path();
    const finalPath = path.join(VID_DIR, 'demo.webm');
    fs.renameSync(tmpPath, finalPath);
    console.log(`  Video saved → ${finalPath}`);
    return true;
  } catch (err) {
    console.error('  Video rename error:', err.message);
    return false;
  }
}

async function verifyOutputs() {
  console.log('\n── Verification ──');
  const { execSync } = require('child_process');
  const files = fs.readdirSync(SS_DIR);
  let passed = 0;
  for (const f of files) {
    if (!f.endsWith('.png')) continue;
    const fp = path.join(SS_DIR, f);
    const size = fs.statSync(fp).size;
    const dims = execSync(`python3 -c "import struct,zlib; d=open('${fp}','rb').read(); w=struct.unpack('>I',d[16:20])[0]; h=struct.unpack('>I',d[20:24])[0]; print(f'{w}x{h}')"`).toString().trim();
    const ok = size > 10000;
    console.log(`  ${ok ? '✓' : '✗'} ${f} — ${(size/1024).toFixed(0)}KB ${dims}`);
    if (ok) passed++;
  }
  const vidPath = path.join(VID_DIR, 'demo.webm');
  const vidOk = fs.existsSync(vidPath);
  const vidSize = vidOk ? (fs.statSync(vidPath).size / 1024).toFixed(0) : 0;
  console.log(`  ${vidOk ? '✓' : '✗'} demo.webm — ${vidSize}KB`);
  return passed;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    console.log('\n── Screenshots (1440×900) ──');
    await captureScreenshots(browser);

    console.log('\n── Video (1440×900) ──');
    const videoOk = await captureVideo(browser);

    const screenshotCount = await verifyOutputs();

    console.log('\n── Summary ──');
    console.log(`Screenshots captured: ${screenshotCount}/10`);
    console.log(`Video captured: ${videoOk ? 'yes' : 'no'}`);
  } finally {
    await browser.close();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
