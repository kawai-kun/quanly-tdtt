// ==============================================================================
// COMPONENT: SIDEBAR NAVIGATION & MOBILE DRAWER
// ==============================================================================

import { state } from '../state.js';

export     function switchTab(t) {
      state.currentTab = t;
      state.mobileDrawerOpen = false;
      renderApp();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderSidebar() {
      const navs = [
        { id: 'bang-dieu-khien', label: 'Bảng điều khiển', icon: 'dashboard' },
        { id: 'quan-ly-giai-dau', label: 'Quản lý giải đấu', icon: 'emoji_events', badge: state.activities.length },
        { id: 'quan-ly-clb', label: 'Quản lý CLB', icon: 'groups_2', badge: state.clubs.length },
        { id: 'lich-sinh-hoat', label: 'Lịch sinh hoạt', icon: 'calendar_month', badge: state.schedules.length },
        { id: 'co-so-vat-chat', label: 'Cơ sở vật chất', icon: 'stadium', badge: state.facilities.length },
        { id: 'kinh-phi', label: 'Quản lý kinh phí', icon: 'account_balance_wallet', badge: state.budgetItems.length },
        { id: 'bao-cao', label: 'Báo cáo & Sổ lưu trữ', icon: 'summarize', badge: state.savedReports.length }
      ];

      return `
        <aside class="hidden lg:flex fixed left-0 top-0 bottom-0 w-[270px] glass-card border-r border-slate-200/80 dark:border-slate-800/80 flex-col justify-between p-4 z-50">
          <div>
            <!-- Official Brand Header: Dedicated to Logo + HỆ THỐNG QUẢN LÝ TDTT (Góc bên trái) -->
            <div class="px-2 py-3 flex items-center gap-3 border-b border-slate-200/60 dark:border-slate-800/60 pb-5 mb-4">
              <div class="w-14 h-14 shrink-0 flex items-center justify-center p-1 rounded-full bg-white/95 dark:bg-slate-800/95 shadow-md border border-slate-200/80 dark:border-slate-700 overflow-hidden group">
                <img src="logo.png" onerror="if(typeof EMBEDDED_LOGO_B64!=='undefined') this.src=EMBEDDED_LOGO_B64" class="w-full h-full object-contain rounded-full transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_8px_rgba(139,227,58,0.35)]" alt="Huy hiệu UBND Phường Tân Khai" />
              </div>
              <div class="flex flex-col text-left min-w-0">
                <span class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">PHƯỜNG TÂN KHAI</span>
                <span class="text-sm font-black font-display uppercase tracking-tight text-brand-700 dark:text-brand-400 leading-tight">HỆ THỐNG QUẢN LÝ</span>
                <span class="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide leading-tight mt-0.5">THỂ DỤC THỂ THAO</span>
              </div>
            </div>

            <!-- Navigation Links with Animated Badges -->
            <nav class="space-y-1">
              ${navs.map(item => {
                const isActive = state.currentTab === item.id;
                const cls = isActive
                  ? 'bg-brand-700 text-white font-bold shadow-md shadow-brand-900/20 dark:bg-gradient-to-r dark:from-[#06301a] dark:to-[#0a2e1b] dark:text-[#8be33a] dark:border dark:border-[#8be33a]/40 dark:shadow-[0_0_16px_rgba(139,227,58,0.25)]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#06301a]/40 hover:text-brand-700 dark:hover:text-[#8be33a] font-medium';
                return `
                  <button onclick="switchTab('${item.id}')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all text-left ${cls} group btn-press">
                    <span class="flex items-center gap-3">
                      <span class="material-symbols-outlined text-[19px] transition-transform group-hover:scale-110">${item.icon}</span>
                      <span>${item.label}</span>
                    </span>
                    ${item.badge !== undefined ? `
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive 
                          ? 'bg-white/20 text-white dark:bg-[#8be33a] dark:text-[#0e1f14] dark:font-black' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }">
                        ${item.badge}
                      </span>
                    ` : ''}
                  </button>
                `;
              }).join('')}
            </nav>
          </div>

          <!-- Bottom Cloud Card -->
          <div class="pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
            <div class="p-3.5 rounded-2xl bg-gradient-to-br from-brand-50 to-emerald-100/50 dark:from-slate-900 dark:to-slate-800 border border-brand-200/60 dark:border-slate-700 text-left">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-brand-800 dark:text-brand-300 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full ${state.apiUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}"></span>
                  Google Drive Cloud
                </span>
                <button onclick="openSyncModal()" class="text-[11px] text-brand-700 dark:text-brand-400 font-bold hover:underline">Cấu hình</button>
              </div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">Lần cuối: ${state.lastSyncTime}</p>
              <div class="mt-2.5 grid grid-cols-2 gap-1.5">
                <button onclick="pullFromGoogleSheet(false)" class="py-2 px-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 btn-press" title="Lấy dữ liệu mới nhất từ Google Drive về máy (bao gồm giải đấu vừa thêm qua Telegram)">
                  <span class="material-symbols-outlined text-[15px]">cloud_download</span>
                  <span>Tải về</span>
                </button>
                <button onclick="pushToGoogleSheet(true)" class="py-2 px-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1 btn-press" title="Lưu dữ liệu hiện tại lên Google Drive">
                  <span class="material-symbols-outlined text-[15px]">cloud_upload</span>
                  <span>Lưu lên</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      `;
    }

    function renderBottomNav() {
      const items = [
        { id: 'bang-dieu-khien', label: 'Tổng quan', icon: 'dashboard' },
        { id: 'quan-ly-giai-dau', label: 'Giải đấu', icon: 'emoji_events' },
        { id: 'quan-ly-clb', label: 'CLB', icon: 'groups_2' },
        { id: 'kinh-phi', label: 'Kinh phí', icon: 'account_balance_wallet' },
        { id: 'bao-cao', label: 'Báo cáo', icon: 'summarize' },
        { id: 'drawer', label: 'Thêm', icon: 'menu', isAction: true }
      ];

      return `
        <div class="lg:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-slate-200/80 dark:border-slate-800/80 z-40 px-2 py-1 flex justify-around items-center shadow-lg">
          ${items.map(i => {
            const isActive = state.currentTab === i.id;
            const color = isActive ? 'text-brand-700 dark:text-brand-400 font-bold' : 'text-slate-400 dark:text-slate-500';
            const action = i.isAction ? 'toggleMobileDrawer()' : `switchTab('${i.id}')`;
            return `
              <button onclick="${action}" class="flex flex-col items-center justify-center py-1.5 px-1 flex-1 ${color} transition-all btn-press">
                <span class="material-symbols-outlined text-[20px]">${i.icon}</span>
                <span class="text-[10px] tracking-tight mt-0.5">${i.label}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    }

    function renderMobileDrawer() {
      const navs = [
        { id: 'bang-dieu-khien', label: 'Bảng điều khiển', icon: 'dashboard' },
        { id: 'quan-ly-giai-dau', label: 'Quản lý giải đấu', icon: 'emoji_events' },
        { id: 'quan-ly-clb', label: 'Quản lý CLB thể thao', icon: 'groups_2' },
        { id: 'lich-sinh-hoat', label: 'Lịch sinh hoạt & tập luyện', icon: 'calendar_month' },
        { id: 'co-so-vat-chat', label: 'Cơ sở vật chất & sân bãi', icon: 'stadium' },
        { id: 'kinh-phi', label: 'Kinh phí & quyết toán', icon: 'account_balance_wallet' },
        { id: 'bao-cao', label: 'Báo cáo & Sổ lưu trữ', icon: 'summarize' }
      ];

      return `
        <div id="mobileDrawer" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-start">
          <div class="w-72 bg-white dark:bg-slate-900 h-full p-5 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-full p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                    <img src="logo.png" onerror="if(typeof EMBEDDED_LOGO_B64!=='undefined') this.src=EMBEDDED_LOGO_B64" class="w-full h-full object-contain rounded-full" alt="Huy hiệu UBND Phường Tân Khai" />
                  </div>
                  <div>
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">PHƯỜNG TÂN KHAI</span>
                    <h3 class="font-black text-xs uppercase text-brand-700 dark:text-brand-400 leading-tight">QUẢN LÝ TDTT</h3>
                  </div>
                </div>
                <button onclick="toggleMobileDrawer()" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600">
                  <span class="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <nav class="mt-4 space-y-1">
                ${navs.map(n => `
                  <button onclick="switchTab('${n.id}')" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    state.currentTab === n.id 
                      ? 'bg-brand-700 text-white font-bold shadow-sm dark:bg-[#06301a] dark:text-[#8be33a] dark:border dark:border-[#8be33a]/30' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }">
                    <span class="material-symbols-outlined text-[18px]">${n.icon}</span>
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
    /* ==============================================================================
