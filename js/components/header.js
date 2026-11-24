// ==============================================================================
// COMPONENT: HEADER & TOP NAVIGATION DOCK (SPORTS IOC + GOVTECH 4.0)
// Hệ thống Quản lý TDTT - Phường Tân Khai
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

export function renderHeader() {
  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
  const dateStr = today.toLocaleDateString('vi-VN', dateOptions);

  const navs = [
    { id: 'bang-dieu-khien', label: 'Bảng điều khiển', icon: 'dashboard' },
    { id: 'quan-ly-giai-dau', label: 'Giải đấu', icon: 'emoji_events', badge: state.activities.length },
    { id: 'quan-ly-clb', label: 'Quản lý CLB', icon: 'groups_2', badge: state.clubs.length },
    { id: 'lich-sinh-hoat', label: 'Lịch sinh hoạt', icon: 'calendar_month', badge: state.schedules.length },
    { id: 'co-so-vat-chat', label: 'Cơ sở vật chất', icon: 'stadium', badge: state.facilities.length },
    { id: 'kinh-phi', label: 'Quản lý kinh phí', icon: 'account_balance_wallet', badge: state.budgetItems.length },
    { id: 'bao-cao', label: 'Báo cáo & Lưu trữ', icon: 'summarize', badge: state.savedReports.length }
  ];

  return `
    <header class="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      
      <!-- TOP INSTITUTIONAL STRIP (GOVTECH 4.0 + CONTROLS) -->
      <div class="px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4 border-b border-slate-100 dark:border-slate-800/80">
        
        <!-- Left: Agency Brand & Logo -->
        <div class="flex items-center gap-3 shrink-0">
          <button onclick="toggleMobileDrawer()" class="p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden btn-press" title="Mở danh mục">
            <span class="material-symbols-outlined text-[22px]">menu</span>
          </button>

          <div class="flex items-center gap-3">
            <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center p-1 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden group">
              <img src="logo.png" onerror="if(typeof EMBEDDED_LOGO_B64!=='undefined') this.src=EMBEDDED_LOGO_B64" class="w-full h-full object-contain rounded-full transition-transform duration-300 group-hover:scale-105" alt="Huy hiệu UBND Phường Tân Khai" />
            </div>
            <div class="flex flex-col text-left">
              <div class="flex items-center gap-2">
                <span class="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">UBND PHƯỜNG TÂN KHAI</span>
                <span class="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span class="hidden sm:inline-block text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Hệ thống Thể thao 4.0</span>
              </div>
              <h1 class="text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-tight text-emerald-700 dark:text-emerald-400 leading-tight">
                TRUNG TÂM DỊCH VỤ TỔNG HỢP
              </h1>
            </div>
          </div>
        </div>

        <!-- Right Side: Fast Command Palette, Cloud Sync, Dark Mode, Profile -->
        <div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          <!-- Command Palette Trigger Button (Ctrl + K) -->
          <button 
            onclick="window.openCommandPalette()" 
            class="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 text-xs font-medium transition-all shadow-xs btn-press"
            title="Mở tìm kiếm nhanh (Phím tắt: Ctrl + K)"
          >
            <span class="material-symbols-outlined text-[17px] text-emerald-600 dark:text-emerald-400">search</span>
            <span class="hidden md:inline">Tìm kiếm...</span>
            <kbd class="hidden sm:inline-block text-[10px] font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-slate-500 font-bold">⌘K</kbd>
          </button>

          <!-- Cloud Sync Pill -->
          <div id="syncPillBox">${renderSyncPillHTML()}</div>

          <!-- 4-Theme Quick Switcher -->
          <div class="hidden sm:flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700" title="Chọn nhanh giao diện màu">
            <button onclick="setColorTheme('sapphire')" class="w-5 h-5 rounded-full bg-blue-600 transition-all ${state.colorTheme === 'sapphire' ? 'ring-2 ring-offset-1 ring-blue-600 scale-110 shadow-xs' : 'opacity-65 hover:opacity-100'}" title="Giao diện 1: Xanh Sapphire Thể Thao (Olympic & IOC)"></button>
            <button onclick="setColorTheme('crimson')" class="w-5 h-5 rounded-full bg-red-600 transition-all ${state.colorTheme === 'crimson' ? 'ring-2 ring-offset-1 ring-red-600 scale-110 shadow-xs' : 'opacity-65 hover:opacity-100'}" title="Giao diện 2: Đỏ Đô Thể Thao Việt Nam & Hoàng Gia"></button>
            <button onclick="setColorTheme('carbon')" class="w-5 h-5 rounded-full bg-orange-500 transition-all ${state.colorTheme === 'carbon' ? 'ring-2 ring-offset-1 ring-orange-500 scale-110 shadow-xs' : 'opacity-65 hover:opacity-100'}" title="Giao diện 3: Đen Carbon & Cam Năng Lượng (Nike/Strava)"></button>
            <button onclick="setColorTheme('titanium')" class="w-5 h-5 rounded-full bg-slate-600 transition-all ${state.colorTheme === 'titanium' ? 'ring-2 ring-offset-1 ring-slate-600 scale-110 shadow-xs' : 'opacity-65 hover:opacity-100'}" title="Giao diện 4: Xám Titan Siêu Tối Giản Đẳng Cấp"></button>
            <button onclick="setColorTheme('emerald')" class="w-5 h-5 rounded-full bg-emerald-600 transition-all ${state.colorTheme === 'emerald' ? 'ring-2 ring-offset-1 ring-emerald-600 scale-110 shadow-xs' : 'opacity-65 hover:opacity-100'}" title="Giao diện 5: Xanh Ngọc Lục Bảo UBND Gốc"></button>
          </div>

          <!-- Dark Mode Toggle -->
          <button onclick="toggleDarkMode()" title="Chế độ sáng/tối" class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all btn-press">
            <span class="material-symbols-outlined text-[19px]">${state.darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>

          <!-- Officer Profile -->
          <div class="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-black text-xs shadow-sm shrink-0">
              TQD
            </div>
            <div class="hidden xl:flex flex-col text-left">
              <span class="text-xs font-bold leading-tight text-slate-900 dark:text-slate-100">Trần Quốc Được</span>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Cán bộ phụ trách TDTT</span>
            </div>
            <button onclick="handleLogout()" title="Đăng xuất" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-0.5 btn-press">
              <span class="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </div>

      <!-- DESKTOP TOP SEGMENTED NAVIGATION DOCK (IOC SPORTS ARCHITECTURE) -->
      <div class="hidden lg:flex items-center justify-between px-3 sm:px-6 lg:px-8 py-2 overflow-x-auto no-scrollbar">
        <nav class="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          ${navs.map(item => {
            const isActive = state.currentTab === item.id;
            const cls = isActive
              ? 'bg-emerald-700 text-white font-bold shadow-sm dark:bg-emerald-600'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white font-semibold';
            return `
              <button onclick="switchTab('${item.id}')" class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all ${cls} btn-press">
                <span class="material-symbols-outlined text-[18px]">${item.icon}</span>
                <span>${item.label}</span>
                ${item.badge !== undefined ? `
                  <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive 
                      ? 'bg-white/25 text-white' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }">
                    ${item.badge}
                  </span>
                ` : ''}
              </button>
            `;
          }).join('')}
        </nav>

        <!-- Right Quick Status: Date Indicator -->
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <span class="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">calendar_month</span>
          <span class="capitalize">${dateStr}</span>
        </div>
      </div>
    </header>
  `;
}

export function renderSyncPillHTML() {
  let icon = 'cloud_done';
  let text = 'Đã lưu Drive';
  let cls = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

  if (state.syncStatus === 'syncing') {
    icon = 'sync';
    text = 'Đang đồng bộ...';
    cls = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 animate-pulse';
  } else if (!state.apiUrl) {
    icon = 'cloud_off';
    text = 'Lưu cục bộ';
    cls = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  } else if (state.syncStatus === 'error') {
    icon = 'cloud_alert';
    text = 'Lỗi Cloud';
    cls = 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
  }

  return `
    <button onclick="openSyncModal()" class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold shadow-xs transition-all hover:opacity-90 ${cls} btn-press">
      <span class="material-symbols-outlined text-[15px] ${state.syncStatus === 'syncing' ? 'animate-spin' : ''}">${icon}</span>
      <span class="hidden sm:inline">${text}</span>
    </button>
  `;
}

export function renderSyncPill() {
  const el = document.getElementById('syncPillBox');
  if (el) el.innerHTML = renderSyncPillHTML();
}
