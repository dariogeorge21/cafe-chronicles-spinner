// ==========================================================================
// Cafe Chronicles - Modern Wheel & UI Logic
// ==========================================================================

const ITEMS = [
  {
    n: 'Virgin Mojito',
    label: 'Virgin Mojito',
    c: '#0284c7',
    cGradStart: '#0284c7',
    cGradEnd: '#38bdf8',
    t: '#ffffff',
    w: 1,
    bar: '#0ea5e9',
    category: 'DRINK'
  },
  {
    n: 'Not this time',
    label: 'Not This Time',
    c: '#1a2b30',
    cGradStart: '#1a2b30',
    cGradEnd: '#0f1a1d',
    t: '#f8fafc',
    w: 0,
    bar: '#64748b'
  },
  {
    n: 'Brosted chicken',
    label: 'Brosted Chicken',
    c: '#d97706',
    cGradStart: '#d97706',
    cGradEnd: '#f59e0b',
    t: '#ffffff',
    w: 1,
    bar: '#f59e0b',
    category: 'BITE'
  },
  {
    n: 'Not this time',
    label: 'Not This Time',
    c: '#1e3036',
    cGradStart: '#1e3036',
    cGradEnd: '#111e22',
    t: '#f8fafc',
    w: 0,
    bar: '#64748b'
  },
  {
    n: 'Pepsi',
    label: 'Pepsi',
    c: '#1d4ed8',
    cGradStart: '#1d4ed8',
    cGradEnd: '#3b82f6',
    t: '#ffffff',
    w: 1,
    bar: '#3b82f6',
    category: 'CHILLED'
  },
  {
    n: 'Not this time',
    label: 'Not This Time',
    c: '#1a2b30',
    cGradStart: '#1a2b30',
    cGradEnd: '#0f1a1d',
    t: '#f8fafc',
    w: 0,
    bar: '#64748b'
  }
];

const WIN_DATA = {
  'Blue lagoon': {
    title: 'Blue Lagoon',
    sub: 'Chill Mode Unlocked',
    desc: 'A refreshing handcrafted Blue Lagoon mocktail is all yours. Sip slowly and savor every drop.',
    label: 'Signature Mocktail',
    color: '#0ea5e9',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h8"/><path d="M12 15v7"/><path d="m19 3-7 8-7-8Z"/></svg>`
  },
  'Brosted chicken': {
    title: 'Brosted Chicken',
    sub: 'Crunch Time Winner',
    desc: 'Golden, crispy, and cooked to seasoned perfection. Brosted Chicken is yours to claim.',
    label: 'Crispy Delicacy',
    color: '#f59e0b',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M4 14a8 8 0 0 1 16 0"/><line x1="2" y1="18" x2="22" y2="18"/><line x1="12" y1="2" x2="12" y2="4"/></svg>`
  },
  'Pepsi': {
    title: 'Ice-Cold Pepsi',
    sub: 'Pure Refreshment',
    desc: 'An ice-cold Pepsi is waiting for you. Pop it open and celebrate your winning spin.',
    label: 'Chilled Beverage',
    color: '#3b82f6',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="3" width="10" height="18" rx="4"/><line x1="10" y1="7" x2="14" y2="7"/></svg>`
  }
};

const LOSE_MESSAGES = [
  'So close! Give the wheel another spin and taste your luck.',
  'Almost had it! Fortune favors another spin.',
  'Warm-up round complete. Your lucky spin is right around the corner.',
  'Not quite this time, but the cafe wheel never stays quiet for long.'
];

const WIN_BADGE_ICON = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2b1800" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`;

const LOSE_BADGE_ICON = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>`;

const $ = id => document.getElementById(id);
const cv = $('wheel');
const ctx = cv.getContext('2d');
const SEG = 360 / ITEMS.length;

let rot = 0;
let busy = false;
let state = { history: [], counts: {} };

// Persistent state
try {
  const s = JSON.parse(localStorage.getItem('cc_state') || 'null');
  if (s && s.history && s.counts) state = s;
} catch (e) {}

const save = () => {
  try {
    localStorage.setItem('cc_state', JSON.stringify(state));
  } catch (e) {}
};

// ==========================================================================
// Web Audio Synthesizer Engine (Zero Dependencies)
// ==========================================================================
let audioCtx = null;
let soundEnabled = true;

try {
  soundEnabled = localStorage.getItem('cc_sound') !== 'false';
} catch (e) {}

function updateSoundUI() {
  const btn = $('sound-toggle');
  if (!btn) return;
  if (soundEnabled) {
    btn.classList.remove('muted');
    btn.setAttribute('aria-label', 'Mute sound effects');
  } else {
    btn.classList.add('muted');
    btn.setAttribute('aria-label', 'Unmute sound effects');
  }
}

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playTick(freq = 620) {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.035);
  } catch (e) {}
}

function playWinChime() {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  try {
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.09, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.55);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.55);
    });
  } catch (e) {}
}

// 24 Precision Bezel LEDs
const rim = $('rim');
for (let i = 0; i < 24; i++) {
  const a = (i / 24) * 2 * Math.PI;
  const b = document.createElement('span');
  b.className = 'bulb';
  b.style.left = (50 + 47.2 * Math.sin(a)) + '%';
  b.style.top = (50 - 47.2 * Math.cos(a)) + '%';
  rim.appendChild(b);
}

// ==========================================================================
// High-DPI Wheel Canvas Drawing
// ==========================================================================
function draw() {
  const s = cv.clientWidth;
  const d = window.devicePixelRatio || 1;
  const r = s / 2;
  const seg = (2 * Math.PI) / ITEMS.length;

  cv.width = cv.height = s * d;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  ctx.clearRect(0, 0, s, s);

  ITEMS.forEach((it, i) => {
    const a0 = -Math.PI / 2 + i * seg;
    const a1 = a0 + seg;
    const mid = a0 + seg / 2;

    // Slice shape
    ctx.beginPath();
    ctx.moveTo(r, r);
    ctx.arc(r, r, r - 2, a0, a1);
    ctx.closePath();

    // Luxury radial gradient per slice
    const grad = ctx.createRadialGradient(r, r, r * 0.15, r, r, r);
    if (it.w) {
      grad.addColorStop(0, it.cGradStart || it.c);
      grad.addColorStop(1, it.cGradEnd || it.c);
    } else {
      grad.addColorStop(0, it.cGradStart || '#182b30');
      grad.addColorStop(1, it.cGradEnd || '#0c1619');
    }
    ctx.fillStyle = grad;
    ctx.fill();

    // Spoke divider with gold reflection
    ctx.strokeStyle = 'rgba(255, 215, 120, 0.35)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Slice Text & Accent
    ctx.save();
    ctx.translate(r, r);
    ctx.rotate(mid);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = it.t;

    const label = it.label || it.n;
    let lines = [];
    if (label === 'Pepsi') {
      lines = ['Pepsi'];
    } else if (label === 'Not This Time') {
      lines = ['Not This', 'Time'];
    } else {
      const k = label.indexOf(' ');
      lines = k === -1 ? [label] : [label.slice(0, k), label.slice(k + 1)];
    }

    ctx.font = `700 ${Math.round(s * 0.046)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;

    if (lines.length === 1) {
      ctx.fillText(lines[0], r * 0.62, 0);
    } else {
      ctx.fillText(lines[0], r * 0.62, -s * 0.026);
      ctx.fillText(lines[1], r * 0.62, s * 0.026);
    }

    // Category / Accent Indicator near rim
    ctx.shadowBlur = 0;
    if (it.w && it.category) {
      ctx.font = `800 ${Math.round(s * 0.024)}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = 'rgba(255, 240, 200, 0.75)';
      ctx.fillText(it.category, r * 0.86, 0);
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.beginPath();
      ctx.arc(r * 0.86, 0, s * 0.007, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Outer rim divider gold peg
    ctx.save();
    const pegDist = r * 0.965;
    const px = r + pegDist * Math.cos(a0);
    const py = r + pegDist * Math.sin(a0);
    ctx.beginPath();
    ctx.arc(px, py, s * 0.013, 0, Math.PI * 2);
    ctx.fillStyle = '#ffeaa7';
    ctx.fill();
    ctx.strokeStyle = '#b8861d';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  });

  // Concentric inner & outer gold ring tracks
  ctx.beginPath();
  ctx.arc(r, r, r * 0.22, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 215, 120, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(r, r, r - 3, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 215, 120, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

// ==========================================================================
// Spin Physics & Dynamic Sound Ticks
// ==========================================================================
function spin() {
  if (busy) return;
  initAudio();

  busy = true;
  $('spin').disabled = true;
  $('spin').querySelector('.spin-label').textContent = 'Spinning...';
  $('stage').classList.add('spinning');

  const i = Math.floor(Math.random() * ITEMS.length);
  const jit = (Math.random() - 0.5) * SEG * 0.7;
  const want = ((-(i + 0.5) * SEG - jit) % 360 + 360) % 360;
  const delta = ((want - (rot % 360)) + 360) % 360;

  rot += 360 * (5 + Math.floor(Math.random() * 3)) + delta;
  cv.style.transform = `rotate(${rot}deg)`;

  // Synthesize realistic acoustic ticks as segments sweep past
  let tickCount = 0;
  const totalTicks = 32;
  const startTime = Date.now();
  const duration = 5200;

  function scheduleTick() {
    if (!busy) return;
    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / duration);

    playTick(580 + (1 - progress) * 140);
    tickCount++;

    if (progress < 0.96 && tickCount < totalTicks) {
      // Cubic ease-out delay between ticks
      const delay = 60 + Math.pow(progress, 2.4) * 380;
      setTimeout(scheduleTick, delay);
    }
  }

  scheduleTick();
  setTimeout(() => finish(i), 5300);
}

function streakLosses() {
  let n = 0;
  for (const h of state.history) {
    if (h.w) break;
    n++;
  }
  return n;
}

function finish(i) {
  const it = ITEMS[i];
  state.history.unshift({ n: it.n, t: Date.now(), w: !!it.w });
  state.history = state.history.slice(0, 100);
  state.counts[it.n] = (state.counts[it.n] || 0) + 1;
  save();

  $('stage').classList.remove('spinning');
  $('spin').disabled = false;
  $('spin').querySelector('.spin-label').textContent = it.w ? 'Spin Again' : 'Try Again';
  busy = false;

  render();
  showModalResult(it);
}

// ==========================================================================
// Result Modal Presentation
// ==========================================================================
function showModalResult(it) {
  const modal = $('result-modal');
  const badge = $('modal-badge');
  const tag = $('modal-tag');
  const title = $('modal-headline');
  const sub = $('modal-sub');
  const desc = $('modal-desc');
  const voucher = $('modal-voucher');
  const swatch = $('voucher-swatch');
  const vLabel = $('voucher-label');
  const vTitle = $('voucher-title');
  const vCode = $('voucher-code');
  const pBtn = $('modal-primary-btn');

  modal.classList.remove('is-win', 'is-lose', 'closing');

  if (it.w) {
    modal.classList.add('is-win');
    badge.innerHTML = WIN_BADGE_ICON;
    tag.textContent = 'Reward Unlocked';

    const data = WIN_DATA[it.n] || {
      title: it.label || it.n,
      sub: 'Winner',
      desc: 'You won a prize!',
      label: 'Cafe Reward',
      color: it.bar,
      icon: ''
    };

    title.textContent = data.title;
    sub.textContent = data.sub;
    desc.textContent = data.desc;
    vLabel.textContent = data.label;
    vTitle.textContent = data.title;

    // Generate authentic ticket voucher reference code
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    if (vCode) vCode.textContent = `CLAIM PASS #CC-${randomCode}`;

    swatch.style.background = data.color;
    swatch.innerHTML = data.icon;
    voucher.style.display = 'flex';
    pBtn.textContent = 'Spin Again';

    playWinChime();
    confetti();
  } else {
    modal.classList.add('is-lose');
    badge.innerHTML = LOSE_BADGE_ICON;
    tag.textContent = 'Better Luck';

    const st = streakLosses();
    title.textContent = 'Better Luck Next Spin';
    sub.textContent = st >= 3 ? 'Keep Going' : 'Warm-Up Spin';
    desc.textContent = st >= 3
      ? 'Three misses in a row means your luck is primed to turn on the next spin.'
      : LOSE_MESSAGES[Math.floor(Math.random()*LOSE_MESSAGES.length)];

    voucher.style.display = 'none';
    pBtn.textContent = 'Try Again';
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  setTimeout(() => pBtn.focus(), 120);
}

function closeModal(andSpin = false) {
  const modal = $('result-modal');
  if (!modal.classList.contains('open')) return;

  modal.classList.add('closing');
  modal.classList.remove('open');

  setTimeout(() => {
    modal.classList.remove('closing');
    modal.setAttribute('aria-hidden', 'true');
    $('spin').focus();
    if (andSpin) {
      spin();
    }
  }, 260);
}

// ==========================================================================
// Dashboard: Tally & History Rendering
// ==========================================================================
function formatRelativeTime(ts) {
  const diff = Date.now() - ts;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'Just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function render() {
  const h = $('hist');
  if (!state.history.length) {
    h.innerHTML = '<li class="empty-state">No spins yet. Your first spin starts the story!</li>';
  } else {
    h.innerHTML = '';
    state.history.forEach(e => {
      const it = ITEMS.find(x => x.n.toLowerCase() === e.n.toLowerCase()) || ITEMS[0];
      const li = document.createElement('li');
      li.className = 'hist-item';
      li.innerHTML = `
        <div class="hist-left">
          <span class="tally-dot" style="background:${e.w ? it.bar : '#64748b'}; color:${e.w ? it.bar : '#64748b'}"></span>
          <span class="hist-badge">${it.label || e.n}</span>
        </div>
        <time class="hist-time" title="${new Date(e.t).toLocaleString()}">${formatRelativeTime(e.t)}</time>
      `;
      h.appendChild(li);
    });
  }

  const rows = [...ITEMS.filter(x => x.w), { n: 'Not this time', label: 'Not this time', bar: '#64748b', dim: 1 }];
  const total = Object.values(state.counts).reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...rows.map(r => state.counts[r.n] || 0));

  $('total').textContent = total + (total === 1 ? ' spin' : ' spins');
  $('tally').innerHTML = rows.map(r => {
    const c = state.counts[r.n] || 0;
    const pct = ((c / max) * 100).toFixed(0);
    return `
      <div class="tally-card${r.dim ? ' dim' : ''}">
        <div class="tally-card-top">
          <div class="tally-item-meta">
            <span class="tally-dot" style="background:${r.bar}; color:${r.bar}"></span>
            <span class="tally-item-name">${r.label || r.n}</span>
          </div>
          <span class="tally-count">${c}</span>
        </div>
        <div class="tally-track">
          <div class="tally-fill" style="width:${pct}%; background:${r.bar}"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// Confetti Animation
// ==========================================================================
function confetti() {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const c = $('fx');
  const x = c.getContext('2d');
  c.width = innerWidth;
  c.height = innerHeight;

  const cols = ['#f5ba42', '#ffd36e', '#ff6b4a', '#0ea5e9', '#3b82f6', '#fff4d0'];
  const P = Array.from({ length: 130 }, () => ({
    x: innerWidth / 2,
    y: innerHeight * 0.42,
    vx: (Math.random() - 0.5) * 16,
    vy: -Math.random() * 15 - 4,
    s: Math.random() * 8 + 4,
    c: cols[Math.random() * cols.length | 0],
    r: Math.random() * 6,
    vr: (Math.random() - 0.5) * 0.4
  }));

  let f = 0;
  (function t() {
    x.clearRect(0, 0, c.width, c.height);
    P.forEach(p => {
      p.vy += 0.36;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      x.save();
      x.translate(p.x, p.y);
      x.rotate(p.r);
      x.fillStyle = p.c;
      x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      x.restore();
    });
    if (++f < 140) {
      requestAnimationFrame(t);
    } else {
      x.clearRect(0, 0, c.width, c.height);
    }
  })();
}

// ==========================================================================
// Dashboard Tab Switching
// ==========================================================================
function setupTabs() {
  const tabTally = $('tab-tally');
  const tabHist = $('tab-hist');
  const panelTally = $('panel-tally');
  const panelHist = $('panel-hist');

  if (!tabTally || !tabHist) return;

  tabTally.addEventListener('click', () => {
    tabTally.classList.add('active');
    tabTally.setAttribute('aria-selected', 'true');
    tabHist.classList.remove('active');
    tabHist.setAttribute('aria-selected', 'false');

    panelTally.classList.add('active');
    panelHist.classList.remove('active');
  });

  tabHist.addEventListener('click', () => {
    tabHist.classList.add('active');
    tabHist.setAttribute('aria-selected', 'true');
    tabTally.classList.remove('active');
    tabTally.setAttribute('aria-selected', 'false');

    panelHist.classList.add('active');
    panelTally.classList.remove('active');
  });
}

// ==========================================================================
// Event Listeners & Initialization
// ==========================================================================
$('spin').addEventListener('click', spin);

$('clear').addEventListener('click', () => {
  state = { history: [], counts: {} };
  save();
  render();
});

$('modal-close').addEventListener('click', () => closeModal(false));
$('modal-secondary-btn').addEventListener('click', () => closeModal(false));
$('modal-backdrop').addEventListener('click', () => closeModal(false));
$('modal-primary-btn').addEventListener('click', () => closeModal(true));

window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('result-modal').classList.contains('open')) {
    closeModal(false);
  }
});

// Sound toggle
const soundBtn = $('sound-toggle');
if (soundBtn) {
  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    try {
      localStorage.setItem('cc_sound', soundEnabled ? 'true' : 'false');
    } catch (e) {}
    updateSoundUI();
    if (soundEnabled) playTick(700);
  });
  updateSoundUI();
}

setupTabs();
addEventListener('resize', draw);
draw();
render();

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(draw);
}
