const {chromium,firefox,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const engine=process.env.QA_BROWSER||'chromium';
const base='http://127.0.0.1:4173';
const paths=['/','/products','/solutions','/developers','/security','/company','/pricing','/contact'];
(async()=>{
const browser=await ({chromium,firefox,webkit})[engine].launch({headless:true});
const reports=[];
try{
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
await page.route('https://fonts.googleapis.com/**',route=>route.abort());
await page.route('https://fonts.gstatic.com/**',route=>route.abort());
const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});
  for(const path of paths){
    const response=await page.goto(base+path);
    assert.equal(response.status(),200,path);
    assert.equal(await page.locator('main h1').count(),1,path+' h1');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),path+' overflow '+width);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.activeElement.className),'skip-link',path+' first focus');
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'main',path+' skip focus');
    if(width===390){
      const nav=page.locator('.mobile-toggle');
      await nav.click();
      assert.equal(await nav.getAttribute('aria-expanded'),'true');
      await page.keyboard.press('Escape');
      assert.equal(await nav.getAttribute('aria-expanded'),'false');
      assert.ok(await nav.evaluate(el=>el===document.activeElement));
    }
    if(engine==='chromium'){
      await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
      const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}}));
      reports.push({path,width,violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
    }
  }
}
await page.goto(base+'/');
const tab=page.locator('#tab-verify');
await tab.focus();await page.keyboard.press('ArrowRight');
assert.equal(await page.locator('#tab-monitor').getAttribute('aria-selected'),'true');
assert.equal(await page.locator('#experience-panel').getAttribute('aria-labelledby'),'tab-monitor');
assert.equal(await page.locator('.necore-intro-skip').count(),0);
const missing=await page.goto(base+'/missing-phase4-qa-page');
assert.equal(missing.status(),404);
assert.ok(await page.getByRole('heading',{name:"This page isn't available."}).isVisible());
assert.deepEqual(errors,[],engine+' browser script errors');
await page.close();
const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
await nojs.goto(base+'/');
assert.ok(await nojs.locator('.nav-links a[href="products.html"]').isVisible(),'no-JS navigation');
await nojs.close();
}finally{
if(engine==='chromium'){fs.mkdirSync('qa-results',{recursive:true});fs.writeFileSync('qa-results/axe.json',JSON.stringify(reports,null,2));console.log(JSON.stringify(reports.map(r=>({path:r.path,width:r.width,violations:r.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length}))})),null,2));}
await browser.close();
}
const critical=reports.flatMap(r=>r.violations.filter(v=>v.impact==='critical').map(v=>({path:r.path,id:v.id})));
assert.deepEqual(critical,[],'Critical accessibility violations');
console.log(engine+' cross-browser checks passed; review all axe findings in the report.');
})().catch(e=>{console.error(e);process.exitCode=1});
