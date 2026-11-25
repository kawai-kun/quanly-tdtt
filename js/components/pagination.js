// ==============================================================================
// LUCIAN UX/UI PROMPT #449 · MIT LICENSE (c) 2026 Seokwoooo
// COMPONENT: 7-SLOT FIXED SPRING PAGINATION BAR
// Hệ thống Quản lý TDTT - Phường Tân Khai
// ==============================================================================

export function renderPaginationHTML(totalPages = 1, currentPage = 1) {
  if (totalPages <= 1) return '';

  return `
    <div class="ux u449" id="u449PaginationBox" data-total="${totalPages}" data-current="${currentPage}">
      <nav class="u449-nav" aria-label="Phân trang">
        <button type="button" class="u449-ar u449-pv" aria-label="Trang trước" ${currentPage <= 1 ? 'disabled' : ''}>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg>
        </button>
        <div class="u449-sl">
          <span class="u449-pill" aria-hidden="true"></span>
        </div>
        <button type="button" class="u449-ar u449-nx" aria-label="Trang tiếp theo" ${currentPage >= totalPages ? 'disabled' : ''}>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5"/></svg>
        </button>
      </nav>
      <p class="u449-live" role="status">Trang ${currentPage}</p>
    </div>
  `;
}

export function initPagination(containerId, totalPages, currentPage, onPageChange) {
  const root = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!root) return;

  const paginationEl = root.querySelector('.u449') || root;
  const sl = paginationEl.querySelector('.u449-sl');
  const pill = paginationEl.querySelector('.u449-pill');
  const pv = paginationEl.querySelector('.u449-pv');
  const nx = paginationEl.querySelector('.u449-nx');
  const live = paginationEl.querySelector('.u449-live');

  if (!sl || !pill || !pv || !nx) return;

  sl.querySelectorAll('.u449-n').forEach(n => n.remove());

  const slots = [];
  for (let k = 0; k < 7; k++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'u449-n';
    b.innerHTML = '<span></span>';
    sl.appendChild(b);
    slots.push(b);
  }

  function win(c) {
    if (totalPages <= 7) {
      const arr = [];
      for (let i = 1; i <= totalPages; i++) arr.push(i);
      while (arr.length < 7) arr.push('');
      return arr;
    }
    if (c <= 4) return [1, 2, 3, 4, 5, '', totalPages];
    if (c >= totalPages - 3) return [1, '', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '', c - 1, c, c + 1, '', totalPages];
  }

  let cur = currentPage;

  function render(back) {
    const currentWindow = win(cur);
    currentWindow.forEach((v, k) => {
      const b = slots[k];
      const old = b.getAttribute('data-v');
      b.classList.toggle('is-dots', v === '');

      if (v === '') {
        b.setAttribute('aria-hidden', 'true');
        b.tabIndex = -1;
        b.removeAttribute('aria-label');
      } else {
        b.removeAttribute('aria-hidden');
        b.tabIndex = 0;
        b.setAttribute('aria-label', `Trang ${v}`);
      }

      if (v === cur) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');

      if (old === String(v)) return;
      b.setAttribute('data-v', v);
      const txt = v === '' ? '…' : String(v);

      if (old === null) {
        b.firstChild.textContent = txt;
        return;
      }

      b.querySelectorAll('.is-out').forEach(s => s.remove());
      const o = b.querySelector('span');
      const s = document.createElement('span');
      s.textContent = txt;
      s.className = 'is-in';
      b.classList.toggle('is-back', !!back);
      if (o) o.className = 'is-out';
      b.appendChild(s);
      setTimeout(() => { if (o && o.isConnected) o.remove(); }, 320);
    });

    const at = currentWindow.indexOf(cur);
    pill.style.setProperty('--x', `${Math.max(0, at) * 34}px`);
    pv.disabled = cur === 1;
    nx.disabled = cur === totalPages;
  }

  function go(n) {
    n = Math.max(1, Math.min(totalPages, n));
    if (n === cur) return;
    const back = n < cur;
    cur = n;
    pill.classList.remove('is-sq');
    void pill.offsetWidth;
    pill.classList.add('is-sq');
    render(back);
    if (live) live.textContent = `Trang ${cur}`;
    if (typeof onPageChange === 'function') onPageChange(cur);
  }

  slots.forEach(b => {
    b.addEventListener('click', () => {
      const v = b.getAttribute('data-v');
      if (v && v !== '') go(+v);
    });
  });

  pv.addEventListener('click', () => go(cur - 1));
  nx.addEventListener('click', () => go(cur + 1));

  render(false);
}

window.renderPaginationHTML = renderPaginationHTML;
window.initPagination = initPagination;
