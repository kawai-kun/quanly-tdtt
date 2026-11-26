// ==============================================================================
// COMPONENT: SIDEBAR NAVIGATION & MOBILE DRAWER
// ==============================================================================

import { state } from '../state.js';

    export function switchTab(t) {
      if (state.currentTab === t) return;
      state.currentTab = t;
      state.mobileDrawerOpen = false;

      const mainArea = document.getElementById('mainContentArea');
      if (mainArea && typeof window.renderDashboard === 'function') {
        // Chuyển Tab siêu mượt: Giữ nguyên Header, áp dụng hiệu ứng mượt mà và hoán đổi nội dung
        let contentHTML = '';
        if (t === 'bang-dieu-khien') contentHTML = window.renderDashboard();
        else if (t === 'quan-ly-giai-dau' && window.renderTournaments) contentHTML = window.renderTournaments();
        else if (t === 'quan-ly-clb' && window.renderClubs) contentHTML = window.renderClubs();
        else if (t === 'lich-sinh-hoat' && window.renderSchedules) contentHTML = window.renderSchedules();
        else if (t === 'co-so-vat-chat' && window.renderFacilities) contentHTML = window.renderFacilities();
        else if (t === 'kinh-phi' && window.renderBudget) contentHTML = window.renderBudget();
        else if (t === 'bao-cao' && window.renderReports) contentHTML = window.renderReports();

        mainArea.classList.remove('tab-transition-active');
        void mainArea.offsetWidth; // force reflow for animation
        mainArea.innerHTML = contentHTML;
        mainArea.classList.add('tab-transition-active');

        // Cập nhật trạng thái active trên thanh điều hướng Top Dock
        const topNav = document.getElementById('topNavDock');
        if (topNav) {
          topNav.querySelectorAll('button').forEach(btn => {
            const btnOnClick = btn.getAttribute('onclick') || '';
            const isCurrent = btnOnClick.includes(`'${t}'`);
            if (isCurrent) {
              btn.className = 'px-3.5 py-1.5 rounded-lg text-xs sm:text-sm tracking-wide flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer bg-white text-emerald-950 shadow-md font-semibold ring-2 ring-emerald-300 scale-102';
            } else {
              btn.className = 'px-3.5 py-1.5 rounded-lg text-xs sm:text-sm tracking-wide flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer text-emerald-100 hover:bg-emerald-800/80 hover:text-white font-medium';
            }
          });
        }

        // Kích hoạt biểu đồ / phân trang theo từng tab
        if (t === 'bang-dieu-khien' && typeof window.initDashboardCharts === 'function') {
          setTimeout(window.initDashboardCharts, 50);
        } else if (t === 'quan-ly-giai-dau') {
          if (typeof window.initTournamentsAnimations === 'function') setTimeout(window.initTournamentsAnimations, 50);
          if (typeof window.initPagination === 'function') setTimeout(window.initPagination, 50);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.renderApp();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    export function toggleMobileDrawer() {
      state.mobileDrawerOpen = !state.mobileDrawerOpen;
      const drawer = document.getElementById('mobileDrawer');
      if (drawer) {
        if (state.mobileDrawerOpen) drawer.classList.remove('hidden');
        else drawer.classList.add('hidden');
      }
    }
    export function renderSidebar() {
      // Đã nâng cấp lên Top Navigation Dock (Kiến trúc IOC Command Center)
      // Giải phóng 100% diện tích bề ngang cho nội dung và dữ liệu
      return '';
    }

    export function renderBottomNav() {
      const items = [
        { id: 'bang-dieu-khien', label: 'TỔNG QUAN', icon: 'dashboard' },
        { id: 'quan-ly-giai-dau', label: 'GIẢI ĐẤU', icon: 'emoji_events' },
        { id: 'quan-ly-clb', label: 'CLB', icon: 'groups_2' },
        { id: 'kinh-phi', label: 'KINH PHÍ', icon: 'account_balance_wallet' },
        { id: 'bao-cao', label: 'BÁO CÁO', icon: 'summarize' },
        { id: 'drawer', label: 'MENU', icon: 'menu', isAction: true }
      ];

      return `
        <div class="lg:hidden fixed bottom-0 left-0 right-0 glass-dock border-t border-slate-200/90 dark:border-slate-800/90 z-40 px-2 py-1 flex justify-around items-center shadow-lg">
          ${items.map(i => {
            const isActive = state.currentTab === i.id;
            const color = isActive ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400 font-medium';
            const action = i.isAction ? 'toggleMobileDrawer()' : `switchTab('${i.id}')`;
            return `
              <button onclick="${action}" class="flex flex-col items-center justify-center py-1.5 px-1 flex-1 ${color} transition-all btn-press">
                <span class="material-symbols-outlined text-[20px]">${i.icon}</span>
                <span class="text-[10.5px] tracking-wide mt-0.5">${i.label}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    }

    export function renderMobileDrawer() {
      const navs = [
        { id: 'bang-dieu-khien', label: 'Tổng quan hệ thống', icon: 'dashboard' },
        { id: 'quan-ly-giai-dau', label: 'Quản lý giải đấu (30 giải)', icon: 'emoji_events' },
        { id: 'quan-ly-clb', label: 'Câu lạc bộ thể thao', icon: 'groups_2' },
        { id: 'lich-sinh-hoat', label: 'Lịch sinh hoạt & tập luyện', icon: 'calendar_month' },
        { id: 'co-so-vat-chat', label: 'Cơ sở vật chất & sân bãi', icon: 'stadium' },
        { id: 'kinh-phi', label: 'Kinh phí & quyết toán', icon: 'account_balance_wallet' },
        { id: 'bao-cao', label: 'Báo cáo & sổ lưu trữ', icon: 'summarize' }
      ];

      return `
        <div id="mobileDrawer" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-start">
          <div class="w-72 bg-white dark:bg-slate-900 h-full p-5 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                    <img src="logo.png" onerror="if(typeof EMBEDDED_LOGO_B64!=='undefined') this.src=EMBEDDED_LOGO_B64" class="w-full h-full object-contain rounded-full" alt="Huy hiệu UBND Phường Tân Khai" />
                  </div>
                  <div>
                    <span class="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">UBND PHƯỜNG TÂN KHAI</span>
                    <h3 class="font-bold text-xs uppercase text-slate-900 dark:text-white leading-tight">ĐIỀU HÀNH TDTT</h3>
                  </div>
                </div>
                <button onclick="toggleMobileDrawer()" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600">
                  <span class="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <nav class="mt-4 space-y-1">
                ${navs.map(n => `
                  <button onclick="switchTab('${n.id}')" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium tracking-wide ${
                    state.currentTab === n.id 
                      ? 'bg-emerald-700 text-white font-semibold shadow-sm' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }">
                    <span class="material-symbols-outlined text-[19px]">${n.icon}</span>
                    <span>${n.label}</span>
                  </button>
                `).join('')}
              </nav>
            </div>

            <div class="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button onclick="openSyncModal()" class="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 mb-2">
                <span class="material-symbols-outlined text-[16px]">cloud_sync</span>
                <span>Cấu hình Google Drive</span>
              </button>
              <button onclick="handleLogout()" class="w-full py-2 px-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[16px]">logout</span>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

