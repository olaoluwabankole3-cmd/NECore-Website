(function () {
  'use strict';
  document.getElementById('year')?.replaceChildren(document.createTextNode(String(new Date().getFullYear())));
  const toggle=document.querySelector('.mobile-toggle'),menu=document.querySelector('.nav-links');
  toggle?.addEventListener('click',()=>{const open=!menu.classList.contains('open');menu.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');toggle.textContent=open?'×':'☰'});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.classList.contains('open')){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰'}});
  if('IntersectionObserver' in window){const observer=new IntersectionObserver((entries,obs)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('show');obs.unobserve(entry.target)}})},{threshold:.09});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el))}else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('show'));
  document.querySelectorAll('[data-copy-target]').forEach(btn=>btn.addEventListener('click',async()=>{const target=document.getElementById(btn.dataset.copyTarget);if(!target)return;const original=btn.textContent;try{await navigator.clipboard.writeText(target.textContent);btn.textContent='Copied';setTimeout(()=>btn.textContent=original,1900)}catch{btn.textContent='Select code to copy';setTimeout(()=>btn.textContent=original,2100)}}));
  const form=document.getElementById('contact-form');
  if(form){form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const btn=document.getElementById('sendBtn');const response=document.getElementById('form-response');const data=Object.fromEntries(new FormData(form).entries());btn.disabled=true;btn.textContent='Sending…';response.className='form-response';response.textContent='';try{const request=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});const body=await request.json().catch(()=>({error:'Unable to parse server response.'}));if(!request.ok)throw new Error(body.error||'Unable to send this enquiry.');response.classList.add('ok');response.textContent='Your enquiry was sent successfully. Thank you for contacting NECore.';form.reset()}catch(err){response.classList.add('error');response.textContent=String(err.message||'We could not send your request. Please try again later.')}finally{btn.disabled=false;btn.innerHTML='Send enquiry →'}})}

  // Keep animation opt-in and respect OS accessibility settings.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(!reducedMotion.matches){
    document.documentElement.classList.add('motion-ready');
  }
  const header = document.querySelector('.site-header');
  const syncHeader = () => header?.classList.toggle('scrolled', window.scrollY > 12);
  syncHeader();
  window.addEventListener('scroll', syncHeader, {passive:true});
  // Opt-in pointer glow on cards, transform-free to avoid hard-to-read interactions.
  if(window.matchMedia('(hover:hover) and (pointer:fine)').matches && !reducedMotion.matches){
    document.querySelectorAll('.feature-card,.solution-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--pointer-x', ((event.clientX - bounds.left) / bounds.width * 100)+'%');
        card.style.setProperty('--pointer-y', ((event.clientY - bounds.top) / bounds.height * 100)+'%');
      }, {passive:true});
    });
  }
  const experience = document.querySelector('[data-experience]');
  if(experience){
    const stages = {
      verify: {num:'01',title:'From claim to confidence.',body:'Combine authorized identity-source evidence, specialist document checks and biometric signals in a single controlled journey.',signals:['Identity source','Document evidence','Biometric review'],evidence:['Authorized source adapter','Document evidence mapped','Reviewer-ready outcome'],link:'Explore verification',href:'products.html#verification'},
      monitor: {num:'02',title:'Risk changes. Context stays.',body:'Watch permitted identity and behavioral signals over time. Surface unusual patterns with clear escalation routes instead of relying on a one-time yes or no.',signals:['Historical context','Change in behavior','Risk evaluation'],evidence:['Consented signal collection','Dynamic risk classification','Human escalation pathway'],link:'Explore intelligence',href:'products.html#intelligence'},
      comply: {num:'03',title:'Every action leaves a record.',body:'Keep policy decisions, reviewer reasoning, and verification events connected so institutions can explain outcomes and prepare reports.',signals:['Policy version','Reviewer record','Exported evidence'],evidence:['Policy rules evaluated','Decision history recorded','Auditable outcome prepared'],link:'Explore compliance',href:'products.html#compliance'}
    };
    const tabs = [...experience.querySelectorAll('[data-stage-tab]')];
    const setStage = key => {
      const data = stages[key]; if(!data) return;
      experience.dataset.stage = key;
      const fill = (selector,value) => {const el=experience.querySelector(selector);if(el)el.textContent=value};
      fill('[data-stage-number]',data.num);fill('[data-stage-title]',data.title);fill('[data-stage-body]',data.body);
      fill('[data-signal-a]',data.signals[0]);fill('[data-signal-b]',data.signals[1]);fill('[data-signal-c]',data.signals[2]);
      fill('[data-evidence-one]',data.evidence[0]);fill('[data-evidence-two]',data.evidence[1]);fill('[data-evidence-three]',data.evidence[2]);
      const link=experience.querySelector('[data-experience-link]');if(link){link.href=data.href;link.replaceChildren(document.createTextNode(data.link+' '));const span=document.createElement('span');span.setAttribute('aria-hidden','true');span.textContent='↗';link.appendChild(span)}
      tabs.forEach(t=>{const selected=t.dataset.stageTab===key;t.classList.toggle('is-selected',selected);t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1});
      experience.querySelector('#experience-panel')?.setAttribute('aria-labelledby','tab-'+key);
    };
    tabs.forEach((tab,i) => {
      tab.addEventListener('click',() => setStage(tab.dataset.stageTab));
      tab.addEventListener('keydown',event=>{
        if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
        event.preventDefault();
        const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
        tabs[next].focus();setStage(tabs[next].dataset.stageTab);
      });
    });
  }

})();