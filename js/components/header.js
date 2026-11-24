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

export function renderThemeSwitcherPills(extraCls = '') {
  return `
    <div class="flex items-center gap-1.5 p-1 bg-slate-900/15 dark:bg-slate-900/95 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-sport font-bold tracking-wider shadow-inner ${extraCls}" title="Chuyển đổi 4 bản giao diện khác biệt hoàn toàn về kiến trúc và màu sắc">
      <button onclick="setColorTheme('sapphire')" class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${(state.colorTheme === 'sapphire' || !state.colorTheme) ? 'bg-blue-600 text-white shadow-md font-black ring-2 ring-cyan-400' : 'text-slate-700 dark:text-slate-300 hover:text-blue-600'}" title="Bản 1: IOC Command Center">
        <span class="w-2.5 h-2.5 rounded-full ${(state.colorTheme === 'sapphire' || !state.colorTheme) ? 'bg-cyan-300 shadow-[0_0_8px_#00e5ff]' : 'bg-blue-600'}"></span>
        <span>1. SAPPHIRE</span>
      </button>
      <button onclick="setColorTheme('crimson')" class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${state.colorTheme === 'crimson' ? 'bg-red-600 text-white shadow-md font-black ring-2 ring-amber-400' : 'text-slate-700 dark:text-slate-300 hover:text-red-600'}" title="Bản 2: Sân Vận Động Rực Lửa">
        <span class="w-2.5 h-2.5 rounded-full ${state.colorTheme === 'crimson' ? 'bg-amber-300 shadow-[0_0_8px_#ff0055]' : 'bg-red-600'}"></span>
        <span>2. CRIMSON</span>
      </button>
      <button onclick="setColorTheme('carbon')" class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${state.colorTheme === 'carbon' ? 'bg-orange-500 text-white shadow-md font-black ring-2 ring-orange-300' : 'text-slate-700 dark:text-slate-300 hover:text-orange-500'}" title="Bản 3: Modern Left-Sidebar Studio">
        <span class="w-2.5 h-2.5 rounded-full ${state.colorTheme === 'carbon' ? 'bg-yellow-300 shadow-[0_0_8px_#ff6b00]' : 'bg-orange-500'}"></span>
        <span>3. CARBON</span>
      </button>
      <button onclick="setColorTheme('titanium')" class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${state.colorTheme === 'titanium' ? 'bg-emerald-700 text-white shadow-md font-black ring-2 ring-emerald-300' : 'text-slate-700 dark:text-slate-300 hover:text-emerald-700'}" title="Bản 4: Sổ Bộ Hành Chính Nhà Nước">
        <span class="w-2.5 h-2.5 rounded-full ${state.colorTheme === 'titanium' ? 'bg-emerald-200 shadow-[0_0_8px_#00e676]' : 'bg-emerald-700'}"></span>
        <span>4. TITANIUM</span>
      </button>
    </div>
  `;
}

// ==============================================================================
// GIAO DIỆN BẢN 1: EXECUTIVE IOC COMMAND CENTER (MẶC ĐỊNH - SAPPHIRE)
// ==============================================================================
function renderSapphireIocHeader(navs) {
  return `
    <header class="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-2 border-slate-300 dark:border-slate-800 shadow-md select-none">
      <div class="px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        <!-- Left: Official Institutional Emblem & Title -->
        <div class="flex items-center gap-3 shrink-0 py-2">
          <button onclick="toggleMobileDrawer()" class="p-2 -ml-1 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden btn-press" title="Mở menu">
            <span class="material-symbols-outlined text-[26px]">menu</span>
          </button>

          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-full flex items-center justify-center p-0.5 bg-white dark:bg-slate-800 border-2 border-blue-600 shadow-md shrink-0 overflow-hidden ring-2 ring-cyan-400/40">
              <img src="logo.png" onerror="if(typeof EMBEDDED_LOGO_B64!=='undefined') this.src=EMBEDDED_LOGO_B64" class="w-full h-full object-contain rounded-full" alt="Huy hiệu UBND Phường Tân Khai" />
            </div>
            <div class="flex flex-col text-left">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 leading-tight">
                UBND PHƯỜNG TÂN KHAI • TRUNG TÂM DỊCH VỤ TỔNG HỢP
              </span>
              <div class="flex items-center gap-2.5 mt-0.5">
                <span class="text-lg sm:text-xl font-sport font-black tracking-wide text-slate-900 dark:text-white uppercase leading-none">
                  TRUNG TÂM CHỈ HUY THỂ THAO
                </span>
                <span class="hidden xl:inline-block px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 shadow-[0_0_8px_rgba(0,229,255,0.4)]">
                  IOC PRO
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Center: Desktop Studio Navigation Dock (Tách Biệt Màu Nền So Với Header) -->
        <nav class="hidden lg:flex items-center studio-nav-dock">
          ${navs.map(item => {
            const isActive = state.currentTab === item.id;
            return `
              <button 
                onclick="switchTab('${item.id}')" 
                class="studio-nav-btn ${isActive ? 'active' : ''}"
                title="${item.label}"
              >
                <span class="material-symbols-outlined text-[20px]">${item.icon}</span>
                <span>${item.label}</span>
                ${item.badge !== undefined ? `
                  <span class="studio-badge ml-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                    isActive ? '' : 'bg-slate-700/80 text-slate-200'
                  }">
                    ${item.badge}
                  </span>
                ` : ''}
              </button>
            `;
          }).join('')}
        </nav>

        <!-- Right Controls -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <button onclick="window.openCommandPalette()" class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold btn-press" title="Tìm kiếm (Ctrl+K)">
            <span class="material-symbols-outlined text-[18px]">search</span>
            <span class="hidden md:inline">Tìm kiếm</span>
            <kbd class="hidden sm:inline-block text-[11px] font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-slate-500 font-bold">⌘K</kbd>
          </button>

          ${renderThemeSwitcherPills('hidden xl:flex')}
          <div id="syncPillBox">${renderSyncPillHTML()}</div>
          <button onclick="toggleDarkMode()" title="Chế độ sáng/tối" class="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 btn-press">
            <span class="material-symbols-outlined text-[20px]">${state.darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>

          <!-- Officer Profile -->
          <div class="flex items-center gap-2.5 pl-2.5 border-l border-slate-300 dark:border-slate-800">
            <div class="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 font-sport shadow-md shadow-blue-500/30">TQD</div>
            <div class="hidden 2xl:flex flex-col text-left">
              <span class="text-xs font-bold leading-tight text-slate-900 dark:text-slate-100">Trần Quốc Được</span>
              <span class="text-[11px] text-slate-500 font-medium">Cán bộ TDTT</span>
            </div>
            <button onclick="handleLogout()" title="Đăng xuất" class="p-1.5 text-slate-400 hover:text-rose-600">
              <span class="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  `;
}

// ==============================================================================
// GIAO DIỆN BẢN 2: ATHLETIC ARENA BROADCAST (SÂN VẬN ĐỘNG RỰC LỬA - CRIMSON)
// ==============================================================================
function renderCrimsonArenaHeader(navs) {
  return `
    <header class="sticky top-0 z-40 w-full bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-white border-b-4 border-amber-400 shadow-2xl select-none">
      
      <!-- Top Running Banner Ticker -->
      <div class="bg-red-950/90 px-4 py-1.5 text-xs font-sport font-black uppercase tracking-widest text-amber-300 flex items-center justify-between border-b border-red-900/80">
        <div class="flex items-center gap-2.5">
          <span class="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
          <span class="text-xs sm:text-sm">SÂN VẬN ĐỘNG THỂ THAO ĐIỀU HÀNH TRỰC TIẾP • BẢN LĨNH THỂ THAO PHƯỜNG TÂN KHAI</span>
        </div>
        <div class="hidden sm:flex items-center gap-4 text-white font-mono text-xs">
          <span class="px-2 py-0.5 rounded bg-red-900 border border-amber-400/30">30 GIẢI ĐẤU QUY MÔ</span>
          <span class="px-2 py-0.5 rounded bg-red-900 border border-amber-400/30">168 TỔNG HUY CHƯƠNG</span>
        </div>
      </div>

      <div class="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        <!-- Left: Athletic Emblem & Title -->
        <div class="flex items-center gap-3.5 shrink-0 py-2">
          <div class="w-13 h-13 rounded-full flex items-center justify-center p-0.5 bg-amber-400 shadow-lg shrink-0 overflow-hidden ring-2 ring-red-400">
            <img src="logo.png" onerror="if(typeof EMBEDDED_LOGO_B64!=='undefined') this.src=EMBEDDED_LOGO_B64" class="w-full h-full object-contain rounded-full" alt="Logo" />
          </div>
          <div class="flex flex-col text-left">
            <span class="text-xs font-sport font-black uppercase tracking-widest text-amber-300 leading-none">
              ỦY BAN NHÂN DÂN PHƯỜNG TÂN KHAI
            </span>
            <h1 class="text-xl sm:text-2xl font-sport font-black tracking-wider text-white uppercase leading-tight mt-0.5 flex items-center gap-2">
              <span>ĐẤU TRƯỜNG THỂ THAO ARENA</span>
              <span class="px-2 py-0.5 rounded text-xs bg-amber-400 text-red-950 font-black shadow-[0_0_10px_#f59e0b]">BẢN 2</span>
            </h1>
          </div>
        </div>

        <!-- Center: Arena Dock Navigation with Gold Active Pill -->
        <nav class="hidden lg:flex items-center p-1.5 bg-red-950/95 rounded-xl border-2 border-red-700/80 shadow-2xl gap-1.5">
          ${navs.map(item => {
            const isActive = state.currentTab === item.id;
            return `
              <button 
                onclick="switchTab('${item.id}')" 
                class="px-4 py-2 rounded-lg font-sport font-black text-sm sm:text-base tracking-wider flex items-center gap-2 transition-all ${
                  isActive 
                    ? 'bg-amber-400 text-red-950 shadow-[0_0_16px_rgba(255,0,85,0.7)] scale-105 ring-2 ring-white/60 font-black' 
                    : 'text-red-200 hover:text-white hover:bg-red-800/80'
                }"
              >
                <span class="material-symbols-outlined text-[20px]">${item.icon}</span>
                <span>${item.label}</span>
                ${item.badge !== undefined ? `
                  <span class="ml-1 px-2 py-0.5 rounded-full text-xs font-mono font-black ${
                    isActive ? 'bg-red-900 text-amber-300' : 'bg-red-900/80 text-red-200'
                  }">
                    ${item.badge}
                  </span>
                ` : ''}
              </button>
            `;
          }).join('')}
        </nav>

        <!-- Right Controls -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          ${renderThemeSwitcherPills('hidden xl:flex bg-red-950/90 border-red-800')}
          <div id="syncPillBox">${renderSyncPillHTML()}</div>
          <button onclick="toggleDarkMode()" title="Chế độ sáng/tối" class="p-2 rounded-lg text-amber-300 hover:bg-red-900/80 btn-press">
            <span class="material-symbols-outlined text-[20px]">${state.darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </div>

      </div>
    </header>
  `;
}

// ==============================================================================
// GIAO DIỆN BẢN 4: CHÍNH QUYỀN ĐIỆN TỬ & SỔ BỘ HÀNH CHÍNH (GOV LEDGER - TITANIUM)
// ==============================================================================
function renderGovOfficialHeader(navs) {
  return `
    <header class="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b-2 border-emerald-800 shadow-md select-none">
      
      <!-- Top Red Strip with National Motto -->
      <div class="bg-red-700 text-white px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm border-b border-red-800">
        <div class="font-bold tracking-wider uppercase flex items-center gap-2">
          <span>★ CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM • Độc lập - Tự do - Hạnh phúc</span>
        </div>
        <div class="text-xs text-red-100 font-medium mt-0.5 sm:mt-0 flex items-center gap-3">
          <span>Hệ thống Quản lý Hành chính Thể dục Thể thao Phường Tân Khai</span>
          <span class="font-mono bg-red-900 px-2 py-0.5 rounded font-bold">NĐ 30/2020/NĐ-CP</span>
        </div>
      </div>

      <!-- Main Government Masthead -->
      <div class="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 bg-emerald-850 bg-[#047857] text-white">
        
        <!-- Left: Official Emblem & Department Name -->
        <div class="flex items-center gap-3.5 shrink-0 py-2">
          <div class="w-13 h-13 rounded-full flex items-center justify-center p-0.5 bg-white shadow-md shrink-0 overflow-hidden border-2 border-amber-400">
            <img src="logo.png" onerror="if(typeof EMBEDDED_LOGO_B64!=='undefined') this.src=EMBEDDED_LOGO_B64" class="w-full h-full object-contain rounded-full" alt="Huy hiệu UBND Phường Tân Khai" />
          </div>
          <div class="flex flex-col text-left">
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-100 leading-tight">
              ỦY BAN NHÂN DÂN PHƯỜNG TÂN KHAI
            </span>
            <h1 class="text-lg sm:text-xl font-bold tracking-wide text-white uppercase leading-snug">
              TRUNG TÂM DỊCH VỤ TỔNG HỢP • BỘ PHẬN TDTT
            </h1>
          </div>
        </div>

        <!-- Center: Official Government Tab Bar -->
        <nav class="hidden lg:flex items-center p-1.5 bg-emerald-900/90 rounded-xl border border-emerald-600 shadow-inner gap-1.5">
          ${navs.map(item => {
            const isActive = state.currentTab === item.id;
            return `
              <button 
                onclick="switchTab('${item.id}')" 
                class="px-4 py-2 rounded-lg font-bold text-sm tracking-wider flex items-center gap-2 transition-all ${
                  isActive 
                    ? 'bg-white text-emerald-950 shadow-md font-black ring-2 ring-emerald-300' 
                    : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
                }"
              >
                <span class="material-symbols-outlined text-[19px]">${item.icon}</span>
                <span>${item.label}</span>
                ${item.badge !== undefined ? `
                  <span class="ml-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                    isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-emerald-950 text-emerald-200'
                  }">
                    ${item.badge}
                  </span>
                ` : ''}
              </button>
            `;
          }).join('')}
        </nav>

        <!-- Right Controls -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          ${renderThemeSwitcherPills('hidden xl:flex bg-emerald-950/80 border-emerald-700')}
          <div id="syncPillBox">${renderSyncPillHTML()}</div>
          <button onclick="toggleDarkMode()" title="Chế độ sáng/tối" class="p-2 rounded text-emerald-100 hover:bg-emerald-800 btn-press">
            <span class="material-symbols-outlined text-[20px]">${state.darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </div>

      </div>
    </header>
  `;
}

// ==============================================================================
// GIAO DIỆN BẢN 3: MODERN STUDIO / LEFT-SIDEBAR DOCK (BENTO STUDIO - CARBON)
// ==============================================================================
export function renderLeftSidebarStudio() {
  const navs = getGlobalNavs();
  return `
    <aside class="hidden lg:flex w-72 h-screen sticky top-0 bg-[#090d16] text-white p-5 flex-col justify-between border-r border-slate-800 shadow-2xl z-40 select-none shrink-0">
      <div>
        
        <!-- Logo & Studio Header -->
        <div class="flex items-center gap-3 pb-5 border-b border-slate-800/80">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center p-0.5 bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30 shrink-0 overflow-hidden ring-2 ring-orange-400">
            <img src="logo.png" onerror="if(typeof EMBEDDED_LOGO_B64!=='undefined') this.src=EMBEDDED_LOGO_B64" class="w-full h-full object-contain rounded-xl" alt="Logo" />
          </div>
          <div class="flex flex-col text-left">
            <span class="text-xs font-sport font-black uppercase tracking-widest text-orange-400 leading-tight">
              PHƯỜNG TÂN KHAI
            </span>
            <span class="text-base font-sport font-black tracking-wider text-white uppercase mt-0.5">
              STUDIO TDTT PRO
            </span>
            <span class="text-xs font-mono text-slate-400">BẢN 3: BENTO SIDEBAR</span>
          </div>
        </div>

        <!-- Vertical Menu Navigation -->
        <nav class="mt-5 space-y-2">
          ${navs.map(item => {
            const isActive = state.currentTab === item.id;
            return `
              <button 
                onclick="switchTab('${item.id}')" 
                class="w-full px-4 py-3 rounded-xl font-sport font-bold text-sm sm:text-base tracking-wider flex items-center justify-between transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black shadow-[0_0_18px_rgba(255,107,0,0.5)] scale-102 ring-2 ring-orange-300' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }"
              >
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-[22px] ${isActive ? 'text-white' : 'text-slate-400'}">${item.icon}</span>
                  <span>${item.label}</span>
                </div>
                ${item.badge !== undefined ? `
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                    isActive ? 'bg-white/30 text-white' : 'bg-slate-800 text-slate-300'
                  }">
                    ${item.badge}
                  </span>
                ` : ''}
              </button>
            `;
          }).join('')}
        </nav>

      </div>

      <!-- Bottom Studio Controls & Profile -->
      <div class="pt-4 border-t border-slate-800/80 space-y-3">
        <!-- 4 Theme Pills in Sidebar -->
        <div class="space-y-1">
          <span class="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">CHUYỂN 4 GIAO DIỆN:</span>
          ${renderThemeSwitcherPills('w-full justify-between')}
        </div>

        <!-- Officer Card -->
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-xs font-sport">
              TQD
            </div>
            <div class="text-left">
              <p class="text-xs font-bold text-white leading-tight">Trần Quốc Được</p>
              <p class="text-[10px] text-slate-400">Cán bộ phụ trách</p>
            </div>
          </div>
          <button onclick="handleLogout()" title="Đăng xuất" class="p-1 text-slate-500 hover:text-rose-400">
            <span class="material-symbols-outlined text-[17px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  `;
}

export function renderStudioTopBar() {
  return `
    <header class="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-300 dark:border-slate-800 shadow-xs h-16 px-6 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button onclick="toggleMobileDrawer()" class="p-2 rounded-lg text-slate-700 lg:hidden btn-press">
          <span class="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <div class="flex items-center gap-2">
          <span class="font-sport font-black text-base uppercase text-slate-900 dark:text-white">
            ${state.currentTab.replace(/-/g, ' ').toUpperCase()}
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-100 text-orange-700 border border-orange-200">
            BẢN 3: BENTO PRO
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button onclick="window.openCommandPalette()" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium btn-press">
          <span class="material-symbols-outlined text-[16px]">search</span>
          <span>Tìm nhanh</span>
          <kbd class="text-[10px] font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border text-slate-500">⌘K</kbd>
        </button>
        <div id="syncPillBox">${renderSyncPillHTML()}</div>
        <button onclick="toggleDarkMode()" title="Chế độ sáng/tối" class="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 btn-press">
          <span class="material-symbols-outlined text-[19px]">${state.darkMode ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </div>
    </header>
  `;
}

// MAIN RENDER HEADER ROUTER
export function renderHeader() {
  const navs = getGlobalNavs();
  if (state.colorTheme === 'crimson') return renderCrimsonArenaHeader(navs);
  if (state.colorTheme === 'titanium') return renderGovOfficialHeader(navs);
  return renderSapphireIocHeader(navs);
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
