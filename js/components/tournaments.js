// ==============================================================================
// COMPONENT: QUẢN LÝ GIẢI ĐẤU (TOURNAMENTS)
// Bảng hiển thị 11 cột cố định kích thước, Ghim cột Thao tác (Sticky right-0)
// Lọc Realtime không giật lag, hỗ trợ Table View & Grid View
// ==============================================================================

import { state, getActivityReportStatus, toggleActivityReportStatus } from '../state.js';
import { getSportBadge } from '../utils/sportBadges.js';
import { getAvailableYears } from '../utils/formatters.js';

       9. TAB 2: QUẢN LÝ GIẢI ĐẤU (TOURNAMENTS) - FULL CRUD
       ============================================================================== */
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
        <span>Tổng số: <b class="text-slate-800 dark:text-slate-100">${total}</b> hoạt động</span>
        <span>•</span>
        <span class="text-emerald-700 dark:text-emerald-400 font-bold">✓ Đã báo cáo: ${reportedCount}</span>
        <span>•</span>
        <span class="text-amber-700 dark:text-amber-400 font-bold">⏳ Chưa báo cáo: ${unreportedCount}</span>
      `;
    }

export function renderTournaments() {
      const f = state.tournamentsFilter;
      const availableYears = getAvailableYears();
      const sportList = Array.from(new Set(state.activities.map(a => a.sport || 'Bóng đá')));
      const acts = getFilteredTournamentsList();

      return `
        <div class="space-y-6 tab-pane-animate">
          <!-- Header & Action Button -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                Quản Lý Giải Thi Đấu & Sự Kiện
              </h1>
              <p id="tournaments_counts_display" class="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                ${getTournamentsCountsHtml(acts)}
              </p>
            </div>

            <div class="flex items-center gap-2.5">
              <button onclick="pullFromGoogleSheet(false)" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer btn-press shrink-0" title="Bấm để đồng bộ tức thì các giải đấu mới nhất vừa thêm từ Telegram hoặc Google Sheet">
                <span class="material-symbols-outlined text-[19px]">sync</span>
                <span>Đồng bộ Telegram</span>
              </button>
              <button onclick="openActivityModal()" class="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-glow-brand transition-all flex items-center gap-2 cursor-pointer btn-press shrink-0">
                <span class="material-symbols-outlined text-[19px]">add_circle</span>
                <span>Thêm giải đấu mới</span>
              </button>
            </div>
          </div>

          <!-- Filter Toolbar (Đồng bộ chiều cao h-10, thẳng hàng chuẩn xác) -->
          <div class="p-3.5 sm:p-4 rounded-3xl glass-card border border-slate-200/90 dark:border-slate-800 shadow-mobbin flex flex-wrap items-center justify-between gap-3">
            
            <div class="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              <!-- Search Input (Đánh tới đâu lọc tới đó, giữ focus không bị click lại) -->
              <div class="relative flex-1 min-w-[220px] h-10">
                <span class="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-2.5 pointer-events-none">search</span>
                <input id="tournament_search_input" type="text" value="${f.search || ''}" oninput="handleTournamentSearchInput(this.value)" placeholder="Tìm tên giải, mã giải, địa điểm..." class="w-full h-full pl-9 pr-3 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 transition-colors" />
              </div>

              <!-- Year Filter -->
              <div class="h-10 flex items-center gap-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 shrink-0">
                <span class="material-symbols-outlined text-[16px] text-brand-700 dark:text-brand-400">date_range</span>
                <select onchange="setGlobalYear(this.value)" class="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer">
                  <option value="all" ${state.selectedYear === 'all' ? 'selected' : ''}>Tất cả năm</option>
                  ${availableYears.map(y => `<option value="${y}" ${String(state.selectedYear) === String(y) ? 'selected' : ''}>Năm ${y}</option>`).join('')}
                </select>
              </div>

              <!-- Sport Filter -->
              <div class="h-10 flex items-center gap-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 shrink-0">
                <span class="material-symbols-outlined text-[16px] text-brand-700 dark:text-brand-400">sports</span>
                <select onchange="setTournamentsFilter('sport', this.value)" class="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer">
                  <option value="all">Tất cả môn</option>
                  ${sportList.map(s => `<option value="${s}" ${f.sport === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>

              <!-- Category Filter -->
              <div class="h-10 flex items-center gap-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 shrink-0">
                <span class="material-symbols-outlined text-[16px] text-brand-700 dark:text-brand-400">military_tech</span>
                <select onchange="setTournamentsFilter('category', this.value)" class="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer">
                  <option value="all">Tất cả cấp độ</option>
                  <option value="Cấp phường" ${f.category === 'Cấp phường' ? 'selected' : ''}>Cấp phường</option>
                  <option value="Cấp thành phố" ${f.category === 'Cấp thành phố' ? 'selected' : ''}>Cấp thành phố</option>
                  <option value="Hành chính" ${f.category === 'Hành chính' ? 'selected' : ''}>Hành chính</option>
                </select>
              </div>

              <!-- Report Status Filter -->
              <div class="h-10 flex items-center gap-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 shrink-0">
                <span class="material-symbols-outlined text-[16px] text-brand-700 dark:text-brand-400">fact_check</span>
                <select onchange="setTournamentsFilter('reportStatus', this.value)" class="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer">
                  <option value="all" ${f.reportStatus === 'all' ? 'selected' : ''}>Tất cả trạng thái BC</option>
                  <option value="unreported" ${f.reportStatus === 'unreported' ? 'selected' : ''}>⏳ Chưa báo cáo</option>
                  <option value="reported" ${f.reportStatus === 'reported' ? 'selected' : ''}>✓ Đã lập báo cáo</option>
                </select>
              </div>
            </div>

            <!-- View Switch: Cards vs Table -->
            <div class="h-10 flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
              <button onclick="toggleTournamentsView('cards')" class="h-8 px-2.5 rounded-lg text-xs flex items-center justify-center ${f.viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-400 font-bold shadow-sm' : 'text-slate-400'}" title="Xem dạng thẻ">
                <span class="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button onclick="toggleTournamentsView('table')" class="h-8 px-2.5 rounded-lg text-xs flex items-center justify-center ${f.viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-400 font-bold shadow-sm' : 'text-slate-400'}" title="Xem dạng bảng">
                <span class="material-symbols-outlined text-[18px]">table_rows</span>
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
      }
      if (counterEl) {
        counterEl.innerHTML = getTournamentsCountsHtml(acts);
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
          <div class="p-12 text-center rounded-3xl glass-card border border-slate-200/90 dark:border-slate-800">
            <span class="material-symbols-outlined text-4xl text-slate-400 mb-2">search_off</span>
            <p class="text-sm font-bold text-slate-600 dark:text-slate-300">Không tìm thấy giải đấu phù hợp</p>
            <p class="text-xs text-slate-400 mt-1">Hãy thử tìm từ khóa khác hoặc xóa bộ lọc.</p>
          </div>
        `;
      }

      return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${acts.map((a, i) => {
            const badge = getSportBadge(a.sport);
            const repStatus = getActivityReportStatus(a);
            return `
              <div class="p-5 rounded-3xl glass-card border ${i === 0 ? 'border-brand-500/80 dark:border-brand-400 ring-2 ring-brand-500/20' : 'border-slate-200/90 dark:border-slate-800'} shadow-mobbin card-lift flex flex-col justify-between relative overflow-hidden">
                ${i === 0 ? `
                  <div class="absolute top-0 right-0 bg-gradient-to-l from-[#06301a] to-[#092817] text-[#8be33a] border-l border-b border-[#8be33a]/40 shadow-[0_0_12px_rgba(139,227,58,0.3)] text-[10px] font-extrabold px-3 py-0.5 rounded-bl-xl flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#8be33a] animate-ping"></span>
                    <span>#1 MỚI NHẤT</span>
                  </div>
                ` : ''}
                <div>
                  <div class="flex items-center justify-between">
                    <span class="px-2.5 py-1 rounded-xl text-[10px] font-bold ${badge.bg} ${badge.text} border ${badge.border} flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">${badge.icon}</span>
                      <span>${badge.label}</span>
                    </span>
                    <span class="font-mono text-xs font-extrabold text-brand-700 dark:text-brand-400 ${i === 0 ? 'mr-16' : ''}">${a.code}</span>
                  </div>

                  <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mt-3 leading-snug">${a.title}</h3>

                  <!-- Achievement Note Badge if present -->
                  ${a.achievementNote ? `
                    <div class="mt-2.5 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 font-semibold">
                      <span class="material-symbols-outlined text-[16px] text-amber-600 shrink-0">military_tech</span>
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
                  <span class="font-bold text-slate-600 dark:text-slate-300 text-[11px]">${((parseInt(a.budgetTotal) || 0) / 1000000).toFixed(1)} tr đ</span>
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
          <div class="p-12 text-center rounded-3xl glass-card border border-slate-200/90 dark:border-slate-800">
            <span class="material-symbols-outlined text-4xl text-slate-400 mb-2">search_off</span>
            <p class="text-sm font-bold text-slate-600 dark:text-slate-300">Không tìm thấy giải đấu phù hợp</p>
            <p class="text-xs text-slate-400 mt-1">Hãy thử tìm từ khóa khác hoặc chuyển sang "Tất cả môn" / "Tất cả năm".</p>
          </div>
        `;
      }

      return `
        <div class="overflow-x-auto -webkit-overflow-scrolling-touch rounded-3xl glass-card border border-slate-200/90 dark:border-slate-800 shadow-mobbin w-full">
          <table class="w-full text-left text-sm border-collapse" style="table-layout: fixed; min-width: 1180px;">
            <colgroup>
              <col style="width: 52px;">
              <col style="width: 72px;">
              <col style="width: auto; min-width: 250px;">
              <col style="width: 125px;">
              <col style="width: 110px;">
              <col style="width: 100px;">
              <col style="width: 105px;">
              <col style="width: 75px;">
              <col style="width: 125px;">
              <col style="width: 140px;">
              <col style="width: 88px;">
            </colgroup>
            <thead class="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700/80 uppercase text-[12px] tracking-wider select-none">
              <tr>
                <th class="py-3.5 px-2 align-middle whitespace-nowrap text-center">STT</th>
                <th class="py-3.5 px-2 align-middle whitespace-nowrap text-center">Mã</th>
                <th class="py-3.5 px-4 align-middle text-left">Tên giải thi đấu</th>
                <th class="py-3.5 px-2 align-middle whitespace-nowrap text-center">Trạng thái BC</th>
                <th class="py-3.5 px-2 align-middle whitespace-nowrap text-center">Bộ môn</th>
                <th class="py-3.5 px-2 align-middle whitespace-nowrap text-center">Cấp độ</th>
                <th class="py-3.5 px-2 align-middle whitespace-nowrap text-center">Ngày tổ chức</th>
                <th class="py-3.5 px-2 align-middle whitespace-nowrap text-center">VĐV</th>
                <th class="py-3.5 px-2 align-middle whitespace-nowrap text-center">Huy chương (V-B-Đ)</th>
                <th class="py-3.5 px-3 align-middle whitespace-nowrap text-right">Tổng kinh phí</th>
                <th class="py-3.5 px-2 align-middle whitespace-nowrap text-center sticky right-0 z-20 bg-slate-100 dark:bg-slate-800 shadow-[-3px_0_6px_rgba(0,0,0,0.06)] dark:shadow-[-3px_0_6px_rgba(0,0,0,0.3)]">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
              ${acts.map((a, i) => {
                const rep = getActivityReportStatus(a);
                const badge = getSportBadge(a.sport);
                const isTop = i === 0;
                return `
                  <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group ${isTop ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-l-4 border-l-emerald-600 dark:border-l-emerald-400 font-medium' : ''}">
                    <!-- 1. STT (52px) -->
                    <td class="py-3.5 px-2 align-middle whitespace-nowrap text-center font-mono">
                      ${isTop ? `
                        <span class="px-2 py-0.5 rounded-full bg-emerald-700 text-white font-extrabold text-[10.5px] inline-flex items-center gap-0.5 shadow-sm">
                          <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                          #1 Mới
                        </span>
                      ` : `
                        <span class="text-slate-400 dark:text-slate-500 font-bold text-sm">${i + 1}</span>
                      `}
                    </td>

                    <!-- 2. Mã giải (72px) -->
                    <td class="py-3.5 px-2 align-middle whitespace-nowrap text-center">
                      <span class="font-mono font-extrabold text-sm px-2 py-0.5 rounded-lg ${isTop ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' : 'bg-slate-100 dark:bg-slate-800 text-brand-700 dark:text-brand-400 border border-slate-200 dark:border-slate-700'}">
                        ${a.code}
                      </span>
                    </td>

                    <!-- 3. Tên giải đấu (Tự động co giãn theo màn hình) -->
                    <td class="py-3.5 px-4 align-middle">
                      <div onclick="openActivityModal('${a.id}')" class="font-bold text-[14.5px] text-slate-900 dark:text-white leading-snug hover:text-brand-700 dark:hover:text-brand-400 cursor-pointer transition-colors" title="Bấm để xem và sửa chi tiết">
                        ${a.title}
                      </div>
                      ${a.achievementNote ? `
                        <div class="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/80 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                          <span class="material-symbols-outlined text-[13px] text-amber-600">military_tech</span>
                          <span>${a.achievementNote}</span>
                        </div>
                      ` : ''}
                    </td>

                    <!-- 4. Trạng thái BC (125px) -->
                    <td class="py-3.5 px-2 align-middle whitespace-nowrap text-center">
                      ${rep.isReported ? `
                        <button type="button" onclick="toggleActivityReportStatus('${a.id}', event)" class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1 hover:opacity-85 transition-all btn-press shadow-sm" title="Bấm để chuyển sang Chưa báo cáo">
                          <span class="material-symbols-outlined text-[13px] text-emerald-600">check_circle</span>
                          <span>Đã BC (${rep.reportCode})</span>
                        </button>
                      ` : `
                        <button type="button" onclick="toggleActivityReportStatus('${a.id}', event)" class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-flex items-center gap-1 hover:opacity-85 transition-all btn-press shadow-sm" title="Bấm để đánh dấu Đã báo cáo">
                          <span class="material-symbols-outlined text-[13px] text-amber-600">pending</span>
                          <span>Chưa BC</span>
                        </button>
                      `}
                    </td>

                    <!-- 5. Bộ môn (110px) -->
                    <td class="py-3.5 px-2 align-middle whitespace-nowrap text-center">
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-xs font-semibold ${badge.bg} ${badge.text} border ${badge.border}">
                        <span class="material-symbols-outlined text-[14px]">${badge.icon}</span>
                        <span class="truncate max-w-[80px]">${a.sport || 'Bóng đá'}</span>
                      </span>
                    </td>

                    <!-- 6. Cấp độ (100px) -->
                    <td class="py-3.5 px-2 align-middle whitespace-nowrap text-center">
                      <span class="px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        ${a.category || 'Cấp phường'}
                      </span>
                    </td>

                    <!-- 7. Ngày tổ chức (105px) -->
                    <td class="py-3.5 px-2 align-middle whitespace-nowrap text-center font-mono font-bold text-sm text-brand-700 dark:text-brand-400">
                      ${a.date}
                    </td>

                    <!-- 8. VĐV (75px) -->
                    <td class="py-3.5 px-2 align-middle whitespace-nowrap text-center font-bold text-sm text-slate-800 dark:text-slate-200 font-mono">
                      ${a.participants} <span class="text-[11px] text-slate-500 font-sans">${a.participantsUnit || 'VĐV'}</span>
                    </td>

                    <!-- 9. Huy chương (125px) -->
                    <td class="py-3.5 px-2 align-middle whitespace-nowrap text-center font-mono text-sm font-bold">
                      <span class="text-amber-600 font-extrabold">${a.goldMedals || 0}V</span> - 
                      <span class="text-slate-500 font-extrabold">${a.silverMedals || 0}B</span> - 
                      <span class="text-orange-600 font-extrabold">${a.bronzeMedals || 0}Đ</span>
                    </td>

                    <!-- 10. Tổng kinh phí (140px, số to rõ, căn phải) -->
                    <td class="py-3.5 px-3 align-middle whitespace-nowrap text-right font-mono font-black text-[14.5px] sm:text-base text-emerald-700 dark:text-emerald-400">
                      ${(parseInt(a.budgetTotal) || 0).toLocaleString('vi-VN')} đ
                    </td>

                    <!-- 11. Thao tác (88px, CỐ ĐỊNH PINNED RIGHT-0, KHÔNG BAO GIỜ BỊ CHE KHUẤT) -->
                    <td class="py-3.5 px-2 align-middle whitespace-nowrap text-center sticky right-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/90 shadow-[-3px_0_6px_rgba(0,0,0,0.06)] dark:shadow-[-3px_0_6px_rgba(0,0,0,0.3)] space-x-1">
                      <button onclick="openActivityModal('${a.id}')" title="Sửa thông tin" class="p-1.5 rounded-lg text-slate-500 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-slate-700 btn-press transition-colors">
                        <span class="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onclick="confirmDeleteActivity('${a.id}')" title="Xóa giải đấu" class="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 btn-press transition-colors">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    /* ==============================================================================
