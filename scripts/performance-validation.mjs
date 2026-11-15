import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'artifacts/performance';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
for (const profile of [
  { name: 'mobile-baseline', cpu: 1, motion: 'no-preference' },
  { name: 'modest-mobile', cpu: 4, motion: 'no-preference' },
  { name: 'slow-mobile', cpu: 6, motion: 'no-preference' },
  { name: 'slow-reduced-motion', cpu: 6, motion: 'reduce' },
]) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: profile.motion });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpu });
  const errors = [], failed = [], requests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('requestfailed', r => failed.push({ url: r.url(), error: r.failure()?.errorText }));
  cdp.on('Network.loadingFinished', e => requests.push(e.encodedDataLength));
  await page.addInitScript(() => {
    window.__perf = { longTasks: [], cls: 0, lcp: 0, frames: [], ready: null };
    new PerformanceObserver(list => { for (const e of list.getEntries()) window.__perf.longTasks.push({ start: e.startTime, duration: e.duration }); }).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(list => { for (const e of list.getEntries()) window.__perf.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    addEventListener('lpm:alien-ready', () => window.__perf.ready = performance.now());
  });
  await page.goto(process.env.PERF_URL ?? 'http://127.0.0.1:4322', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(45000);
  const loading = await page.evaluate(() => ({ ...window.__perf, paints: performance.getEntriesByType('paint').map(e => ({ name: e.name, ms: e.startTime })), resources: performance.getEntriesByType('resource').map(e => ({ url: e.name, bytes: e.transferSize, decoded: e.decodedBodySize, duration: e.duration })), heap: performance.memory?.usedJSHeapSize, overflow: document.documentElement.scrollWidth > innerWidth, spatial: document.querySelector('[data-spatial-portrait]')?.dataset.spatialState }));
  await page.screenshot({ path: `${output}/${profile.name}.png` });
  const scrolling = await page.evaluate(async () => {
    const samples = []; let previous = performance.now(); const start = previous;
    await new Promise(resolve => { function tick(now) { samples.push(now - previous); previous = now; scrollTo(0, (now - start) / 5000 * (document.documentElement.scrollHeight - innerHeight)); if (now - start < 5000) requestAnimationFrame(tick); else resolve(); } requestAnimationFrame(tick); });
    samples.sort((a,b) => a-b); return { frames: samples.length, p95FrameMs: samples[Math.floor(samples.length * .95)], over50ms: samples.filter(n => n > 50).length };
  });
  results.push({ profile, loading, scrolling, wireBytes: requests.reduce((a,b) => a+b,0), errors, failed });
  console.log(JSON.stringify({ profile: profile.name, lcp: loading.lcp, ready: loading.ready, bytes: results.at(-1).wireBytes, longTasks: loading.longTasks.length, scrolling, errors }));
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  await context.close();
}
await browser.close();
