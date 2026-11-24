// ==============================================================================
// COMPONENT: UNIBODY MASTHEAD & STUDIO NAVIGATION
// Hệ thống Quản lý TDTT - Phường Tân Khai
// Thiết kế Human-Crafted: Nguyên khối, Chuẩn mực công thái học, Bản lĩnh Thể thao
// ==============================================================================

import { state, lsSet } from '../state.js';
import { toggleDarkMode, setColorTheme } from '../utils/toast.js';

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
    { id: 'bang-dieu-khien', label: 'TỔNG QUAN', icon: 'dashboard' },
    { id: 'quan-ly-giai-dau', label: 'GIẢI ĐẤU', icon: 'emoji_events', badge: state.activities.length },
    { id: 'quan-ly-clb', label: 'CLB THỂ THAO', icon: 'groups_2', badge: state.clubs.length },
    { id: 'lich-sinh-hoat', label: 'LỊCH TẬP LUYỆN', icon: 'calendar_month', badge: state.schedules.length },
    { id: 'co-so-vat-chat', label: 'SÂN BÃI & CSVC', icon: 'stadium', badge: state.facilities.length },
    { id: 'kinh-phi', label: 'KINH PHÍ', icon: 'account_balance_wallet', badge: state.budgetItems.length },
    { id: 'bao-cao', label: 'BÁO CÁO CÔNG VĂN', icon: 'summarize', badge: state.savedReports.length }
  ];

  return `
    <header class="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs select-none">
      
      <!-- MAIN UNIBODY MASTHEAD -->
      <div class="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        <!-- Left: Official Institutional Emblem & Title -->
        <div class="flex items-center gap-3 shrink-0">
          <button onclick="toggleMobileDrawer()" class="p-2 -ml-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden btn-press" title="Mở menu">
            <span class="material-symbols-outlined text-[24px]">menu</span>
          </button>

          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center p-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xs shrink-0 overflow-hidden">
              <img src="logo.png" onerror="if(typeof EMBEDDED_LOGO_B64!=='undefined') this.src=EMBEDDED_LOGO_B64" class="w-full h-full object-contain rounded-full" alt="Huy hiệu UBND Phường Tân Khai" />
            </div>
            <div class="flex flex-col text-left">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-tight">
                UBND PHƯỜNG TÂN KHAI • TRUNG TÂM DỊCH VỤ TỔNG HỢP
              </span>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-sm font-sport font-black tracking-wide text-slate-900 dark:text-white uppercase leading-none">
                  ĐIỀU HÀNH THỂ DỤC THỂ THAO
                </span>
                <span class="hidden xl:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  V5.0 PRO
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Center: Desktop Studio Navigation (Thẳng hàng, sắc nét, có đường gạch chân thể thao) -->
        <nav class="hidden lg:flex items-center gap-1 xl:gap-2 h-full">
          ${navs.map(item => {
            const isActive = state.currentTab === item.id;
            return `
              <button 
                onclick="switchTab('${item.id}')" 
                class="studio-nav-btn h-full px-2.5 xl:px-3 flex items-center gap-1.5 text-xs font-sport tracking-wider transition-colors ${
                  isActive 
                    ? 'active text-blue-600 dark:text-blue-400 font-black' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }"
              >
                <span class="material-symbols-outlined text-[17px]">${item.icon}</span>
                <span>${item.label}</span>
                ${item.badge !== undefined ? `
                  <span class="ml-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                    isActive 
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }">
                    ${item.badge}
                  </span>
                ` : ''}
              </button>
            `;
          }).join('')}
        </nav>

        <!-- Right: Action Controls (Command Search, Theme Palette, Cloud Sync, Officer) -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          
          <!-- Command Search Shortcut -->
          <button 
            onclick="window.openCommandPalette()" 
            class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all btn-press"
            title="Mở thanh tìm kiếm (Phím tắt: Ctrl + K)"
          >
            <span class="material-symbols-outlined text-[16px] text-slate-500">search</span>
            <span class="hidden md:inline font-semibold">Tìm kiếm</span>
            <kbd class="hidden sm:inline-block text-[10px] font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-300 dark:border-slate-600 text-slate-500 font-bold">⌘K</kbd>
          </button>

          <!-- 4-Theme Live Switcher Segmented Control (Top-Tier Craft) -->
          <div class="hidden xl:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-sport font-bold tracking-wider shadow-inner" title="Bộ 4 Giao Diện Đẳng Cấp Quốc Tế">
            <button onclick="setColorTheme('sapphire')" class="px-2 py-0.5 rounded transition-all flex items-center gap-1.5 ${(state.colorTheme === 'sapphire' || !state.colorTheme) ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'}">
              <span class="w-2 h-2 rounded-full ${(state.colorTheme === 'sapphire' || !state.colorTheme) ? 'bg-white' : 'bg-blue-600'}"></span>
              <span>SAPPHIRE</span>
            </button>
            <button onclick="setColorTheme('crimson')" class="px-2 py-0.5 rounded transition-all flex items-center gap-1.5 ${state.colorTheme === 'crimson' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-red-600'}">
              <span class="w-2 h-2 rounded-full ${state.colorTheme === 'crimson' ? 'bg-white' : 'bg-red-600'}"></span>
              <span>CRIMSON</span>
            </button>
            <button onclick="setColorTheme('carbon')" class="px-2 py-0.5 rounded transition-all flex items-center gap-1.5 ${state.colorTheme === 'carbon' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-orange-500'}">
              <span class="w-2 h-2 rounded-full ${state.colorTheme === 'carbon' ? 'bg-white' : 'bg-orange-500'}"></span>
              <span>CARBON</span>
            </button>
            <button onclick="setColorTheme('titanium')" class="px-2 py-0.5 rounded transition-all flex items-center gap-1.5 ${state.colorTheme === 'titanium' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-200'}">
              <span class="w-2 h-2 rounded-full ${state.colorTheme === 'titanium' ? 'bg-white' : 'bg-slate-400'}"></span>
              <span>TITANIUM</span>
            </button>
          </div>

          <!-- Compact Dot Switcher for Laptops & Tablets -->
          <div class="flex xl:hidden items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700" title="Chuyển đổi giao diện">
            <button onclick="setColorTheme('sapphire')" class="w-4 h-4 rounded-full bg-blue-600 transition-transform ${(state.colorTheme === 'sapphire' || !state.colorTheme) ? 'ring-2 ring-blue-600 scale-125' : 'opacity-60 hover:opacity-100'}" title="1. Sapphire Pro (Linear/Vercel)"></button>
            <button onclick="setColorTheme('crimson')" class="w-4 h-4 rounded-full bg-red-600 transition-transform ${state.colorTheme === 'crimson' ? 'ring-2 ring-red-600 scale-125' : 'opacity-60 hover:opacity-100'}" title="2. Crimson Athletic (Nike/Olympic)"></button>
            <button onclick="setColorTheme('carbon')" class="w-4 h-4 rounded-full bg-orange-500 transition-transform ${state.colorTheme === 'carbon' ? 'ring-2 ring-orange-500 scale-125' : 'opacity-60 hover:opacity-100'}" title="3. Carbon Studio (Raycast/Stripe)"></button>
            <button onclick="setColorTheme('titanium')" class="w-4 h-4 rounded-full bg-slate-500 transition-transform ${state.colorTheme === 'titanium' ? 'ring-2 ring-slate-500 scale-125' : 'opacity-60 hover:opacity-100'}" title="4. Titanium Executive (Apple)"></button>
          </div>

          <!-- Cloud Sync Pill -->
          <div id="syncPillBox">${renderSyncPillHTML()}</div>

          <!-- Dark Mode Toggle -->
          <button onclick="toggleDarkMode()" title="Chế độ sáng/tối" class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors btn-press">
            <span class="material-symbols-outlined text-[19px]">${state.darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>

          <!-- Officer Profile -->
          <div class="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div class="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs shrink-0 font-sport">
              TQD
            </div>
            <div class="hidden 2xl:flex flex-col text-left">
              <span class="text-xs font-bold leading-tight text-slate-900 dark:text-slate-100">Trần Quốc Được</span>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Cán bộ phụ trách TDTT</span>
            </div>
            <button onclick="handleLogout()" title="Đăng xuất" class="p-1 text-slate-400 hover:text-rose-600 transition-colors">
              <span class="material-symbols-outlined text-[17px]">logout</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  `;
}

export function renderSyncPillHTML() {
  let icon = 'cloud_done';
  let text = 'Drive OK';
  let cls = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700';

  if (state.syncStatus === 'syncing') {
    icon = 'sync';
    text = 'Đang đồng bộ...';
    cls = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse';
  } else if (!state.apiUrl) {
    icon = 'cloud_off';
    text = 'Cục bộ';
    cls = 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700';
  } else if (state.syncStatus === 'error') {
    icon = 'cloud_alert';
    text = 'Lỗi kết nối';
    cls = 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700';
  }

  return `
    <button onclick="openSyncModal()" class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold shadow-2xs transition-all hover:opacity-90 ${cls} btn-press">
      <span class="material-symbols-outlined text-[15px] ${state.syncStatus === 'syncing' ? 'animate-spin' : ''}">${icon}</span>
      <span class="hidden sm:inline">${text}</span>
    </button>
  `;
}

export function renderSyncPill() {
  const el = document.getElementById('syncPillBox');
  if (el) el.innerHTML = renderSyncPillHTML();
}
