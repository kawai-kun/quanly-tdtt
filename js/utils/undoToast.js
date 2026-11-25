// ==============================================================================
// LUCIAN UX/UI PROMPT #470 · MIT LICENSE (c) 2026 Seokwoooo
// UTILITY: SAFE DELETE WITH 5-SECOND COUNTDOWN RING & UNDO PILL
// Hệ thống Quản lý TDTT - Phường Tân Khai
// ==============================================================================

let activeUndoSlot = null;
let rafId = 0;
let lastTick = 0;
let isPaused = false;

export function triggerSafeDelete({
  itemName = 'mục dữ liệu',
  onUndo,
  onCommit,
  duration = 5000
}) {
  // Commit any existing pending delete first
  if (activeUndoSlot) {
    commitSafeDelete();
  }

  let pill = document.getElementById('u470UndoPill');
  if (!pill) {
    pill = document.createElement('button');
    pill.id = 'u470UndoPill';
    pill.type = 'button';
    pill.className = 'u470-undo';
    pill.setAttribute('role', 'status');
    pill.setAttribute('aria-live', 'polite');
    pill.innerHTML = `
      <span class="u470-rg" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <circle class="bg" cx="12" cy="12" r="10"/>
          <circle class="fg" cx="12" cy="12" r="10"/>
        </svg>
        <b id="u470CountdownNum">5</b>
      </span>
      <span id="u470UndoLabel">Đã xóa · Hoàn tác</span>
      <svg class="u470-ar" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4.5 3.5 2 6l2.5 2.5"/>
        <path d="M2.5 6h7a4 4 0 0 1 0 8H7"/>
      </svg>
    `;

    document.body.appendChild(pill);

    pill.addEventListener('pointerenter', () => { isPaused = true; });
    pill.addEventListener('pointerleave', () => { isPaused = false; });
    pill.addEventListener('focus', () => { isPaused = true; });
    pill.addEventListener('blur', () => { isPaused = false; });

    pill.addEventListener('click', (e) => {
      e.preventDefault();
      if (!activeUndoSlot) return;
      const callback = activeUndoSlot.onUndo;
      cancelSafeDelete();
      if (typeof callback === 'function') callback();
    });
  }

  const C = 2 * Math.PI * 10; // 62.83
  const fg = pill.querySelector('.fg');
  const num = pill.querySelector('#u470CountdownNum');
  const label = pill.querySelector('#u470UndoLabel');

  fg.style.strokeDasharray = `${C.toFixed(2)} ${C.toFixed(2)}`;
  num.textContent = '5';
  label.textContent = `Đã xóa "${itemName.slice(0, 20)}..." · Hoàn tác`;

  activeUndoSlot = {
    left: duration,
    duration,
    onUndo,
    onCommit
  };

  isPaused = false;
  lastTick = performance.now();

  pill.classList.add('is-on');

  function tick(now) {
    rafId = 0;
    if (!activeUndoSlot) return;

    if (!isPaused) {
      activeUndoSlot.left -= Math.min(100, now - lastTick);
    }
    lastTick = now;

    const f = Math.max(0, activeUndoSlot.left / activeUndoSlot.duration);
    fg.style.strokeDasharray = `${(C * f).toFixed(2)} ${C.toFixed(2)}`;
    num.textContent = String(Math.max(1, Math.ceil(activeUndoSlot.left / 1000)));

    if (activeUndoSlot.left <= 0) {
      commitSafeDelete();
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);
}

export function commitSafeDelete() {
  if (!activeUndoSlot) return;
  const callback = activeUndoSlot.onCommit;
  activeUndoSlot = null;
  cancelAnimationFrame(rafId);
  rafId = 0;

  const pill = document.getElementById('u470UndoPill');
  if (pill) pill.classList.remove('is-on');

  if (typeof callback === 'function') {
    callback();
  }
}

export function cancelSafeDelete() {
  if (!activeUndoSlot) return;
  activeUndoSlot = null;
  cancelAnimationFrame(rafId);
  rafId = 0;

  const pill = document.getElementById('u470UndoPill');
  if (pill) pill.classList.remove('is-on');
}

window.triggerSafeDelete = triggerSafeDelete;
window.commitSafeDelete = commitSafeDelete;
window.cancelSafeDelete = cancelSafeDelete;
