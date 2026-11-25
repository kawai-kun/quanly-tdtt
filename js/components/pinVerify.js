// ==============================================================================
// LUCIAN UX/UI PROMPT #406 · MIT LICENSE (c) 2026 Seokwoooo
// COMPONENT: 6-DIGIT VERIFICATION PIN MODAL (DIGIT POP, SHAKE & MERGE CHECK)
// Hệ thống Quản lý TDTT - Phường Tân Khai
// ==============================================================================

import { showToast } from '../utils/toast.js';

export function openPinVerifyModal({
  title = 'XÁC THỰC BẢO MẬT CÁN BỘ',
  subtitle = 'Nhập mã PIN 6 chữ số (Mặc định: 482915) để xác thực quyền quản trị',
  expectedPin = '482915',
  onSuccess
} = {}) {
  const existing = document.getElementById('pinVerifyModal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'pinVerifyModal';
  overlay.className = 'u406-modal-overlay';
  overlay.innerHTML = `
    <div class="ux u406">
      <!-- Close button -->
      <button type="button" onclick="window.closePinVerifyModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-full transition-colors" title="Đóng">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>

      <div class="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-2 mx-auto">
        <span class="material-symbols-outlined text-[26px]">lock</span>
      </div>

      <h3 class="text-sm sm:text-base font-bold uppercase tracking-wide text-slate-900 dark:text-white">${title}</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">${subtitle}</p>

      <div class="u406-wrap">
        <div class="u406-row" role="group" aria-label="Mã PIN 6 số"></div>
        <svg class="u406-ck" viewBox="0 0 60 60" aria-hidden="true">
          <circle cx="30" cy="30" r="30"/>
          <path d="M18 30.5l8 8L42.5 22"/>
        </svg>
      </div>

      <p class="text-[11px] text-slate-400 dark:text-slate-500">Mã PIN cán bộ: <strong class="font-mono text-emerald-600 dark:text-emerald-400">${expectedPin}</strong></p>
      <p class="u406-live" role="status" aria-live="polite"></p>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) window.closePinVerifyModal();
  });

  const onKey = (e) => {
    if (e.key === 'Escape') {
      window.closePinVerifyModal();
      window.removeEventListener('keydown', onKey);
    }
  };
  window.addEventListener('keydown', onKey);

  initPinInputs(overlay.querySelector('.u406'), expectedPin, onSuccess);
}

export function closePinVerifyModal() {
  const modal = document.getElementById('pinVerifyModal');
  if (modal) modal.remove();
}

window.openPinVerifyModal = openPinVerifyModal;
window.closePinVerifyModal = closePinVerifyModal;

function initPinInputs(root, expectedCode, onSuccess) {
  const row = root.querySelector('.u406-row');
  const live = root.querySelector('.u406-live');
  let vals = ['', '', '', '', '', ''];
  let busy = false;
  let gen = 0;
  const bs = [], ins = [], gs = [];

  for (let k = 0; k < 6; k++) {
    const b = document.createElement('div');
    b.className = 'u406-b';
    b.style.setProperty('--i', k);
    b.style.setProperty('--mx', `${(2.5 - k) * 50}px`);
    b.style.setProperty('--d', Math.abs(2.5 - k) * 2);
    b.innerHTML = `
      <input class="u406-in" inputmode="numeric" pattern="[0-9]*" autocomplete="${k ? 'off' : 'one-time-code'}">
      <span class="u406-g" aria-hidden="true"></span>
    `;
    b.querySelector('input').setAttribute('aria-label', `Chữ số thứ ${k + 1}`);
    row.appendChild(b);
    bs.push(b);
    ins.push(b.querySelector('input'));
    gs.push(b.querySelector('.u406-g'));
  }

  function later(fn, ms) {
    const g = gen;
    setTimeout(() => {
      if (root.isConnected && g === gen) fn();
    }, ms);
  }

  function render(popAt) {
    ins.forEach((d, j) => {
      d.value = vals[j];
      bs[j].classList.toggle('is-fill', !!vals[j]);
      if (gs[j].textContent !== vals[j]) {
        gs[j].textContent = vals[j];
        if (vals[j] && popAt && popAt.indexOf(j) >= 0) {
          gs[j].classList.remove('is-pop');
          void gs[j].offsetWidth;
          gs[j].classList.add('is-pop');
        }
      }
    });
  }

  function cur(j) {
    bs.forEach((b, n) => { b.classList.toggle('is-cur', n === j); });
    if (j >= 0 && ins[j]) ins[j].focus({ preventScroll: true });
  }

  function fill(i, text) {
    const ds = String(text).replace(/\D/g, '').split('');
    if (!ds.length) return;
    if (ds.length >= 6) i = 0;
    const changed = [];
    ds.forEach((c, j) => {
      if (i + j < 6) {
        vals[i + j] = c;
        changed.push(i + j);
      }
    });
    row.classList.remove('is-err');
    render(changed);
    const next = vals.indexOf('');
    if (next < 0) {
      cur(-1);
      ins[5].blur();
      check();
    } else {
      cur(Math.max(next, Math.min(5, i + ds.length)));
    }
  }

  function check() {
    busy = true;
    row.classList.add('is-busy');
    gen++;

    later(() => {
      row.classList.remove('is-busy');
      if (vals.join('') === expectedCode) {
        row.classList.add('is-merge');
        if (live) live.textContent = 'Xác thực thành công';
        showToast('Xác thực thành công', 'Mã PIN bảo mật cán bộ chính xác.');

        later(() => {
          window.closePinVerifyModal();
          if (typeof onSuccess === 'function') {
            onSuccess();
          }
        }, 1200);
        return;
      }

      // Wrong PIN: shake & error
      row.classList.add('is-err');
      if (live) live.textContent = 'Mã PIN không chính xác';
      row.classList.remove('is-shake');
      void row.offsetWidth;
      row.classList.add('is-shake');

      later(() => {
        vals = ['', '', '', '', '', ''];
        render();
        row.classList.remove('is-err');
        busy = false;
        cur(0);
      }, 700);
    }, 550);
  }

  ins.forEach((d, i) => {
    d.addEventListener('focus', () => {
      bs.forEach((b, n) => { b.classList.toggle('is-cur', n === i); });
    });
    d.addEventListener('blur', () => {
      bs[i].classList.remove('is-cur');
    });
    d.addEventListener('pointerdown', () => {
      if (!busy) bs.forEach((b, n) => { b.classList.toggle('is-cur', n === i); });
    });
    d.addEventListener('input', () => {
      if (busy) { render(); return; }
      const v = d.value.replace(/\D/g, '');
      const old = vals[i];
      if (!v) { vals[i] = ''; render(); return; }
      const add = v;
      fill(i, add);
    });
    d.addEventListener('paste', (e) => {
      const t = e.clipboardData && e.clipboardData.getData('text');
      if (!t) return;
      e.preventDefault();
      if (!busy) fill(i, t);
    });
    d.addEventListener('keydown', (e) => {
      if (busy) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (vals[i]) {
          vals[i] = '';
          render();
          cur(i);
        } else if (i > 0) {
          vals[i - 1] = '';
          render();
          cur(i - 1);
        }
      } else if (e.key === 'ArrowLeft' && i > 0) {
        e.preventDefault();
        cur(i - 1);
      } else if (e.key === 'ArrowRight' && i < 5) {
        e.preventDefault();
        cur(i + 1);
      }
    });
  });

  setTimeout(() => cur(0), 100);
}
