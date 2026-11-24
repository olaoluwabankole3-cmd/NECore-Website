const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = 'http://127.0.0.1:4173/';
const paths=['index','products','solutions','developers','security','company','pricing','contact'];
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({reducedMotion:'reduce'});
  for(const width of [320,375,390,620,768,900,1024,1100,1280,1440]){
   await page.setViewportSize({width,height:900});
   for(const path of paths){
    const response=await page.goto(base+path+'.html');
    assert.equal(response.status(),200,path);
    await page.locator('main h1').first().waitFor({state:'visible'});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),path+' overflow at '+width);
    const toggle=page.locator('.mobile-toggle');
    if(width<=1100){
     assert.ok(await toggle.isVisible(),path+' mobile toggle at '+width);
     await toggle.click();
     assert.equal(await toggle.getAttribute('aria-expanded'),'true');
     assert.ok(await page.locator('.mobile-menu-cta').isVisible());
     await page.keyboard.press('Escape');
     assert.equal(await toggle.getAttribute('aria-expanded'),'false');
    }else{assert.ok(await page.locator('.nav-links').isVisible());assert.equal(await toggle.isVisible(),false)}
    assert.equal(await page.locator('.necore-intro-skip').count(),0,'reduced motion must bypass intro');
   }
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'products.html');
  for(const id of ['verification','intelligence','compliance','credentials']){
   assert.equal(await page.locator('#'+id).count(),1);
   assert.equal(await page.locator('.section-index a[href="#'+id+'"]').count(),1);
  }
  await page.close();
  const motion=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'no-preference'});
  await motion.goto(base+'index.html?intro=1');
  const skip=motion.locator('.necore-intro-skip');
  await skip.waitFor({state:'visible'});
  await skip.click();
  await skip.waitFor({state:'detached'});
  assert.equal(await motion.locator('html').evaluate(e=>e.classList.contains('necore-intro-running')),false);
  const control=motion.locator('[data-story-toggle]');
  await control.click();
  assert.equal(await control.getAttribute('aria-pressed'),'true');
  const scene=await motion.locator('[data-verify-story]').getAttribute('data-scene');
  await motion.waitForTimeout(4500);
  assert.equal(await motion.locator('[data-verify-story]').getAttribute('data-scene'),scene);
  await control.click();
  assert.equal(await control.getAttribute('aria-pressed'),'false');
  await motion.close();
  console.log('Responsive layout, navigation, section links, reduced motion and pause/skip smoke checks passed.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
