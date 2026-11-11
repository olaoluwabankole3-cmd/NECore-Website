(()=>{
  'use strict';
  const story=document.querySelector('[data-verify-story]');
  if(!story)return;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const stages=[
    {key:'capture',number:'01 / 03',tag:'CAPTURE',title:'Ready for a simple identity check',subtitle:'Bring your phone up, frame your face, and begin.',duration:2850},
    {key:'scan',number:'02 / 03',tag:'VERIFYING',title:'A smarter check, in motion',subtitle:'Face, liveness, and source signals come together.',duration:3700},
    {key:'success',number:'03 / 03',tag:'COMPLETE',title:'Identity verified',subtitle:'Illustrative result. The right evidence, clearly presented.',duration:3200}
  ];
  const toggle=story.querySelector('[data-story-toggle]');
  const dots=[...story.querySelectorAll('.story-stage-pill')];
  const nodes={number:story.querySelector('[data-story-number]'),tag:story.querySelector('[data-story-tag]'),title:story.querySelector('[data-story-title]'),subtitle:story.querySelector('[data-story-subtitle]')};
  let timer=null,current=0,paused=false;
  function stop(){if(timer!==null)clearTimeout(timer);timer=null;story.classList.remove('is-playing')}
  function paint(index){
    current=index;
    const state=stages[index];
    story.dataset.scene=state.key;
    nodes.number.textContent=state.number;
    nodes.tag.textContent=state.tag;
    nodes.title.textContent=state.title;
    nodes.subtitle.textContent=state.subtitle;
    dots.forEach((dot,i)=>dot.classList.toggle('is-current',i===index));
    story.style.setProperty('--story-duration',state.duration+'ms');
    story.classList.remove('is-playing');
    void story.offsetWidth;
    if(!reduce.matches&&!paused){story.classList.add('is-playing');}
  }
  function next(){if(paused||reduce.matches||document.hidden)return;let i=(current+1)%stages.length;
    if(i===0){story.classList.remove('is-entered');paint(0);timer=setTimeout(()=>{story.classList.add('is-entered');timer=setTimeout(next,stages[0].duration)},180);return;}
    paint(i);timer=setTimeout(next,stages[i].duration);
  }
  function play(){stop();paused=false;toggle?.setAttribute('aria-pressed','false');if(toggle)toggle.innerHTML='<span aria-hidden="true">Ⅱ</span> Pause';paint(current);
    if(!story.classList.contains('is-entered'))requestAnimationFrame(()=>story.classList.add('is-entered'));
    if(!reduce.matches&&!document.hidden)timer=setTimeout(next,stages[current].duration);
  }
  function pause(){paused=true;stop();toggle?.setAttribute('aria-pressed','true');if(toggle)toggle.innerHTML='<span aria-hidden="true">▶</span> Play'}
  toggle?.addEventListener('click',()=>paused?play():pause());
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop()}else if(!paused){play()}});
  reduce.addEventListener?.('change',()=>{stop();if(reduce.matches){paused=true;story.classList.add('is-entered');paint(2);toggle?.setAttribute('hidden','hidden')}else{paused=false;toggle?.removeAttribute('hidden');current=0;play()}});
  if(reduce.matches){paused=true;story.classList.add('is-entered');paint(2);toggle?.setAttribute('hidden','hidden');}
  else {paint(0);requestAnimationFrame(()=>requestAnimationFrame(()=>{story.classList.add('is-entered');timer=setTimeout(next,stages[0].duration)}));}
})();
