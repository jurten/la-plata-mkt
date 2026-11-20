import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const out = 'artifacts/value-light-stories';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const report = [];
try {
  const variants = [
    { locale:'es', width:1440, theme:'light', card:null },
    { locale:'en', width:1440, theme:'dark', card:null },
    { locale:'es', width:768, theme:'dark', card:null },
    ...[0,1,2].map(card => ({locale:'es',width:390,theme:'light',card})),
  ];
  for (const variant of variants) {
    const { locale, width, theme, card } = variant;
    const context = await browser.newContext({ viewport:{width,height:1000}, colorScheme:theme, reducedMotion:'reduce', hasTouch:width===390, isMobile:width===390 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{ if(message.type()==='error' && /shader|GLSL|uniform|WebGL/i.test(message.text())) errors.push(message.text()); });
    await page.route(/hs-scripts|hs-analytics|hubspot/,route=>route.fulfill({body:''}));
    await page.goto(`http://127.0.0.1:4321/${locale==='es'?'nosotros':'en/about'}/`);
    await page.evaluate(()=>document.fonts.ready);
    const focus = card===null ? page.locator('#valores') : page.locator('[data-value-visual]').nth(card);
    await focus.evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-120,behavior:'instant'}));
    await page.emulateMedia({reducedMotion:'no-preference'});
    const target = card===null ? page.locator('.about-value__canvas').first() : page.locator('[data-value-visual]').nth(card).locator('canvas');
    await expect(target).toBeVisible();
    const prefix=`${out}/${locale}-${width}-${theme}${card===null?'':`-card${card}`}`;
    const capture = async name => card===null ? page.screenshot({path:`${prefix}-${name}.png`}) : focus.screenshot({path:`${prefix}-${name}.png`});
    await page.waitForTimeout(1000);
    const start=await capture('start');
    const visual=page.locator('[data-value-visual]').nth(card??0);
    if(width===390) await visual.tap(); else await visual.hover({position:{x:180,y:120}});
    await expect(target).toHaveAttribute('data-scene-stage',['merging','revealing','connecting'][card??0],{timeout:4000});
    await page.waitForTimeout(850);
    await capture('transition');
    await expect(target).toHaveAttribute('data-scene-stage',['created','clear','whole'][card??0],{timeout:6000});
    const finish=await capture('result');
    if(start.equals(finish)) throw Error('Light story did not change');
    if(width===390) await visual.tap(); else await visual.click({position:{x:180,y:120}});
    await expect(target).toHaveAttribute('data-animation-state','playing');
    await page.emulateMedia({reducedMotion:'reduce'});
    await expect(page.locator('[data-value-warp-ready]')).toHaveCount(0);
    await expect(visual.locator('.about-value__still')).toHaveCSS('visibility','visible');
    await capture('static');
    const accessibility=(await new AxeBuilder({page}).include('.about-values').analyze()).violations.map(v=>v.id);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    const row={...variant,errors,accessibility,overflow,sequence:true,interaction:true,reducedMotion:true};
    report.push(row); console.log(JSON.stringify(row));
    await context.close();
  }
} finally { await browser.close(); await writeFile(`${out}/report.json`,JSON.stringify(report,null,2)); }
if(report.some(row=>row.errors.length||row.accessibility.length||row.overflow)) process.exitCode=1;
