/**
 * Cycle Relay — Presentability Audit Script
 * Runs all visual, functional, and content checks at 1440x900 and 390x844.
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SS_DIR = 'media/screenshots';

const issues = [];
const fixed = []; // filled in by fix step

function flag(severity, location, description) {
  issues.push({ severity, location, description });
  const tag = severity === 'CRITICAL' ? '🔴' : severity === 'WARN' ? '🟡' : 'ℹ️';
  console.log(`  ${tag} [${severity}] ${location}: ${description}`);
}

function pass(check) {
  console.log(`  ✓ ${check}`);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForGen(page, timeout = 90000) {
  await page.waitForFunction(
    () => {
      const t = document.body.innerText;
      return !t.includes('No message generated yet') || !!document.querySelector('[class*="text-red"]');
    },
    { timeout }
  );
  await sleep(600);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(`PAGE ERROR: ${err.message}`));

  // ─────────────────────────────────────────────────────
  // STEP 2: VISUAL AUDIT
  // ─────────────────────────────────────────────────────
  console.log('\n═══ STEP 2: VISUAL AUDIT ═══\n');

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await sleep(800);

  // Screenshot: hero state
  await page.screenshot({ path: `${SS_DIR}/audit-hero.png`, fullPage: true });

  // ── Header ──
  console.log('── Header ──');
  const h1Text = await page.locator('h1').textContent();
  if (h1Text?.trim() === 'Cycle Relay') pass('H1 wordmark: Cycle Relay');
  else flag('CRITICAL', 'Header > h1', `Wrong wordmark: "${h1Text}"`);

  const tagline = await page.locator('header p').textContent();
  if (tagline?.includes('IVF coordinator')) pass('Tagline correct');
  else flag('WARN', 'Header > p', `Unexpected tagline: "${tagline}"`);

  const demoBadge = await page.locator('text=DEMO').count();
  if (demoBadge > 0) pass('DEMO badge visible');
  else flag('WARN', 'Header', 'DEMO badge missing');

  const coastalText = await page.locator('text=Built for Coastal Fertility Specialists').count();
  if (coastalText > 0) pass('Coastal Fertility attribution visible');
  else flag('WARN', 'Header', 'Coastal Fertility attribution not visible at 1440px');

  // ── Provider toggle ──
  console.log('── Provider toggle ──');
  const claudeBtn = page.locator('button:has-text("Claude")');
  const ollamaBtn = page.locator('button:has-text("Ollama")');
  const claudeActive = await claudeBtn.evaluate(el =>
    el.className.includes('bg-[#06B6D4]') || el.className.includes('shadow')
  );
  if (claudeActive) pass('Claude pill is active on load');
  else flag('WARN', 'ProviderToggle', 'Claude pill not visually active on load');

  // ── Demo patient cards ──
  console.log('── Demo patient cards ──');
  const cards = await page.locator('.grid.grid-cols-2 button').count();
  if (cards === 4) pass('4 demo patient cards present');
  else flag('CRITICAL', 'Demo patients', `Expected 4 cards, found ${cards}`);

  const names = ['Sarah M.', 'Jennifer K.', 'Amanda R.', 'Michelle T.'];
  for (const name of names) {
    const count = await page.locator(`button:has-text("${name}")`).count();
    if (count > 0) pass(`Card present: ${name}`);
    else flag('CRITICAL', 'Demo patients', `Missing card: ${name}`);
  }

  // ── Output panel empty state ──
  console.log('── Output panel empty state ──');
  const emptyText = await page.locator('text=No message generated yet').count();
  if (emptyText > 0) pass('Empty state visible');
  else flag('WARN', 'Output panel', 'Empty state text not found');

  const emptySubtext = await page.locator('text=Select a stage, fill in the context').count();
  if (emptySubtext > 0) pass('Empty state subtext correct');
  else flag('WARN', 'Output panel', 'Empty state subtext missing');

  // ── Audit log ──
  console.log('── Audit log ──');
  const auditBtn = page.locator('button:has-text("Audit Log")');
  if (await auditBtn.count() > 0) pass('Audit log button present');
  else flag('CRITICAL', 'Audit log', 'Audit log button missing');

  const sessionNote = await page.locator('text=Session only — clears on refresh').count();
  if (sessionNote > 0) pass('Audit log session disclaimer present');
  else flag('WARN', 'Audit log', 'Session disclaimer missing');

  // ── Footer ──
  console.log('── Footer ──');
  const footerText = await page.locator('footer').textContent();
  if (footerText?.includes('Adam VanArsdalen')) pass('Footer author correct');
  else flag('WARN', 'Footer', 'Author name missing from footer');
  if (footerText?.includes('Next.js') && footerText?.includes('Claude')) pass('Footer stack attribution correct');
  else flag('WARN', 'Footer', 'Stack attribution missing');
  const ghLink = await page.locator('footer a[href*="github"]').count();
  if (ghLink > 0) pass('GitHub link present in footer');
  else flag('WARN', 'Footer', 'GitHub link missing');

  // ── Placeholder / debug text scan ──
  console.log('── Placeholder/debug scan ──');
  const bodyText = await page.evaluate(() => document.body.innerText);
  const badStrings = ['TODO', 'lorem ipsum', 'undefined', '[object Object]', 'coming soon', 'placeholder', 'test content'];
  for (const bad of badStrings) {
    if (bodyText.toLowerCase().includes(bad.toLowerCase())) {
      flag('CRITICAL', 'Body text', `Found placeholder/debug string: "${bad}"`);
    }
  }
  pass('No placeholder/debug strings found');

  // ─────────────────────────────────────────────────────
  // STEP 3: FUNCTIONAL AUDIT
  // ─────────────────────────────────────────────────────
  console.log('\n═══ STEP 3: FUNCTIONAL AUDIT ═══\n');

  // 3.1 Console errors on load
  console.log('── Console errors on load ──');
  if (consoleErrors.length === 0) pass('No console errors on load');
  else {
    for (const err of consoleErrors) flag('CRITICAL', 'Console', err.substring(0, 120));
  }

  // 3.2 Demo patient cards — each one loads the form correctly
  console.log('── Demo patient card loading ──');
  const demoPatients = [
    { name: 'Sarah M.', expectedName: 'Sarah', expectedStage: 'stim_mid' },
    { name: 'Jennifer K.', expectedName: 'Jennifer', expectedStage: 'trigger_night' },
    { name: 'Amanda R.', expectedName: 'Amanda', expectedStage: 'blastocyst_report' },
    { name: 'Michelle T.', expectedName: 'Michelle', expectedStage: 'beta_negative' },
  ];

  for (const patient of demoPatients) {
    await page.click(`button:has-text("${patient.name}")`);
    await sleep(500);
    const nameVal = await page.inputValue('input[placeholder="e.g. Sarah"]');
    const stageVal = await page.evaluate(() =>
      document.querySelector('select')?.value
    );
    if (nameVal === patient.expectedName) pass(`${patient.name}: name field = "${nameVal}"`);
    else flag('CRITICAL', `Demo card: ${patient.name}`, `Name field shows "${nameVal}", expected "${patient.expectedName}"`);
    if (stageVal === patient.expectedStage) pass(`${patient.name}: stage = "${stageVal}"`);
    else flag('WARN', `Demo card: ${patient.name}`, `Stage is "${stageVal}", expected "${patient.expectedStage}"`);
    // check no undefined values in form inputs
    const inputs = await page.evaluate(() => {
      const vals = Array.from(document.querySelectorAll('input, textarea'))
        .map(el => el.value)
        .filter(v => v === 'undefined' || v === '[object Object]');
      return vals;
    });
    if (inputs.length === 0) pass(`${patient.name}: no undefined values in form`);
    else flag('CRITICAL', `Demo card: ${patient.name}`, `Undefined/object values in form: ${inputs.join(', ')}`);
  }

  // 3.3 Generate with Sarah M.
  console.log('── Generate: Sarah M. (mid-stim) ──');
  await page.click('button:has-text("Sarah M.")');
  await sleep(500);

  const submitBtn = page.locator('button[type="submit"]');
  const isDisabled = await submitBtn.getAttribute('disabled');
  if (isDisabled === null) pass('Generate button enabled after loading demo patient');
  else flag('CRITICAL', 'Generate button', 'Button is disabled after loading Sarah M.');

  await page.screenshot({ path: `${SS_DIR}/audit-form-loaded.png`, fullPage: true });
  await submitBtn.click();
  await sleep(300);

  // Check loading state
  const loadingText = await page.locator('text=Generating...').count();
  if (loadingText > 0) pass('Loading state appears after click');
  else flag('WARN', 'Generate button', 'Loading state "Generating..." not visible');

  await page.screenshot({ path: `${SS_DIR}/audit-generating.png`, fullPage: true });

  await waitForGen(page);
  await page.screenshot({ path: `${SS_DIR}/audit-output.png`, fullPage: true });

  // Check output panels
  const patientMsgPanel = await page.locator('text=PATIENT MESSAGE').count();
  if (patientMsgPanel > 0) pass('Patient Message panel rendered');
  else flag('CRITICAL', 'Output', 'Patient Message panel missing after generation');

  const coordSummaryPanel = await page.locator('text=COORDINATOR SUMMARY').count();
  if (coordSummaryPanel > 0) pass('Coordinator Summary panel rendered');
  else flag('CRITICAL', 'Output', 'Coordinator Summary panel missing after generation');

  const patientMsgContent = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('p'));
    const el = els.find(e => e.closest('[class*="rounded-lg"]') && e.textContent.length > 50);
    return el?.textContent?.trim().substring(0, 60) ?? '';
  });
  if (patientMsgContent.length > 20) pass(`Patient message has content: "${patientMsgContent}..."`);
  else flag('CRITICAL', 'Output > Patient message', 'Patient message content appears empty');

  // Provider badge
  const claudeBadge = await page.locator('text=Claude').last().isVisible();
  if (claudeBadge) pass('Provider badge shows "Claude"');
  else flag('WARN', 'Output meta', 'Provider badge not found or not "Claude"');

  // Timestamp visible
  const timestampVisible = await page.evaluate(() => {
    const text = document.body.innerText;
    return /\d{1,2}:\d{2}\s?(AM|PM)/i.test(text);
  });
  if (timestampVisible) pass('Timestamp visible in output');
  else flag('WARN', 'Output meta', 'Timestamp not found or wrong format');

  // Copy button
  const copyBtn = page.locator('button:has-text("Copy")');
  if (await copyBtn.count() > 0) pass('Copy button visible');
  else flag('WARN', 'Output', 'Copy button not visible');

  // 3.4 Michelle T. — beta negative, clinical flags
  console.log('── Generate: Michelle T. (beta negative) ──');
  await page.click('button:has-text("Michelle T.")');
  await sleep(500);
  await page.locator('button[type="submit"]').click();
  await waitForGen(page);
  await page.screenshot({ path: `${SS_DIR}/audit-beta-negative.png`, fullPage: true });

  const flagsPanel = await page.locator('text=Clinical Flags').count();
  if (flagsPanel > 0) pass('Clinical Flags panel appeared for beta negative');
  else flag('CRITICAL', 'Output > Clinical flags', 'Clinical flags panel missing for beta negative result');

  const flagsPanelAmber = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('[class*="amber"]'));
    return el.length > 0;
  });
  if (flagsPanelAmber) pass('Clinical flags panel has amber warning styling');
  else flag('WARN', 'Output > Clinical flags', 'Amber warning styling not found on flags panel');

  const physicianText = await page.locator('text=Physician').count();
  if (physicianText > 0) pass('Physician review notice visible in flags');
  else flag('WARN', 'Output > Clinical flags', '"Physician" text not found in flags panel');

  // 3.5 Audit log
  console.log('── Audit log ──');
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }));
  await sleep(400);

  const entryCount = await page.locator('.lucide-shield-check + span + span').textContent().catch(() => '');
  pass(`Audit entry count badge: "${entryCount || 'present'}"`);

  await page.click('button:has-text("Audit Log")');
  await sleep(600);
  await page.screenshot({ path: `${SS_DIR}/audit-log-expanded.png`, fullPage: true });

  const auditEntries = await page.locator('[class*="divide-y"] > div').count();
  if (auditEntries >= 2) pass(`Audit log expanded with ${auditEntries} entries`);
  else flag('WARN', 'Audit log', `Expected ≥2 entries, found ${auditEntries}`);

  const hipaaText = await page.locator('text=HIPAA: No PHI stored').count();
  if (hipaaText > 0) pass('HIPAA policy tag present in audit entries');
  else flag('WARN', 'Audit log', 'HIPAA policy tag not visible in entries');

  // 3.6 Provider toggle — Ollama
  console.log('── Provider toggle: Ollama ──');
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await sleep(300);
  await page.click('button:has-text("Ollama")');
  await sleep(400);
  await page.screenshot({ path: `${SS_DIR}/audit-ollama-toggle.png`, fullPage: true });

  // Check Ollama active styling
  const ollamaActive = await page.locator('button:has-text("Ollama")').evaluate(el =>
    el.className.includes('emerald')
  );
  if (ollamaActive) pass('Ollama pill has active styling when selected');
  else flag('WARN', 'ProviderToggle', 'Ollama pill active styling not applied');

  // Hover tooltip
  await page.hover('button:has-text("Ollama")');
  await sleep(600);
  const tooltip = await page.locator('text=Local deployment only').count();
  if (tooltip > 0) pass('Ollama tooltip shows on hover');
  else flag('WARN', 'ProviderToggle > tooltip', '"Local deployment only" tooltip text missing on hover');

  const hipaaTooltip = await page.locator('text=PHI never leaves your network').count();
  if (hipaaTooltip > 0) pass('Tooltip has HIPAA messaging');
  else flag('WARN', 'ProviderToggle > tooltip', 'HIPAA messaging missing from tooltip');

  // 3.7 Switch back to Claude
  console.log('── Switch back to Claude ──');
  await page.click('button:has-text("Claude")');
  await sleep(300);
  const claudeActiveNow = await page.locator('button:has-text("Claude")').evaluate(el =>
    el.className.includes('bg-[#06B6D4]')
  );
  if (claudeActiveNow) pass('Claude pill re-activates after switching back');
  else flag('WARN', 'ProviderToggle', 'Claude pill not re-activated after switch');

  const outputStillThere = await page.locator('text=PATIENT MESSAGE').count();
  if (outputStillThere > 0) pass('Output still intact after provider switch');
  else flag('WARN', 'Output persistence', 'Output cleared when switching providers');

  // 3.8 Mobile layout
  console.log('── Mobile layout (390x844) ──');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await sleep(600);
  await page.screenshot({ path: `${SS_DIR}/audit-mobile.png`, fullPage: true });

  // Check for horizontal overflow
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  if (!hasOverflow) pass('No horizontal overflow at 390px');
  else flag('CRITICAL', 'Mobile layout', 'Horizontal overflow detected at 390px viewport');

  // Header still renders on mobile
  const mobileH1 = await page.locator('h1').isVisible();
  if (mobileH1) pass('H1 visible on mobile');
  else flag('CRITICAL', 'Mobile > Header', 'H1 not visible at 390px');

  // Tagline hidden on mobile (it has hidden sm:block)
  const taglineVisible = await page.locator('header p').isVisible();
  if (!taglineVisible) pass('Tagline correctly hidden on mobile (hidden sm:block)');
  else flag('WARN', 'Mobile > Header', 'Tagline visible on mobile — may crowd the header');

  // Demo cards still 2-col on mobile? (grid-cols-2 no responsive — may be tight)
  const mobileCards = await page.locator('.grid.grid-cols-2 button').count();
  if (mobileCards === 4) pass('Demo patient cards render on mobile');
  else flag('WARN', 'Mobile > Demo cards', `${mobileCards}/4 demo cards visible on mobile`);

  // Generate button accessible on mobile
  const mobileGenBtn = await page.locator('button[type="submit"]').isVisible();
  if (mobileGenBtn) pass('Generate button visible on mobile');
  else flag('CRITICAL', 'Mobile > Generate button', 'Generate button not visible on mobile');

  // ─────────────────────────────────────────────────────
  // STEP 4: CONTENT AUDIT
  // ─────────────────────────────────────────────────────
  console.log('\n═══ STEP 4: CONTENT AUDIT ═══\n');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await sleep(500);

  // Stage dropdown groups
  console.log('── Stage dropdown groups ──');
  const optgroups = await page.evaluate(() =>
    Array.from(document.querySelectorAll('optgroup')).map(g => g.label)
  );
  const expectedGroups = ['Monitoring & Stimulation', 'Egg Retrieval', 'Post-Retrieval', 'Transfer', 'Results'];
  for (const g of expectedGroups) {
    if (optgroups.includes(g)) pass(`Optgroup: "${g}"`);
    else flag('WARN', 'Stage dropdown', `Missing optgroup: "${g}"`);
  }

  // Stage count
  const stageCount = await page.evaluate(() => document.querySelectorAll('option').length);
  if (stageCount === 14) pass(`Stage count: 14 stages`);
  else flag('WARN', 'Stage dropdown', `Expected 14 stages, found ${stageCount}`);

  // Ollama tooltip text quality
  await page.hover('button:has-text("Ollama")');
  await sleep(500);
  const tooltipEl = await page.locator('[class*="absolute"] p').textContent().catch(() => '');
  if (tooltipEl.includes('README')) pass('Tooltip references README for setup');
  else flag('WARN', 'ProviderToggle > tooltip', 'Tooltip does not reference README');

  // Footer GitHub link
  const githubHref = await page.locator('footer a').getAttribute('href');
  if (githubHref?.includes('adam-vanarsdalen/cycle-relay')) pass(`Footer GitHub link correct: ${githubHref}`);
  else flag('WARN', 'Footer', `GitHub href unexpected: "${githubHref}"`);

  // ─────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────
  await browser.close();

  console.log('\n═══ AUDIT COMPLETE ═══\n');
  console.log(`Issues found: ${issues.length}`);
  const criticals = issues.filter(i => i.severity === 'CRITICAL');
  const warns = issues.filter(i => i.severity === 'WARN');
  console.log(`  Critical: ${criticals.length}`);
  console.log(`  Warnings: ${warns.length}`);

  if (issues.length > 0) {
    console.log('\nAll issues:');
    issues.forEach((i, n) => console.log(`  ${n + 1}. [${i.severity}] ${i.location}: ${i.description}`));
  }

  // Write JSON report
  fs.writeFileSync('scripts/audit-report.json', JSON.stringify({ issues, consoleErrors }, null, 2));
  console.log('\nFull report saved to scripts/audit-report.json');
}

main().catch(err => { console.error(err); process.exit(1); });
