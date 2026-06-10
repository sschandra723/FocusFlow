/* FocusFlow — app.js */

/* ── LOADER ── */
(function(){
  const msgs=['Getting things ready…','Warming up sounds…','Almost there…','Let\'s focus!'];
  const fill=document.getElementById('loaderProg'), msg=document.getElementById('loaderMsg');
  let pct=0,si=0;
  const iv=setInterval(()=>{
    pct=Math.min(100,pct+Math.random()*18+6);
    fill.style.width=pct+'%';
    const ni=Math.min(msgs.length-1,Math.floor(pct/26));
    if(ni!==si){si=ni;msg.textContent=msgs[si];}
    if(pct>=100){
      clearInterval(iv); msg.textContent=msgs[msgs.length-1];
      setTimeout(()=>{
        document.getElementById('loader').classList.add('out');
        setTimeout(()=>{
          document.getElementById('loader').style.display='none';
          document.getElementById('landing').classList.add('vis');
          initReveal(); initMarquee();
        },650);
      },320);
    }
  },140);
})();

/* ── NAV SCROLL ── */
window.addEventListener('scroll',()=>{
  document.getElementById('nav')?.classList.toggle('scrolled',window.scrollY>40);
},{passive:true});

/* ── SCROLL REVEAL ── */
function initReveal(){
  const els=document.querySelectorAll('.reveal-up,.reveal-left');
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:0.12});
  els.forEach(el=>io.observe(el));
  document.querySelectorAll('.hero-section .reveal-up').forEach(el=>el.classList.add('in'));
}

/* ── MARQUEE ── */
function initMarquee(){
  const t=document.querySelector('.marquee-track');
  if(t){const c=t.cloneNode(true);t.parentNode.appendChild(c);}
}

/* ── SUPPORT POPUP ── */
function openSupportPopup(){
  document.getElementById('supportPopup').classList.add('show');
}
function closeSupportPopup(e){
  if(e.target===e.currentTarget) document.getElementById('supportPopup').classList.remove('show');
}
function closeSupportPopupDirect(){
  document.getElementById('supportPopup').classList.remove('show');
}

/* ── ENTER/LEAVE APP ── */
function enterApp(){
  document.getElementById('landing').style.display='none';
  const app=document.getElementById('app');
  app.style.display='flex'; app.style.opacity='0';
  requestAnimationFrame(()=>{
    app.style.transition='opacity .4s ease'; app.style.opacity='1';
    setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(sizeCanvas)),80);
  });

}


function showLanding(){
  document.getElementById('app').style.display='none';
  const l=document.getElementById('landing');
  l.style.display=''; l.classList.add('vis');
  initReveal();
}

/* ── STATE ── */

const G={
  mode:'focus',total:1500,rem:1500,running:false,
  sess:0,focMin:0,locked:false,theme:'dark',
  cfg:{focus:25,short:5,long:15},
  spToken:null,spPlaying:false,spLiked:false,
  spShuf:false,spRep:false,spProg:0,spIdx:0,
  spDemo:false
};
const TRACKS=[
  {song:'Lofi Chill Beats',artist:'Study Music · Lo-Fi',dur:'3:24',art:'🎵'},
  {song:'Deep Focus',artist:'Ambient Works',dur:'4:12',art:'🎶'},
  {song:'Morning Coffee Jazz',artist:'Café Sessions',dur:'2:58',art:'🎷'},
  {song:'Rain & Keys',artist:'Nature Piano',dur:'5:00',art:'🌧'},
  {song:'Forest Dawn',artist:'Ambient Binaural',dur:'6:15',art:'🌿'},
];
let ticker=null,raf=null,spInt=null;
const COL={
  focus:{main:'hsl(42,92%,60%)',glow:'rgba(255,182,44,.24)',ring:'rgba(255,182,44,.06)'},
  short:{main:'hsl(168,56%,42%)',glow:'rgba(0,205,155,.17)',ring:'rgba(0,205,155,.05)'},
  long: {main:'hsl(250,56%,62%)',glow:'rgba(157,127,255,.17)',ring:'rgba(157,127,255,.05)'}
};
const LABLS={focus:'Focus',short:'Short break',long:'Long break'};
const DPR=window.devicePixelRatio||1;
const cv=document.getElementById('dc');
const cx=cv.getContext('2d');

/* ── THEME ── */
function setAppTheme(t){
  G.theme=t;
  document.body.classList.toggle('lm',t==='light');
  document.getElementById('ttDark').classList.toggle('on',t==='dark');
  document.getElementById('ttLight').classList.toggle('on',t==='light');
}

/* ── CANVAS ── */
function sizeCanvas(){
  const w=document.getElementById('dialWrap');if(!w)return;
  const sz=w.offsetWidth;
  cv.style.width=sz+'px';cv.style.height=sz+'px';
  cv.width=sz*DPR;cv.height=sz*DPR;
  cx.setTransform(1,0,0,1,0,0);cx.scale(DPR,DPR);draw();
}
window.addEventListener('resize',()=>{clearTimeout(window._rst);window._rst=setTimeout(sizeCanvas,80);});

function draw(){
  const W=cv.width/DPR,H=cv.height/DPR;
  cx.clearRect(0,0,W,H);
  const Cx=W/2,Cy=H/2,R=W*.44;
  const PI2=Math.PI*2,pct=1-(G.rem/G.total);
  const c=COL[G.mode],a0=-Math.PI/2;
  // Clean track ring — just a very faint circle, no ticks, no numbers
  cx.strokeStyle='rgba(255,255,255,.04)';cx.lineWidth=W*.018;cx.lineCap='round';
  cx.beginPath();cx.arc(Cx,Cy,R,a0,a0+PI2);cx.stroke();
  if(pct<1){
    const endA=a0+(1-pct)*PI2;
    cx.save();cx.strokeStyle=c.ring;cx.lineWidth=W*.055;cx.lineCap='round';
    cx.beginPath();cx.arc(Cx,Cy,R,a0,endA);cx.stroke();cx.restore();
    if(G.mode==='focus'){
      const g=cx.createLinearGradient(Cx-R,Cy,Cx+R,Cy);
      g.addColorStop(0,'hsl(36,80%,48%)');g.addColorStop(.5,'hsl(42,92%,62%)');g.addColorStop(1,'hsl(46,95%,68%)');
      cx.strokeStyle=g;
    }else cx.strokeStyle=c.main;
    cx.lineWidth=W*.02;cx.lineCap='round';
    cx.shadowColor=c.main;cx.shadowBlur=G.running?W*.055:W*.018;
    cx.beginPath();cx.arc(Cx,Cy,R,a0,endA);cx.stroke();cx.shadowBlur=0;
  }
  const na=a0+(1-pct)*PI2,nx=Cx+R*Math.cos(na),ny=Cy+R*Math.sin(na);
  cx.beginPath();cx.arc(nx,ny,W*.03,0,PI2);cx.fillStyle=c.glow;cx.fill();
  if(G.mode==='focus'){const dg=cx.createRadialGradient(nx-1,ny-1,0,nx,ny,W*.016);dg.addColorStop(0,'hsl(48,100%,78%)');dg.addColorStop(1,'hsl(36,85%,50%)');cx.fillStyle=dg;}
  else cx.fillStyle=c.main;
  cx.beginPath();cx.arc(nx,ny,W*.016,0,PI2);cx.shadowColor=c.main;cx.shadowBlur=W*.035;cx.fill();cx.shadowBlur=0;
  cx.beginPath();cx.arc(Cx,Cy,W*.01,0,PI2);cx.fillStyle=c.main.replace('hsl','hsla').replace(')',',0.45)');cx.fill();
  const m=Math.floor(G.rem/60).toString().padStart(2,'0');
  const s=(G.rem%60).toString().padStart(2,'0');
  document.getElementById('dM').textContent=m;
  document.getElementById('dS').textContent=s;
  document.getElementById('dtime').style.color=c.main;
  document.getElementById('dMode').textContent=LABLS[G.mode];
  document.getElementById('dSess').textContent=G.sess>0?'Session '+(G.sess+1):'';
  if(G.running)raf=requestAnimationFrame(draw);
}

/* ── TIMER ── */
function toggleTimer(){
  G.running=!G.running;
  document.getElementById('pIco').textContent=G.running?'⏸':'▶';
  document.getElementById('dCol').classList.toggle('tick',G.running);
  const pr=document.getElementById('pring');
  pr.style.borderColor=COL[G.mode].main;pr.classList.toggle('go',G.running);
  document.getElementById('playBtn').className='play-btn'+(G.mode==='short'?' brk':G.mode==='long'?' lng':'');
  if(G.running){draw();ticker=setInterval(()=>{if(G.rem>0)G.rem--;else{clearInterval(ticker);completeSess();}},1000);}
  else{clearInterval(ticker);cancelAnimationFrame(raf);}
}
function completeSess(){
  G.running=false;cancelAnimationFrame(raf);
  document.getElementById('pIco').textContent='▶';
  document.getElementById('dCol').classList.remove('tick');
  document.getElementById('pring').classList.remove('go');
  Audio.bell();draw();
  if(G.mode==='focus'){
    G.sess++;G.focMin+=G.cfg.focus;
    document.getElementById('sSess').textContent=G.sess;
    document.getElementById('sFoc').textContent=G.focMin+'m';
    showToast('🎉','Session complete!',G.sess%4===0?'Long break time':'Short break time');
    doConf();
  }else showToast('⚡','Break over','Back to work');
  const nxt=G.mode==='focus'?(G.sess%4===0?'long':'short'):'focus';
  const tabs=document.querySelectorAll('.mt');
  setTimeout(()=>setMode(nxt,tabs[['focus','short','long'].indexOf(nxt)]),1400);
}
function resetTimer(){
  clearInterval(ticker);cancelAnimationFrame(raf);
  G.running=false;G.rem=G.total;
  document.getElementById('pIco').textContent='▶';
  document.getElementById('dCol').classList.remove('tick');
  document.getElementById('pring').classList.remove('go');draw();
}
function skipSess(){clearInterval(ticker);cancelAnimationFrame(raf);completeSess();}
function setMode(mode,tab){
  G.mode=mode;G.total=G.cfg[mode]*60;G.rem=G.total;
  if(G.running){clearInterval(ticker);cancelAnimationFrame(raf);G.running=false;
    document.getElementById('pIco').textContent='▶';
    document.getElementById('dCol').classList.remove('tick');
    document.getElementById('pring').classList.remove('go');}
  document.querySelectorAll('.mt').forEach(t=>t.classList.remove('on'));
  if(tab)tab.classList.add('on');
  const c=COL[mode];
  document.getElementById('dialGlow').style.background=`radial-gradient(circle,${c.glow} 0%,transparent 65%)`;
  document.getElementById('pring').style.borderColor=c.main;
  document.getElementById('playBtn').className='play-btn'+(mode==='short'?' brk':mode==='long'?' lng':'');
  draw();
}
function doPreset(m,btn){
  G.cfg.focus=m;G.total=m*60;G.rem=m*60;
  clearInterval(ticker);cancelAnimationFrame(raf);G.running=false;
  document.getElementById('pIco').textContent='▶';
  document.getElementById('dCol').classList.remove('tick');
  document.getElementById('pring').classList.remove('go');
  document.querySelectorAll('.pr').forEach(b=>b.classList.remove('on'));
  if(btn)btn.classList.add('on');
  document.getElementById('customRow').style.display='none';
  document.getElementById('prCustom').classList.remove('on');
  draw();
}
function toggleCustom(forceClose){
  const row=document.getElementById('customRow'),btn=document.getElementById('prCustom');
  const open=row.style.display!=='none';
  if(forceClose===true||open){
    row.style.display='none';btn.classList.remove('on');
  }else{
    row.style.display='block';btn.classList.add('on');
    document.getElementById('manM').value=Math.floor(G.rem/60);
    document.getElementById('manS').value=G.rem%60;
  }
}
// Global Escape handler — always active
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    const row=document.getElementById('customRow');
    if(row&&row.style.display!=='none') toggleCustom(true);
  }
});
function adjManual(f,d){
  if(f==='m'){const e=document.getElementById('manM');e.value=Math.max(0,Math.min(180,(parseInt(e.value)||0)+d));}
  else{const e=document.getElementById('manS');let v=(parseInt(e.value)||0)+d;if(v<0)v=55;if(v>59)v=0;e.value=v;}
}
function applyManual(){
  const m=parseInt(document.getElementById('manM').value)||0;
  const s=parseInt(document.getElementById('manS').value)||0;
  const t=m*60+s;
  if(t<1){showToast('⚠️','Invalid time','Enter at least 1 second');return;}
  clearInterval(ticker);cancelAnimationFrame(raf);
  G.running=false;G.total=t;G.rem=t;G.cfg.focus=m;
  document.getElementById('pIco').textContent='▶';
  document.getElementById('dCol').classList.remove('tick');
  document.getElementById('pring').classList.remove('go');
  document.querySelectorAll('.pr').forEach(b=>b.classList.remove('on'));
  document.getElementById('prCustom').classList.add('on');
  document.getElementById('customRow').style.display='none';
  draw();showToast('⏱','Timer set',`${m}m${s?' '+s+'s':''}`);
}

/* ── AMBIENT ── */
const AMB_NAMES={rain:'Rain',forest:'Forest',cafe:'Café',waves:'Ocean',fire:'Fireplace'};
function playAmb(type,btn){
  document.querySelectorAll('.amb').forEach(b=>b.classList.remove('on'));
  if(btn)btn.classList.add('on');
  Audio.play(type);
  document.getElementById('eqRow').style.display='flex';
  document.getElementById('eqLbl').textContent=AMB_NAMES[type]||type;
  document.querySelectorAll('.eq-b').forEach(b=>b.classList.add('live'));
}
function stopAmb(){
  document.querySelectorAll('.amb').forEach(b=>b.classList.remove('on'));
  document.querySelector('.amb-off')?.classList.add('on');
  Audio.stop();
  document.getElementById('eqRow').style.display='none';
  document.querySelectorAll('.eq-b').forEach(b=>b.classList.remove('live'));
}
function setAmbVol(v){document.getElementById('ambVolVal').textContent=Math.round(v)+'%';Audio.setVolume(v/100);}
function toggleMute(){const btn=document.getElementById('muteBtn'),muted=btn.textContent==='🔕';Audio.setMuted(!muted);btn.textContent=muted?'🔔':'🔕';}

/* ── FOCUS LOCK — HARD BLOCK ── */
function setLock(on){
  G.locked=on;
  document.getElementById('ltFree').classList.toggle('on',!on);
  document.getElementById('ltLock').classList.toggle('on',on);
  if(on)showToast('🔒','Focus Lock ON','You cannot leave this page during a session');
  else showToast('🔓','Focus Lock OFF','You can now navigate freely');
}

let _lockVisible=false;

function showLockWall(){
  if(_lockVisible)return;
  _lockVisible=true;
  updateLockTime();
  document.getElementById('app').style.filter='blur(6px)';
  document.getElementById('app').style.pointerEvents='none';
  document.getElementById('lockWall').classList.add('show');
  // Start updating time on the lock screen
  window._lockIv=setInterval(updateLockTime,1000);
}

function updateLockTime(){
  const m=Math.floor(G.rem/60).toString().padStart(2,'0');
  const s=(G.rem%60).toString().padStart(2,'0');
  const el=document.getElementById('lockRem');
  if(el)el.textContent=m+':'+s+' remaining';
}

function dismissLockFull(){
  // Only lets user back IN — doesn't disable lock
  document.getElementById('lockWall').classList.remove('show');
  document.getElementById('app').style.filter='';
  document.getElementById('app').style.pointerEvents='';
  clearInterval(window._lockIv);
  _lockVisible=false;
}

function exitLockFull(){
  // Disables lock AND closes wall
  setLock(false);
  dismissLockFull();
}

// ── FOCUS LOCK ──
// ONLY fires when user tries to CLOSE/LEAVE the page entirely.
// Switching tabs is fine — we do NOT interrupt that.

// Browser native "Leave site?" dialog (same as Google Docs unsaved changes)
// This fires when: closing tab, closing browser, typing new URL, clicking external link
window.addEventListener('beforeunload', e => {
  if (G.locked && G.running) {
    e.preventDefault();
    e.returnValue = 'Your focus session is running. If you leave, your session progress will be lost.';
    return e.returnValue;
  }
});

// Block back/forward navigation while locked (would leave the page)
history.pushState(null, '', window.location.href);
window.addEventListener('popstate', () => {
  if (G.locked && G.running) {
    history.pushState(null, '', window.location.href);
    // Show our overlay briefly so user knows why back didn't work
    showLockWall();
  }
});

/* ── MUSIC PANEL ── */
// Spotify Web API requires Premium for playback control.
// Instead we offer quick-launch links to music apps in a new tab,
// so the user never has to leave FocusFlow.

function openMusic(url){
  window.open(url,'_blank','noopener');
  showToast('🎵','Music opened','Switch back here to keep focusing');
}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function tryFS(){document.documentElement.requestFullscreen?.();}

/* ── TOAST ── */
function showToast(ico,t1,t2){
  document.getElementById('tIco').textContent=ico;document.getElementById('tT1').textContent=t1;document.getElementById('tT2').textContent=t2;
  const el=document.getElementById('toast');el.style.display='block';clearTimeout(el._t);el._t=setTimeout(()=>el.style.display='none',3400);
}

/* ── CONFETTI ── */
function doConf(){
  const cl=document.getElementById('conf');cl.style.display='block';cl.innerHTML='';
  const cs=['hsl(42,90%,60%)','hsl(38,80%,50%)','hsl(250,58%,64%)','hsl(168,55%,46%)','hsl(46,95%,68%)'];
  for(let i=0;i<52;i++){const d=document.createElement('div');d.className='cp';d.style.cssText=`left:${8+Math.random()*84}%;top:-5px;background:${cs[i%cs.length]};animation-delay:${(Math.random()*.55).toFixed(2)}s;animation-duration:${(1.8+Math.random()*.6).toFixed(2)}s`;cl.appendChild(d);}
  setTimeout(()=>cl.style.display='none',3200);
}

/* ── NAV ── */
function nav(v,btn){
  document.getElementById('vTimer').style.display=v==='timer'?'grid':'none';
  document.getElementById('vSettings').style.display=v==='settings'?'block':'none';
  document.querySelectorAll('.an').forEach((b,i)=>b.classList.toggle('on',['timer','settings'][i]===v));
  document.querySelectorAll('.mn').forEach((b,i)=>b.classList.toggle('on',['timer','settings'][i]===v));
  if(v==='settings')buildSettings();
  if(v==='timer')setTimeout(sizeCanvas,50);
}

/* ── SETTINGS ── */
function buildSettings(){
  const durs=[
    {k:'focus',l:'Focus',st:5,mn:5,mx:120},
    {k:'short',l:'Short break',st:1,mn:1,mx:30},
    {k:'long', l:'Long break', st:5,mn:5,mx:60}
  ];
  document.getElementById('durRows').innerHTML=durs.map(r=>`
    <div class="dur-row">
      <span class="dur-lbl">${r.l}</span>
      <div class="dur-ctrl">
        <button class="dur-btn" onclick="adjCfg('${r.k}',-${r.st})">−</button>
        <span class="dur-val" id="cfg_${r.k}">${G.cfg[r.k]}m</span>
        <button class="dur-btn" onclick="adjCfg('${r.k}',${r.st})">+</button>
      </div>
    </div>`).join('');
  const themes=[
    {k:'default',l:'🟡 Default', a:'hsl(42,90%,55%)', b:'hsl(36,68%,30%)'},
    {k:'forest', l:'🌿 Forest',  a:'hsl(148,55%,40%)',b:'hsl(165,48%,18%)'},
    {k:'dusk',   l:'🌆 Dusk',   a:'hsl(280,55%,55%)',b:'hsl(238,40%,24%)'},
    {k:'ocean',  l:'🌊 Ocean',  a:'hsl(208,70%,52%)',b:'hsl(218,50%,24%)'},
  ];
  document.getElementById('themeRow').innerHTML=themes.map(t=>`<button class="theme-pill" style="background:linear-gradient(135deg,${t.b},${t.a});min-width:100px" onclick="applyTheme('${t.k}')">${t.l}</button>`).join('');

}
function adjCfg(k,d){
  const mn={focus:5,short:1,long:5},mx={focus:120,short:30,long:60};
  G.cfg[k]=Math.max(mn[k],Math.min(mx[k],G.cfg[k]+d));
  const el=document.getElementById('cfg_'+k);if(el)el.textContent=G.cfg[k]+'m';
  if(G.mode===k&&!G.running){G.total=G.cfg[k]*60;G.rem=G.total;draw();}
}
function applyTheme(t){
  const th={default:{f:'hsl(42,92%,60%)',b:'hsl(168,56%,42%)',l:'hsl(250,56%,62%)'},forest:{f:'hsl(148,58%,46%)',b:'hsl(80,52%,42%)',l:'hsl(165,50%,54%)'},dusk:{f:'hsl(280,62%,62%)',b:'hsl(198,55%,48%)',l:'hsl(318,55%,58%)'},ocean:{f:'hsl(208,70%,54%)',b:'hsl(165,55%,42%)',l:'hsl(248,55%,60%)'}};
  const v=th[t];COL.focus.main=v.f;COL.short.main=v.b;COL.long.main=v.l;
  document.documentElement.style.setProperty('--gold',v.f);document.documentElement.style.setProperty('--teal',v.b);document.documentElement.style.setProperty('--purple',v.l);draw();
}



/* ── INIT ── */
document.getElementById('dateChip').textContent=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
document.getElementById('dialGlow').style.background='radial-gradient(circle,rgba(255,182,44,.24) 0%,transparent 65%)';
