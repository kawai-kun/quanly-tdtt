// ==============================================================================
// COMPONENT: UNIBODY GOVERNMENT MASTHEAD & NAVIGATION (BẢN 4 - TITANIUM)
// Tích hợp:
// - Lucian UX/UI #447: Day–Night Sky Switch (122px x 52px chuẩn tỷ lệ)
// - Lucian UX/UI #408: Account Menu Avatar Spring Dropdown (Cán bộ Trần Quốc Được)
// - Lucian UX/UI #471: Command K Interactive Search Button (Ctrl/⌘ + K Keycaps)
// - Lucian UX/UI #045: Full-screen circular expand menu on mobile
// ==============================================================================

import { state, lsSet } from '../state.js';
import { toggleDarkMode } from '../utils/toast.js';

export function setGlobalYear(year) {
  state.selectedYear = year;
  lsSet('tk_selected_year', year);
  window.renderApp();
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

// MAIN HEADER COMPONENT (BẢN 4 DUY NHẤT: TITANIUM)
export function renderHeader() {
  const navs = getGlobalNavs();
  return `
    <header class="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b-2 border-emerald-800 shadow-md select-none">
      
      <!-- Top Red Strip: Tiêu đề hệ thống to rõ ràng căn giữa + Nút Day-Night Switch + Account Menu #408 -->
      <div class="bg-[#b91c1c] text-white px-4 sm:px-6 py-2 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 shadow-md border-b border-red-800 relative">
        
        <!-- Left: Cổng điều hành số -->
        <div class="hidden lg:flex items-center gap-3 shrink-0 min-w-[190px]">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]"></span>
          <div class="flex flex-col text-left leading-tight">
            <span class="text-xs font-bold text-amber-200 uppercase tracking-widest">CỔNG ĐIỀU HÀNH SỐ</span>
            <span class="text-[10px] text-red-200 font-medium">UBND PHƯỜNG TÂN KHAI</span>
          </div>
        </div>

        <!-- Center: HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO • PHƯỜNG TÂN KHAI (TO, RÕ, CĂN GIỮA, CHUẨN CÔNG VĂN) -->
        <div class="flex-1 text-center px-2 py-0.5">
          <h1 class="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold uppercase tracking-widest text-amber-300 drop-shadow-sm leading-tight">
            HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO • PHƯỜNG TÂN KHAI
          </h1>
          <p class="text-[10.5px] sm:text-[11.5px] text-red-100 font-medium tracking-wider mt-0.5 hidden sm:block uppercase opacity-95">
            TRUNG TÂM DỊCH VỤ TỔNG HỢP • BỘ PHẬN THỂ DỤC THỂ THAO
          </p>
        </div>

        <!-- Right: Nút Day-Night Switch (#447) + Menu Cán bộ (#408) -->
        <div class="flex items-center justify-end gap-3 sm:gap-4 shrink-0">
          
          <!-- Day–Night Sky Switch (Lucian UX/UI #447 - Chiều ngang mở rộng gấp đôi: 200px x 42px) -->
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
              <svg class="u447-sr" viewBox="0 0 250 58" aria-hidden="true">
                <path d="M14 9Q14 14 19 14Q14 14 14 19Q14 14 9 14Z"/>
                <path d="M42 6Q42 10 46 10Q42 10 42 14Q42 10 38 10Q42 10 42 6Z"/>
                <path d="M28 31Q28 35 32 35Q28 35 28 39Q28 35 24 35Q28 35 28 31Z"/>
                <path d="M72 18Q72 22 76 22Q72 22 72 26Q72 22 68 22Q72 22 72 18Z"/>
                <path d="M115 12Q115 16 119 16Q115 16 115 20Q115 16 111 16Q115 16 115 12Z"/>
                <path d="M160 28Q160 32 164 32Q160 32 160 36Q160 32 156 32Q160 32 160 28Z"/>
                <path d="M205 14Q205 17 208 17Q205 17 205 20Q205 17 202 17Q205 17 205 14Z"/>
                <circle cx="7" cy="31" r="1.3"/>
                <circle cx="50" cy="42" r="1.1"/>
                <circle cx="95" cy="38" r="1.2"/>
                <circle cx="138" cy="45" r="1.3"/>
                <circle cx="180" cy="20" r="1.1"/>
                <circle cx="225" cy="36" r="1.2"/>
              </svg>
              <span class="u447-halo"><i></i><i></i><i></i></span>
              <svg class="u447-cl" viewBox="0 0 210 68" aria-hidden="true">
                <g fill="#CFE7FF">
                  <circle cx="34" cy="46" r="18"/><circle cx="58" cy="36" r="20"/>
                  <circle cx="86" cy="40" r="18"/><circle cx="110" cy="28" r="21"/><circle cx="132" cy="40" r="18"/>
                  <circle cx="160" cy="32" r="20"/><circle cx="188" cy="42" r="18"/>
                </g>
                <g fill="#FFFFFF">
                  <circle cx="22" cy="60" r="16"/><circle cx="46" cy="52" r="18"/>
                  <circle cx="74" cy="56" r="18"/><circle cx="98" cy="46" r="19"/><circle cx="124" cy="54" r="19"/>
                  <circle cx="150" cy="48" r="18"/><circle cx="178" cy="56" r="19"/>
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

          <!-- Lucian UX/UI #408: Account Menu Dropdown on Avatar -->
          ${state.isAuthenticated ? `
            <div class="ux u408" id="accountMenuContainer">
              <div class="u408-w">
                <button 
                  type="button" 
                  class="u408-av cursor-pointer" 
                  id="accountMenuBtn" 
                  aria-label="Menu tài khoản cán bộ Trần Quốc Được" 
                  aria-haspopup="menu" 
                  aria-expanded="false" 
                  onclick="window.toggleAccountMenu(event)"
                >
                  <div class="w-8 h-8 rounded-full bg-amber-400 text-red-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-md ring-2 ring-white/70">
                    TQD
                  </div>
                  <div class="hidden sm:flex flex-col text-left leading-tight pr-1">
                    <span class="text-xs font-bold text-white tracking-wide">Trần Quốc Được</span>
                    <span class="text-[9.5px] text-amber-200 font-semibold uppercase tracking-wider">Cán bộ TDTT</span>
                  </div>
                  <span class="material-symbols-outlined text-amber-200 text-[18px] transition-transform duration-300" id="accountMenuArrow">expand_more</span>
                </button>
                <span class="u408-dot" aria-hidden="true" title="Trực tuyến"></span>

                <!-- #408 Spring Dropdown Menu -->
                <div class="u408-m" id="accountMenuDropdown" role="menu" aria-label="Menu tài khoản">
                  <div class="u408-hd" style="--i:0">
                    <div class="flex items-center justify-between gap-2">
                      <b>Trần Quốc Được</b>
                      <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-red-950 uppercase tracking-wider">Cán bộ TDTT</span>
                    </div>
                    <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Bộ phận TDTT • UBND Phường Tân Khai</span>
                    ${state.isAdminElevated ? `
                      <span class="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Đã xác thực Quản trị tối cao
                      </span>
                    ` : ''}
                  </div>
                  
                  <button type="button" class="u408-it" role="menuitem" style="--i:1" onclick="window.showOfficerProfileModal && window.showOfficerProfileModal()">
                    <span class="material-symbols-outlined">badge</span>
                    <span>Hồ sơ & Nhiệm vụ cán bộ</span>
                  </button>

                  <button type="button" class="u408-it" role="menuitem" style="--i:2" onclick="window.openTelegramConfigModal && window.openTelegramConfigModal()">
                    <span class="material-symbols-outlined">settings_suggest</span>
                    <span>Cấu hình Drive & Telegram</span>
                  </button>

                  <button type="button" class="u408-it" role="menuitem" style="--i:3" onclick="window.openAdminElevationModal && window.openAdminElevationModal()">
                    <span class="material-symbols-outlined text-amber-500">verified_user</span>
                    <span>${state.isAdminElevated ? 'Quản trị viên (Đã mở khóa)' : 'Xác thực Quản trị tối cao (Mã PIN)'}</span>
                  </button>

                  <button type="button" class="u408-it" role="menuitem" style="--i:4" onclick="window.openQrShareModal && window.openQrShareModal()">
                    <span class="material-symbols-outlined">qr_code_2</span>
                    <span>Chia sẻ mã QR trang</span>
                  </button>

                  <button type="button" class="u408-it" role="menuitem" style="--i:5" onclick="window.lockAdminScreen && window.lockAdminScreen()">
                    <span class="material-symbols-outlined text-amber-500">lock_clock</span>
                    <span>Khóa màn hình (Mã PIN)</span>
                  </button>

                  <div class="u408-hr" role="separator" style="--i:6"></div>

                  <button type="button" class="u408-it is-out" role="menuitem" style="--i:7" onclick="window.handleLogout && window.handleLogout()">
                    <span class="material-symbols-outlined">logout</span>
                    <span>Đăng xuất hệ thống</span>
                  </button>
                </div>
              </div>
            </div>
          ` : `
            <button onclick="window.openLoginModal()" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-red-950 font-bold text-xs shadow-md transition-all btn-press">
              <span class="material-symbols-outlined text-[16px]">login</span>
              <span>Đăng nhập</span>
            </button>
          `}

        </div>

      </div>

      <!-- Tier 1: Main Government Masthead (Emerald) -->
      <div class="px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4 bg-[#047857] text-white">
        
        <!-- Left: Official Emblem & Department Name + Mobile Hamburger triggering #045 -->
        <div class="flex items-center gap-3 shrink-0 py-2">
          <!-- Mobile Hamburger Button -> Lucian UX/UI #045 Full-screen Circular Expand Menu -->
          <button 
            type="button" 
            id="mobileHamburgerBtn" 
            onclick="window.openFullscreenMenu(event)" 
            class="p-2 -ml-1 rounded-lg text-white hover:bg-emerald-800/80 lg:hidden btn-press" 
            title="Mở menu toàn màn hình" 
            aria-label="Mở menu điều hướng toàn màn hình"
          >
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

        <!-- Right: Lucian UX/UI #471 Command K button + Drive Sync Pill -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          
          <!-- Lucian UX/UI #471: Command K Interactive Search Button with physical keycap sink -->
          <button 
            type="button" 
            id="headerCommandKBtn" 
            class="u471-b cursor-pointer" 
            title="Tìm kiếm thông tin hệ thống (Ctrl+K)" 
            onclick="window.handleCommandKClick(event)"
          >
            <svg class="u471-ic" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5"/>
              <path d="m15.5 15.5 4.5 4.5"/>
            </svg>
            <span class="u471-l hidden md:inline">Tìm kiếm...</span>
            <span class="u471-ks" aria-hidden="true">
              <kbd class="u471-k" id="kCapMod"><span class="u471-t">Ctrl</span></kbd>
              <kbd class="u471-k" id="kCapKey"><span class="u471-t">K</span></kbd>
            </span>
          </button>

          <div id="syncPillBox">${renderSyncPillHTML()}</div>
        </div>

      </div>

      <!-- Tier 2: Dedicated Navigation Tab Bar Strip (Deep Emerald #064e3b) -->
      <div class="hidden lg:flex w-full bg-[#064e3b] border-b border-emerald-600/80 px-4 sm:px-6 py-2 overflow-x-auto no-scrollbar shadow-inner">
        <nav id="topNavDock" class="flex items-center justify-center gap-1.5 sm:gap-2 w-full max-w-[1780px] mx-auto">
          ${navs.map(item => {
            const isActive = state.currentTab === item.id;
            return `
              <button 
                onclick="switchTab('${item.id}')" 
                class="px-3.5 py-1.5 rounded-lg font-medium text-xs sm:text-sm tracking-wide flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
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
    <button onclick="openSyncModal()" class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium shadow-xs transition-all hover:bg-emerald-900 ${cls} btn-press cursor-pointer">
      <span class="material-symbols-outlined text-[15px] ${state.syncStatus === 'syncing' ? 'animate-spin' : ''}">${icon}</span>
      <span class="hidden sm:inline">${text}</span>
    </button>
  `;
}

export function renderSyncPill() {
  const el = document.getElementById('syncPillBox');
  if (el) el.innerHTML = renderSyncPillHTML();
}

// ==============================================================================
// INTERACTION HANDLERS: ACCOUNT MENU (#408) & COMMAND K (#471)
// ==============================================================================

export function toggleAccountMenu(e) {
  if (e) e.stopPropagation();
  const container = document.getElementById('accountMenuContainer');
  const btn = document.getElementById('accountMenuBtn');
  const arrow = document.getElementById('accountMenuArrow');
  if (!container || !btn) return;

  const isOpen = container.classList.contains('is-open');
  if (isOpen) {
    container.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
  } else {
    container.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    if (arrow) arrow.style.transform = 'rotate(180deg)';
  }
}

export function closeAccountMenu() {
  const container = document.getElementById('accountMenuContainer');
  const btn = document.getElementById('accountMenuBtn');
  const arrow = document.getElementById('accountMenuArrow');
  if (container) container.classList.remove('is-open');
  if (btn) btn.setAttribute('aria-expanded', 'false');
  if (arrow) arrow.style.transform = 'rotate(0deg)';
}

// Global click & ESC listener for Account Menu
document.addEventListener('click', (e) => {
  const container = document.getElementById('accountMenuContainer');
  if (container && container.classList.contains('is-open') && !container.contains(e.target)) {
    closeAccountMenu();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAccountMenu();
  }
});

// Officer Profile Modal
export function showOfficerProfileModal() {
  closeAccountMenu();
  const existing = document.getElementById('officerProfileModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'officerProfileModal';
  modal.className = 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 modal-animate text-slate-800 dark:text-slate-100">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-amber-400 text-red-950 font-black text-base flex items-center justify-center shadow-md">
            TQD
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Trần Quốc Được</h3>
            <span class="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase">Cán bộ phụ trách Thể dục Thể thao</span>
          </div>
        </div>
        <button onclick="document.getElementById('officerProfileModal').remove()" class="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div class="py-4 space-y-3 text-xs leading-relaxed">
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span class="font-bold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider text-[10px]">Cơ quan công tác</span>
          <p class="font-semibold text-slate-800 dark:text-slate-200">Ủy ban nhân dân Phường Tân Khai • Trung tâm Dịch vụ Tổng hợp</p>
          <p class="text-slate-500 dark:text-slate-400 mt-0.5">Bộ phận chuyên trách: Thể dục Thể thao & Phong trào Quần chúng</p>
        </div>

        <div class="grid grid-cols-2 gap-2 text-center">
          <div class="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
            <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase block">Giải đấu quản lý</span>
            <span class="text-lg font-black text-emerald-800 dark:text-emerald-300">${state.activities.length} giải</span>
          </div>
          <div class="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40">
            <span class="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase block">CLB Thể thao</span>
            <span class="text-lg font-black text-amber-800 dark:text-amber-300">${state.clubs.length} CLB</span>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
          <span class="font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider text-[10px]">Quyền hạn & Bảo mật</span>
          <p>• Quản trị toàn quyền dữ liệu thi đua, khen thưởng & vận động viên TDTT.</p>
          <p>• Phê duyệt dự toán & quyết toán kinh phí các giải đấu trên địa bàn.</p>
          <p>• Xuất báo cáo công văn chuẩn thể thức Nghị định 30/2020/NĐ-CP.</p>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button onclick="document.getElementById('officerProfileModal').remove()" class="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs">
          Đã hiểu
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Command K (#471) interactive click handler
export function handleCommandKClick(e) {
  const btn = document.getElementById('headerCommandKBtn');
  const mod = document.getElementById('kCapMod');
  const key = document.getElementById('kCapKey');

  if (mod && key && btn) {
    mod.classList.add('is-down');
    setTimeout(() => {
      key.classList.add('is-down');
      // Create ripple
      const rect = btn.getBoundingClientRect();
      const rp = document.createElement('span');
      rp.className = 'u471-rp';
      rp.style.left = `${(e.clientX - rect.left)}px`;
      rp.style.top = `${(e.clientY - rect.top)}px`;
      btn.appendChild(rp);
      setTimeout(() => rp.remove(), 800);

      btn.classList.add('is-hit', 'is-pop');
      setTimeout(() => {
        key.classList.remove('is-down');
        mod.classList.remove('is-down');
        btn.classList.remove('is-hit', 'is-pop');
      }, 350);
    }, 60);
  }

  setTimeout(() => {
    if (window.openCommandPalette) window.openCommandPalette();
  }, 120);
}

// Global Ctrl+K / Cmd+K listener
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    handleCommandKClick({ clientX: window.innerWidth / 2, clientY: 60 });
  }
});

export function openAdminElevationModal() {
  if (state.isAdminElevated) {
    import('../utils/toast.js').then(({ showToast }) => {
      showToast('Đã xác thực Quản trị', 'Đồng chí đang giữ quyền Quản trị viên tối cao trong phiên làm việc này.');
    });
    return;
  }
  if (typeof window.openPinVerifyModal === 'function') {
    window.openPinVerifyModal({
      title: 'XÁC THỰC QUYỀN QUẢN TRỊ TỐI CAO',
      subtitle: 'Nhập mã PIN 6 chữ số để mở khóa cấu hình hệ thống & phê duyệt ngân sách',
      expectedPin: '123123',
      onSuccess: () => {
        state.isAdminElevated = true;
        lsSet('tk_admin_elevated', true);
        import('../utils/toast.js').then(({ showToast }) => {
          showToast('Xác thực Quản trị thành công', 'Đã cấp quyền Quản trị tối cao cho phiên làm việc.');
        });
        if (typeof window.renderApp === 'function') window.renderApp();
      }
    });
  }
}

export function updateHeaderAdminBadge() {
  const container = document.getElementById('accountMenuContainer');
  if (!container) return;
  const hd = container.querySelector('.u408-hd');
  if (hd) {
    const existingBadge = hd.querySelector('.admin-elevated-badge');
    if (state.isAdminElevated) {
      if (!existingBadge) {
        const badge = document.createElement('span');
        badge.className = 'admin-elevated-badge mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800';
        badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Đã xác thực Quản trị tối cao';
        hd.appendChild(badge);
      }
    } else {
      if (existingBadge) existingBadge.remove();
    }
  }
}

window.toggleAccountMenu = toggleAccountMenu;
window.closeAccountMenu = closeAccountMenu;
window.showOfficerProfileModal = showOfficerProfileModal;
window.handleCommandKClick = handleCommandKClick;
window.openAdminElevationModal = openAdminElevationModal;
window.updateHeaderAdminBadge = updateHeaderAdminBadge;
