const ITEMS = [
  { n: 'Blue lagoon', label: 'Blue Lagoon', c: '#19a7ce', t: '#fff', w: 1, bar: '#19a7ce' },
  { n: 'Not this time', label: 'Not This Time', c: '#f3e8d0', t: '#4a3b2a' },
  { n: 'Brosted chicken', label: 'Brosted Chicken', c: '#f0902b', t: '#2a1500', w: 1, bar: '#f0902b' },
  { n: 'Not this time', label: 'Not This Time', c: '#e5d4b0', t: '#4a3b2a' },
  { n: 'Pepsi', label: 'Pepsi', c: '#1e46a8', t: '#fff', w: 1, bar: '#4a7cf0' },
  { n: 'Not this time', label: 'Not This Time', c: '#f3e8d0', t: '#4a3b2a' }
];

const WIN_DATA = {
  'Blue lagoon': {
    title: 'Blue Lagoon',
    sub: 'Chill Mode Unlocked',
    desc: 'A refreshing Blue Lagoon mocktail is all yours. Sip slowly and savor every drop.',
    label: 'Signature Mocktail',
    color: '#19a7ce',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h8"/><path d="M12 15v7"/><path d="m19 3-7 8-7-8Z"/></svg>`
  },
  'Brosted chicken': {
    title: 'Brosted Chicken',
    sub: 'Crunch Time Winner',
    desc: 'Brosted Chicken is yours! Golden, crispy, and freshly seasoned for you.',
    label: 'Crispy Delicacy',
    color: '#f0902b',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M4 14a8 8 0 0 1 16 0"/><line x1="2" y1="18" x2="22" y2="18"/><line x1="12" y1="2" x2="12" y2="4"/></svg>`
  },
  'Pepsi': {
    title: 'Ice-Cold Pepsi',
    sub: 'Pure Refreshment',
    desc: 'A chilled Pepsi is yours. Crack it open and enjoy the crisp fizz.',
    label: 'Chilled Beverage',
    color: '#1e46a8',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="3" width="10" height="18" rx="4"/><line x1="10" y1="7" x2="14" y2="7"/></svg>`
  }
};

const LOSE_MESSAGES = [
  'So close! Give the wheel another spin and taste your luck.',
  'Almost had it! Fortune favors another spin.',
  'Warm-up round complete. Your lucky spin is right around the corner.',
  'Not quite this time, but the cafe wheel never stays quiet for long.'
];

const WIN_BADGE_ICON = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2a1600" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`;

const LOSE_BADGE_ICON = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>`;

const $ = id => document.getElementById(id);
const cv = $('wheel'), ctx = cv.getContext('2d'), SEG = 360 / ITEMS.length;
let rot = 0, busy = false, state = { history: [], counts: {} };

try {
  const s = JSON.parse(localStorage.getItem('cc_state') || 'null');
  if (s && s.history && s.counts) state = s;
} catch (e) {}

const save = () => {
  try {
    localStorage.setItem('cc_state', JSON.stringify(state));
  } catch (e) {}
};

// Rim bulbs generator
for (let i = 0; i < 24; i++) {
  const a = (i / 24) * 2 * Math.PI;
  const b = document.createElement('span');
  b.className = 'bulb';
  b.style.left = (50 + 47 * Math.sin(a)) + '%';
  b.style.top = (50 - 47 * Math.cos(a)) + '%';
  $('rim').appendChild(b);
}

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

    ctx.beginPath();
    ctx.moveTo(r, r);
    ctx.arc(r, r, r, a0, a0 + seg);
    ctx.closePath();
    ctx.fillStyle = it.c;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.28)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(r, r);
    ctx.rotate(a0 + seg / 2);
    ctx.fillStyle = it.t;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.round(s * 0.046)}px 'DM Sans', sans-serif`;

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

    if (lines.length === 1) {
      ctx.fillText(lines[0], r * 0.62, 0);
    } else {
      ctx.fillText(lines[0], r * 0.62, -s * 0.026);
      ctx.fillText(lines[1], r * 0.62, s * 0.026);
    }
    ctx.restore();

    ctx.beginPath();
    ctx.arc(r + r * 0.965 * Math.cos(a0), r + r * 0.965 * Math.sin(a0), s * 0.012, 0, 7);
    ctx.fillStyle = '#ffe9a8';
    ctx.fill();
  });
}

function spin() {
  if (busy) return;
  busy = true;
  $('spin').disabled = true;
  $('spin').textContent = 'Spinning...';
  $('stage').classList.add('spinning');

  const i = Math.floor(Math.random() * ITEMS.length);
  const jit = (Math.random() - 0.5) * SEG * 0.7;
  const want = ((-(i + 0.5) * SEG - jit) % 360 + 360) % 360;
  const delta = ((want - (rot % 360)) + 360) % 360;

  rot += 360 * (5 + Math.floor(Math.random() * 3)) + delta;
  cv.style.transform = `rotate(${rot}deg)`;

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
  $('spin').textContent = it.w ? 'Spin again' : 'Try again';
  busy = false;

  render();
  showModalResult(it);
}

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
    swatch.style.background = data.color;
    swatch.innerHTML = data.icon;
    voucher.style.display = 'flex';
    pBtn.textContent = 'Spin Again';
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
      : LOSE_MESSAGES[Math.floor(Math.random() * LOSE_MESSAGES.length)];
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

function render() {
  const h = $('hist');
  h.innerHTML = state.history.length ? '' : '<p class="empty">No spins yet. Your first spin starts the story.</p>';

  state.history.forEach(e => {
    const it = ITEMS.find(x => x.n.toLowerCase() === e.n.toLowerCase()) || ITEMS[0];
    const li = document.createElement('li');
    li.innerHTML = `<span class="dot" style="background:${e.w ? it.bar : '#8a8f8a'}"></span><span class="val"></span><time></time>`;
    li.children[1].textContent = it.label || e.n;
    li.children[2].textContent = new Date(e.t).toLocaleString([], {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
    h.appendChild(li);
  });

  const rows = [...ITEMS.filter(x => x.w), { n: 'Not this time', label: 'Not this time', bar: '#9a9a8a', dim: 1 }];
  const total = Object.values(state.counts).reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...rows.map(r => state.counts[r.n] || 0));

  $('total').textContent = total + (total === 1 ? ' spin' : ' spins');
  $('tally').innerHTML = rows.map(r => {
    const c = state.counts[r.n] || 0;
    return `<div class="row${r.dim ? ' dim' : ''}"><span>${r.label || r.n}</span><div class="track"><div class="fill" style="width:${(c / max) * 100}%;background:${r.bar}"></div></div><span class="num">${c}</span></div>`;
  }).join('');
}

function confetti() {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const c = $('fx');
  const x = c.getContext('2d');
  c.width = innerWidth;
  c.height = innerHeight;
  const cols = ['#ffc24b', '#ff6b4a', '#19a7ce', '#f6ecd6', '#4a7cf0'];
  const P = Array.from({ length: 120 }, () => ({
    x: innerWidth / 2,
    y: innerHeight * 0.4,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 14 - 4,
    s: Math.random() * 8 + 4,
    c: cols[Math.random() * 5 | 0],
    r: Math.random() * 6,
    vr: (Math.random() - 0.5) * 0.4
  }));

  let f = 0;
  (function t() {
    x.clearRect(0, 0, c.width, c.height);
    P.forEach(p => {
      p.vy += 0.35;
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
    if (++f < 130) {
      requestAnimationFrame(t);
    } else {
      x.clearRect(0, 0, c.width, c.height);
    }
  })();
}

// Event Listeners
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

addEventListener('resize', draw);
draw();
render();
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(draw);
}
