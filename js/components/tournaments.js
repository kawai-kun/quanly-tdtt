// ==============================================================================
// COMPONENT: QUẢN LÝ GIẢI ĐẤU (TOURNAMENTS) - MULTI-VIEW PRO
// Hỗ trợ 3 chế độ xem: Bảng dữ liệu 11 cột, Kanban Board tiến độ, Thẻ Thể thao Poster
// ==============================================================================

import { state, getActivityReportStatus, toggleActivityReportStatus } from '../state.js';
import { getSportBadge } from '../utils/sportBadges.js';
import { getAvailableYears, sortActivitiesByLatest, extractYearFromDate, formatVNCurrency } from '../utils/formatters.js';
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
      
      <!-- Top Action Bar & Statistics -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Quản Lý Giải Thi Đấu & Sự Kiện TDTT
            </h1>
            <span class="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              30 GIẢI THỰC TẾ
            </span>
          </div>
          <p id="tournaments_counts_display" class="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
            ${getTournamentsCountsHtml(acts)}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="pullFromGoogleSheet(false)" class="px-3.5 py-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer btn-press shrink-0" title="Đồng bộ tức thì từ Google Drive & Telegram">
            <span class="material-symbols-outlined text-[17px]">sync</span>
            <span>Đồng bộ</span>
          </button>
          <button onclick="openActivityModal()" class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer btn-press shrink-0" title="Thêm giải đấu mới (Phím tắt: N)">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Thêm giải đấu</span>
            <kbd class="hidden sm:inline text-[10px] bg-emerald-800 px-1.5 py-0.5 rounded text-emerald-100 font-mono">N</kbd>
          </button>
        </div>
      </div>

      <!-- Unified Toolbar & Multi-View Switcher -->
      <div class="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        
        <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <!-- Realtime Search Input -->
          <div class="relative flex-1 min-w-[220px] h-9">
            <span class="material-symbols-outlined text-[17px] text-slate-400 absolute left-2.5 top-2 pointer-events-none">search</span>
            <input 
              id="tournament_search_input" 
              type="text" 
              value="${f.search || ''}" 
              oninput="handleTournamentSearchInput(this.value)" 
              placeholder="Tìm theo tên giải, mã số, môn, địa điểm... (Nhấn /)" 
              class="w-full h-full pl-8 pr-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors" 
            />
          </div>

          <!-- Year Filter -->
          <div class="h-9 flex items-center gap-1 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
            <select onchange="setGlobalYear(this.value)" class="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer">
              <option value="all" ${state.selectedYear === 'all' ? 'selected' : ''}>Tất cả năm</option>
              ${availableYears.map(y => `<option value="${y}" ${String(state.selectedYear) === String(y) ? 'selected' : ''}>Năm ${y}</option>`).join('')}
            </select>
          </div>

          <!-- Sport Filter -->
          <div class="h-9 flex items-center gap-1 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
            <select onchange="setTournamentsFilter('sport', this.value)" class="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer">
              <option value="all">Tất cả môn</option>
              ${sportList.map(s => `<option value="${s}" ${f.sport === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>

          <!-- Category Filter -->
          <div class="h-9 flex items-center gap-1 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
            <select onchange="setTournamentsFilter('category', this.value)" class="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer">
              <option value="all">Tất cả cấp độ</option>
              <option value="Cấp phường" ${f.category === 'Cấp phường' ? 'selected' : ''}>Cấp phường</option>
              <option value="Cấp thành phố" ${f.category === 'Cấp thành phố' ? 'selected' : ''}>Cấp thành phố</option>
              <option value="Hành chính" ${f.category === 'Hành chính' ? 'selected' : ''}>Hành chính</option>
            </select>
          </div>

          <!-- Report Status Filter -->
          <div class="h-9 flex items-center gap-1 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
            <select onchange="setTournamentsFilter('reportStatus', this.value)" class="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer">
              <option value="all" ${f.reportStatus === 'all' ? 'selected' : ''}>Tất cả trạng thái</option>
              <option value="unreported" ${f.reportStatus === 'unreported' ? 'selected' : ''}>○ Chưa báo cáo</option>
              <option value="reported" ${f.reportStatus === 'reported' ? 'selected' : ''}>● Đã báo cáo</option>
            </select>
          </div>
        </div>

        <!-- Triple View Switcher: Table vs Kanban vs Poster Cards -->
        <div class="h-9 flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button 
            onclick="toggleTournamentsView('table')" 
            class="h-7 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${f.viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}" 
            title="Xem dạng Bảng dữ liệu 11 cột chuẩn"
          >
            <span class="material-symbols-outlined text-[16px]">table_rows</span>
            <span class="hidden sm:inline">Bảng số liệu</span>
          </button>

          <button 
            onclick="toggleTournamentsView('kanban')" 
            class="h-7 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${f.viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}" 
            title="Xem dạng Kanban Board tiến độ"
          >
            <span class="material-symbols-outlined text-[16px]">view_kanban</span>
            <span class="hidden sm:inline">Kanban</span>
          </button>

          <button 
            onclick="toggleTournamentsView('cards')" 
            class="h-7 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${f.viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}" 
            title="Xem dạng Thẻ thể thao Athletic Poster"
          >
            <span class="material-symbols-outlined text-[16px]">grid_view</span>
            <span class="hidden sm:inline">Thẻ thể thao</span>
          </button>
        </div>
      </div>

      <!-- Live Dynamic Container -->
      <div id="tournaments_data_container">
        ${renderActiveTournamentsView(acts)}
      </div>

    </div>
  `;
}

function renderActiveTournamentsView(acts) {
  const mode = state.tournamentsFilter.viewMode || 'table';
  if (mode === 'kanban') return renderTournamentsKanban(acts);
  if (mode === 'cards') return renderTournamentsGrid(acts);
  return renderTournamentsTable(acts);
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
    if (shouldAnimate) {
      initTournamentsAnimations();
    }
  }
  if (counterEl) {
    counterEl.innerHTML = getTournamentsCountsHtml(acts);
  }
}

export function initTournamentsAnimations() {
  try {
    const mode = state.tournamentsFilter.viewMode || 'table';
    if (mode === 'cards') {
      animateStagger('#tournaments_data_container .grid > div', { delayStep: 25, duration: 280 });
    } else if (mode === 'kanban') {
      animateStagger('#tournaments_data_container .kanban-card', { delayStep: 15, duration: 250 });
    } else {
      animateStagger('#tournaments_data_container table tbody tr', { delayStep: 15, duration: 220 });
    }
  } catch (err) {
    console.warn('Tournaments animation error:', err);
  }
}

export function setTournamentsFilter(key, val) {
  state.tournamentsFilter[key] = val;
  updateTournamentsOnly(false);
}

export function toggleTournamentsView(mode) {
  state.tournamentsFilter.viewMode = mode;
  // Cập nhật lại toàn bộ giao diện hoặc toolbar để nút active sáng đúng
  const container = document.getElementById('tournaments_data_container');
  if (container) {
    updateTournamentsOnly(true);
    // Cập nhật style của 3 nút bấm
    const toolbar = container.previousElementSibling;
    if (toolbar) {
      const parent = document.getElementById('appContainer');
      if (parent) window.renderApp();
    }
  } else {
    window.renderApp();
  }
}

// ==============================================================================
// VIEW 1: KANBAN BOARD TIẾN ĐỘ THI ĐẤU (WORKSPACE PRO)
// ==============================================================================
export function renderTournamentsKanban(acts) {
  if (!acts.length) {
    return `
      <div class="p-10 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <span class="material-symbols-outlined text-3xl text-slate-400 mb-2">search_off</span>
        <p class="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy giải đấu phù hợp</p>
      </div>
    `;
  }

  // Phân loại vào 4 cột Kanban:
  // 1. Cấp Phường - Đang triển khai/Chưa BC
  // 2. Cấp Phường - Đã hoàn tất báo cáo
  // 3. Cấp Thành phố - Thi đấu tranh tài
  // 4. Giải Trọng điểm / Đạt thành tích Huy chương
  const colPlan = acts.filter(a => a.category === 'Cấp phường' && !getActivityReportStatus(a).isReported);
  const colDonePhuong = acts.filter(a => a.category === 'Cấp phường' && getActivityReportStatus(a).isReported);
  const colCity = acts.filter(a => a.category === 'Cấp thành phố');
  const colMedal = acts.filter(a => (parseInt(a.totalMedals) > 0 || a.achievementNote));

  const columns = [
    { title: 'Cấp Phường (Chờ báo cáo)', icon: 'pending_actions', color: 'text-amber-600 dark:text-amber-400', count: colPlan.length, items: colPlan },
    { title: 'Cấp Phường (Đã hoàn thành)', icon: 'task_alt', color: 'text-emerald-600 dark:text-emerald-400', count: colDonePhuong.length, items: colDonePhuong },
    { title: 'Cấp Thành Phố (Đoàn VĐV)', icon: 'location_city', color: 'text-blue-600 dark:text-blue-400', count: colCity.length, items: colCity },
    { title: 'Giải Đạt Thành Tích & HC', icon: 'military_tech', color: 'text-orange-500', count: colMedal.length, items: colMedal }
  ];

  return `
    <div class="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[600px]">
      ${columns.map(col => `
        <div class="kanban-col p-3 flex flex-col gap-2.5 shrink-0">
          
          <!-- Column Header -->
          <div class="flex items-center justify-between px-1 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] ${col.color}">${col.icon}</span>
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200">${col.title}</span>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              ${col.count}
            </span>
          </div>

          <!-- Cards List -->
          <div class="space-y-2.5 overflow-y-auto max-h-[70vh] pr-1">
            ${col.items.length === 0 ? `
              <div class="p-6 text-center text-slate-400 text-xs italic">
                Chưa có giải đấu nào trong nhóm này
              </div>
            ` : col.items.map(a => {
              const badge = getSportBadge(a.sport);
              const rep = getActivityReportStatus(a);
              return `
                <div class="kanban-card p-3 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="px-2 py-0.2 rounded text-[10px] font-bold ${badge.bg} ${badge.text}">
                      ${badge.label}
                    </span>
                    <span class="font-mono text-[10px] font-bold text-slate-400">${a.code}</span>
                  </div>

                  <h4 
                    onclick="openActivityModal('${a.id}')"
                    class="text-xs font-bold text-slate-900 dark:text-white leading-snug cursor-pointer hover:text-emerald-600 transition-colors"
                  >
                    ${a.title}
                  </h4>

                  ${a.achievementNote ? `
                    <div class="badge-gold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                      <span>🏆</span>
                      <span class="truncate">${a.achievementNote}</span>
                    </div>
                  ` : ''}

                  <div class="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div class="flex justify-between">
                      <span>Ngày: <strong class="font-mono text-slate-700 dark:text-slate-300">${a.date}</strong></span>
                      <span>VĐV: <strong class="font-mono text-slate-700 dark:text-slate-300">${a.participants}</strong></span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between pt-1">
                    <button 
                      type="button" 
                      onclick="toggleActivityReportStatus('${a.id}', event)" 
                      class="px-2 py-0.5 rounded text-[10px] font-bold ${rep.isReported ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'} border ${rep.isReported ? 'border-emerald-200 dark:border-emerald-800' : 'border-amber-200 dark:border-amber-800'}"
                    >
                      ${rep.isReported ? 'Đã BC' : 'Chưa BC'}
                    </button>

                    <div class="flex items-center gap-1">
                      <button onclick="openActivityModal('${a.id}')" class="p-1 rounded text-slate-400 hover:text-emerald-600">
                        <span class="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                    </div>
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

// ==============================================================================
// VIEW 2: THẺ THỂ THAO ATHLETIC PRO (POSTER MATCH CARDS)
// ==============================================================================
export function renderTournamentsGrid(acts) {
  if (!acts.length) {
    return `
      <div class="p-10 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <span class="material-symbols-outlined text-3xl text-slate-400 mb-2">search_off</span>
        <p class="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy giải đấu phù hợp</p>
        <p class="text-xs text-slate-400 mt-1">Hãy thử tìm từ khóa khác hoặc xóa bộ lọc.</p>
      </div>
    `;
  }

  return `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      ${acts.map((a, i) => {
        const badge = getSportBadge(a.sport);
        const repStatus = getActivityReportStatus(a);
        return `
          <div class="match-poster-card p-4 sm:p-5 flex flex-col justify-between">
            ${i === 0 ? `
              <div class="absolute top-0 right-0 bg-emerald-700 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-bl-xl shadow-xs">
                MỚI NHẤT
              </div>
            ` : ''}

            <div>
              <!-- Header Card: Sport badge + Code -->
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${badge.bg} ${badge.text} flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px]">${badge.icon}</span>
                  <span>${badge.label}</span>
                </span>
                <span class="font-mono text-xs font-bold text-slate-400 ${i === 0 ? 'mr-14' : ''}">${a.code}</span>
              </div>

              <!-- Title -->
              <h3 
                onclick="openActivityModal('${a.id}')"
                class="text-sm font-black text-slate-900 dark:text-white mt-3 leading-snug cursor-pointer hover:text-emerald-600 transition-colors"
              >
                ${a.title}
              </h3>

              <!-- Achievement Note -->
              ${a.achievementNote ? `
                <div class="mt-2.5 badge-gold px-2.5 py-1 rounded-xl text-[11px] flex items-center gap-1.5 font-bold">
                  <span class="material-symbols-outlined text-[15px] shrink-0">military_tech</span>
                  <span class="truncate">${a.achievementNote}</span>
                </div>
              ` : ''}

              <!-- Status Pill -->
              <div class="mt-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                <span class="text-[10px] font-semibold text-slate-400">Trạng thái báo cáo:</span>
                ${repStatus.isReported ? `
                  <button type="button" onclick="toggleActivityReportStatus('${a.id}', event)" class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 inline-flex items-center gap-1 btn-press">
                    <span class="material-symbols-outlined text-[12px] text-emerald-600">check_circle</span>
                    <span>Đã BC (${repStatus.reportCode})</span>
                  </button>
                ` : `
                  <button type="button" onclick="toggleActivityReportStatus('${a.id}', event)" class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 inline-flex items-center gap-1 btn-press">
                    <span class="material-symbols-outlined text-[12px] text-amber-600">pending</span>
                    <span>Chưa lập BC</span>
                  </button>
                `}
              </div>

              <!-- Details Grid -->
              <div class="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">calendar_today</span>Ngày tổ chức:</span>
                  <span class="font-bold font-mono text-emerald-700 dark:text-emerald-400">${a.date}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">groups</span>Số VĐV:</span>
                  <b class="text-slate-900 dark:text-slate-100 font-mono">${a.participants} ${a.participantsUnit || 'VĐV'}</b>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">payments</span>Kinh phí:</span>
                  <b class="text-slate-900 dark:text-slate-100 font-mono">${formatVNCurrency(a.budgetTotal || 0)}</b>
                </div>
              </div>

              <!-- Medals Breakdown -->
              <div class="mt-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-around text-xs font-bold font-mono">
                <div class="text-center"><span class="text-[9px] text-amber-600 block">VÀNG</span><b>${a.goldMedals || 0}</b></div>
                <div class="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
                <div class="text-center"><span class="text-[9px] text-slate-400 block">BẠC</span><b>${a.silverMedals || 0}</b></div>
                <div class="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
                <div class="text-center"><span class="text-[9px] text-orange-600 block">ĐỒNG</span><b>${a.bronzeMedals || 0}</b></div>
                <div class="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
                <div class="text-center"><span class="text-[9px] text-emerald-600 block">TỔNG</span><b class="text-emerald-600">${a.totalMedals || 0}</b></div>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span class="text-xs text-slate-500 font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px] text-emerald-600">flag</span>
                <span>${a.category || 'Cấp phường'}</span>
              </span>
              <div class="flex items-center gap-1">
                <button onclick="openActivityModal('${a.id}')" title="Sửa" class="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800 btn-press">
                  <span class="material-symbols-outlined text-[17px]">edit</span>
                </button>
                <button onclick="confirmDeleteActivity('${a.id}')" title="Xóa" class="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 btn-press">
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

// ==============================================================================
// VIEW 3: BẢNG DỮ LIỆU CỐ ĐỊNH 11 CỘT (DATA GRID PRO - 100% FULL-WIDTH)
// ==============================================================================
export function renderTournamentsTable(acts) {
  if (!acts.length) {
    return `
      <div class="p-10 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <span class="material-symbols-outlined text-3xl text-slate-400 mb-2">search_off</span>
        <p class="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy giải đấu phù hợp</p>
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
    <div class="overflow-x-auto -webkit-overflow-scrolling-touch rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs w-full">
      <table class="w-full text-left text-sm border-collapse" style="table-layout: fixed; min-width: 1100px;">
        <colgroup>
          <col style="width: 5%;">
          <col style="width: 6%;">
          <col style="width: 27%;">
          <col style="width: 13%;">
          <col style="width: 13%;">
          <col style="width: 10%;">
          <col style="width: 10%;">
          <col style="width: 7%;">
          <col style="width: 10%;">
          <col style="width: 9%;">
        </colgroup>
        <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700/80 uppercase text-[11px] tracking-wider select-none">
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
                <!-- 1. STT -->
                <td class="py-3 px-2 align-middle whitespace-nowrap text-center font-mono">
                  ${isTop ? `
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 inline-block">
                      #1 Mới
                    </span>
                  ` : `
                    <span class="text-slate-400 dark:text-slate-500 font-semibold text-xs">${i + 1}</span>
                  `}
                </td>

                <!-- 2. Mã giải -->
                <td class="py-3 px-2 align-middle whitespace-nowrap text-center">
                  <span class="font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    ${a.code}
                  </span>
                </td>

                <!-- 3. Tên giải đấu -->
                <td class="py-3 px-3 align-middle">
                  <div onclick="openActivityModal('${a.id}')" class="font-bold text-[13.5px] text-slate-900 dark:text-white leading-snug whitespace-normal break-words hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer transition-colors" title="Bấm để xem và sửa chi tiết">
                    ${a.title}
                  </div>
                  ${a.achievementNote ? `
                    <div class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <span class="material-symbols-outlined text-[13px] text-amber-600 shrink-0">military_tech</span>
                      <span class="break-words">${a.achievementNote}</span>
                    </div>
                  ` : ''}
                </td>

                <!-- 4. Trạng thái BC -->
                <td class="py-3 px-2 align-middle whitespace-nowrap text-center">
                  ${rep.isReported ? `
                    <button type="button" onclick="toggleActivityReportStatus('${a.id}', event)" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors btn-press" title="Bấm để chuyển sang Chưa báo cáo">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>Đã BC (${rep.reportCode})</span>
                    </button>
                  ` : `
                    <button type="button" onclick="toggleActivityReportStatus('${a.id}', event)" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors btn-press" title="Bấm để đánh dấu Đã báo cáo">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>Chưa BC</span>
                    </button>
                  `}
                </td>

                <!-- 5. Bộ môn -->
                <td class="py-3 px-2 align-middle whitespace-nowrap text-center">
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${badge.bg} ${badge.text} border ${badge.border}">
                    <span class="material-symbols-outlined text-[13px] shrink-0">${badge.icon}</span>
                    <span>${a.sport || 'Bóng đá'}</span>
                  </span>
                </td>

                <!-- 6. Cấp độ -->
                <td class="py-3 px-2 align-middle whitespace-nowrap text-center">
                  <span class="px-2 py-0.5 rounded-md text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold">
                    ${a.category || 'Cấp phường'}
                  </span>
                </td>

                <!-- 7. Ngày tổ chức -->
                <td class="py-3 px-2 align-middle whitespace-nowrap text-center font-mono font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  ${a.date}
                </td>

                <!-- 8. VĐV -->
                <td class="py-3 px-2 align-middle whitespace-nowrap text-center font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-mono">
                  ${a.participants} <span class="text-[10px] text-slate-500 font-sans font-normal">${a.participantsUnit || 'VĐV'}</span>
                </td>

                <!-- 9. Huy chương -->
                <td class="py-3 px-2 align-middle whitespace-nowrap text-center font-mono text-xs sm:text-sm font-bold">
                  <span class="text-amber-600">${a.goldMedals || 0}V</span> - 
                  <span class="text-slate-400">${a.silverMedals || 0}B</span> - 
                  <span class="text-amber-700">${a.bronzeMedals || 0}Đ</span>
                </td>

                <!-- 10. Thao tác (Ghim mép phải) -->
                <td class="py-3 px-2 align-middle whitespace-nowrap text-center sticky right-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 border-l border-slate-200/80 dark:border-slate-800 shadow-[-3px_0_6px_rgba(0,0,0,0.04)]">
                  <div class="flex items-center justify-center gap-1">
                    <button onclick="openActivityModal('${a.id}')" title="Sửa thông tin" class="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-700 btn-press transition-colors">
                      <span class="material-symbols-outlined text-[17px]">edit</span>
                    </button>
                    <button onclick="confirmDeleteActivity('${a.id}')" title="Xóa giải đấu" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 btn-press transition-colors">
                      <span class="material-symbols-outlined text-[17px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
        
        <!-- Table Footer -->
        <tfoot class="bg-slate-50 dark:bg-slate-800/80 border-t-2 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
          <tr>
            <td colspan="3" class="py-3 px-3 text-left font-bold text-slate-900 dark:text-white">
              TỔNG CỘNG: <span class="font-mono text-emerald-700 dark:text-emerald-400 font-black">${acts.length}</span> GIẢI ĐẤU
            </td>
            <td colspan="4" class="py-3 px-2 text-center text-slate-500 dark:text-slate-400 text-[11.5px] font-normal">
              <span class="text-emerald-700 dark:text-emerald-400 font-bold">${totalReported} đã báo cáo</span> • <span class="text-amber-700 dark:text-amber-400 font-bold">${acts.length - totalReported} chưa báo cáo</span>
            </td>
            <td class="py-3 px-2 text-center font-mono font-black text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
              ${totalTableVdv.toLocaleString('vi-VN')}
            </td>
            <td class="py-3 px-2 text-center font-mono text-xs sm:text-sm">
              <span class="text-amber-600 font-bold">${totalGold}V</span> - <span class="text-slate-400 font-bold">${totalSilver}B</span> - <span class="text-amber-700 font-bold">${totalBronze}Đ</span>
            </td>
            <td class="py-3 px-2 sticky right-0 z-10 bg-slate-50 dark:bg-slate-800 border-l border-slate-200/80 dark:border-slate-700"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}
