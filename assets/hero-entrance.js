/* NECore hero entrance — art first, then a shared-element transition.
   Runs at most once per tab session, is skippable, and never affects
   accessibility reduced-motion settings or navigation to page anchors.
   No user data, API calls, external animation libraries or extra UI cards.
*/
(()=>{
  'use strict';
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
  document.body.append(curtain,art);
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
    document.documentElement.classList.remove('necore-intro-running','necore-intro-reveal');
    document.dispatchEvent(new Event('necore:intro-complete'));
  }
  function onKey(e){if(e.key==='Escape'||e.key==='Tab')finish()}
  function onVisibility(){if(document.hidden)finish()}
  document.addEventListener('keydown',onKey);
  document.addEventListener('visibilitychange',onVisibility);
  curtain.addEventListener('click',finish);
  window.addEventListener('resize',finish,{passive:true});
  window.addEventListener('wheel',finish,{passive:true});

  // A restrained arrival. Keep the hero's illustrated scan rather than
  // adding a logo splash, progress text, or a separate loading screen.
  art.animate([
    {opacity:0,transform:'translateY(25px) scale(.9)'},
    {opacity:1,transform:'translateY(0) scale(1)'}
  ],{duration:620,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});

  schedule(()=>{if(!ended)art.dataset.scene='scan'},550);
  schedule(()=>{
    if(ended)return;
    const destination=original.getBoundingClientRect();
    if(destination.width<50||destination.height<50){finish();return}
    document.documentElement.classList.add('necore-intro-reveal');
    art.animate([
      {left:x+'px',top:y+'px',width:w+'px',height:h+'px'},
      {left:destination.left+'px',top:destination.top+'px',
       width:destination.width+'px',height:destination.height+'px'}
    ],{duration:1120,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
    curtain.animate([
      {opacity:1,offset:0},{opacity:1,offset:.18},{opacity:0,offset:1}
    ],{duration:1060,easing:'ease-in-out',fill:'forwards'});
    schedule(finish,1160);
  },1510);

  // Recovery if animation playback, network or browser frames stall.
  schedule(finish,4500);
  if(motion.addEventListener){
    motion.addEventListener('change',()=>{if(motion.matches)finish()},{once:true});
  }
})();
