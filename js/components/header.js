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
      
      <!-- Top Red Strip: Tiêu đề hệ thống to rõ ràng căn giữa + Nút Day-Night Switch (176px x 74px) + Tài khoản cán bộ Trần Quốc Được -->
      <div class="bg-[#b91c1c] text-white px-4 sm:px-6 py-3 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 shadow-md border-b border-red-800 relative">
        
        <!-- Left: Cổng điều hành số -->
        <div class="hidden lg:flex items-center gap-3 shrink-0 min-w-[190px]">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-xs"></span>
          <div class="flex flex-col text-left leading-tight">
            <span class="text-xs font-bold text-amber-200 uppercase tracking-widest">CỔNG ĐIỀU HÀNH SỐ</span>
            <span class="text-[10px] text-red-200 font-medium">UBND PHƯỜNG TÂN KHAI</span>
          </div>
        </div>

        <!-- Center: HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO • PHƯỜNG TÂN KHAI (TO, RÕ, CĂN GIỮA) -->
        <div class="flex-1 text-center px-2 py-0.5">
          <h1 class="text-sm sm:text-base md:text-lg lg:text-xl font-bold uppercase tracking-wider text-amber-200 drop-shadow-sm leading-tight">
            ★ HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO • PHƯỜNG TÂN KHAI ★
          </h1>
          <p class="text-[10.5px] sm:text-[11.5px] text-red-100 font-medium tracking-wide mt-0.5 hidden sm:block opacity-90">
            TRUNG TÂM DỊCH VỤ TỔNG HỢP • BỘ PHẬN THỂ DỤC THỂ THAO
          </p>
        </div>

        <!-- Right: Nút Day-Night Sky Switch (176px x 74px chuẩn gốc) ngay sát bên cạnh Tên Cán bộ Trần Quốc Được -->
        <div class="flex items-center justify-end gap-3 sm:gap-4 shrink-0">
          
          <!-- Day–Night Sky Switch (Lucian UX/UI #447 - Kích thước chuẩn y file gốc 176px x 74px) -->
          <div class="u447-wrapper" title="Chuyển chế độ Sáng / Tối (Ngày & Đêm)">
            <button 
              type="button" 
              id="dayNightSwitch" 
              class="u447-b" 
              role="switch" 
              aria-checked="${state.darkMode ? 'true' : 'false'}" 
              aria-label="Chuyển chế độ Sáng / Tối" 
              onclick="toggleDarkMode()"
            >
              <span class="u447-sky"></span>
              <span class="u447-ngt"></span>
              <span class="u447-meteor"></span>
              <svg class="u447-sr" viewBox="0 0 90 58" aria-hidden="true">
                <path d="M14 9Q14 14 19 14Q14 14 14 19Q14 14 9 14Z"/>
                <path d="M42 6Q42 10 46 10Q42 10 42 14Q42 10 38 10Q42 10 42 6Z"/>
                <path d="M28 31Q28 35 32 35Q28 35 28 39Q28 35 24 35Q28 35 28 31Z"/>
                <path d="M60 23Q60 26 63 26Q60 26 60 29Q60 26 57 26Q60 26 60 23Z"/>
                <circle cx="7" cy="31" r="1.3"/>
                <circle cx="50" cy="42" r="1.1"/>
                <circle cx="68" cy="10" r="1.3"/>
                <circle cx="36" cy="51" r="1"/>
                <circle cx="76" cy="38" r="1"/>
              </svg>
              <span class="u447-halo"><i></i><i></i><i></i></span>
              <svg class="u447-cl" viewBox="0 0 136 68" aria-hidden="true">
                <g fill="#CFE7FF">
                  <circle cx="34" cy="46" r="18"/><circle cx="58" cy="36" r="20"/>
                  <circle cx="86" cy="40" r="18"/><circle cx="110" cy="28" r="21"/><circle cx="132" cy="40" r="18"/>
                </g>
                <g fill="#FFFFFF">
                  <circle cx="22" cy="60" r="16"/><circle cx="46" cy="52" r="18"/>
                  <circle cx="74" cy="56" r="18"/><circle cx="98" cy="46" r="19"/><circle cx="124" cy="54" r="19"/>
                </g>
              </svg>
              <span class="u447-th">
                <svg viewBox="0 0 62 62" aria-hidden="true">
                  <circle cx="22" cy="24" r="6.5"/>
                  <circle cx="40" cy="38" r="8"/>
                  <circle cx="39" cy="18" r="3.6"/>
                </svg>
              </span>
            </button>
          </div>

          <!-- Thông tin Tên Cán bộ Trần Quốc Được -->
          ${state.isAuthenticated ? `
            <div class="flex items-center gap-3 bg-red-950/70 border border-red-700/80 rounded-2xl px-4 py-2.5 shadow-inner">
              <div class="w-10 h-10 rounded-full bg-amber-400 text-red-950 flex items-center justify-center font-bold text-sm shrink-0 shadow-md ring-2 ring-white/60">
                TQD
              </div>
              <div class="hidden sm:flex flex-col text-left leading-tight">
                <span class="text-sm font-bold text-white tracking-wide">Trần Quốc Được</span>
                <span class="text-[10.5px] text-amber-200 font-semibold uppercase tracking-wider">Cán bộ TDTT</span>
              </div>
              <button onclick="handleLogout()" title="Đăng xuất khỏi hệ thống" class="p-1.5 rounded-full text-amber-200 hover:text-white hover:bg-red-800 transition-colors btn-press ml-1">
                <span class="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          ` : `
            <button onclick="window.openLoginModal()" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-red-950 font-bold text-sm shadow-md transition-all btn-press">
              <span class="material-symbols-outlined text-[18px]">login</span>
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
          
          </div>
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
