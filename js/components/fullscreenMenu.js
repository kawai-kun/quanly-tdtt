// ==============================================================================
// LUCIAN UX/UI PROMPT #045 · MIT LICENSE (c) 2026 Seokwoooo
// COMPONENT: FULL-SCREEN CIRCULAR EXPAND MENU (MOBILE MASTHEAD NAVIGATION)
// Hệ thống Quản lý TDTT - Phường Tân Khai
// ==============================================================================

import { state } from '../state.js';
import { switchTab } from './sidebar.js';
import { toggleDarkMode } from '../utils/toast.js';

export function openFullscreenMenu(event) {
  let existing = document.getElementById('fullscreenMenuSheet');
  if (existing) {
    closeFullscreenMenu();
    return;
  }

  const trigger = event?.currentTarget || document.getElementById('mobileHamburgerBtn');
  let cx = '90vw';
  let cy = '40px';
  if (trigger) {
    const rect = trigger.getBoundingClientRect();
    cx = `${rect.left + rect.width / 2}px`;
    cy = `${rect.top + rect.height / 2}px`;
  }

  const sheet = document.createElement('div');
  sheet.id = 'fullscreenMenuSheet';
  sheet.className = 'u045-sheet';
  sheet.style.setProperty('--cx', cx);
  sheet.style.setProperty('--cy', cy);
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-label', 'Menu điều hướng toàn màn hình');

  const navs = [
    { id: 'bang-dieu-khien', num: '01', label: 'TỔNG QUAN', desc: 'Bảng số liệu & Tiến độ thi đua' },
    { id: 'quan-ly-giai-dau', num: '02', label: 'GIẢI ĐẤU THỂ THAO', desc: `${state.activities.length} sự kiện & hội thao` },
    { id: 'quan-ly-clb', num: '03', label: 'CLB CƠ SỞ', desc: `${state.clubs.length} câu lạc bộ hoạt động` },
    { id: 'lich-sinh-hoat', num: '04', label: 'LỊCH TẬP LUYỆN', desc: `${state.schedules.length} buổi tập định kỳ` },
    { id: 'co-so-vat-chat', num: '05', label: 'SÂN BÃI & CSVC', desc: `${state.facilities.length} công trình thể thao` },
    { id: 'kinh-phi', num: '06', label: 'KINH PHÍ QUYẾT TOÁN', desc: 'Hồ sơ ngân sách & dự toán' },
    { id: 'bao-cao', num: '07', label: 'BÁO CÁO CÔNG VĂN', desc: 'Xuất văn bản Word chuẩn NĐ 30' }
  ];

  sheet.innerHTML = `
    <!-- Top Header -->
    <div class="flex items-center justify-between pb-4 border-b border-white/10">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 shadow-md">
          <img src="logo.png" onerror="if(typeof EMBEDDED_LOGO_B64!=='undefined') this.src=EMBEDDED_LOGO_B64" class="w-full h-full object-contain rounded-full" alt="UBND Phường Tân Khai" />
        </div>
        <div>
          <span class="text-[10px] font-bold text-amber-300 tracking-wider uppercase block">UBND PHƯỜNG TÂN KHAI</span>
          <span class="text-xs font-bold text-white uppercase block">HỆ THỐNG QUẢN LÝ TDTT</span>
        </div>
      </div>
      <button type="button" class="u045-close-btn" onclick="window.closeFullscreenMenu()" aria-label="Đóng menu">
        <span class="material-symbols-outlined text-[24px]">close</span>
      </button>
    </div>

    <!-- Navigation List -->
    <div class="my-auto py-6 overflow-y-auto">
      <small>DANH MỤC PHÂN HỆ ĐIỀU HÀNH</small>
      <ul class="u045-nav">
        ${navs.map((n, i) => `
          <li>
            <a class="u045-ln" href="javascript:void(0)" style="--i:${i}" onclick="window.handleFullscreenNav('${n.id}')" ${state.currentTab === n.id ? 'aria-current="page"' : ''}>
              <em>${n.num}</em>
              <span>${n.label}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    </div>

    <!-- Bottom Actions -->
    <div class="u045-foot">
      <button type="button" onclick="window.openQrShareModal(); window.closeFullscreenMenu();" class="px-4 py-2 rounded-full border border-white/20 text-xs font-bold flex items-center gap-1.5 hover:bg-white/10 text-white">
        <span class="material-symbols-outlined text-[16px]">qr_code_2</span>
        <span>Mã QR</span>
      </button>
      <button type="button" onclick="toggleDarkMode();" class="px-4 py-2 rounded-full border border-white/20 text-xs font-bold flex items-center gap-1.5 hover:bg-white/10 text-white">
        <span class="material-symbols-outlined text-[16px]">${state.darkMode ? 'light_mode' : 'dark_mode'}</span>
        <span>${state.darkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}</span>
      </button>
      <div class="ml-auto text-right">
        <span class="text-[11px] text-amber-200 block font-semibold">Trần Quốc Được</span>
        <span class="text-[9px] text-emerald-200 block">Cán bộ phụ trách TDTT</span>
      </div>
    </div>
  `;

  document.body.appendChild(sheet);

  // Trigger opening circle animation
  requestAnimationFrame(() => {
    sheet.classList.add('is-open');
  });

  const onKey = (e) => {
    if (e.key === 'Escape') {
      window.closeFullscreenMenu();
      window.removeEventListener('keydown', onKey);
    }
  };
  window.addEventListener('keydown', onKey);
}

export function closeFullscreenMenu() {
  const sheet = document.getElementById('fullscreenMenuSheet');
  if (!sheet) return;
  sheet.classList.remove('is-open');
  setTimeout(() => {
    if (sheet && sheet.parentNode) sheet.remove();
  }, 700);
}

export function handleFullscreenNav(tabId) {
  closeFullscreenMenu();
  setTimeout(() => {
    switchTab(tabId);
  }, 250);
}

window.openFullscreenMenu = openFullscreenMenu;
window.closeFullscreenMenu = closeFullscreenMenu;
window.handleFullscreenNav = handleFullscreenNav;
