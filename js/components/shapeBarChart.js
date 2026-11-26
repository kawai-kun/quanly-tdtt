// ==============================================================================
// LUCIAN UX/UI #095: BAR CHART THAT CHANGES SHAPE (TIẾN ĐỘ HUY ĐỘNG VĐV)
// MIT License (c) 2026 Seokwoooo · Hệ thống Quản lý TDTT Phường Tân Khai
// ==============================================================================

import { state } from '../state.js';

export function renderShapeBarHTML() {
  return `
    <div class="u095-card" id="u095_vvd_barchart">
      <div class="u095-h">
        <div>
          <div class="u095-top">
            <small class="u095-lab" id="u095_label">Cả năm 2026</small>
            <span class="u095-dl" id="u095_delta">+152% chỉ tiêu</span>
          </div>
          <div class="u095-v">
            <b id="u095_big_val">0</b>
            <span class="text-xs font-semibold text-slate-400 ml-1">Lượt VĐV</span>
          </div>
        </div>
        <div class="u095-seg" role="group" aria-label="Chu kỳ thống kê">
          <button type="button" aria-pressed="false" onclick="window.setShapeBarPeriod(0)">W</button>
          <button type="button" aria-pressed="true" onclick="window.setShapeBarPeriod(1)">M</button>
          <button type="button" aria-pressed="false" onclick="window.setShapeBarPeriod(2)">Q</button>
        </div>
      </div>

      <div class="u095-ch" id="u095_chart_container">
        <div class="u095-grid" aria-hidden="true" id="u095_grid"></div>
        <div class="u095-bars" role="group" aria-label="Thanh biểu đồ VĐV" id="u095_bars"></div>
        <div class="u095-avg" aria-hidden="true" id="u095_avg"><span>Avg</span></div>
        <div class="u095-tip" aria-hidden="true" id="u095_tip"><span></span><small></small></div>
      </div>
    </div>
  `;
}

let currentPeriod = 1; // 0: Tuần (W), 1: Tháng (M), 2: Quý (Q)
let chartDataset = [];
let barsElements = [];
let gridLines = [];
let drawFn = null;

export function setShapeBarPeriod(periodIndex) {
  if (drawFn) {
    drawFn(periodIndex, false);
  }
}
window.setShapeBarPeriod = setShapeBarPeriod;

export function initShapeBarChart(acts) {
  const root = document.getElementById('u095_vvd_barchart');
  if (!root) return;

  const lab = document.getElementById('u095_label');
  const big = document.getElementById('u095_big_val');
  const dl = document.getElementById('u095_delta');
  const segs = root.querySelectorAll('.u095-seg button');
  const grid = document.getElementById('u095_grid');
  const bars = document.getElementById('u095_bars');
  const avg = document.getElementById('u095_avg');
  const tip = document.getElementById('u095_tip');
  const ch = document.getElementById('u095_chart_container');

  if (!lab || !big || !bars || !grid || !avg || !tip) return;

  const activities = acts || state.activities || [];

  // Tính số lượng VĐV theo 12 tháng
  const monthVdv = Array(12).fill(0);
  activities.forEach(a => {
    let m = a.month;
    if (!m && a.date) {
      const parts = a.date.split('/');
      if (parts.length >= 2) m = parseInt(parts[1]);
    }
    if (m >= 1 && m <= 12) {
      monthVdv[m - 1] += (a.participants || 0);
    }
  });

  // Tính số lượng VĐV theo 4 quý
  const qVdv = [
    monthVdv[0] + monthVdv[1] + monthVdv[2],
    monthVdv[3] + monthVdv[4] + monthVdv[5],
    monthVdv[6] + monthVdv[7] + monthVdv[8],
    monthVdv[9] + monthVdv[10] + monthVdv[11]
  ];

  // Tuần mẫu đại diện cao điểm (Tháng 3 - Tháng 4)
  const weekVdv = [110, 45, 80, 150, 75, 95, 120];

  chartDataset = [
    {
      t: 'Giai đoạn cao điểm (7 ngày trọng điểm)',
      p: 'so với tuần trước',
      d: 0.18,
      l: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
      f: ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'],
      v: weekVdv
    },
    {
      t: 'Tiến độ 12 tháng năm 2026',
      p: 'so với chỉ tiêu năm',
      d: 0.52,
      l: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
      f: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
      v: monthVdv
    },
    {
      t: 'Phân kỳ 4 Quý năm 2026',
      p: 'so với quý trước',
      d: 0.25,
      l: ['Q1', 'Q2', 'Q3', 'Q4'],
      f: ['Quý I (Mừng Đảng & Ngày chạy)', 'Quý II (Đại hội TDTT Phường)', 'Quý III (Giải hè thanh thiếu nhi)', 'Quý IV (Giải truyền thống & Người cao tuổi)'],
      v: qVdv
    }
  ];

  // Khởi tạo 12 thanh bar
  bars.innerHTML = '';
  barsElements = [];
  for (let i = 0; i < 12; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'u095-b off';
    b.tabIndex = -1;
    b.innerHTML = '<i></i><em></em>';
    bars.appendChild(b);
    barsElements.push(b);
  }

  // Khởi tạo đường lưới grid (4 đường)
  grid.innerHTML = '';
  gridLines = [0, 1, 2, 3].map(k => {
    const g = document.createElement('div');
    g.className = 'u095-gl';
    g.style.bottom = (k / 3 * 100).toFixed(3) + '%';
    g.innerHTML = '<span></span>';
    grid.appendChild(g);
    return g;
  });

  let act = -1;
  let pin = -1;
  let shown = 0;
  let tw = 0;

  function fmt(v) {
    return Math.round(v).toLocaleString('vi-VN');
  }

  function nice(m) {
    if (m <= 0) return 300;
    const p = Math.pow(10, Math.floor(Math.log10(m / 3)));
    const s = [1, 2, 2.5, 5, 10].map(k => k * p).filter(k => k * 3 >= m)[0];
    return s ? s * 3 : m * 1.2;
  }

  function roll(to) {
    cancelAnimationFrame(tw);
    const from = shown;
    const t0 = performance.now();
    const dur = 400;

    function f(n) {
      if (!root.isConnected) return;
      const k = Math.min(1, (n - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      shown = Math.round(from + (to - from) * e);
      big.textContent = fmt(shown);
      if (k < 1) tw = requestAnimationFrame(f);
    }
    tw = requestAnimationFrame(f);
  }

  function pct(a, b) {
    if (!b) return '+100%';
    const r = (a - b) / b;
    return (r >= 0 ? '+' : '−') + Math.abs(Math.round(r * 100)) + '%';
  }

  function updateHeader() {
    const d = chartDataset[currentPeriod];
    const idx = act >= 0 ? act : pin;
    if (idx >= 0) {
      lab.textContent = d.f[idx];
      roll(d.v[idx]);
      dl.textContent = idx ? pct(d.v[idx], d.v[idx - 1]) + ' so với kỳ trước' : '';
      dl.classList.toggle('dn', idx > 0 && d.v[idx] < d.v[idx - 1]);
    } else {
      const sum = d.v.reduce((a, b) => a + b, 0);
      lab.textContent = d.t;
      roll(sum);
      dl.textContent = (d.d >= 0 ? '+' : '−') + Math.abs(Math.round(d.d * 100)) + '% ' + d.p;
      dl.classList.toggle('dn', d.d < 0);
    }
  }

  function draw(k, isFirst) {
    currentPeriod = k;
    act = -1;
    pin = -1;
    const d = chartDataset[k];
    const n = d.v.length;
    const maxVal = Math.max(10, ...d.v);
    const max = nice(maxVal);
    const mean = d.v.reduce((a, b) => a + b, 0) / Math.max(1, n);

    segs.forEach((s, j) => s.setAttribute('aria-pressed', String(j === k)));
    root.querySelector('.u095-seg')?.style.setProperty('--k', String(k));

    barsElements.forEach((b, j) => {
      const on = j < n;
      b.classList.toggle('off', !on);
      b.classList.remove('on', 'pin');
      b.classList.toggle('last', j === n - 1);
      b.style.setProperty('--d', String(j));
      b.style.setProperty('--pad', n > 8 ? '3px' : '8px');

      if (on) {
        b.querySelector('em').textContent = d.l[j];
        b.setAttribute('aria-label', `${d.f[j]}: ${fmt(d.v[j])} VĐV`);
        b.style.setProperty('--h', isFirst ? '0' : (d.v[j] / max).toFixed(3));
      } else {
        b.style.setProperty('--h', '0');
      }
    });

    if (isFirst) {
      requestAnimationFrame(() => {
        barsElements.forEach((b, j) => {
          if (j < n) b.style.setProperty('--h', (d.v[j] / max).toFixed(3));
        });
      });
    }

    gridLines.forEach((g, j) => {
      const val = Math.round(max * j / 3);
      g.firstChild.textContent = val.toLocaleString('vi-VN');
      g.firstChild.style.opacity = Math.abs(j / 3 - mean / max) < 0.08 ? '0' : '1';
    });

    avg.style.setProperty('--a', (mean / max).toFixed(3));
    avg.firstChild.textContent = `Avg: ${Math.round(mean)}`;
    root.classList.remove('has');
    updateHeader();
  }

  function hoverBar(i) {
    if (i === act) return;
    act = i;
    root.classList.toggle('has', i >= 0);
    barsElements.forEach((b, j) => b.classList.toggle('on', j === i));

    if (i >= 0) {
      const d = chartDataset[currentPeriod];
      const b = barsElements[i];
      const r = b.getBoundingClientRect();
      const pr = ch.getBoundingClientRect();
      tip.style.setProperty('--tx', (r.left - pr.left + r.width / 2 - 40).toFixed(1) + 'px');
      tip.style.setProperty('--ty', (r.top - pr.top - 32).toFixed(1) + 'px');
      tip.querySelector('span').textContent = `${d.f[i]}: ${fmt(d.v[i])} VĐV`;
      const prev = i > 0 ? d.v[i - 1] : 0;
      const small = tip.querySelector('small');
      if (prev > 0) {
        small.textContent = pct(d.v[i], prev);
        small.classList.toggle('dn', d.v[i] < prev);
      } else {
        small.textContent = '';
      }
    }
    updateHeader();
  }

  barsElements.forEach((b, i) => {
    b.addEventListener('pointerenter', () => hoverBar(i));
    b.addEventListener('click', () => {
      pin = pin === i ? -1 : i;
      barsElements.forEach((el, j) => el.classList.toggle('pin', j === pin));
      updateHeader();
    });
  });

  ch.addEventListener('pointerleave', () => hoverBar(-1));

  drawFn = draw;
  draw(currentPeriod, true);
}
