// ==============================================================================
// COMPONENT: UNIBODY GOVERNMENT MASTHEAD & NAVIGATION (BẢN 4 - TITANIUM)
// Hệ thống Quản lý TDTT - Phường Tân Khai
// Thiết kế: Chuẩn mực Chính quyền số, Tinh tế, Thanh thoát, Thân thiện thị giác
// ==============================================================================

import { state, lsSet } from '../state.js';
import { toggleDarkMode } from '../utils/toast.js';

export function setGlobalYear(year) {
  state.selectedYear = year;
  lsSet('tk_selected_year', year);
  window.renderApp();
}

function toggleMobileDrawer() {
  state.mobileDrawerOpen = !state.mobileDrawerOpen;
  const drawer = document.getElementById('mobileDrawer');
  if (drawer) {
    if (state.mobileDrawerOpen) drawer.classList.remove('hidden');
    else drawer.classList.add('hidden');
  }
}

export function getGlobalNavs() {
  return [
    { id: 'bang-dieu-khien', label: 'TỔNG QUAN', icon: 'dashboard' },
    { id: 'quan-ly-giai-dau', label: 'GIẢI ĐẤU', icon: 'emoji_events', badge: state.activities.length },
    { id: 'quan-ly-clb', label: 'CLB THỂ THAO', icon: 'groups_2', badge: state.clubs.length },
    { id: 'lich-sinh-hoat', label: 'LỊCH TẬP LUYỆN', icon: 'calendar_month', badge: state.schedules.length },
    { id: 'co-so-vat-chat', label: 'SÂN BÃI & CSVC', icon: 'stadium', badge: state.facilities.length },
    { id: 'kinh-phi', label: 'KINH PHÍ', icon: 'account_balance_wallet', badge: state.budgetItems.length },
    { id: 'bao-cao', label: 'BÁO CÁO CÔNG VĂN', icon: 'summarize', badge: state.savedReports.length }
  ];
}

// MAIN HEADER COMPONENT (BẢN 4 DUY NHẤT: SỔ BỘ HÀNH CHÍNH & CHÍNH QUYỀN SỐ)
export function renderHeader() {
  const navs = getGlobalNavs();
  return `
    <header class="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b-2 border-emerald-800 shadow-md select-none">
      
      <!-- Top Red Strip: Tiêu đề hệ thống to rõ ràng căn giữa + Hệ thống đăng nhập cán bộ sang đây -->
      <div class="bg-[#b91c1c] text-white px-4 sm:px-6 py-2 flex items-center justify-between shadow-xs border-b border-red-800 relative">
        
        <!-- Left spacer for absolute balance on desktop -->
        <div class="hidden md:flex items-center gap-2 w-48 shrink-0">
          <span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span class="text-[11px] font-medium text-amber-200 uppercase tracking-widest">CỔNG ĐIỀU HÀNH SỐ</span>
        </div>

        <!-- Center: HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO • PHƯỜNG TÂN KHAI (TO, RÕ, CĂN GIỮA) -->
        <div class="flex-1 text-center px-2">
          <h1 class="text-sm sm:text-base md:text-lg lg:text-xl font-bold uppercase tracking-wider text-amber-200 drop-shadow-sm">
            ★ HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO • PHƯỜNG TÂN KHAI ★
          </h1>
        </div>

        <!-- Right: CHUYỂN HỆ THỐNG ĐĂNG NHẬP SANG ĐÂY -->
        <div class="flex items-center justify-end shrink-0 md:w-48">
          ${state.isAuthenticated ? `
            <div class="flex items-center gap-2 bg-red-950/60 border border-red-700/80 rounded-full px-2.5 py-1 shadow-inner">
              <div class="w-6 h-6 rounded-full bg-amber-400 text-red-950 flex items-center justify-center font-bold text-[11px] shrink-0 shadow-sm ring-1 ring-white/50">
                TQD
              </div>
              <div class="hidden lg:flex flex-col text-left leading-none">
                <span class="text-xs font-semibold text-white">Trần Quốc Được</span>
                <span class="text-[9.5px] text-amber-200 font-medium">Cán bộ TDTT</span>
              </div>
              <button onclick="handleLogout()" title="Đăng xuất khỏi hệ thống" class="p-1 rounded-full text-amber-200 hover:text-white hover:bg-red-800 transition-colors btn-press ml-0.5">
                <span class="material-symbols-outlined text-[16px]">logout</span>
              </button>
            </div>
          ` : `
            <button onclick="window.openLoginModal()" class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-red-950 font-bold text-xs shadow-sm transition-all btn-press">
              <span class="material-symbols-outlined text-[16px]">login</span>
              <span>Đăng nhập</span>
            </button>
          `}
        </div>

      </div>

      <!-- Tier 1: Main Government Masthead (Emerald) -->
      <div class="px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4 bg-[#047857] text-white">
        
        <!-- Left: Official Emblem & Department Name -->
        <div class="flex items-center gap-3 shrink-0 py-2">
          <button onclick="toggleMobileDrawer()" class="p-2 -ml-1 rounded-lg text-white hover:bg-emerald-800/80 lg:hidden btn-press" title="Mở menu">
            <span class="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <div class="w-10 h-10 rounded-full flex items-center justify-center p-0.5 bg-white shadow-md shrink-0 overflow-hidden border-2 border-amber-300">
            <img src="logo.png" onerror="if(typeof EMBEDDED_LOGO_B64!=='undefined') this.src=EMBEDDED_LOGO_B64" class="w-full h-full object-contain rounded-full" alt="Huy hiệu UBND Phường Tân Khai" />
          </div>
          <div class="flex flex-col text-left">
            <span class="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-100 leading-tight">
              ỦY BAN NHÂN DÂN PHƯỜNG TÂN KHAI
            </span>
            <h2 class="text-sm sm:text-base font-bold tracking-wide text-white uppercase leading-snug">
              TRUNG TÂM DỊCH VỤ TỔNG HỢP • BỘ PHẬN TDTT
            </h2>
          </div>
        </div>

        <!-- Right: Utility Controls (Search, Drive Sync, Dark mode) -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <button onclick="window.openCommandPalette()" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-900 border border-emerald-600 text-emerald-100 text-xs sm:text-sm font-medium transition-colors btn-press" title="Tìm kiếm (Ctrl+K)">
            <span class="material-symbols-outlined text-[18px]">search</span>
            <span class="hidden md:inline">Tìm kiếm</span>
            <kbd class="hidden sm:inline-block text-[11px] font-mono bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-700 text-emerald-200">⌘K</kbd>
          </button>

          <div id="syncPillBox">${renderSyncPillHTML()}</div>
          
          <button onclick="toggleDarkMode()" title="Chế độ sáng/tối" class="p-2 rounded-lg text-emerald-100 hover:bg-emerald-800/80 transition-colors btn-press">
            <span class="material-symbols-outlined text-[20px]">${state.darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </div>

      </div>

      <!-- Tier 2: Dedicated Navigation Tab Bar Strip (Deep Emerald #064e3b) -->
      <div class="hidden lg:flex w-full bg-[#064e3b] border-b border-emerald-600/80 px-4 sm:px-6 py-2 overflow-x-auto no-scrollbar shadow-inner">
        <nav class="flex items-center justify-center gap-1.5 sm:gap-2 w-full max-w-[1780px] mx-auto">
          ${navs.map(item => {
            const isActive = state.currentTab === item.id;
            return `
              <button 
                onclick="switchTab('${item.id}')" 
                class="px-3.5 py-1.5 rounded-lg font-medium text-xs sm:text-sm tracking-wide flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-white text-emerald-950 shadow-md font-semibold ring-2 ring-emerald-300 scale-102' 
                    : 'text-emerald-100 hover:bg-emerald-800/80 hover:text-white'
                }"
                title="${item.label}"
              >
                <span class="material-symbols-outlined text-[18px]">${item.icon}</span>
                <span>${item.label}</span>
                ${item.badge !== undefined ? `
                  <span class="ml-1 px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                    isActive ? 'bg-emerald-100 text-emerald-900 font-semibold' : 'bg-emerald-950 text-emerald-200'
                  }">
                    ${item.badge}
                  </span>
                ` : ''}
              </button>
            `;
          }).join('')}
        </nav>
      </div>

    </header>
  `;
}

export function renderSyncPillHTML() {
  let icon = 'cloud_done';
  let text = 'Drive OK';
  let cls = 'bg-emerald-900/80 text-emerald-100 border-emerald-600';

  if (state.syncStatus === 'syncing') {
    icon = 'sync';
    text = 'Đang đồng bộ...';
    cls = 'bg-amber-500/20 text-amber-200 border-amber-400 animate-pulse';
  } else if (!state.apiUrl) {
    icon = 'cloud_off';
    text = 'Cục bộ';
    cls = 'bg-emerald-900/60 text-emerald-300/70 border-emerald-700';
  } else if (state.syncStatus === 'error') {
    icon = 'cloud_alert';
    text = 'Lỗi kết nối';
    cls = 'bg-rose-900/80 text-rose-200 border-rose-600';
  }

  return `
    <button onclick="openSyncModal()" class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium shadow-xs transition-all hover:bg-emerald-900 ${cls} btn-press">
      <span class="material-symbols-outlined text-[15px] ${state.syncStatus === 'syncing' ? 'animate-spin' : ''}">${icon}</span>
      <span class="hidden sm:inline">${text}</span>
    </button>
  `;
}

export function renderSyncPill() {
  const el = document.getElementById('syncPillBox');
  if (el) el.innerHTML = renderSyncPillHTML();
}
