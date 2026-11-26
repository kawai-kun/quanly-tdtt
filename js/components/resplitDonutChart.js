// ==============================================================================
// LUCIAN UX/UI #097: DONUT THAT RE-SPLITS (CƠ CẤU BỘ MÔN THI ĐẤU)
// MIT License (c) 2026 Seokwoooo · Hệ thống Quản lý TDTT Phường Tân Khai
// ==============================================================================

import { state } from '../state.js';

export function renderResplitDonutHTML() {
  return `
    <div class="u097-card" id="u097_sports_donut">
      <div class="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
        <div>
          <small class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cơ cấu bộ môn thi đấu</small>
          <b class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white block mt-0.5">Tỷ trọng giải theo môn thể thao</b>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
          Tương tác trực quan
        </span>
      </div>

      <div class="u097-dn">
        <svg viewBox="0 0 200 200" aria-hidden="true" id="u097_svg">
          <circle class="u097-trk" cx="100" cy="100" r="70"/>
        </svg>
        <div class="u097-c" id="u097_center" aria-live="polite">
          <small id="u097_center_small">Tổng cộng</small>
          <b id="u097_center_big">0</b>
          <span id="u097_center_sub">giải đấu</span>
        </div>
      </div>

      <div class="u097-lg" id="u097_legend" role="group" aria-label="Bộ môn thi đấu"></div>
    </div>
  `;
}

export function initResplitDonut(acts) {
  const root = document.getElementById('u097_sports_donut');
  if (!root) return;

  const svg = document.getElementById('u097_svg');
  const cs = document.getElementById('u097_center_small');
  const cb = document.getElementById('u097_center_big');
  const cp = document.getElementById('u097_center_sub');
  const lg = document.getElementById('u097_legend');
  const center = document.getElementById('u097_center');

  if (!svg || !cs || !cb || !cp || !lg) return;

  // Xóa các phần tử cũ nếu đã khởi tạo
  svg.querySelectorAll('.u097-sg').forEach(el => el.remove());
  lg.innerHTML = '';

  const activities = acts || state.activities || [];
  if (activities.length === 0) return;

  // Thống kê số lượng giải theo môn
  const counts = {};
  activities.forEach(a => {
    const s = a.sport || 'Khác';
    counts[s] = (counts[s] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const palette = ['#059669', '#0284c7', '#d97706', '#7c3aed', '#db2777', '#10b981', '#f59e0b', '#6366f1'];

  // Lấy top 5 môn + môn khác
  let D = [];
  if (sorted.length <= 6) {
    D = sorted.map(([name, val], i) => [name, val, palette[i % palette.length]]);
  } else {
    const top5 = sorted.slice(0, 5);
    const otherVal = sorted.slice(5).reduce((sum, item) => sum + item[1], 0);
    D = top5.map(([name, val], i) => [name, val, palette[i]]);
    if (otherVal > 0) {
      D.push(['Môn khác', otherVal, '#64748b']);
    }
  }

  const R = 70;
  const C = 2 * Math.PI * R;
  const GAP = 3;
  let on = D.map(() => true);
  let fr = D.map(() => 0);
  let act = -1;
  let tw = 0;
  let shownTotal = 0;
  let cnt = 0;

  const segs = D.map((d, i) => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('class', 'u097-sg');
    c.setAttribute('cx', '100');
    c.setAttribute('cy', '100');
    c.setAttribute('r', String(R));
    c.style.stroke = d[2];
    c.addEventListener('pointerenter', () => focus(i));
    c.addEventListener('click', () => toggle(i));
    svg.appendChild(c);
    return c;
  });

  const items = D.map((d, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'u097-it';
    b.style.setProperty('--c', d[2]);
    b.setAttribute('aria-pressed', 'true');
    b.innerHTML = '<i aria-hidden="true"></i><span></span><small></small>';
    b.querySelector('span').textContent = d[0];
    b.querySelector('small').textContent = d[1] + ' giải';
    b.setAttribute('aria-label', d[0] + ' ' + d[1] + ' giải');
    b.addEventListener('pointerenter', () => focus(i));
    b.addEventListener('focus', () => focus(i));
    b.addEventListener('click', () => toggle(i));
    lg.appendChild(b);
    return b;
  });

  svg.addEventListener('pointerleave', () => focus(-1));
  lg.addEventListener('pointerleave', () => {
    if (!lg.contains(document.activeElement)) focus(-1);
  });

  function total() {
    return D.reduce((s, d, i) => s + (on[i] ? d[1] : 0), 0);
  }

  function paint() {
    let acc = 0;
    segs.forEach((c, i) => {
      const len = fr[i] * C;
      const vis = Math.max(0, len - GAP);
      c.setAttribute('stroke-dasharray', vis.toFixed(2) + ' ' + C.toFixed(2));
      c.setAttribute('stroke-dashoffset', (-acc - GAP / 2).toFixed(2));
      const mid = (acc + len / 2) / C * Math.PI * 2;
      c.style.transform = (i === act && on[i]) 
        ? `translate(${(Math.cos(mid) * 7).toFixed(2)}px, ${(Math.sin(mid) * 7).toFixed(2)}px)` 
        : '';
      acc += len;
    });
  }

  function morph(stagger) {
    cancelAnimationFrame(tw);
    const t = Math.max(1, total());
    const to = D.map((d, i) => on[i] ? d[1] / t : 0);
    const from = fr.slice();
    const t0 = performance.now();
    const dur = stagger ? 1000 : 550;

    function f(n) {
      if (!root.isConnected) return;
      const k = Math.min(1, (n - t0) / dur);
      fr = from.map((v, i) => {
        const kk = stagger ? Math.max(0, Math.min(1, (k - i * 0.08) / 0.65)) : k;
        const e = kk < 0.5 ? 4 * kk * kk * kk : 1 - Math.pow(-2 * kk + 2, 3) / 2;
        return v + (to[i] - v) * e;
      });
      paint();
      if (k < 1) tw = requestAnimationFrame(f);
    }
    tw = requestAnimationFrame(f);
  }

  function rollTotal(to) {
    const from = shownTotal;
    const t0 = performance.now();
    const dur = 500;
    const my = ++cnt;

    function f(n) {
      if (!root.isConnected || my !== cnt || act >= 0) return;
      const k = Math.min(1, (n - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      shownTotal = Math.round(from + (to - from) * e);
      cb.textContent = shownTotal;
      if (k < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }

  function label() {
    center.classList.remove('sw');
    void center.offsetWidth;
    center.classList.add('sw');

    if (act >= 0 && on[act]) {
      cs.textContent = D[act][0];
      cb.textContent = D[act][1];
      const tot = Math.max(1, total());
      cp.textContent = Math.round(D[act][1] / tot * 100) + '% tổng số';
    } else {
      const n = on.filter(Boolean).length;
      cs.textContent = n === D.length ? 'Tổng số giải' : `${n} môn đã chọn`;
      cb.textContent = shownTotal;
      const grandTotal = D.reduce((s, d) => s + d[1], 0);
      cp.textContent = n === D.length ? '100% phong trào' : `trên tổng ${grandTotal} giải`;
      rollTotal(total());
    }
  }

  function focus(i) {
    if (i === act) return;
    act = i;
    root.classList.toggle('has', i >= 0 && on[i]);
    segs.forEach((c, k) => c.classList.toggle('on', k === i && on[k]));
    items.forEach((b, k) => b.classList.toggle('on', k === i && on[k]));
    label();
    paint();
  }

  function toggle(i) {
    if (on.filter(Boolean).length === 1 && on[i]) return;
    on[i] = !on[i];
    items[i].setAttribute('aria-pressed', String(on[i]));
    morph(false);
    label();
  }

  shownTotal = total();
  cb.textContent = shownTotal;
  morph(true);
  label();
}
