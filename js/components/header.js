// ==============================================================================
// COMPONENT: UNIBODY GOVERNMENT MASTHEAD & NAVIGATION (BẢN 4 - TITANIUM)
// Tích hợp:
// - Lucian UX/UI #447: Day–Night Sky Switch (122px x 52px chuẩn tỷ lệ)
// - Lucian UX/UI #408: Account Menu Avatar Spring Dropdown (Cán bộ Trần Quốc Được)
// - Lucian UX/UI #471: Command K Interactive Search Button (Ctrl/⌘ + K Keycaps)
// - Lucian UX/UI #045: Full-screen circular expand menu on mobile
// ==============================================================================

import { state, lsSet, saveAll } from '../state.js';
import { toggleDarkMode, showToast } from '../utils/toast.js';
import { exportBackupJSON, triggerRestoreSystemData, exportPartyMemberReviewDoc } from '../services/backupService.js';

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
          <span class="neon-dot-green"></span>
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
                    <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400">badge</span>
                    <span>Hồ sơ, KPI & Nhiệm vụ cán bộ</span>
                  </button>

                  <button type="button" class="u408-it" role="menuitem" style="--i:2" onclick="window.backupSystemData && window.backupSystemData()">
                    <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">download</span>
                    <span>Sao lưu dữ liệu hệ thống (JSON)</span>
                  </button>

                  <button type="button" class="u408-it" role="menuitem" style="--i:3" onclick="window.triggerRestoreSystemData && window.triggerRestoreSystemData()">
                    <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400">upload</span>
                    <span>Phục hồi dữ liệu từ JSON</span>
                  </button>

                  <button type="button" class="u408-it" role="menuitem" style="--i:4" onclick="window.exportPartyMemberReviewDoc && window.exportPartyMemberReviewDoc()">
                    <span class="material-symbols-outlined text-rose-600 dark:text-rose-400">description</span>
                    <span>Xuất bản Kiểm điểm Đảng viên (.doc)</span>
                  </button>

                  <div class="u408-hr" role="separator" style="--i:5"></div>

                  <button type="button" class="u408-it" role="menuitem" style="--i:6" onclick="window.openTelegramConfigModal && window.openTelegramConfigModal()">
                    <span class="material-symbols-outlined">settings_suggest</span>
                    <span>Cấu hình Drive & Telegram</span>
                  </button>

                  <button type="button" class="u408-it" role="menuitem" style="--i:7" onclick="window.openAdminElevationModal && window.openAdminElevationModal()">
                    <span class="material-symbols-outlined text-amber-500">verified_user</span>
                    <span>${state.isAdminElevated ? 'Quản trị viên (Đã mở khóa)' : 'Xác thực Quản trị tối cao (Mã PIN)'}</span>
                  </button>

                  <button type="button" class="u408-it" role="menuitem" style="--i:8" onclick="window.openQrShareModal && window.openQrShareModal()">
                    <span class="material-symbols-outlined">qr_code_2</span>
                    <span>Chia sẻ mã QR trang</span>
                  </button>

                  <button type="button" class="u408-it" role="menuitem" style="--i:9" onclick="window.lockAdminScreen && window.lockAdminScreen()">
                    <span class="material-symbols-outlined text-amber-500">lock_clock</span>
                    <span>Khóa màn hình (Mã PIN)</span>
                  </button>

                  <div class="u408-hr" role="separator" style="--i:10"></div>

                  <button type="button" class="u408-it is-out" role="menuitem" style="--i:11" onclick="window.handleLogout && window.handleLogout()">
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

      <!-- Tier 2: Dedicated Navigation Tab Bar Strip (Deep Emerald #064e3b) - 7 Khung cố định từng Tab -->
      <div class="hidden lg:flex w-full bg-[#064e3b] border-b border-emerald-600/80 px-4 sm:px-6 py-2 shadow-inner">
        <nav id="topNavDock" class="grid grid-cols-7 gap-1.5 sm:gap-2 w-full max-w-[1780px] mx-auto select-none">
          ${navs.map(item => {
            const isActive = state.currentTab === item.id;
            return `
              <button 
                type="button"
                onclick="switchTab('${item.id}')" 
                class="w-full h-10 px-2 py-1 rounded-lg font-semibold text-xs xl:text-sm tracking-wide flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer border ${
                  isActive 
                    ? 'bg-white text-emerald-950 shadow-md border-white/90 ring-2 ring-emerald-300' 
                    : 'text-emerald-100 hover:bg-emerald-800/80 hover:text-white border-transparent'
                }"
                title="${item.label}"
              >
                <span class="material-symbols-outlined text-[18px] shrink-0">${item.icon}</span>
                <span class="truncate">${item.label}</span>
                ${item.badge !== undefined ? `
                  <span class="ml-1 min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-mono font-bold inline-flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-emerald-950/80 text-emerald-200'
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

// ==============================================================================
// HỒ SƠ & BẢN ĐỒ NHIỆM VỤ CÁN BỘ (CHUẨN QĐ 01 & QĐ 161 - KPI & ĐẢNG VIÊN)
// ==============================================================================
let currentOfficerTab = 'plan';

export function setOfficerProfileTab(tab) {
  currentOfficerTab = tab;
  showOfficerProfileModal(tab);
}

export function showOfficerProfileModal(activeTab = currentOfficerTab) {
  currentOfficerTab = activeTab;
  closeAccountMenu();
  const existing = document.getElementById('officerProfileModal');
  if (existing) existing.remove();

  const planActs = state.activities.filter(a => a.planType === 'plan');
  const extraActs = state.activities.filter(a => a.planType !== 'plan');
  const extraTasks = state.extraTasks || [];

  const totalParticipants = state.activities.reduce((acc, a) => acc + (parseInt(a.participants) || 0), 0);
  const totalMedals = state.activities.reduce((acc, a) => acc + (parseInt(a.totalMedals) || 0), 0);
  const totalGold = state.activities.reduce((acc, a) => acc + (parseInt(a.goldMedals) || 0), 0);
  const totalSilver = state.activities.reduce((acc, a) => acc + (parseInt(a.silverMedals) || 0), 0);
  const totalBronze = state.activities.reduce((acc, a) => acc + (parseInt(a.bronzeMedals) || 0), 0);

  const modal = document.createElement('div');
  modal.id = 'officerProfileModal';
  modal.className = 'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4';
  modal.innerHTML = `
    <div class="w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 modal-animate text-slate-800 dark:text-slate-100 overflow-hidden text-left">
      
      <!-- Modal Header -->
      <div class="p-5 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white shrink-0 relative">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3.5">
            <div class="w-13 h-13 rounded-full bg-amber-400 text-red-950 font-black text-lg flex items-center justify-center shadow-lg ring-2 ring-white/80 shrink-0">
              TQD
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-lg font-bold text-white tracking-wide">Trần Quốc Được</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-red-950 uppercase tracking-wider">Đảng viên • Cán bộ TDTT</span>
              </div>
              <p class="text-xs text-emerald-200 font-medium mt-0.5">
                UBND Phường Tân Khai • Trung tâm Dịch vụ Tổng hợp
              </p>
              <div class="flex items-center gap-2 mt-1 flex-wrap text-[10.5px]">
                <span class="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/60" title="Quyết định phân công nhiệm vụ">
                  <span class="material-symbols-outlined text-[13px]">gavel</span>QĐ 01/QĐ-TT.DVTH (Mục 8)
                </span>
                <span class="inline-flex items-center gap-1 text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-700/60" title="Kế hoạch năm 2026">
                  <span class="material-symbols-outlined text-[13px]">assignment</span>QĐ 161/QĐ-UBND (KH 2026)
                </span>
              </div>
            </div>
          </div>
          <button onclick="document.getElementById('officerProfileModal').remove()" class="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer" title="Đóng">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- KPI 4-Tile Strip -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/15 text-center">
          <div class="p-2 rounded-xl bg-black/20 border border-white/10">
            <span class="text-[10px] text-emerald-300 uppercase font-semibold block">Kế hoạch giao (QĐ 161)</span>
            <span class="text-base sm:text-lg font-black text-white">${planActs.length}/8 <span class="text-xs font-bold text-emerald-400">(100%)</span></span>
          </div>
          <div class="p-2 rounded-xl bg-black/20 border border-white/10">
            <span class="text-[10px] text-purple-300 uppercase font-semibold block">Phát sinh ngoài KH</span>
            <span class="text-base sm:text-lg font-black text-white">${extraActs.length} giải <span class="text-xs font-bold text-purple-300">(+250%)</span></span>
          </div>
          <div class="p-2 rounded-xl bg-black/20 border border-white/10">
            <span class="text-[10px] text-amber-300 uppercase font-semibold block">Huy chương đạt được</span>
            <span class="text-base sm:text-lg font-black text-amber-300">${totalMedals} <span class="text-[10.5px] font-bold text-white">(${totalGold}🥇 ${totalSilver}🥈 ${totalBronze}🥉)</span></span>
          </div>
          <div class="p-2 rounded-xl bg-black/20 border border-white/10">
            <span class="text-[10px] text-sky-300 uppercase font-semibold block">Xếp loại thi đua</span>
            <span class="text-xs sm:text-sm font-black text-amber-300 tracking-wide uppercase mt-1 block">HOÀN THÀNH XUẤT SẮC</span>
          </div>
        </div>
      </div>

      <!-- Navigation Subtabs -->
      <div class="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-4 shrink-0 overflow-x-auto">
        <button 
          onclick="window.setOfficerProfileTab('plan')" 
          class="px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${activeTab === 'plan' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}"
        >
          <span class="material-symbols-outlined text-[16px]">assignment</span>
          <span>Nhiệm vụ trong Kế hoạch (${planActs.length})</span>
        </button>
        <button 
          onclick="window.setOfficerProfileTab('extra')" 
          class="px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${activeTab === 'extra' ? 'border-purple-600 text-purple-700 dark:text-purple-400 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}"
        >
          <span class="material-symbols-outlined text-[16px]">bolt</span>
          <span>Phát sinh & Đột xuất (${extraActs.length + extraTasks.length})</span>
        </button>
        <button 
          onclick="window.setOfficerProfileTab('party')" 
          class="px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${activeTab === 'party' ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}"
        >
          <span class="material-symbols-outlined text-[16px]">verified</span>
          <span>Đánh giá Đảng viên & Bản kiểm điểm</span>
        </button>
      </div>

      <!-- Tab Content Area (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        
        <!-- SUBTAB 1: TRONG KẾ HOẠCH NĂM (QĐ 161) -->
        ${activeTab === 'plan' ? `
          <div class="space-y-3">
            <div class="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <b class="text-sky-900 dark:text-sky-200 block text-xs">Căn cứ: Quyết định 161/QĐ-UBND ngày 28/01/2026 của UBND Phường Tân Khai</b>
                <span class="text-slate-600 dark:text-slate-400 mt-0.5 block">Phụ trách tổ chức 8 hoạt động TDTT nòng cốt và Đại hội TDTT phường lần thứ I.</span>
              </div>
              <span class="px-2.5 py-1 rounded-lg font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 shrink-0 self-start sm:self-auto">
                Hoàn thành 100%
              </span>
            </div>

            <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px]">
                  <tr>
                    <th class="py-2.5 px-3">Mã & Thời gian</th>
                    <th class="py-2.5 px-3">Hoạt động trong Kế hoạch</th>
                    <th class="py-2.5 px-3 text-center">VĐV</th>
                    <th class="py-2.5 px-3">Căn cứ kế hoạch</th>
                    <th class="py-2.5 px-3 text-center">Kết quả</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  ${planActs.map((a, i) => `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td class="py-2.5 px-3 whitespace-nowrap">
                        <span class="font-mono font-bold text-slate-900 dark:text-white">${a.code}</span>
                        <div class="text-[10.5px] text-slate-400">${a.date}</div>
                      </td>
                      <td class="py-2.5 px-3">
                        <span class="font-semibold text-slate-900 dark:text-white">${a.title}</span>
                        ${a.achievementNote ? `<div class="text-[10.5px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">🏆 ${a.achievementNote}</div>` : ''}
                      </td>
                      <td class="py-2.5 px-3 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        ${a.participants} VĐV
                      </td>
                      <td class="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-[11px] whitespace-nowrap">
                        ${a.refPlan || 'QĐ 161/QĐ-UBND'}
                      </td>
                      <td class="py-2.5 px-3 text-center whitespace-nowrap">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                          Đã hoàn thành
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- SUBTAB 2: PHÁT SINH NGOÀI KẾ HOẠCH & NHIỆM VỤ ĐỘT XUẤT -->
        ${activeTab === 'extra' ? `
          <div class="space-y-4">
            
            <!-- Header Bar with Add Button -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
              <div>
                <b class="text-purple-900 dark:text-purple-200 text-xs block">Nhiệm vụ phát sinh & Chỉ đạo đột xuất năm 2026</b>
                <span class="text-slate-600 dark:text-slate-400 text-xs mt-0.5 block">
                  Bao gồm các giải cấp thành phố triệu tập, xã hội hóa và các nhiệm vụ chuyên trách CNTT - CĐS theo QĐ 01/QĐ-TT.DVTH.
                </span>
              </div>
              <button onclick="window.openAddExtraTaskModal()" class="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-sm flex items-center gap-1.5 shrink-0 self-start sm:self-auto btn-press cursor-pointer">
                <span class="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Thêm nhiệm vụ phát sinh</span>
              </button>
            </div>

            <!-- List of Special Ad-hoc Extra Tasks -->
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-purple-600">task_alt</span>
                <span>Các nhiệm vụ trọng tâm theo Quyết định 01 (${extraTasks.length} nhiệm vụ)</span>
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${extraTasks.map((t, idx) => `
                  <div class="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between gap-2 mb-1.5">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          ${t.domainLabel || t.domain}
                        </span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          ${t.statusLabel || 'Hoàn thành'}
                        </span>
                      </div>
                      <h5 class="text-xs font-bold text-slate-900 dark:text-white leading-snug">${t.title}</h5>
                      <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1"><b>Căn cứ:</b> ${t.basis || 'Chỉ đạo Ban Giám đốc'}</p>
                      <p class="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1"><b>Kết quả:</b> ${t.result || 'Đã nghiệm thu'}</p>
                    </div>
                    <div class="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Thời hạn: ${t.deadline || '2026'}</span>
                      <button onclick="window.deleteExtraTask('${t.id}')" class="text-rose-500 hover:text-rose-700 font-semibold cursor-pointer" title="Xóa nhiệm vụ này">Xóa</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- List of Extra Tournaments -->
            <div class="pt-2">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-purple-600">sports_score</span>
                <span>Các giải đấu phát sinh ngoài kế hoạch (${extraActs.length} giải)</span>
              </h4>
              <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-60 overflow-y-auto">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10.5px] sticky top-0">
                    <tr>
                      <th class="py-2 px-3">Mã & Ngày</th>
                      <th class="py-2 px-3">Tên giải đấu</th>
                      <th class="py-2 px-3 text-center">Cấp độ</th>
                      <th class="py-2 px-3">Nguồn việc</th>
                      <th class="py-2 px-3 text-center">Huy chương</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    ${extraActs.map(a => `
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td class="py-2 px-3 whitespace-nowrap">
                          <b class="font-mono text-slate-900 dark:text-white">${a.code}</b>
                          <span class="text-slate-400 block text-[10px]">${a.date}</span>
                        </td>
                        <td class="py-2 px-3">
                          <span class="font-semibold text-slate-900 dark:text-white">${a.title}</span>
                          ${a.achievementNote ? `<span class="text-[10px] text-amber-600 dark:text-amber-400 block">🏆 ${a.achievementNote}</span>` : ''}
                        </td>
                        <td class="py-2 px-3 text-center whitespace-nowrap">
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${a.category || 'Cấp TP'}</span>
                        </td>
                        <td class="py-2 px-3 text-slate-600 dark:text-slate-300 text-[11px] whitespace-nowrap">
                          ${a.refPlan || 'Phát sinh'}
                        </td>
                        <td class="py-2 px-3 text-center font-mono font-bold text-amber-600 whitespace-nowrap">
                          ${a.totalMedals > 0 ? `${a.totalMedals} HC` : '-'}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ` : ''}

        <!-- SUBTAB 3: ĐÁNH GIÁ ĐẢNG VIÊN & BẢN KIỂM ĐIỂM -->
        ${activeTab === 'party' ? `
          <div class="space-y-4">
            <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <b class="text-amber-900 dark:text-amber-200 text-xs block">Bản kiểm điểm Đảng viên & Đánh giá công tác năm 2026</b>
                <span class="text-slate-600 dark:text-slate-300 text-xs mt-0.5 block">
                  Đã tự động trích xuất toàn bộ dữ liệu 30 giải đấu, 168 huy chương và các nhiệm vụ chuyên môn theo chuẩn mẫu hướng dẫn của Ban Tổ chức Trung ương.
                </span>
              </div>
              <button onclick="window.exportPartyMemberReviewDoc()" class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 shadow-md flex items-center gap-1.5 shrink-0 self-start sm:self-auto btn-press cursor-pointer">
                <span class="material-symbols-outlined text-[16px]">file_download</span>
                <span>Tải bản Kiểm điểm (.doc)</span>
              </button>
            </div>

            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs leading-relaxed">
              <div>
                <h5 class="font-bold text-slate-900 dark:text-white uppercase text-[11px] mb-1">1. Về tư tưởng chính trị, đạo đức, lối sống</h5>
                <p class="text-slate-600 dark:text-slate-300">
                  Kiên định chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh. Chấp hành nghiêm chỉnh Cương lĩnh, Điều lệ Đảng, chính sách pháp luật của Nhà nước. Giữ vững lối sống trung thực, giản dị, đoàn kết nội bộ.
                </p>
              </div>

              <div>
                <h5 class="font-bold text-slate-900 dark:text-white uppercase text-[11px] mb-1">2. Kết quả thực hiện nhiệm vụ chính trị được giao</h5>
                <p class="text-slate-600 dark:text-slate-300">
                  • <b>Kế hoạch năm (QĐ 161):</b> Hoàn thành 100% (8/8 hoạt động được giao, tổ chức thành công Đại hội TDTT phường lần thứ I).<br/>
                  • <b>Khối lượng vượt kế hoạch:</b> Tham mưu tổ chức và đưa đoàn tham gia 22 giải thi đấu cấp thành phố và giải phong trào (vượt 280% chỉ tiêu).<br/>
                  • <b>Thành tích thể thao:</b> Đạt 168 Huy chương (54 Vàng, 56 Bạc, 58 Đồng), xếp thứ hạng cao toàn đoàn.<br/>
                  • <b>Chuyển đổi số & CNTT:</b> Xây dựng và vận hành Cổng điều hành số TDTT, số hóa 100% hồ sơ dữ liệu giải đấu và sân bãi.
                </p>
              </div>

              <div>
                <h5 class="font-bold text-slate-900 dark:text-white uppercase text-[11px] mb-1">3. Tự nhận mức xếp loại chất lượng</h5>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-xs">
                  <span class="material-symbols-outlined text-[16px]">verified</span>
                  HOÀN THÀNH XUẤT SẮC NHIỆM VỤ NĂM 2026
                </span>
              </div>
            </div>
          </div>
        ` : ''}

      </div>

      <!-- Modal Footer -->
      <div class="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div class="flex items-center gap-2">
          <button onclick="window.backupSystemData()" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 btn-press">
            <span class="material-symbols-outlined text-[15px]">download</span>
            <span class="hidden sm:inline">Sao lưu JSON</span>
          </button>
          <button onclick="window.exportPartyMemberReviewDoc()" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-1 btn-press">
            <span class="material-symbols-outlined text-[15px]">description</span>
            <span class="hidden sm:inline">Xuất văn bản Word</span>
          </button>
        </div>
        <button onclick="document.getElementById('officerProfileModal').remove()" class="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md btn-press">
          Đóng hồ sơ
        </button>
      </div>

    </div>
  `;
  document.body.appendChild(modal);
}

// Modal thêm nhiệm vụ phát sinh ngoài kế hoạch
export function openAddExtraTaskModal() {
  const existing = document.getElementById('addExtraTaskModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'addExtraTaskModal';
  modal.className = 'fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 modal-animate text-slate-800 dark:text-slate-100 text-left">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div class="flex items-center gap-2 text-purple-700 dark:text-purple-400">
          <span class="material-symbols-outlined text-[20px]">add_task</span>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Thêm nhiệm vụ phát sinh / đột xuất</h3>
        </div>
        <button onclick="document.getElementById('addExtraTaskModal').remove()" class="p-1 rounded-full text-slate-400 hover:text-slate-700">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <form id="addExtraTaskForm" onsubmit="window.handleAddExtraTaskSubmit(event)" class="py-3 space-y-3 text-xs">
        <div>
          <label class="block font-bold mb-1">Tên nhiệm vụ / Công việc phát sinh</label>
          <input id="extra_title" required type="text" placeholder="VD: Hướng dẫn thành lập CLB Bơi lội..." class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold" />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-bold mb-1">Mảng phụ trách</label>
            <select id="extra_domain" class="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium">
              <option value="tdtt">Phong trào TDTT</option>
              <option value="thieunhi">TDTT Thanh thiếu nhi</option>
              <option value="cntt">CNTT & Chuyển đổi số</option>
              <option value="csvc">Quản lý CSVC</option>
              <option value="khac">Nhiệm vụ đột xuất khác</option>
            </select>
          </div>
          <div>
            <label class="block font-bold mb-1">Thời hạn hoàn thành</label>
            <input id="extra_deadline" type="text" placeholder="VD: 30/08/2026" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
          </div>
        </div>

        <div>
          <label class="block font-bold mb-1">Căn cứ văn bản / Chỉ đạo giao việc</label>
          <input id="extra_basis" type="text" placeholder="VD: QĐ 01/QĐ-TT.DVTH hoặc Chỉ đạo trực tiếp của BGĐ" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
        </div>

        <div>
          <label class="block font-bold mb-1">Kết quả đạt được / Tiến độ</label>
          <input id="extra_result" type="text" placeholder="VD: Đã hoàn thành 100%, ban hành quyết định..." class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button type="button" onclick="document.getElementById('addExtraTaskModal').remove()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Hủy</button>
          <button type="submit" class="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-sm btn-press">Lưu nhiệm vụ</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
}

export function handleAddExtraTaskSubmit(e) {
  e.preventDefault();
  const domainSelect = document.getElementById('extra_domain');
  const domainText = domainSelect.options[domainSelect.selectedIndex].text;

  const newTask = {
    id: 'extra-' + Date.now(),
    title: document.getElementById('extra_title').value.trim(),
    domain: domainSelect.value,
    domainLabel: domainText,
    basis: document.getElementById('extra_basis').value.trim() || 'Chỉ đạo Ban Giám đốc',
    deadline: document.getElementById('extra_deadline').value.trim() || 'Năm 2026',
    status: 'completed',
    statusLabel: 'Hoàn thành tốt',
    result: document.getElementById('extra_result').value.trim() || 'Đã hoàn thành',
    year: 2026
  };

  if (!state.extraTasks) state.extraTasks = [];
  state.extraTasks.unshift(newTask);
  saveAll();

  document.getElementById('addExtraTaskModal')?.remove();
  showOfficerProfileModal('extra');
  showToast('Đã thêm nhiệm vụ', `Đã bổ sung nhiệm vụ "${newTask.title}" vào hồ sơ.`);
}

export function deleteExtraTask(taskId) {
  if (!confirm('Đồng chí có chắc muốn xóa nhiệm vụ phát sinh này?')) return;
  state.extraTasks = (state.extraTasks || []).filter(t => t.id !== taskId);
  saveAll();
  showOfficerProfileModal('extra');
  showToast('Đã xóa', 'Đã gỡ bỏ nhiệm vụ khỏi danh sách.');
}

window.showOfficerProfileModal = showOfficerProfileModal;
window.setOfficerProfileTab = setOfficerProfileTab;
window.openAddExtraTaskModal = openAddExtraTaskModal;
window.handleAddExtraTaskSubmit = handleAddExtraTaskSubmit;
window.deleteExtraTask = deleteExtraTask;

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
