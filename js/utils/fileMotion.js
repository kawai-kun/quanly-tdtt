// ==============================================================================
// COMPONENT: INTERACTIVE FILE MOTION (Lucian UX/UI #432 Adapted)
// Bộ xuất & tải tệp hoạt họa (Download / Export / Upload)
// ==============================================================================

const BADGE_COLORS = {
  xlsx: '#10b981',
  xls: '#10b981',
  csv: '#059669',
  docx: '#2563eb',
  doc: '#2563eb',
  pdf: '#ef4444',
  zip: '#f59e0b',
  png: '#8b5cf6',
  jpg: '#3b82f6',
  jpeg: '#3b82f6'
};

export function triggerDownloadWithMotion({
  filename = 'tai-ve.xlsx',
  ext = 'xlsx',
  title = 'Đang xuất dữ liệu',
  subtitle = 'Đang trích xuất cơ sở dữ liệu và tổng hợp số liệu...',
  estimatedSize = '42 KB',
  onExecute = () => {}
}) {
  const existing = document.getElementById('fileMotionOverlay');
  if (existing) existing.remove();

  const cleanExt = (ext || filename.split('.').pop() || 'xlsx').toLowerCase();
  const badgeColor = BADGE_COLORS[cleanExt] || '#059669';
  const tagText = cleanExt.slice(0, 4).toUpperCase();

  const overlay = document.createElement('div');
  overlay.id = 'fileMotionOverlay';
  overlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs modal-animate';
  overlay.innerHTML = `
    <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center overflow-hidden">
      
      <!-- Header -->
      <div class="mb-4">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">${title}</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${subtitle}</p>
      </div>

      <!-- Lucian UX/UI #432 Motion Box -->
      <div class="u432-motion-box is-animating" style="--doc-badge-color: ${badgeColor};">
        <div class="u432-st">
          <svg class="u432-ring" viewBox="0 0 100 100">
            <circle class="tk" cx="50" cy="50" r="46"/>
            <circle class="pg" cx="50" cy="50" r="46"/>
          </svg>
          <svg class="u432-doc" viewBox="0 0 50 62">
            <path class="pp" d="M6 1h26l15 15v39a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V7a6 6 0 0 1 6-6z"/>
            <path class="fd" d="M32 1v10a5 5 0 0 0 5 5h10z"/>
            <rect class="ln" x="9" y="22" width="24" height="3" rx="1.5"/>
            <rect class="ln" x="9" y="29" width="30" height="3" rx="1.5"/>
            <rect class="tg" x="-4" y="40" width="28" height="14" rx="3.5"/>
            <text x="10" y="50" text-anchor="middle">${tagText}</text>
          </svg>
          <span class="u432-ok">
            <svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
          </span>
        </div>
        <p class="u432-nm text-slate-900 dark:text-white">
          ${filename} <small class="text-slate-500 dark:text-slate-400">· <span id="u432_pct">0%</span></small>
        </p>
      </div>

      <!-- Action status text -->
      <p id="u432_status_desc" class="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-3 animate-pulse">
        Đang khởi tạo tệp tin...
      </p>

    </div>
  `;

  document.body.appendChild(overlay);

  const box = overlay.querySelector('.u432-motion-box');
  const ring = overlay.querySelector('.u432-ring .pg');
  const pctEl = overlay.querySelector('#u432_pct');
  const statusEl = overlay.querySelector('#u432_status_desc');

  let start = performance.now();
  const duration = 1200; // 1.2s smooth animation

  function step(now) {
    if (!overlay.isConnected) return;
    const elapsed = now - start;
    const progress = Math.min(1, elapsed / duration);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const strokeOffset = (289 * (1 - eased)).toFixed(1);
    
    ring.style.strokeDashoffset = strokeOffset;
    const pct = Math.round(eased * 100);
    if (pctEl) pctEl.textContent = `${pct}%`;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // Completed!
      box.classList.add('is-done');
      if (pctEl) pctEl.textContent = estimatedSize;
      if (statusEl) {
        statusEl.className = 'text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-3';
        statusEl.textContent = '✓ Xuất tệp thành công!';
      }

      // Execute actual file save
      try {
        if (typeof onExecute === 'function') onExecute();
      } catch (e) {
        console.error('File execution error:', e);
      }

      // Dismiss after 1.5s
      setTimeout(() => {
        if (overlay.isConnected) {
          overlay.classList.add('opacity-0', 'transition-opacity', 'duration-300');
          setTimeout(() => overlay.remove(), 300);
        }
      }, 1500);
    }
  }

  requestAnimationFrame(step);
}
