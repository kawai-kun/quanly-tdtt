// ==============================================================================
// COMPONENT: QUẢN LÝ GIẢI ĐẤU (TOURNAMENTS)
// Bảng hiển thị 11 cột cố định kích thước, Ghim cột Thao tác (Sticky right-0)
// ==============================================================================

import { state, getActivityReportStatus, toggleActivityReportStatus } from '../state.js';
import { getSportBadge } from '../utils/sportBadges.js';
import { getAvailableYears, sortActivitiesByLatest, extractYearFromDate } from '../utils/formatters.js';
import { animateStagger } from '../utils/animations.js';

    export function getFilteredTournamentsList() {
      const f = state.tournamentsFilter;
      let acts = state.activities.filter(a => {
        const y = String(a.year || extractYearFromDate(a.date));
        if (state.selectedYear !== 'all' && y !== String(state.selectedYear)) return false;
        if (f.category !== 'all' && a.category !== f.category) return false;
        if (f.sport !== 'all' && a.sport !== f.sport) return false;
        if (f.reportStatus && f.reportStatus !== 'all') {
          const repStatus = getActivityReportStatus(a);
          if (f.reportStatus === 'reported' && !repStatus.isReported) return false;
          if (f.reportStatus === 'unreported' && repStatus.isReported) return false;
        }
        if (f.search) {
          const q = f.search.toLowerCase().trim();
          const matchTitle = (a.title || '').toLowerCase().includes(q);
          const matchCode = (a.code || '').toLowerCase().includes(q);
          const matchSport = (a.sport || '').toLowerCase().includes(q);
          const matchLoc = (a.location || '').toLowerCase().includes(q);
          if (!matchTitle && !matchCode && !matchSport && !matchLoc) return false;
        }
        return true;
      });
      return sortActivitiesByLatest(acts);
    }

    export function getTournamentsCountsHtml(acts) {
      const allYearActs = state.selectedYear === 'all'
        ? state.activities
        : state.activities.filter(a => String(a.year || extractYearFromDate(a.date)) === String(state.selectedYear));
      const unreportedCount = allYearActs.filter(a => !getActivityReportStatus(a).isReported).length;
      const reportedCount = allYearActs.filter(a => getActivityReportStatus(a).isReported).length;
      const total = acts ? acts.length : allYearActs.length;

      return `
        <span class="text-slate-600 dark:text-slate-300 font-medium">Tổng số: <b class="text-slate-900 dark:text-white font-mono">${total}</b> hoạt động</span>
        <span class="text-slate-300 dark:text-slate-700">|</span>
        <span class="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
          <span class="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>Đã báo cáo: ${reportedCount}
        </span>
        <span class="text-slate-300 dark:text-slate-700">|</span>
        <span class="inline-flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
          <span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>Chưa báo cáo: ${unreportedCount}
        </span>
      `;
    }

    export function renderTournaments() {
      const f = state.tournamentsFilter;
      const availableYears = getAvailableYears();
      const sportList = Array.from(new Set(state.activities.map(a => a.sport || 'Bóng đá')));
      const acts = getFilteredTournamentsList();

      return `
        <div class="space-y-4 tab-pane-animate">
          <!-- Header & Action Buttons -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Quản Lý Giải Thi Đấu & Sự Kiện
              </h1>
              <p id="tournaments_counts_display" class="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                ${getTournamentsCountsHtml(acts)}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button onclick="pullFromGoogleSheet(false)" class="px-3.5 py-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer btn-press shrink-0" title="Đồng bộ tức thì từ Google Drive & Telegram">
                <span class="material-symbols-outlined text-[17px]">sync</span>
                <span>Đồng bộ</span>
              </button>
              <button onclick="openActivityModal()" class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer btn-press shrink-0" title="Thêm giải đấu mới (Phím tắt: N)">
                <span class="material-symbols-outlined text-[18px]">add</span>
                <span>Thêm giải đấu</span>
                <span class="hidden sm:inline text-[10px] bg-emerald-800 px-1.5 py-0.5 rounded text-emerald-100 font-mono">N</span>
              </button>
            </div>
          </div>

          <!-- Unified Toolbar (Thanh công cụ tích hợp chuẩn phẳng) -->
          <div class="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-2">
            
            <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              <!-- Search Input -->
              <div class="relative flex-1 min-w-[220px] h-9">
                <span class="material-symbols-outlined text-[17px] text-slate-400 absolute left-2.5 top-2 pointer-events-none">search</span>
                <input id="tournament_search_input" type="text" value="${f.search || ''}" oninput="handleTournamentSearchInput(this.value)" placeholder="Tìm kiếm giải đấu, mã, địa điểm... (Nhấn /)" class="w-full h-full pl-8 pr-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors" />
              </div>

              <!-- Year Filter -->
              <div class="h-9 flex items-center gap-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0">
                <select onchange="setGlobalYear(this.value)" class="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer">
                  <option value="all" ${state.selectedYear === 'all' ? 'selected' : ''}>Tất cả năm</option>
                  ${availableYears.map(y => `<option value="${y}" ${String(state.selectedYear) === String(y) ? 'selected' : ''}>Năm ${y}</option>`).join('')}
                </select>
              </div>

              <!-- Sport Filter -->
              <div class="h-9 flex items-center gap-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0">
                <select onchange="setTournamentsFilter('sport', this.value)" class="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer">
                  <option value="all">Tất cả môn</option>
                  ${sportList.map(s => `<option value="${s}" ${f.sport === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>

              <!-- Category Filter -->
              <div class="h-9 flex items-center gap-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0">
                <select onchange="setTournamentsFilter('category', this.value)" class="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer">
                  <option value="all">Tất cả cấp độ</option>
                  <option value="Cấp phường" ${f.category === 'Cấp phường' ? 'selected' : ''}>Cấp phường</option>
                  <option value="Cấp thành phố" ${f.category === 'Cấp thành phố' ? 'selected' : ''}>Cấp thành phố</option>
                  <option value="Hành chính" ${f.category === 'Hành chính' ? 'selected' : ''}>Hành chính</option>
                </select>
              </div>

              <!-- Report Status Filter -->
              <div class="h-9 flex items-center gap-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0">
                <select onchange="setTournamentsFilter('reportStatus', this.value)" class="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer">
                  <option value="all" ${f.reportStatus === 'all' ? 'selected' : ''}>Tất cả trạng thái</option>
                  <option value="unreported" ${f.reportStatus === 'unreported' ? 'selected' : ''}>○ Chưa báo cáo</option>
                  <option value="reported" ${f.reportStatus === 'reported' ? 'selected' : ''}>● Đã báo cáo</option>
                </select>
              </div>
            </div>

            <!-- View Switch: Cards vs Table -->
            <div class="h-9 flex items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
              <button onclick="toggleTournamentsView('cards')" class="h-7 px-2 rounded text-xs flex items-center justify-center ${f.viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm' : 'text-slate-400'}" title="Xem dạng thẻ">
                <span class="material-symbols-outlined text-[17px]">grid_view</span>
              </button>
              <button onclick="toggleTournamentsView('table')" class="h-7 px-2 rounded text-xs flex items-center justify-center ${f.viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm' : 'text-slate-400'}" title="Xem dạng bảng">
                <span class="material-symbols-outlined text-[17px]">table_rows</span>
              </button>
            </div>
          </div>

          <!-- Live Dynamic Container (Chỉ cập nhật container này khi tìm kiếm) -->
          <div id="tournaments_data_container">
            ${f.viewMode === 'cards' ? renderTournamentsGrid(acts) : renderTournamentsTable(acts)}
          </div>

        </div>
      `;
    }

    export function handleTournamentSearchInput(val) {
      state.tournamentsFilter.search = val;
      updateTournamentsOnly();
    }

    export function updateTournamentsOnly() {
      const container = document.getElementById('tournaments_data_container');
      const counterEl = document.getElementById('tournaments_counts_display');
      const acts = getFilteredTournamentsList();

      if (container) {
        container.innerHTML = state.tournamentsFilter.viewMode === 'cards' 
          ? renderTournamentsGrid(acts) 
          : renderTournamentsTable(acts);
        initTournamentsAnimations();
      }
      if (counterEl) {
        counterEl.innerHTML = getTournamentsCountsHtml(acts);
      }
    }

    export function initTournamentsAnimations() {
      try {
        if (state.tournamentsFilter.viewMode === 'cards') {
          animateStagger('#tournaments_data_container .grid > div', { delayStep: 30, duration: 320 });
        } else {
          animateStagger('#tournaments_data_container table tbody tr', { delayStep: 20, duration: 280 });
        }
      } catch (err) {
        console.warn('Tournaments animation error:', err);
      }
    }

    export function setTournamentsFilter(key, val) {
      state.tournamentsFilter[key] = val;
      updateTournamentsOnly();
    }

    export function toggleTournamentsView(mode) {
      state.tournamentsFilter.viewMode = mode;
      updateTournamentsOnly();
    }

    export function renderTournamentsGrid(acts) {
      if (!acts.length) {
        return `
          <div class="p-10 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span class="material-symbols-outlined text-3xl text-slate-400 mb-2">search_off</span>
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Không tìm thấy giải đấu phù hợp</p>
            <p class="text-xs text-slate-400 mt-1">Hãy thử tìm từ khóa khác hoặc xóa bộ lọc.</p>
          </div>
        `;
      }

      return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${acts.map((a, i) => {
            const badge = getSportBadge(a.sport);
            const repStatus = getActivityReportStatus(a);
            return `
              <div class="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border ${i === 0 ? 'border-emerald-600/80 dark:border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'} shadow-sm card-lift flex flex-col justify-between relative overflow-hidden">
                ${i === 0 ? `
                  <div class="absolute top-0 right-0 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg shadow-sm">
                    #1 MỚI NHẤT
                  </div>
                ` : ''}
                <div>
                  <div class="flex items-center justify-between">
                    <span class="px-2.5 py-0.5 rounded text-[11px] font-semibold ${badge.bg} ${badge.text} border ${badge.border} flex items-center gap-1">
                      <span class="material-symbols-outlined text-[13px]">${badge.icon}</span>
                      <span>${badge.label}</span>
                    </span>
                    <span class="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 ${i === 0 ? 'mr-16' : ''}">${a.code}</span>
                  </div>

                  <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2.5 leading-snug">${a.title}</h3>

                  <!-- Achievement Note Badge if present -->
                  ${a.achievementNote ? `
                    <div class="mt-2 px-2.5 py-1 rounded text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1.5 font-medium">
                      <span class="material-symbols-outlined text-[15px] text-amber-600 shrink-0">military_tech</span>
                      <span class="truncate">${a.achievementNote}</span>
                    </div>
                  ` : ''}

                  <!-- Trạng thái đưa vào Báo cáo (Chức năng 3) -->
                  <div class="mt-3 p-2 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-2">
                    <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">fact_check</span>
                      <span>Báo cáo:</span>
                    </span>
                    ${repStatus.isReported ? `
                      <button type="button" onclick="toggleActivityReportStatus('${a.id}', event)" class="px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1 hover:opacity-85 transition-all btn-press" title="Bấm để chuyển sang Chưa báo cáo">
                        <span class="material-symbols-outlined text-[12px] text-emerald-600">check_circle</span>
                        <span>Đã báo cáo (${repStatus.reportCode})</span>
                      </button>
                    ` : `
                      <button type="button" onclick="toggleActivityReportStatus('${a.id}', event)" class="px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-flex items-center gap-1 hover:opacity-85 transition-all btn-press" title="Bấm để đánh dấu Đã báo cáo">
                        <span class="material-symbols-outlined text-[12px] text-amber-600">pending</span>
                        <span>Chưa lập báo cáo</span>
                      </button>
                    `}
                  </div>

                  <div class="mt-3.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div class="flex items-center justify-between">
                      <span class="text-slate-400 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">calendar_today</span>Ngày tổ chức:</span>
                      <span class="font-semibold font-mono text-brand-700 dark:text-brand-400">${a.date}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-400 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">location_on</span>Địa điểm:</span>
                      <span class="font-semibold truncate max-w-[170px]">${a.location}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-400 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">groups</span>Số VĐV:</span>
                      <b class="text-slate-800 dark:text-slate-200">${a.participants} ${a.participantsUnit || 'VĐV'}</b>
                    </div>
                  </div>

                  <!-- Medals Badge Row -->
                  <div class="mt-3.5 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-around text-xs">
                    <div class="text-center"><span class="text-[10px] text-amber-700 font-bold block">VÀNG</span><b class="text-amber-600">${a.goldMedals || 0}</b></div>
                    <div class="w-px h-5 bg-amber-500/20"></div>
                    <div class="text-center"><span class="text-[10px] text-slate-500 font-bold block">BẠC</span><b class="text-slate-600 dark:text-slate-300">${a.silverMedals || 0}</b></div>
                    <div class="w-px h-5 bg-amber-500/20"></div>
                    <div class="text-center"><span class="text-[10px] text-orange-700 font-bold block">ĐỒNG</span><b class="text-orange-600">${a.bronzeMedals || 0}</b></div>
                    <div class="w-px h-5 bg-amber-500/20"></div>
                    <div class="text-center"><span class="text-[10px] text-brand-700 font-bold block">TỔNG</span><b class="text-brand-700 dark:text-brand-400">${a.totalMedals || 0}</b></div>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                    <span class="material-symbols-outlined text-[15px] text-brand-600">flag</span>
                    <span>${a.category || 'Cấp phường'}</span>
                  </span>
                  <div class="flex items-center gap-1">
                    <button onclick="openActivityModal('${a.id}')" title="Sửa" class="p-1.5 rounded-lg text-slate-500 hover:text-brand-700 hover:bg-brand-50 btn-press">
                      <span class="material-symbols-outlined text-[17px]">edit</span>
                    </button>
                    <button onclick="confirmDeleteActivity('${a.id}')" title="Xóa" class="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 btn-press">
                      <span class="material-symbols-outlined text-[17px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    export function renderTournamentsTable(acts) {
      if (!acts.length) {
        return `
          <div class="p-10 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span class="material-symbols-outlined text-3xl text-slate-400 mb-2">search_off</span>
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Không tìm thấy giải đấu phù hợp</p>
            <p class="text-xs text-slate-400 mt-1">Hãy thử đổi từ khóa tìm kiếm hoặc chọn "Tất cả môn" / "Tất cả năm".</p>
          </div>
        `;
      }

      const totalTableVdv = acts.reduce((acc, a) => acc + (parseInt(a.participants) || 0), 0);
      const totalGold = acts.reduce((acc, a) => acc + (parseInt(a.goldMedals) || 0), 0);
      const totalSilver = acts.reduce((acc, a) => acc + (parseInt(a.silverMedals) || 0), 0);
      const totalBronze = acts.reduce((acc, a) => acc + (parseInt(a.bronzeMedals) || 0), 0);
      const totalReported = acts.filter(a => getActivityReportStatus(a).isReported).length;

      return `
        <div class="overflow-x-auto -webkit-overflow-scrolling-touch rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm w-full">
          <table class="w-full text-left text-sm border-collapse" style="table-layout: fixed; min-width: 1050px;">
            <colgroup>
              <col style="width: 5%;">
              <col style="width: 6%;">
              <col style="width: 28%;">
              <col style="width: 13%;">
              <col style="width: 14%;">
              <col style="width: 10%;">
              <col style="width: 9%;">
              <col style="width: 6%;">
              <col style="width: 9%;">
              <col style="width: 7%;">
            </colgroup>
            <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700/80 uppercase text-[11px] tracking-wider select-none">
              <tr>
                <th class="py-3 px-2 align-middle whitespace-nowrap text-center">STT</th>
                <th class="py-3 px-2 align-middle whitespace-nowrap text-center">Mã</th>
                <th class="py-3 px-3 align-middle text-left">Tên giải thi đấu</th>
                <th class="py-3 px-2 align-middle whitespace-nowrap text-center">Trạng thái BC</th>
                <th class="py-3 px-2 align-middle whitespace-nowrap text-center">Bộ môn</th>
                <th class="py-3 px-2 align-middle whitespace-nowrap text-center">Cấp độ</th>
                <th class="py-3 px-2 align-middle whitespace-nowrap text-center">Ngày tổ chức</th>
                <th class="py-3 px-2 align-middle whitespace-nowrap text-center">VĐV</th>
                <th class="py-2.5 px-2 align-middle text-center whitespace-nowrap">
                  <div>Huy chương</div>
                  <div class="text-[9.5px] font-normal text-slate-400 lowercase tracking-normal">(v - b - đ)</div>
                </th>
                <th class="py-3 px-2 align-middle whitespace-nowrap text-center sticky right-0 z-20 bg-slate-50 dark:bg-slate-800 border-l border-slate-200/80 dark:border-slate-700 shadow-[-3px_0_6px_rgba(0,0,0,0.04)]">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
              ${acts.map((a, i) => {
                const rep = getActivityReportStatus(a);
                const badge = getSportBadge(a.sport);
                const isTop = i === 0;
                return `
                  <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group ${isTop ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''}">
                    <!-- 1. STT (5%) -->
                    <td class="py-3 px-2 align-middle whitespace-nowrap text-center font-mono">
                      ${isTop ? `
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 inline-block">
                          #1 Mới
                        </span>
                      ` : `
                        <span class="text-slate-400 dark:text-slate-500 font-semibold text-xs">${i + 1}</span>
                      `}
                    </td>

                    <!-- 2. Mã giải (6%) -->
                    <td class="py-3 px-2 align-middle whitespace-nowrap text-center">
                      <span class="font-mono font-semibold text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        ${a.code}
                      </span>
                    </td>

                    <!-- 3. Tên giải đấu (28% - Tự động xuống hàng, ngắt dòng thông minh) -->
                    <td class="py-3 px-3 align-middle">
                      <div onclick="openActivityModal('${a.id}')" class="font-semibold text-[13.5px] text-slate-900 dark:text-white leading-snug whitespace-normal break-words hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer transition-colors" title="Bấm để xem và sửa chi tiết">
                        ${a.title}
                      </div>
                      ${a.achievementNote ? `
                        <div class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50/90 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                          <span class="material-symbols-outlined text-[13px] text-amber-600 shrink-0">military_tech</span>
                          <span class="break-words">${a.achievementNote}</span>
                        </div>
                      ` : ''}
                    </td>

                    <!-- 4. Trạng thái BC (13%) -->
                    <td class="py-3 px-2 align-middle whitespace-nowrap text-center">
                      ${rep.isReported ? `
                        <button type="button" onclick="toggleActivityReportStatus('${a.id}', event)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors btn-press" title="Bấm để chuyển sang Chưa báo cáo">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span>Đã BC (${rep.reportCode})</span>
                        </button>
                      ` : `
                        <button type="button" onclick="toggleActivityReportStatus('${a.id}', event)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/70 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors btn-press" title="Bấm để đánh dấu Đã báo cáo">
                          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>Chưa BC</span>
                        </button>
                      `}
                    </td>

                    <!-- 5. Bộ môn (14%) -->
                    <td class="py-3 px-2 align-middle whitespace-nowrap text-center">
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text} border ${badge.border}">
                        <span class="material-symbols-outlined text-[13px] shrink-0">${badge.icon}</span>
                        <span>${a.sport || 'Bóng đá'}</span>
                      </span>
                    </td>

                    <!-- 6. Cấp độ (10%) -->
                    <td class="py-3 px-2 align-middle whitespace-nowrap text-center">
                      <span class="px-2 py-0.5 rounded text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        ${a.category || 'Cấp phường'}
                      </span>
                    </td>

                    <!-- 7. Ngày tổ chức (9%) -->
                    <td class="py-3 px-2 align-middle whitespace-nowrap text-center font-mono font-medium text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      ${a.date}
                    </td>

                    <!-- 8. VĐV (6%) -->
                    <td class="py-3 px-2 align-middle whitespace-nowrap text-center font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-mono">
                      ${a.participants} <span class="text-[10px] text-slate-500 font-sans font-normal">${a.participantsUnit || 'VĐV'}</span>
                    </td>

                    <!-- 9. Huy chương (9%) -->
                    <td class="py-3 px-2 align-middle whitespace-nowrap text-center font-mono text-xs sm:text-sm font-semibold">
                      <span class="text-amber-600 font-bold">${a.goldMedals || 0}V</span> - 
                      <span class="text-slate-500 font-bold">${a.silverMedals || 0}B</span> - 
                      <span class="text-amber-700 font-bold">${a.bronzeMedals || 0}Đ</span>
                    </td>

                    <!-- 10. Thao tác (7% - Ghim mép phải) -->
                    <td class="py-3 px-2 align-middle whitespace-nowrap text-center sticky right-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 border-l border-slate-200/80 dark:border-slate-800 shadow-[-3px_0_6px_rgba(0,0,0,0.04)]">
                      <div class="flex items-center justify-center gap-1">
                        <button onclick="openActivityModal('${a.id}')" title="Sửa thông tin" class="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-700 btn-press transition-colors">
                          <span class="material-symbols-outlined text-[17px]">edit</span>
                        </button>
                        <button onclick="confirmDeleteActivity('${a.id}')" title="Xóa giải đấu" class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 btn-press transition-colors">
                          <span class="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <!-- Table Footer: Dòng Tổng kết số liệu thực tế -->
            <tfoot class="bg-slate-50 dark:bg-slate-800/80 border-t-2 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
              <tr>
                <td colspan="3" class="py-3 px-3 text-left font-bold text-slate-900 dark:text-white">
                  TỔNG CỘNG: <span class="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">${acts.length}</span> GIẢI ĐẤU
                </td>
                <td colspan="4" class="py-3 px-2 text-center text-slate-500 dark:text-slate-400 text-[11.5px] font-normal">
                  <span class="text-emerald-700 dark:text-emerald-400 font-semibold">${totalReported} đã báo cáo</span> • <span class="text-amber-700 dark:text-amber-400 font-semibold">${acts.length - totalReported} chưa báo cáo</span>
                </td>
                <td class="py-3 px-2 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
                  ${totalTableVdv.toLocaleString('vi-VN')}
                </td>
                <td class="py-3 px-2 text-center font-mono text-xs sm:text-sm">
                  <span class="text-amber-600 font-bold">${totalGold}V</span> - <span class="text-slate-500 font-bold">${totalSilver}B</span> - <span class="text-amber-700 font-bold">${totalBronze}Đ</span>
                </td>
                <td class="py-3 px-2 sticky right-0 z-10 bg-slate-50 dark:bg-slate-800 border-l border-slate-200/80 dark:border-slate-700"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    }

