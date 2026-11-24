/* NECore hero entrance — art first, then a shared-element transition.
   Runs at most once per tab session, is skippable, and never affects
   accessibility reduced-motion settings or navigation to page anchors.
   No user data, API calls, external animation libraries or extra UI cards.
*/
(()=>{
  'use strict';
  const INTRO_TIMING={
    capture:2400, scan:3500, success:2200,
    arrive:720, settle:1650
  };
  const story=document.querySelector('[data-verify-story]');
  const original=story?.querySelector('.toon-stage-v6');
  if(!story||!original||typeof original.animate!=='function')return;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(motion.matches||document.visibilityState==='hidden'||window.scrollY>8||location.hash)return;
  // ?intro=1 allows visual QA without clearing the tab's session state.
  const forceReplay=new URLSearchParams(window.location.search).get('intro')==='1';
  try{
    if(!forceReplay&&window.sessionStorage.getItem('necore_hero_entrance_v1')==='seen')return;
  }catch{ /* Private mode without storage must still work. */ }

  const rect=original.getBoundingClientRect();
  if(rect.width<60||rect.height<60)return;
  try{window.sessionStorage.setItem('necore_hero_entrance_v1','seen')}catch{}

  const curtain=document.createElement('div');
  curtain.className='necore-intro-curtain';
  curtain.setAttribute('aria-hidden','true');

  const art=document.createElement('div');
  art.className='necore-intro-art toon-v6-intro';
  art.dataset.scene='capture';
  art.setAttribute('aria-hidden','true');
  const artwork=original.cloneNode(true);
  art.appendChild(artwork);

  // One continuous artwork: the intro scene and its destination use
  // the exact same two images and scan-frame geometry.
  const vw=window.innerWidth,vh=window.innerHeight;
  const w=vw<=620?Math.min(vw*1.3,615):Math.min(vw*.74,900);
  const h=w*460/670;
  const x=(vw-w)/2;
  const y=Math.max(4,(vh-h)/2-14);
  Object.assign(art.style,{
    width:w+'px',height:h+'px',left:x+'px',top:y+'px',opacity:'1'
  });

  document.documentElement.classList.add('necore-intro-running');
  const skip=document.createElement('button');
  skip.type='button';skip.className='necore-intro-skip';skip.textContent='Skip intro';
  document.body.append(curtain,art,skip);
  document.dispatchEvent(new Event('necore:intro-start'));

  let ended=false;
  const timers=new Set();
  const schedule=(fn,delay)=>{
    const id=window.setTimeout(()=>{timers.delete(id);fn()},delay);
    timers.add(id);
  };
  const removeListeners=()=>{
    document.removeEventListener('keydown',onKey);
    document.removeEventListener('visibilitychange',onVisibility);
    curtain.removeEventListener('click',finish);
    skip.removeEventListener('click',onSkip);
    window.removeEventListener('resize',finish);
    window.removeEventListener('wheel',finish);
  };
  function finish(){
    if(ended)return;
    ended=true;
    timers.forEach(id=>window.clearTimeout(id));
    timers.clear();
    removeListeners();
    curtain.remove();
    art.remove();
    skip.remove();
    document.documentElement.classList.remove('necore-intro-running','necore-intro-reveal','necore-intro-handoff');
    document.dispatchEvent(new Event('necore:intro-complete'));
  }
  function onSkip(){finish();const main=document.getElementById('main');if(main){main.setAttribute('tabindex','-1');main.focus({preventScroll:true})}}
  function onKey(e){if(e.key==='Escape'){e.preventDefault();onSkip()}else if(e.key==='Tab'){e.preventDefault();skip.focus()}}
  function onVisibility(){if(document.hidden)finish()}
  document.addEventListener('keydown',onKey);
  document.addEventListener('visibilitychange',onVisibility);
  curtain.addEventListener('click',finish);
  skip.addEventListener('click',onSkip);
  window.addEventListener('resize',finish,{passive:true});
  window.addEventListener('wheel',finish,{passive:true});

  // Show one complete capture → scan → success sequence before landing.
  // The scanner needs time to finish its full beam/phone movement. No
  // intermediate pages, status boxes, or duplicate copy are introduced.
  const entrance=art.animate([
    {opacity:0,transform:'translateY(24px) scale(.92)'},
    {opacity:1,transform:'translateY(0) scale(1)'}
  ],{duration:INTRO_TIMING.arrive,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});
  schedule(()=>{if(!ended)entrance.cancel()},INTRO_TIMING.arrive+40);

  schedule(()=>{if(!ended)art.dataset.scene='scan'},INTRO_TIMING.capture);
  schedule(()=>{if(!ended)art.dataset.scene='success'},INTRO_TIMING.capture+INTRO_TIMING.scan);

  schedule(()=>{
    if(ended)return;
    const destination=original.getBoundingClientRect();
    if(destination.width<50||destination.height<50){finish();return}
    // Pre-align the hidden destination to success so the composited
    // illustration can crossfade without reverting the phone to capture.
    story.dataset.scene='success';
    story.classList.add('is-entered');

    document.documentElement.classList.add('necore-intro-reveal');
    art.animate([
      {left:x+'px',top:y+'px',width:w+'px',height:h+'px',opacity:1,offset:0},
      {left:(destination.left-4)+'px',top:(destination.top-3)+'px',
       width:(destination.width+8)+'px',height:(destination.height+6)+'px',
       opacity:1,offset:.88},
      {left:destination.left+'px',top:destination.top+'px',
       width:destination.width+'px',height:destination.height+'px',
       opacity:1,offset:1}
    ],{duration:INTRO_TIMING.settle,
       easing:'cubic-bezier(.18,.84,.25,1)',fill:'forwards'});

    curtain.animate([
      {opacity:1,offset:0},
      {opacity:.93,offset:.32},
      {opacity:.45,offset:.76},
      {opacity:0,offset:1}
    ],{duration:INTRO_TIMING.settle,
       easing:'cubic-bezier(.28,.74,.38,1)',fill:'forwards'});

    // The real art becomes visible during the final part of the landing.
    // Overlapping two identical art stages prevents a sudden last-frame pop.
    schedule(()=>{
      if(!ended)document.documentElement.classList.add('necore-intro-handoff');
    },INTRO_TIMING.settle-420);
    schedule(finish,INTRO_TIMING.settle+80);
  },INTRO_TIMING.capture+INTRO_TIMING.scan+INTRO_TIMING.success);

  // Recovery if painting, animations or a browser frame stalls.
  schedule(finish,INTRO_TIMING.capture+INTRO_TIMING.scan+
    INTRO_TIMING.success+INTRO_TIMING.settle+1700);
  if(motion.addEventListener){
    motion.addEventListener('change',()=>{if(motion.matches)finish()},{once:true});
  }
})();
