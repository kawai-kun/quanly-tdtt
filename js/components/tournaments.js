// ==============================================================================
// COMPONENT: QUẢN LÝ GIẢI ĐẤU - ACTION DECK & SỔ TAY ĐIỀU HÀNH THỂ THAO PRO
// Thiết kế Human-Crafted: Thanh công cụ nguyên khối, Bảng trọng tài sắc nét
// ==============================================================================

import { state, getActivityReportStatus, toggleActivityReportStatus } from '../state.js';
import { getSportBadge } from '../utils/sportBadges.js';
import { getAvailableYears, sortActivitiesByLatest, extractYearFromDate, formatVNCurrency } from '../utils/formatters.js';
import { renderPaginationHTML, initPagination } from './pagination.js';

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
    <span class="text-slate-700 dark:text-slate-300 font-medium text-xs tracking-wide">
      Tổng cộng: <b class="font-mono text-sm text-slate-900 dark:text-white font-semibold">${total}</b> giải
    </span>
    <span class="text-slate-300 dark:text-slate-700">|</span>
    <span class="inline-flex items-center gap-1.5 font-medium text-xs tracking-wide text-emerald-700 dark:text-emerald-400">
      <span class="w-2 h-2 rounded-full bg-emerald-600"></span>Đã báo cáo: ${reportedCount}
    </span>
    <span class="text-slate-300 dark:text-slate-700">|</span>
    <span class="inline-flex items-center gap-1.5 font-medium text-xs tracking-wide text-amber-700 dark:text-amber-400">
      <span class="w-2 h-2 rounded-full bg-amber-500"></span>Chờ báo cáo: ${unreportedCount}
    </span>
  `;
}

export function renderTournaments() {
  const f = state.tournamentsFilter;
  const availableYears = getAvailableYears();
  const sportList = Array.from(new Set(state.activities.map(a => a.sport || 'Bóng đá')));
  const acts = getFilteredTournamentsList();

  return `
    <div class="space-y-4 tab-pane-animate text-left">
      
      <!-- Top Title & Controls Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              Sổ tay Điều hành & Quản lý Giải đấu
            </h1>
            <span class="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              30 giải thực tế
            </span>
          </div>
          <p id="tournaments_counts_display" class="text-xs text-slate-500 mt-1.5 flex items-center gap-2 flex-wrap">
            ${getTournamentsCountsHtml(acts)}
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button onclick="pullFromGoogleSheet(false)" class="btn-glass-tactile px-3 py-1.5 text-slate-700 dark:text-slate-200 font-medium text-xs rounded-lg flex items-center gap-1.5 shadow-2xs">
            <span class="material-symbols-outlined text-[16px]">sync</span>
            <span>Đồng bộ Drive</span>
          </button>
          <button onclick="openActivityModal()" class="btn-top-tier px-3.5 py-1.5 font-medium text-xs rounded-lg flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[17px]">add</span>
            <span>Thêm giải đấu (N)</span>
          </button>
        </div>
      </div>

      <!-- INTEGRATED ACTION DECK (THANH ĐIỀU KHIỂN NGUYÊN KHỐI) -->
      <div class="action-deck p-2 sm:p-2.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        
        <!-- Left: Search + Combined Filters -->
        <div class="flex flex-wrap items-center gap-2 flex-1">
          
          <!-- Search input -->
          <div class="relative flex-1 min-w-[240px] h-9">
            <span class="material-symbols-outlined text-[18px] text-slate-400 absolute left-2.5 top-2 pointer-events-none">search</span>
            <input 
              id="tournament_search_input" 
              type="text" 
              value="${f.search || ''}" 
              oninput="handleTournamentSearchInput(this.value)" 
              placeholder="Tìm kiếm giải đấu, mã số, môn, địa điểm... (/)" 
              class="w-full h-full pl-9 pr-3 text-xs rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors" 
            />
          </div>

          <!-- Integrated Filter Dropdowns -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <div class="h-9 flex items-center px-2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs font-sport font-bold text-slate-700 dark:text-slate-200">
              <select onchange="setGlobalYear(this.value)" class="bg-transparent tracking-wider focus:outline-none cursor-pointer">
                <option value="all" ${state.selectedYear === 'all' ? 'selected' : ''}>TẤT CẢ NĂM</option>
                ${availableYears.map(y => `<option value="${y}" ${String(state.selectedYear) === String(y) ? 'selected' : ''}>NĂM ${y}</option>`).join('')}
              </select>
            </div>

            <div class="h-9 flex items-center px-2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs font-sport font-bold text-slate-700 dark:text-slate-200">
              <select onchange="setTournamentsFilter('sport', this.value)" class="bg-transparent tracking-wider focus:outline-none cursor-pointer">
                <option value="all">TẤT CẢ MÔN</option>
                ${sportList.map(s => `<option value="${s}" ${f.sport === s ? 'selected' : ''}>${s.toUpperCase()}</option>`).join('')}
              </select>
            </div>

            <div class="h-9 flex items-center px-2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs font-sport font-bold text-slate-700 dark:text-slate-200">
              <select onchange="setTournamentsFilter('category', this.value)" class="bg-transparent tracking-wider focus:outline-none cursor-pointer">
                <option value="all">TẤT CẢ CẤP</option>
                <option value="Cấp phường" ${f.category === 'Cấp phường' ? 'selected' : ''}>CẤP PHƯỜNG</option>
                <option value="Cấp thành phố" ${f.category === 'Cấp thành phố' ? 'selected' : ''}>CẤP THÀNH PHỐ</option>
                <option value="Hành chính" ${f.category === 'Hành chính' ? 'selected' : ''}>HÀNH CHÍNH</option>
              </select>
            </div>

            <div class="h-9 flex items-center px-2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs font-sport font-bold text-slate-700 dark:text-slate-200">
              <select onchange="setTournamentsFilter('reportStatus', this.value)" class="bg-transparent tracking-wider focus:outline-none cursor-pointer">
                <option value="all" ${f.reportStatus === 'all' ? 'selected' : ''}>TẤT CẢ BÁO CÁO</option>
                <option value="unreported" ${f.reportStatus === 'unreported' ? 'selected' : ''}>CHỜ LẬP BÁO CÁO</option>
                <option value="reported" ${f.reportStatus === 'reported' ? 'selected' : ''}>ĐÃ NỘP BÁO CÁO</option>
              </select>
            </div>
          </div>

        </div>

        <!-- Right: View Switcher (Phím cơ học dứt khoát) -->
        <div class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 self-end lg:self-auto shrink-0 shadow-inner">
          <button 
            onclick="toggleTournamentsView('table')" 
            class="h-7 px-3 rounded-md text-xs font-sport font-bold tracking-wider flex items-center gap-1 transition-all ${f.viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}" 
            title="Sổ tay bảng số liệu 11 cột"
          >
            <span class="material-symbols-outlined text-[16px]">table_rows</span>
            <span>BẢNG</span>
          </button>

          <button 
            onclick="toggleTournamentsView('kanban')" 
            class="h-7 px-3 rounded-md text-xs font-sport font-bold tracking-wider flex items-center gap-1 transition-all ${f.viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}" 
            title="Bảng Kanban tiến độ thi đấu"
          >
            <span class="material-symbols-outlined text-[16px]">view_kanban</span>
            <span>KANBAN</span>
          </button>

          <button 
            onclick="toggleTournamentsView('cards')" 
            class="h-7 px-3 rounded-md text-xs font-sport font-bold tracking-wider flex items-center gap-1 transition-all ${f.viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}" 
            title="Thẻ thi đấu Match Pass"
          >
            <span class="material-symbols-outlined text-[16px]">grid_view</span>
            <span>THẺ ĐẤU</span>
          </button>
        </div>

      </div>

      <!-- Dynamic Data Container -->
      <div id="tournaments_data_container">
        ${renderActiveTournamentsView(acts)}
      </div>

    </div>
  `;
}

function renderActiveTournamentsView(acts) {
  const mode = state.tournamentsFilter.viewMode || 'table';
  const pageSize = 10;
  const totalPages = Math.ceil(acts.length / pageSize) || 1;
  const curPage = Math.min(totalPages, Math.max(1, state.tournamentsFilter.page || 1));
  const start = (curPage - 1) * pageSize;
  const paginatedActs = (mode !== 'kanban') ? acts.slice(start, start + pageSize) : acts;

  let viewHtml = '';
  if (mode === 'kanban') viewHtml = renderTournamentsKanban(acts);
  else if (mode === 'cards') viewHtml = renderTournamentsGrid(paginatedActs);
  else viewHtml = renderTournamentsTable(paginatedActs);

  const paginationHtml = (mode !== 'kanban' && totalPages > 1) 
    ? renderPaginationHTML(totalPages, curPage)
    : '';

  setTimeout(() => {
    if (mode !== 'kanban' && totalPages > 1) {
      initPagination('u449PaginationBox', totalPages, curPage, (newPage) => {
        state.tournamentsFilter.page = newPage;
        updateTournamentsOnly(false);
      });
    }
  }, 40);

  return viewHtml + paginationHtml;
}

export function handleTournamentSearchInput(val) {
  state.tournamentsFilter.search = val;
  updateTournamentsOnly(false);
}

export function updateTournamentsOnly(shouldAnimate = false) {
  const container = document.getElementById('tournaments_data_container');
  const counterEl = document.getElementById('tournaments_counts_display');
  const acts = getFilteredTournamentsList();

  if (container) {
    container.innerHTML = renderActiveTournamentsView(acts);
  }
  if (counterEl) {
    counterEl.innerHTML = getTournamentsCountsHtml(acts);
  }
}

export function initTournamentsAnimations() {}

export function setTournamentsFilter(key, val) {
  state.tournamentsFilter[key] = val;
  updateTournamentsOnly(false);
}

export function toggleTournamentsView(mode) {
  state.tournamentsFilter.viewMode = mode;
  window.renderApp();
}

// ==============================================================================
// 1. SỔ TAY BẢNG DỮ LIỆU LIÊN ĐOÀN 11 CỘT (REFEREE LEDGER)
// ==============================================================================
export function renderTournamentsTable(acts) {
  if (!acts.length) {
    return `
      <div class="p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">search_off</span>
        <p class="font-sport font-bold text-base text-slate-700 dark:text-slate-300 uppercase tracking-wide">KHÔNG TÌM THẤY GIẢI ĐẤU NÀO</p>
        <p class="text-xs text-slate-400 mt-1">Hãy thử xóa từ khóa tìm kiếm hoặc chọn "Tất cả môn" / "Tất cả năm".</p>
      </div>
    `;
  }

  const totalTableVdv = acts.reduce((acc, a) => acc + (parseInt(a.participants) || 0), 0);
  const totalGold = acts.reduce((acc, a) => acc + (parseInt(a.goldMedals) || 0), 0);
  const totalSilver = acts.reduce((acc, a) => acc + (parseInt(a.silverMedals) || 0), 0);
  const totalBronze = acts.reduce((acc, a) => acc + (parseInt(a.bronzeMedals) || 0), 0);
  const totalReported = acts.filter(a => getActivityReportStatus(a).isReported).length;

  return `
    <div class="overflow-x-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs w-full">
      <table class="referee-table w-full text-left text-sm border-collapse" style="table-layout: fixed; min-width: 1100px;">
        <colgroup>
          <col style="width: 5%;">
          <col style="width: 7%;">
          <col style="width: 27%;">
          <col style="width: 12%;">
          <col style="width: 12%;">
          <col style="width: 10%;">
          <col style="width: 10%;">
          <col style="width: 7%;">
          <col style="width: 10%;">
          <col style="width: 9%;">
        </colgroup>
        <thead class="bg-slate-900 text-white select-none border-b border-slate-800">
          <tr>
            <th class="py-3 px-2 text-center">STT</th>
            <th class="py-3 px-2 text-center">MÃ SỐ</th>
            <th class="py-3 px-3 text-left">TÊN GIẢI THI ĐẤU</th>
            <th class="py-3 px-2 text-center">BÁO CÁO</th>
            <th class="py-3 px-2 text-center">BỘ MÔN</th>
            <th class="py-3 px-2 text-center">CẤP ĐỘ</th>
            <th class="py-3 px-2 text-center">NGÀY THI ĐẤU</th>
            <th class="py-3 px-2 text-center">VĐV</th>
            <th class="py-3 px-2 text-center">HUY CHƯƠNG</th>
            <th class="py-3 px-2 text-center sticky right-0 z-20 bg-slate-900 border-l border-slate-800">THAO TÁC</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
          ${acts.map((a, i) => {
            const rep = getActivityReportStatus(a);
            const badge = getSportBadge(a.sport);
            const isTop = i === 0;
            return `
              <tr class="hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors group">
                <!-- 1. STT -->
                <td class="py-3 px-2 text-center font-mono font-bold text-xs text-slate-400">
                  ${isTop ? `
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-700 text-white">#1 Mới</span>
                  ` : (i + 1)}
                </td>

                <!-- 2. Mã giải -->
                <td class="py-3 px-2 text-center font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                  <span class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    ${a.code}
                  </span>
                </td>

                <!-- 3. Tên giải đấu -->
                <td class="py-3 px-3">
                  <div onclick="openActivityModal('${a.id}')" class="font-bold text-sm text-slate-900 dark:text-white leading-snug hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors" title="Bấm để xem và sửa chi tiết">
                    ${a.title}
                  </div>
                  ${a.achievementNote ? `
                    <div class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10.5px] font-sport font-bold badge-gold">
                      <span>🏆</span>
                      <span class="truncate">${a.achievementNote}</span>
                    </div>
                  ` : ''}
                </td>

                <!-- 4. Trạng thái BC -->
                <td class="py-3 px-2 text-center">
                  ${rep.isReported ? `
                    <button type="button" onclick="toggleActivityReportStatus('${a.id}', event)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sport font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 btn-press" title="Bấm để đổi trạng thái">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>ĐÃ BÁO CÁO (${rep.reportCode})</span>
                    </button>
                  ` : `
                    <button type="button" onclick="toggleActivityReportStatus('${a.id}', event)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sport font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 btn-press" title="Bấm để đánh dấu đã nộp">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>CHỜ BÁO CÁO</span>
                    </button>
                  `}
                </td>

                <!-- 5. Bộ môn -->
                <td class="py-3 px-2 text-center">
                  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-sport font-bold ${badge.bg} ${badge.text} border ${badge.border} shadow-2xs">
                    <span class="material-symbols-outlined text-[15px]">${badge.icon}</span>
                    <span>${a.sport || 'Bóng đá'}</span>
                  </span>
                </td>

                <!-- 6. Cấp độ -->
                <td class="py-3 px-2 text-center font-sport font-bold text-xs text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  ${a.category || 'Cấp phường'}
                </td>

                <!-- 7. Ngày thi đấu -->
                <td class="py-3 px-2 text-center font-mono font-bold text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  ${a.date}
                </td>

                <!-- 8. VĐV -->
                <td class="py-3 px-2 text-center font-mono font-bold text-sm text-slate-900 dark:text-white tabular-nums">
                  ${a.participants}
                </td>

                <!-- 9. Huy chương Olympic -->
                <td class="py-3 px-2 text-center font-mono text-xs font-semibold whitespace-nowrap">
                  <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <span class="inline-flex items-center gap-0.5 text-amber-600 font-bold" title="Huy chương Vàng">
                      <span>🥇</span><span>${a.goldMedals || 0}</span>
                    </span>
                    <span class="text-slate-300 dark:text-slate-600">|</span>
                    <span class="inline-flex items-center gap-0.5 text-slate-500 font-bold" title="Huy chương Bạc">
                      <span>🥈</span><span>${a.silverMedals || 0}</span>
                    </span>
                    <span class="text-slate-300 dark:text-slate-600">|</span>
                    <span class="inline-flex items-center gap-0.5 text-amber-700 dark:text-amber-500 font-bold" title="Huy chương Đồng">
                      <span>🥉</span><span>${a.bronzeMedals || 0}</span>
                    </span>
                  </div>
                </td>

                <!-- 10. Thao tác -->
                <td class="py-3 px-2 text-center sticky right-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 border-l border-slate-200 dark:border-slate-800">
                  <div class="flex items-center justify-center gap-1">
                    <button onclick="window.openQrShareModal('${(a.title || '').replace(/'/g, "\\'")}', window.location.href)" title="Chia sẻ mã QR giải đấu" class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-emerald-700 transition-colors btn-press cursor-pointer">
                      <span class="material-symbols-outlined text-[17px]">qr_code_2</span>
                    </button>
                    <button onclick="openActivityModal('${a.id}')" title="Sửa" class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-emerald-700 transition-colors btn-press cursor-pointer">
                      <span class="material-symbols-outlined text-[17px]">edit</span>
                    </button>
                    <button onclick="confirmDeleteActivity('${a.id}')" title="Xóa" class="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors btn-press cursor-pointer">
                      <span class="material-symbols-outlined text-[17px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>

        <!-- Footer Bảng Phân Tách Cột Sắc Nét -->
        <tfoot class="bg-slate-100 dark:bg-slate-800 font-semibold text-xs text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700 uppercase tracking-wide">
          <tr>
            <td colspan="3" class="py-3 px-3 text-left border-r border-slate-300 dark:border-slate-700">
              Tổng số: <span class="font-mono text-sm text-emerald-700 dark:text-emerald-400 font-bold ml-1">${acts.length}</span> giải đấu
            </td>
            <td colspan="4" class="py-3 px-2 text-center text-slate-600 dark:text-slate-300 border-r border-slate-300 dark:border-slate-700">
              <span class="text-emerald-700 dark:text-emerald-400 font-semibold">${totalReported} đã báo cáo</span> • <span class="text-amber-700 font-semibold">${acts.length - totalReported} chờ báo cáo</span>
            </td>
            <td class="py-3 px-2 text-center font-mono text-sm text-emerald-700 dark:text-emerald-400 font-bold border-r border-slate-300 dark:border-slate-700 bg-emerald-50/70 dark:bg-emerald-950/40 tabular-nums">
              ${totalTableVdv.toLocaleString('vi-VN')}
            </td>
            <td class="py-3 px-2 text-center font-mono text-xs border-r border-slate-300 dark:border-slate-700 bg-amber-50/60 dark:bg-amber-950/30 whitespace-nowrap">
              <div class="inline-flex items-center gap-1.5 font-bold">
                <span class="text-amber-600 font-bold">🥇${totalGold}</span>
                <span class="text-slate-300 dark:text-slate-600">|</span>
                <span class="text-slate-500 font-bold">🥈${totalSilver}</span>
                <span class="text-slate-300 dark:text-slate-600">|</span>
                <span class="text-amber-700 dark:text-amber-500 font-bold">🥉${totalBronze}</span>
              </div>
            </td>
            <td class="py-3 px-2 sticky right-0 z-10 bg-slate-100 dark:bg-slate-800"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

// ==============================================================================
// 2. THẺ THI ĐẤU THỂ THAO MATCH PASS CARDS
// ==============================================================================
export function renderTournamentsGrid(acts) {
  if (!acts.length) {
    return `
      <div class="p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <p class="font-sport font-bold text-base text-slate-400 uppercase">Không tìm thấy giải đấu phù hợp</p>
      </div>
    `;
  }

  const isCrimson = state.colorTheme === 'crimson';
  const isCarbon = state.colorTheme === 'carbon';

  // Bản 2 (Crimson): 2 Cột Khổ Lớn Mega Arena; Bản 1 & 3: 3 Cột Cân Đối
  const gridCls = isCrimson ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  return `
    <div class="${gridCls}">
      ${acts.map((a, i) => {
        const badge = getSportBadge(a.sport);
        const rep = getActivityReportStatus(a);

        // Styling chuẩn Bản 4: Sổ bộ Hành chính Titanium (Trang nhã, Viền Emerald, Dịu mắt)
        let cardBorderCls = 'luxury-card border-l-4 border-l-emerald-600 shadow-sm hover:shadow-md transition-shadow';
        let titleCls = 'text-base font-semibold text-slate-900 dark:text-white leading-snug';

        return `
          <div class="${cardBorderCls} p-5 rounded-xl flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <div class="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                <span class="px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 ${badge.bg} ${badge.text} border ${badge.border}">
                  <span class="material-symbols-outlined text-[15px]">${badge.icon}</span>
                  <span>${badge.label}</span>
                </span>
                <span class="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">${a.code}</span>
              </div>

              <h3 
                onclick="openActivityModal('${a.id}')"
                class="${titleCls} mt-3 cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                title="Bấm để xem và sửa chi tiết"
              >
                ${a.title}
              </h3>

              ${a.achievementNote ? `
                <div class="mt-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800/60 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs">
                  <span class="text-sm">🏆</span>
                  <span class="truncate">${a.achievementNote}</span>
                </div>
              ` : ''}

              <div class="mt-3.5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal">
                <div class="flex justify-between items-center">
                  <span>Ngày thi đấu:</span>
                  <strong class="text-slate-900 dark:text-white font-mono text-xs sm:text-sm font-semibold">${a.date}</strong>
                </div>
                <div class="flex justify-between items-center">
                  <span>VĐV tham gia:</span>
                  <strong class="text-slate-900 dark:text-white font-mono text-xs sm:text-sm font-semibold">${a.participants} ${a.participantsUnit || 'VĐV'}</strong>
                </div>
                <div class="flex justify-between items-center">
                  <span>Kinh phí giải:</span>
                  <strong class="text-emerald-700 dark:text-emerald-400 font-mono text-xs sm:text-sm font-semibold">${formatVNCurrency(a.budgetTotal || 0)}</strong>
                </div>
              </div>

              <!-- Huy chương To Rõ Gọn Gàng -->
              <div class="mt-3.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-around font-mono shadow-xs">
                <div class="text-center flex items-center gap-1.5">
                  <span class="text-base">🥇</span>
                  <div>
                    <span class="text-[10px] text-amber-600 dark:text-amber-400 block leading-none font-medium">VÀNG</span>
                    <span class="text-base text-slate-900 dark:text-white font-bold">${a.goldMedals || 0}</span>
                  </div>
                </div>
                <div class="w-px h-5 bg-slate-200 dark:bg-slate-700"></div>
                <div class="text-center flex items-center gap-1.5">
                  <span class="text-base">🥈</span>
                  <div>
                    <span class="text-[10px] text-slate-500 dark:text-slate-400 block leading-none font-medium">BẠC</span>
                    <span class="text-base text-slate-900 dark:text-white font-bold">${a.silverMedals || 0}</span>
                  </div>
                </div>
                <div class="w-px h-5 bg-slate-200 dark:bg-slate-700"></div>
                <div class="text-center flex items-center gap-1.5">
                  <span class="text-base">🥉</span>
                  <div>
                    <span class="text-[10px] text-amber-700 dark:text-amber-500 block leading-none font-medium">ĐỒNG</span>
                    <span class="text-base text-slate-900 dark:text-white font-bold">${a.bronzeMedals || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-3.5 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span class="text-xs font-medium tracking-wide ${rep.isReported ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}">
                ● ${rep.isReported ? 'Đã lập báo cáo' : 'Chờ lập báo cáo'}
              </span>

              <div class="flex items-center gap-1">
                <button onclick="window.openQrShareModal('${(a.title || '').replace(/'/g, "\\'")}', window.location.href)" class="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors btn-press cursor-pointer" title="Chia sẻ mã QR giải đấu">
                  <span class="material-symbols-outlined text-[19px]">qr_code_2</span>
                </button>
                <button onclick="openActivityModal('${a.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors btn-press cursor-pointer" title="Chỉnh sửa giải đấu">
                  <span class="material-symbols-outlined text-[19px]">edit</span>
                </button>
                <button onclick="confirmDeleteActivity('${a.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors btn-press cursor-pointer" title="Xóa giải đấu">
                  <span class="material-symbols-outlined text-[19px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ==============================================================================
// 3. KANBAN BOARD TIẾN ĐỘ THI ĐẤU PRO
// ==============================================================================
export function renderTournamentsKanban(acts) {
  if (!acts.length) {
    return `<div class="p-12 text-center text-slate-400 font-sport font-bold">KHÔNG CÓ DỮ LIỆU</div>`;
  }

  const colPlan = acts.filter(a => a.category === 'Cấp phường' && !getActivityReportStatus(a).isReported);
  const colDone = acts.filter(a => a.category === 'Cấp phường' && getActivityReportStatus(a).isReported);
  const colCity = acts.filter(a => a.category === 'Cấp thành phố');
  const colMedal = acts.filter(a => (parseInt(a.totalMedals) > 0 || a.achievementNote));

  const columns = [
    { title: 'CẤP PHƯỜNG (CHỜ BÁO CÁO)', color: 'border-amber-500 text-amber-600', count: colPlan.length, items: colPlan },
    { title: 'CẤP PHƯỜNG (HOÀN TẤT BÁO CÁO)', color: 'border-emerald-500 text-emerald-600', count: colDone.length, items: colDone },
    { title: 'CẤP THÀNH PHỐ (ĐOÀN VĐV)', color: 'border-blue-500 text-blue-600', count: colCity.length, items: colCity },
    { title: 'GIẢI ĐẠT HUY CHƯƠNG & CÚP', color: 'border-orange-500 text-orange-500', count: colMedal.length, items: colMedal }
  ];

  return `
    <div class="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[600px]">
      ${columns.map(col => `
        <div class="w-[300px] shrink-0 bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-2.5">
          <!-- Column Header with Top Accent -->
          <div class="border-t-2 ${col.color.split(' ')[0]} pt-2 flex items-center justify-between">
            <span class="font-semibold text-xs tracking-wide ${col.color.split(' ')[1]} uppercase">${col.title}</span>
            <span class="font-mono font-bold text-xs px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              ${col.count}
            </span>
          </div>

          <div class="space-y-2 overflow-y-auto max-h-[70vh] pr-1">
            ${col.items.map(a => {
              const badge = getSportBadge(a.sport);
              return `
                <div class="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-2xs space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="px-2 py-0.2 rounded text-[9px] font-sport font-bold ${badge.bg} ${badge.text}">${badge.label}</span>
                    <span class="font-mono text-[10px] text-slate-400 font-bold">${a.code}</span>
                  </div>
                  <h4 onclick="openActivityModal('${a.id}')" class="font-bold text-xs text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 leading-snug">
                    ${a.title}
                  </h4>
                  <div class="text-xs text-slate-500 flex justify-between font-mono pt-1 border-t border-slate-100 dark:border-slate-700">
                    <span>${a.date}</span>
                    <span>${a.participants} VĐV</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
