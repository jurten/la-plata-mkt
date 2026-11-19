import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'artifacts/team-flowing';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const theme of ['light', 'dark']) {
    for (const [width, height] of [[1920,966], [1440,1000], [1100,900], [768,900], [390,844], [320,740]]) {
      const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme, hasTouch:width <= 390, isMobile:width <= 390 });
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      await page.route('https://js.hs-scripts.com/**', route => route.fulfill({body:''}));
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:4321/#nosotros');
      await page.locator('[data-team-ready]').waitFor();
      await page.evaluate(() => document.fonts.ready);
      if (await page.locator('[data-portfolio-reveal]').getAttribute('data-enhanced')) await page.locator('.featured-stage[inert]').waitFor({state:'attached'});
      await page.waitForFunction(() => Math.abs(document.querySelector('#nosotros').getBoundingClientRect().top) < 2);
      // Initial fragment arrival also starts the existing masthead transition.
      await page.waitForTimeout(650);
      const geometry = await page.evaluate(() => {
        const section = document.querySelector('#nosotros');
        const rect = section.getBoundingClientRect();
        const footer = document.querySelector('#contacto').getBoundingClientRect();
        return {
          height:rect.height, footerTop:footer.top, overflow:document.documentElement.scrollWidth > innerWidth,
          clipped:[...section.querySelectorAll('[data-team-current-name], [data-team-current-role]')].filter(el => el.scrollWidth > el.clientWidth + 1).map(el=>el.textContent),
        };
      });
      await page.screenshot({path:`${output}/team-${width}-${theme}.png`});
      if (width <= 390) {
        await page.locator('[data-team-choice]').first().tap();
        await page.waitForTimeout(900);
        if (await page.locator('[data-team-choice]').first().getAttribute('aria-pressed') !== 'true') throw new Error('Touch selection did not settle');
        await page.screenshot({path:`${output}/team-active-${width}-${theme}.png`});
      }
      if (width === 1440) {
        for (const index of [1,2]) {
          await page.locator('[data-team-choice]').nth(index).hover({position:{x:240,y:80}});
          await page.waitForTimeout(900);
          await page.screenshot({path:`${output}/team-hover-${index}-${theme}.png`});
        }
        const accessibility = await new AxeBuilder({page}).include('#nosotros').analyze();
        results.push({theme, accessibility:accessibility.violations.map(({id,impact,nodes})=>({id,impact,nodes:nodes.map(n=>({target:n.target,reason:n.failureSummary}))}))});
        await page.mouse.move(700,170);
        await page.locator('[data-team-choice]').first().focus();
        await page.waitForTimeout(650);
        const keyboard = await page.locator('[data-team-choice]').first().evaluate(el => ({focused:document.activeElement === el, pressed:el.getAttribute('aria-pressed')}));
        if (!keyboard.focused || keyboard.pressed !== 'true') throw new Error('Keyboard selection did not settle');
        await page.screenshot({path:`${output}/team-keyboard-${theme}.png`});
        await page.mouse.wheel(0,-240);
        await page.waitForFunction(() => document.querySelector('[data-team-roster]').dataset.teamFlowState === 'disabled');
        await page.waitForTimeout(500);
        const reset = await page.locator('[data-team-roster]').evaluate(el => ({
          state:el.dataset.teamFlowState, selected:el.dataset.teamSelected,
          animatedStyles:el.querySelectorAll('[data-team-band][style], [data-team-track][style]').length,
        }));
        if (reset.selected !== '-1' || reset.animatedStyles) throw new Error('Return to Trabajos did not fully reset');
        await page.screenshot({path:`${output}/team-reset-trabajos-${theme}.png`});
        await page.mouse.wheel(0,240);
        await page.waitForFunction(() => document.querySelector('[data-team-roster]').dataset.teamFlowState === 'idle');
        await page.screenshot({path:`${output}/team-reenter-${theme}.png`});
        results.push({theme,reset});
      }
      results.push({width,height,theme,...geometry,errors});
      console.log(JSON.stringify({width,theme,...geometry,errors}));
      await context.close();
    }
  }
} finally { await browser.close(); }
await writeFile(`${output}/report.json`,JSON.stringify(results,null,2));
if(results.some(r=>r.overflow||r.clipped?.length||r.errors?.length||r.accessibility?.length)) process.exitCode=1;
