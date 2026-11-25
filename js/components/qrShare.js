// ==============================================================================
// LUCIAN UX/UI PROMPT #478 · MIT LICENSE (c) 2026 Seokwoooo
// COMPONENT: QR CODE SHARE MODAL (REAL SVG GENERATION + LASER SWEEP)
// Hệ thống Quản lý TDTT - Phường Tân Khai
// ==============================================================================

export function openQrShareModal(customTitle, customUrl) {
  const existing = document.getElementById('qrShareModal');
  if (existing) existing.remove();

  const title = customTitle || 'HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO • PHƯỜNG TÂN KHAI';
  const url = customUrl || window.location.href;

  const overlay = document.createElement('div');
  overlay.id = 'qrShareModal';
  overlay.className = 'u478-modal-overlay';
  overlay.innerHTML = `
    <div class="ux u478" data-url="${url}">
      <section class="u478-c">
        <!-- Close button -->
        <button type="button" onclick="window.closeQrShareModal()" class="absolute top-3 right-3 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-full transition-colors" title="Đóng">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div class="mb-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">CHIA SẺ KẾT NỐI</span>
          <h3 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 max-w-[240px] mx-auto truncate">${title}</h3>
        </div>

        <div class="u478-q">
          <span class="u478-br" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
          <span class="u478-sc" aria-hidden="true"><i></i></span>
        </div>

        <p class="u478-u">${url.replace(/^https?:\/\//, '')}</p>

        <button type="button" class="u478-cp">
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1 1"/>
              <path d="M14 10a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1-1"/>
            </svg>
            Sao chép liên kết
          </span>
          <span aria-hidden="true">
            <svg class="ck" viewBox="0 0 24 24">
              <path d="m5 12.5 4.5 4.5L19 7.5"/>
            </svg>
            Đã sao chép!
          </span>
        </button>
      </section>
      <p class="u478-live" role="status"></p>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close on outside click or ESC
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) window.closeQrShareModal();
  });

  const onKey = (e) => {
    if (e.key === 'Escape') {
      window.closeQrShareModal();
      window.removeEventListener('keydown', onKey);
    }
  };
  window.addEventListener('keydown', onKey);

  // Initialize QR algorithm
  initQrCode(overlay.querySelector('.u478'), url);
}

export function closeQrShareModal() {
  const modal = document.getElementById('qrShareModal');
  if (modal) modal.remove();
}

window.openQrShareModal = openQrShareModal;
window.closeQrShareModal = closeQrShareModal;

function initQrCode(root, url) {
  const box = root.querySelector('.u478-q');
  const cp = root.querySelector('.u478-cp');
  const live = root.querySelector('.u478-live');

  const EC = [null, [10, 1, 16], [16, 1, 28], [26, 1, 44], [18, 2, 32], [24, 2, 43], [16, 4, 27]];
  const AL = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34]];

  function mul(x, y) {
    let z = 0;
    for (let i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }

  function rsDiv(n) {
    const r = [];
    for (let i = 0; i < n - 1; i++) r.push(0);
    r.push(1);
    let g = 1;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < r.length; j++) {
        r[j] = mul(r[j], g);
        if (j + 1 < r.length) r[j] ^= r[j + 1];
      }
      g = mul(g, 2);
    }
    return r;
  }

  function rsRem(data, div) {
    const r = div.map(() => 0);
    data.forEach((b) => {
      const f = b ^ r.shift();
      r.push(0);
      div.forEach((c, i) => { r[i] ^= mul(c, f); });
    });
    return r;
  }

  function qr(text) {
    const bytes = [].slice.call(new TextEncoder().encode(text));
    let v = 1;
    while (v < 6 && 12 + bytes.length * 8 > EC[v][1] * EC[v][2] * 8) v++;
    const ecn = EC[v][0], nb = EC[v][1], dpb = EC[v][2], cap = nb * dpb * 8;
    const bits = [];

    function put(val, len) {
      for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
    }

    put(4, 4);
    put(bytes.length, 8);
    bytes.forEach((b) => { put(b, 8); });
    put(0, Math.min(4, cap - bits.length));
    while (bits.length % 8) bits.push(0);
    for (let pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) put(pad, 8);

    const data = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0;
      for (let k = 0; k < 8; k++) b = (b << 1) | bits[i + k];
      data.push(b);
    }

    const div = rsDiv(ecn), blocks = [], ecs = [];
    for (let i = 0; i < nb; i++) {
      const blk = data.slice(i * dpb, (i + 1) * dpb);
      blocks.push(blk);
      ecs.push(rsRem(blk, div));
    }

    const all = [];
    for (let i = 0; i < dpb; i++) blocks.forEach((bk) => { all.push(bk[i]); });
    for (let i = 0; i < ecn; i++) ecs.forEach((e) => { all.push(e[i]); });

    const n = 17 + 4 * v, M = [], F = [];
    for (let i = 0; i < n; i++) {
      M.push(new Array(n).fill(false));
      F.push(new Array(n).fill(false));
    }

    function set(x, y, d) { M[y][x] = d; F[y][x] = true; }

    for (let i = 0; i < n; i++) {
      set(6, i, i % 2 === 0);
      set(i, 6, i % 2 === 0);
    }

    [[3, 3], [n - 4, 3], [3, n - 4]].forEach((c) => {
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const x = c[0] + dx, y = c[1] + dy, d = Math.max(Math.abs(dx), Math.abs(dy));
          if (x >= 0 && x < n && y >= 0 && y < n) set(x, y, d !== 2 && d !== 4);
        }
      }
    });

    const al = AL[v], last = al.length - 1;
    al.forEach((ax, ii) => {
      al.forEach((ay, jj) => {
        if ((ii === 0 && jj === 0) || (ii === 0 && jj === last) || (ii === last && jj === 0)) return;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
          }
        }
      });
    });

    function format(mask) {
      const d = (0 << 3) | mask;
      let r = d;
      for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      const fb = ((d << 10) | r) ^ 0x5412;
      const bit = (i) => ((fb >>> i) & 1) === 1;
      for (let i = 0; i <= 5; i++) set(8, i, bit(i));
      set(8, 7, bit(6));
      set(8, 8, bit(7));
      set(7, 8, bit(8));
      for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
      for (let i = 0; i < 8; i++) set(n - 1 - i, 8, bit(i));
      for (let i = 8; i < 15; i++) set(8, n - 15 + i, bit(i));
      set(8, n - 8, true);
    }

    format(0);
    let bi = 0, total = all.length * 8;
    for (let right = n - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < n; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j, up = ((right + 1) & 2) === 0, y = up ? n - 1 - vert : vert;
          if (!F[y][x] && bi < total) {
            M[y][x] = ((all[bi >>> 3] >>> (7 - (bi & 7))) & 1) === 1;
            bi++;
          }
        }
      }
    }

    const MASKS = [
      (x, y) => (x + y) % 2 === 0,
      (x, y) => y % 2 === 0,
      (x) => x % 3 === 0,
      (x, y) => (x + y) % 3 === 0,
      (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
      (x, y) => (x * y % 2 + x * y % 3) === 0,
      (x, y) => ((x * y % 2 + x * y % 3) % 2) === 0,
      (x, y) => (((x + y) % 2 + x * y % 3) % 2) === 0
    ];

    function apply(m) {
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          if (!F[y][x] && MASKS[m](x, y)) M[y][x] = !M[y][x];
        }
      }
    }

    function penalty() {
      let p = 0, dark = 0;
      const lines = [];
      for (let y = 0; y < n; y++) {
        let row = '', col = '';
        for (let x = 0; x < n; x++) {
          row += M[y][x] ? 1 : 0;
          col += M[x][y] ? 1 : 0;
          if (M[y][x]) dark++;
        }
        lines.push(row, col);
      }
      lines.forEach((s) => {
        (s.match(/0{5,}|1{5,}/g) || []).forEach((r) => { p += r.length - 2; });
        p += 40 * ((s.match(/(?=10111010000|00001011101)/g) || []).length);
      });
      for (let y = 0; y < n - 1; y++) {
        for (let x = 0; x < n - 1; x++) {
          const c = M[y][x];
          if (c === M[y][x + 1] && c === M[y + 1][x] && c === M[y + 1][x + 1]) p += 3;
        }
      }
      return p + 10 * Math.floor(Math.abs(dark * 20 / (n * n) - 10));
    }

    let best = 0, bestP = Infinity;
    for (let m = 0; m < 8; m++) {
      apply(m);
      format(m);
      const sc = penalty();
      if (sc < bestP) { bestP = sc; best = m; }
      apply(m);
    }
    apply(best);
    format(best);
    return { n, M, F };
  }

  const Q = qr(url), n = Q.n, pad = 3, W = n + pad * 2;
  let d = '';

  function inFinder(x, y) {
    return (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  }

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (Q.M[y][x] && !inFinder(x, y)) {
        d += 'M' + (x + pad + 0.06) + ' ' + (y + pad + 0.06) + 'h.88v.88h-.88z';
      }
    }
  }

  let eyes = '';
  [[0, 0], [n - 7, 0], [0, n - 7]].forEach((c) => {
    const X = c[0] + pad, Y = c[1] + pad;
    eyes += '<rect class="f" x="' + (X + 0.5) + '" y="' + (Y + 0.5) + '" width="6" height="6" rx="1.7" stroke-width="1"/>' +
      '<rect class="e" x="' + (X + 2) + '" y="' + (Y + 2) + '" width="3" height="3" rx=".9"/>';
  });

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + W);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'QR code: ' + url);
  svg.setAttribute('shape-rendering', 'geometricPrecision');
  svg.innerHTML = '<path class="m" d="' + d + '"/>' + eyes;
  box.insertBefore(svg, box.firstChild);

  let t1 = 0;
  cp.addEventListener('click', () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).catch(() => {});
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
    } catch (e) {}

    cp.classList.remove('is-ok');
    void cp.offsetWidth;
    cp.classList.add('is-ok');
    live.textContent = 'Link copied';
    clearTimeout(t1);
    t1 = setTimeout(() => {
      if (root.isConnected) {
        cp.classList.remove('is-ok');
        live.textContent = '';
      }
    }, 2200);
  });

  setTimeout(() => {
    root.classList.add('is-in');
  }, 100);
}
