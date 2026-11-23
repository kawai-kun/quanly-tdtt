// ==============================================================================
// COMPONENT: HEADER & CLOUD SYNC PILL
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

      return `
        <header class="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 shadow-sm">
          
          <!-- Left Side: Mobile Menu Button & Brand Indicator -->
          <div class="flex items-center gap-2 sm:gap-3 shrink-0">
            <button onclick="toggleMobileDrawer()" class="p-2 -ml-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden btn-press" title="Mở danh mục">
              <span class="material-symbols-outlined text-[22px]">menu</span>
            </button>
            
            <!-- Mobile Brand: Logo + HỆ THỐNG QUẢN LÝ TDTT -->
            <div class="flex lg:hidden items-center gap-2">
              <div class="w-9 h-9 rounded-full flex items-center justify-center p-0.5 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden">
                <img src="logo.png" onerror="if(typeof EMBEDDED_LOGO_B64!=='undefined') this.src=EMBEDDED_LOGO_B64" class="w-full h-full object-contain rounded-full" alt="Logo Phường Tân Khai" />
              </div>
              <div class="hidden xs:flex flex-col text-left">
                <span class="text-[11px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400 leading-tight">QUẢN LÝ TDTT</span>
              </div>
            </div>

            <!-- Desktop Left Indicator: Date Badge -->
            <div class="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span class="material-symbols-outlined text-[16px] text-emerald-700 dark:text-emerald-400">calendar_today</span>
              <span class="capitalize">${dateStr}</span>
            </div>
          </div>

          <!-- CENTER: Institutional Title (UBND PHƯỜNG TÂN KHAI & TRUNG TÂM DỊCH VỤ TỔNG HỢP) -->
          <div class="flex-1 flex flex-col items-center justify-center text-center px-1 sm:px-2 min-w-0">
            <span class="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 truncate leading-tight">
              ỦY BAN NHÂN DÂN PHƯỜNG TÂN KHAI
            </span>
            <h1 class="text-xs sm:text-base md:text-lg lg:text-xl font-bold uppercase tracking-tight text-emerald-700 dark:text-emerald-400 truncate leading-tight mt-0.5 sm:mt-1">
              TRUNG TÂM DỊCH VỤ TỔNG HỢP
            </h1>
          </div>

          <!-- Right Side: Cloud Sync, Dark Mode, Profile -->
          <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div id="syncPillBox">${renderSyncPillHTML()}</div>

            <button onclick="toggleDarkMode()" title="Chế độ sáng/tối" class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all btn-press">
              <span class="material-symbols-outlined text-[20px]">${state.darkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>

            <div class="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
              <div class="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                TK
              </div>
              <div class="hidden xl:flex flex-col text-left">
                <span class="text-xs font-bold leading-tight text-slate-900 dark:text-slate-100">Trần Quốc Được</span>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Trung tâm DV Tổng hợp</span>
              </div>
              <button onclick="handleLogout()" title="Đăng xuất" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-0.5 btn-press">
                <span class="material-symbols-outlined text-[18px]">logout</span>
              </button>
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
        <button onclick="openSyncModal()" class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold shadow-sm transition-all hover:opacity-90 ${cls}">
          <span class="material-symbols-outlined text-[15px] ${state.syncStatus === 'syncing' ? 'animate-spin' : ''}">${icon}</span>
          <span class="hidden sm:inline">${text}</span>
        </button>
      `;
    }

    export function renderSyncPill() {
      const el = document.getElementById('syncPillBox');
      if (el) el.innerHTML = renderSyncPillHTML();
    }

