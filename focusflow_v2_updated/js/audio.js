/**
 * FocusFlow Audio Engine v2
 * Forest, Café, Ocean, Fire → real MP3 files from sounds/
 * Rain → synthesised (no MP3 provided)
 */

const Audio = (() => {
  let ctx = null;
  let masterGain = null;
  let currentNodes = [];
  let currentSource = null;   // for MP3 AudioBufferSourceNode
  let currentType = null;
  let volume = 0.4;
  let muted = false;
  const bufferCache = {};     // cache decoded audio buffers

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function makeMaster() {
    const ac = getCtx();
    masterGain = ac.createGain();
    masterGain.gain.value = muted ? 0 : volume;
    masterGain.connect(ac.destination);
    return masterGain;
  }

  function stopAll() {
    currentNodes.forEach(n => { try { n.stop(); } catch(e){} });
    if (currentSource) { try { currentSource.stop(); } catch(e){} currentSource = null; }
    if (masterGain) { try { masterGain.disconnect(); } catch(e){} }
    currentNodes = [];
    masterGain = null;
    currentType = null;
  }

  // ── MP3 LOADER ──────────────────────────────────────────
  async function loadAndPlay(filename, out) {
    const ac = getCtx();
    try {
      // Check cache first
      if (!bufferCache[filename]) {
        const resp = await fetch(`sounds/${filename}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const arrayBuf = await resp.arrayBuffer();
        bufferCache[filename] = await ac.decodeAudioData(arrayBuf);
      }
      const buf = bufferCache[filename];
      const src = ac.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      // Fade in
      const fade = ac.createGain();
      fade.gain.setValueAtTime(0, ac.currentTime);
      fade.gain.linearRampToValueAtTime(1, ac.currentTime + 1.5);
      src.connect(fade);
      fade.connect(out);
      src.start();
      currentSource = src;
    } catch(e) {
      console.warn(`Could not load sounds/${filename}:`, e.message);
      // Fallback to synthesis if MP3 fails
      return false;
    }
    return true;
  }

  // ── SYNTHESIS HELPERS ──────────────────────────────────
  function whiteNoise(ac, durationSec = 3) {
    const buf = ac.createBuffer(1, ac.sampleRate * durationSec, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    return src;
  }

  function burst(ac, dest, freq, type, gainVal, startTime, duration) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(gainVal, startTime + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    o.connect(g); g.connect(dest);
    o.start(startTime); o.stop(startTime + duration + 0.01);
  }

  function scheduleBursts(ac, dest, opts, activeRef) {
    const { freqMin, freqMax, gainMin, gainMax, durMin, durMax, intervalMin, intervalMax, type } = opts;
    function fire() {
      if (!activeRef.alive) return;
      const now = ac.currentTime;
      burst(ac, dest,
        freqMin + Math.random() * (freqMax - freqMin),
        type || 'sine',
        gainMin + Math.random() * (gainMax - gainMin),
        now + 0.01,
        durMin + Math.random() * (durMax - durMin)
      );
      setTimeout(fire, (intervalMin + Math.random() * (intervalMax - intervalMin)) * 1000);
    }
    fire();
  }

  // ── RAIN (synthesised — no MP3) ─────────────────────────
  function startRain(ac, out) {
    const noise = whiteNoise(ac, 4);
    const hiPass = ac.createBiquadFilter();
    hiPass.type = 'highpass'; hiPass.frequency.value = 400;
    const bandPass = ac.createBiquadFilter();
    bandPass.type = 'bandpass'; bandPass.frequency.value = 1200; bandPass.Q.value = 0.6;
    noise.connect(hiPass); hiPass.connect(bandPass); bandPass.connect(out);
    noise.start(); currentNodes.push(noise);

    const clickGain = ac.createGain(); clickGain.gain.value = 0.18; clickGain.connect(out);
    const ref = { alive: true };
    scheduleBursts(ac, clickGain, {
      freqMin:1800,freqMax:4000,gainMin:.05,gainMax:.18,
      durMin:.008,durMax:.025,intervalMin:.04,intervalMax:.18,type:'sine'
    }, ref);
    currentNodes.push({ stop: () => { ref.alive = false; } });
  }

  // ── FOREST fallback (synthesised) ────────────────────────
  function startForestSynth(ac, out) {
    const wind = whiteNoise(ac, 5);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320; lp.Q.value = 0.5;
    const windGain = ac.createGain(); windGain.gain.value = 0.55;
    wind.connect(lp); lp.connect(windGain); windGain.connect(out);
    wind.start(); currentNodes.push(wind);
    const lfo = ac.createOscillator(); const lfoGain = ac.createGain();
    lfo.type='sine'; lfo.frequency.value=0.12; lfoGain.gain.value=0.25;
    lfo.connect(lfoGain); lfoGain.connect(windGain.gain); lfo.start(); currentNodes.push(lfo);
    const birdGain = ac.createGain(); birdGain.gain.value=0.12; birdGain.connect(out);
    const ref={alive:true};
    scheduleBursts(ac,birdGain,{freqMin:2800,freqMax:5200,gainMin:.06,gainMax:.14,durMin:.06,durMax:.18,intervalMin:1.2,intervalMax:4.5,type:'sine'},ref);
    currentNodes.push({stop:()=>{ref.alive=false;}});
  }

  // ── CAFÉ fallback ─────────────────────────────────────────
  function startCafeSynth(ac, out) {
    [650,980].forEach((freq,i)=>{
      const n=whiteNoise(ac,3+i); const bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=freq; bp.Q.value=1.4;
      const g=ac.createGain(); g.gain.value=0.32;
      n.connect(bp); bp.connect(g); g.connect(out); n.start(); currentNodes.push(n);
    });
    const ref={alive:true}; const cg=ac.createGain(); cg.gain.value=0.1; cg.connect(out);
    scheduleBursts(ac,cg,{freqMin:1100,freqMax:2200,gainMin:.04,gainMax:.10,durMin:.18,durMax:.55,intervalMin:1.5,intervalMax:6,type:'triangle'},ref);
    currentNodes.push({stop:()=>{ref.alive=false;}});
  }

  // ── OCEAN fallback ────────────────────────────────────────
  function startOceanSynth(ac, out) {
    const noise=whiteNoise(ac,6); const lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=600; lp.Q.value=0.4;
    const wg=ac.createGain(); wg.gain.value=0.5;
    noise.connect(lp); lp.connect(wg); wg.connect(out); noise.start(); currentNodes.push(noise);
    const lfo=ac.createOscillator(); const la=ac.createGain(); lfo.type='sine'; lfo.frequency.value=0.18; la.gain.value=0.45;
    lfo.connect(la); la.connect(wg.gain); lfo.start(); currentNodes.push(lfo);
  }

  // ── FIRE fallback ─────────────────────────────────────────
  function startFireSynth(ac, out) {
    const base=whiteNoise(ac,4); const lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=220; lp.Q.value=0.7;
    const bg=ac.createGain(); bg.gain.value=0.65;
    base.connect(lp); lp.connect(bg); bg.connect(out); base.start(); currentNodes.push(base);
    const ref={alive:true}; const pg=ac.createGain(); pg.gain.value=0.08; pg.connect(out);
    scheduleBursts(ac,pg,{freqMin:600,freqMax:1400,gainMin:.04,gainMax:.12,durMin:.005,durMax:.022,intervalMin:.06,intervalMax:.35,type:'sawtooth'},ref);
    currentNodes.push({stop:()=>{ref.alive=false;}});
  }

  // ── BELL ──────────────────────────────────────────────────
  function bell() {
    try {
      const ac = getCtx();
      [[1318,0,.007],[1047,.07,.005],[1568,.16,.004],[2093,.25,.003],[1318,.62,.005],[1047,1.1,.004]]
        .forEach(([f,t,v]) => {
          const o=ac.createOscillator(); const g=ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.type='sine'; o.frequency.value=f;
          const n=ac.currentTime+t;
          g.gain.setValueAtTime(0,n);
          g.gain.linearRampToValueAtTime(v,n+.009);
          g.gain.exponentialRampToValueAtTime(.0001,n+2.3);
          o.start(n); o.stop(n+2.5);
        });
    } catch(e) {}
  }

  function alert() {
    try {
      const ac=getCtx(); const o=ac.createOscillator(); const g=ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type='triangle'; o.frequency.value=480;
      g.gain.setValueAtTime(.06,ac.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.4);
      o.start(); o.stop(ac.currentTime+.45);
    } catch(e) {}
  }

  // ── PUBLIC API ─────────────────────────────────────────────
  return {
    async play(type) {
      stopAll();
      const ac = getCtx();
      const out = makeMaster();
      currentType = type;

      if (type === 'rain') {
        startRain(ac, out);
        return;
      }

      // Map type to MP3 filename
      const mp3Map = { forest:'forest.mp3', cafe:'cafe.mp3', waves:'ocean.mp3', fire:'fire.mp3' };
      const file = mp3Map[type];

      if (file) {
        const ok = await loadAndPlay(file, out);
        if (!ok) {
          // fallback to synthesis if MP3 failed (e.g. opened via file://)
          if (type==='forest') startForestSynth(ac,out);
          else if (type==='cafe') startCafeSynth(ac,out);
          else if (type==='waves') startOceanSynth(ac,out);
          else if (type==='fire') startFireSynth(ac,out);
        }
      }
    },
    stop() { stopAll(); },
    setVolume(v) {
      volume = Math.max(0, Math.min(1, v));
      if (masterGain && !muted) masterGain.gain.value = volume;
    },
    setMuted(m) {
      muted = m;
      if (masterGain) masterGain.gain.value = muted ? 0 : volume;
    },
    bell,
    alert,
    get currentType() { return currentType; }
  };
})();
