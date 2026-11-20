import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const out='artifacts/value-hover';
await mkdir(out,{recursive:true});
const browser=await chromium.launch();
const report=[];
try {
  for(const [locale,width] of [['es',1440],['en',390]]) {
    const context=await browser.newContext({viewport:{width,height:1000},hasTouch:width===390,isMobile:width===390,colorScheme:locale==='en'?'dark':'light'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.route(/hs-scripts|hs-analytics|hubspot/,route=>route.fulfill({body:''}));
    await page.goto(`http://127.0.0.1:4321/${locale==='es'?'nosotros':'en/about'}/`);
    await page.evaluate(()=>document.fonts.ready);
    for(let index=0;index<3;index++) {
      await page.mouse.move(5,5);
      const visual=page.locator('[data-value-visual]').nth(index);
      await visual.scrollIntoViewIfNeeded();
      const canvas=visual.locator('canvas');
      await expect(canvas).toHaveAttribute('data-animation-state','idle');
      const still=await visual.screenshot({path:`${out}/${locale}-${index}-idle.png`});
      await page.waitForTimeout(600);
      if(!still.equals(await visual.screenshot())) throw Error('Autoplay remained before hover');
      if(width===390) await visual.tap(); else await visual.hover({position:{x:160,y:100}});
      await expect(canvas).toHaveAttribute('data-animation-state','playing');
      await page.waitForTimeout(900);
      await visual.screenshot({path:`${out}/${locale}-${index}-playing.png`});
      await expect(canvas).toHaveAttribute('data-animation-state','holding',{timeout:5500});
      await expect(canvas).toHaveAttribute('data-scene-stage',['created','clear','whole'][index]);
      await visual.screenshot({path:`${out}/${locale}-${index}-result.png`});
      if(width===1440) {
        const neighbors=page.locator('.about-value__canvas');
        const states=await neighbors.evaluateAll(elements=>elements.map(el=>el.dataset.animationState));
        if(states.some((state,i)=>i!==index&&state!=='idle')) throw Error('Hover started a neighboring story');
        await page.mouse.move(5,5);
        await expect(canvas).toHaveAttribute('data-animation-state','idle');
        await expect(canvas).toHaveAttribute('data-scene-stage',['separate','blurred','parts'][index]);
        await visual.hover({position:{x:170,y:110}});
        await expect(canvas).toHaveAttribute('data-animation-state','playing');
        await page.mouse.move(5,5);
        await expect(canvas).toHaveAttribute('data-animation-state','idle');
      } else {
        await visual.tap();
        await expect(canvas).toHaveAttribute('data-animation-state','playing');
        await page.locator('.site-footer').evaluate(el=>el.scrollIntoView({behavior:'instant'}));
        await expect(visual).not.toHaveAttribute('data-value-warp-ready','');
        await visual.scrollIntoViewIfNeeded();
        await expect(canvas).toHaveAttribute('data-animation-state','idle');
      }
      report.push({locale,width,index,idle:true,trigger:true,completes:true,restarts:true,noAutoplay:true});
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    await expect(page.locator('[data-value-warp-ready]')).toHaveCount(0);
    await expect(page.locator('.about-value__still').first()).toHaveCSS('visibility','visible');
    const accessibility=(await new AxeBuilder({page}).include('.about-values').analyze()).violations.map(v=>v.id);
    if(errors.length||accessibility.length) throw Error(JSON.stringify({errors,accessibility}));
    console.log(JSON.stringify({locale,width,errors,accessibility,passed:true}));
    await context.close();
  }
} finally {await browser.close();await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));}
