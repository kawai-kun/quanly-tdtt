// ==============================================================================
// COMPONENT: DASHBOARD & THỐNG KÊ KPI THỂ THAO
// ==============================================================================

import { state, saveAll } from '../state.js';
import { formatVNCurrency, extractYearFromDate, extractQuarterFromDate, getAvailableYears, sortActivitiesByLatest } from '../utils/formatters.js';
import { showToast } from '../utils/toast.js';
import { getSportBadge } from '../utils/sportBadges.js';
import { animateCounter, animateProgressBar, animateStagger } from '../utils/animations.js';

    export function renderDashboard() {
      const availableYears = getAvailableYears();
      const rawActs = state.selectedYear === 'all'
        ? state.activities
        : state.activities.filter(a => String(a.year || extractYearFromDate(a.date)) === String(state.selectedYear));
      const filteredActs = sortActivitiesByLatest(rawActs);

      const totalActs = filteredActs.length;
      const totalParticipants = filteredActs.reduce((acc, a) => acc + (parseInt(a.participants) || 0), 0);
      const totalMedals = filteredActs.reduce((acc, a) => acc + (parseInt(a.totalMedals) || 0), 0);
      const totalBudget = filteredActs.reduce((acc, a) => acc + (parseInt(a.budgetTotal) || 0), 0);

      return `
        <div class="space-y-6 tab-pane-animate">
          
          <!-- Top Greeting & Action Bar (Fast Search & Year Filter) -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                Bảng Điều Khiển Tổng Quan
              </h1>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Theo dõi và đánh giá phong trào Thể dục Thể thao Phường Tân Khai
              </p>
            </div>

            <!-- Toolbar: Multi-Year Selector & Fast Search & Export -->
            <div class="flex flex-wrap items-center gap-2.5">
              
              <!-- Fast Search Input -->
              <div class="relative flex-1 sm:w-64">
                <span class="material-symbols-outlined text-[17px] text-slate-400 absolute left-3 top-2.5">search</span>
                <input type="text" oninput="handleDashboardSearch(this.value)" placeholder="Tìm kiếm giải đấu, CLB..." class="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-brand-500 shadow-sm text-slate-800 dark:text-slate-100" />
              </div>

              <!-- Multi-Year Dropdown -->
              <div class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-sm">
                <span class="material-symbols-outlined text-[16px] text-brand-700 dark:text-brand-400">event</span>
                <select onchange="setGlobalYear(this.value)" class="bg-transparent dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer">
                  <option class="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="all" ${state.selectedYear === 'all' ? 'selected' : ''}>Tất cả các năm</option>
                  ${availableYears.map(y => `<option class="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="${y}" ${String(state.selectedYear) === String(y) ? 'selected' : ''}>Năm ${y}</option>`).join('')}
                </select>
              </div>

              <!-- Quick Export Excel Button -->
              <button onclick="exportAllExcel()" class="px-3.5 py-2 glass-card border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all btn-press">
                <span class="material-symbols-outlined text-[16px]">file_download</span>
                <span class="hidden sm:inline">Xuất Excel</span>
              </button>
            </div>
          </div>

          <!-- 4 Stat Metric Cards (Human-Crafted Executive Metrics) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            <div class="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm card-lift">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng giải tổ chức</span>
                <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <span class="material-symbols-outlined text-[20px]">emoji_events</span>
                </div>
              </div>
              <p id="stat_total_acts" class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2.5 font-mono">${totalActs}</p>
              <div class="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mt-2">
                <span class="material-symbols-outlined text-[14px]">calendar_today</span>
                <span>${state.selectedYear === 'all' ? 'Toàn bộ kỳ hoạt động' : 'Kỳ năm ' + state.selectedYear}</span>
              </div>
            </div>

            <div class="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm card-lift">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Lượt VĐV tham gia</span>
                <div class="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                  <span class="material-symbols-outlined text-[20px]">groups</span>
                </div>
              </div>
              <p id="stat_total_parts" class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2.5 font-mono">${totalParticipants.toLocaleString('vi-VN')}</p>
              <div class="flex items-center gap-1.5 text-[11px] font-medium text-teal-700 dark:text-teal-400 mt-2">
                <span class="material-symbols-outlined text-[14px]">person_check</span>
                <span>Hội viên & VĐV quần chúng</span>
              </div>
            </div>

            <div class="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm card-lift">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Huy chương đạt được</span>
                <div class="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <span class="material-symbols-outlined text-[20px]">military_tech</span>
                </div>
              </div>
              <p id="stat_total_medals" class="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2.5 font-mono">${totalMedals}</p>
              <div class="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400 mt-2">
                <span class="material-symbols-outlined text-[14px]">workspace_premium</span>
                <span>Vàng, Bạc & Đồng</span>
              </div>
            </div>

            <div class="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm card-lift">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng kinh phí giải ngân</span>
                <div class="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                </div>
              </div>
              <p id="stat_total_budget" class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2.5 truncate font-mono">${(totalBudget / 1000000).toFixed(1)} tr đ</p>
              <div class="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-2">
                <span class="material-symbols-outlined text-[14px]">verified</span>
                <span>Hồ sơ quyết toán</span>
              </div>
            </div>
          </div>

          <!-- Tiến Độ Chỉ Tiêu Thi Đua Năm (Kế Hoạch vs Thực Hiện) -->
          ${renderKpiProgressCard(filteredActs, totalActs, totalParticipants, totalMedals)}

          <!-- Charts Row (Chart.js) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Cơ Cấu Bộ Môn Thể Thao</h3>
              <p class="text-[11px] text-slate-400 mb-3">Phân bổ giải đấu theo môn thi đấu</p>
              <div class="relative h-60 flex items-center justify-center">
                <canvas id="sportsDonutChart"></canvas>
              </div>
            </div>

            <div class="lg:col-span-2 p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Tiến Độ Hoạt Động & Lượng VĐV Tham Gia</h3>
              <p class="text-[11px] text-slate-400 mb-3">Số lượng người tham gia theo từng tháng</p>
              <div class="relative h-60">
                <canvas id="timelineBarChart"></canvas>
              </div>
            </div>
          </div>

          <!-- Recent Activities Quick Table -->
          <div class="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">Giải Đấu Gần Đây</h3>
                <p class="text-[11px] text-slate-400">Các hoạt động thể thao mới nhất của Trung tâm</p>
              </div>
              <button onclick="switchTab('quan-ly-giai-dau')" class="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1">
                <span>Xem toàn bộ 30 giải</span>
                <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>

            <div class="overflow-x-auto -webkit-overflow-scrolling-touch rounded-lg border border-slate-200 dark:border-slate-800">
              <table id="dashboard_recent_table" class="w-full text-left text-xs">
                <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 select-none">
                  <tr>
                    <th class="p-3 align-middle whitespace-nowrap w-16">Mã</th>
                    <th class="p-3 align-middle min-w-[220px]">Tên giải đấu</th>
                    <th class="p-3 align-middle whitespace-nowrap">Bộ môn</th>
                    <th class="p-3 align-middle whitespace-nowrap">Ngày</th>
                    <th class="p-3 align-middle whitespace-nowrap text-center">VĐV</th>
                    <th class="p-3 align-middle whitespace-nowrap text-center">Huy chương</th>
                    <th class="p-3 align-middle whitespace-nowrap text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  ${filteredActs.slice(0, 6).map(a => {
                    const badge = getSportBadge(a.sport);
                    return `
                      <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td class="p-3.5 align-middle whitespace-nowrap font-mono font-bold text-brand-700">${a.code}</td>
                        <td class="p-3.5 align-middle min-w-[220px] max-w-xs">
                          <div class="font-bold text-slate-900 dark:text-slate-100 truncate">${a.title}</div>
                          ${a.achievementNote ? `
                            <div class="inline-flex items-center gap-1 mt-0.5 text-[10px] text-amber-700 dark:text-amber-400 font-semibold truncate">
                              <span class="material-symbols-outlined text-[12px] text-amber-500">military_tech</span>
                              <span>${a.achievementNote}</span>
                            </div>
                          ` : ''}
                        </td>
                        <td class="p-3.5 align-middle whitespace-nowrap"><span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${badge.bg} ${badge.text}">${badge.label}</span></td>
                        <td class="p-3.5 align-middle whitespace-nowrap text-slate-500 font-mono">${a.date}</td>
                        <td class="p-3.5 align-middle whitespace-nowrap text-center font-semibold text-slate-700 dark:text-slate-300">${a.participants}</td>
                        <td class="p-3.5 align-middle whitespace-nowrap text-center font-bold text-amber-600">${a.totalMedals} HC</td>
                        <td class="p-3.5 align-middle whitespace-nowrap text-right">
                          <button onclick="openActivityModal('${a.id}')" title="Chỉnh sửa" class="p-1.5 rounded-lg text-slate-400 hover:text-brand-700 hover:bg-brand-50 btn-press">
                            <span class="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      `;
    }

    export function renderKpiProgressCard(filteredActs, totalActs, totalParticipants, totalMedals) {
      const kpi = state.kpiTargets || {
        targetActivities: 20,
        targetParticipants: 1500,
        targetMedals: 30,
        targetClubs: 5,
        planTitle: 'Kế hoạch phát triển TDTT Phường Tân Khai năm 2026'
      };

      const actPct = Math.round((totalActs / (kpi.targetActivities || 20)) * 100);
      const partPct = Math.round((totalParticipants / (kpi.targetParticipants || 1500)) * 100);
      const medalPct = Math.round((totalMedals / (kpi.targetMedals || 30)) * 100);
      const clubCount = (state.clubs || []).length;
      const clubPct = Math.round((clubCount / (kpi.targetClubs || 5)) * 100);

      // Điểm đánh giá trung bình
      const avgPct = Math.round((actPct + partPct + medalPct + clubPct) / 4);

      let badgeBg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      let dotBg = 'bg-emerald-600';
      let badgeText = `Vượt chỉ tiêu (${avgPct}%)`;
      let noteText = 'Phong trào TDTT Phường Tân Khai đã hoàn thành và vượt mức toàn bộ các chỉ tiêu kế hoạch năm được giao.';

      if (avgPct < 80) {
        badgeBg = 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        dotBg = 'bg-amber-500';
        badgeText = `Đang triển khai (${avgPct}%)`;
        noteText = 'Đang tiếp tục tổ chức các giải đấu và hoạt động phong trào để hoàn thành chỉ tiêu năm.';
      } else if (avgPct < 100) {
        badgeBg = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        dotBg = 'bg-slate-500';
        badgeText = `Đạt kế hoạch (${avgPct}%)`;
        noteText = 'Đã cơ bản đạt các chỉ tiêu đề ra, đang duy trì ổn định phong trào cơ sở.';
      }

      return `
        <div class="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
          <!-- Header Card -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <div class="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-sm">
                  <span class="material-symbols-outlined text-[16px]">flag</span>
                </div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                  Tiến Độ Thực Hiện Chỉ Tiêu Thi Đua Năm ${state.selectedYear === 'all' ? '2026' : state.selectedYear}
                </h3>
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeBg}">
                  <span class="w-1.5 h-1.5 rounded-full ${dotBg}"></span>
                  <span>${badgeText}</span>
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                ${kpi.planTitle || 'Kế hoạch phát triển TDTT Phường Tân Khai'} • ${noteText}
              </p>
            </div>

            <button onclick="openKpiTargetsModal()" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto btn-press" title="Điều chỉnh các con số kế hoạch được giao">
              <span class="material-symbols-outlined text-[15px]">tune</span>
              <span>Cài đặt chỉ tiêu</span>
            </button>
          </div>

          <!-- 4 Progress Bars Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            <!-- 1. Chỉ tiêu Giải đấu -->
            <div class="p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[15px] text-emerald-600">emoji_events</span>
                  <span>Giải đấu tổ chức</span>
                </span>
                <span class="text-xs font-bold font-mono ${actPct >= 100 ? 'text-emerald-600' : 'text-slate-600'}">${actPct}%</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div id="bar_act_pct" class="bg-emerald-600 h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
              </div>
              <div class="flex justify-between items-center text-[11px] text-slate-500">
                <span>Thực tế: <b class="text-slate-900 dark:text-white font-mono">${totalActs}</b> giải</span>
                <span>Chỉ tiêu: <b class="font-mono">${kpi.targetActivities || 20}</b></span>
              </div>
            </div>

            <!-- 2. Chỉ tiêu Lượt VĐV -->
            <div class="p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[15px] text-teal-600">groups</span>
                  <span>Lượt VĐV tham gia</span>
                </span>
                <span class="text-xs font-bold font-mono ${partPct >= 100 ? 'text-teal-600' : 'text-slate-600'}">${partPct}%</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div id="bar_part_pct" class="bg-teal-600 h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
              </div>
              <div class="flex justify-between items-center text-[11px] text-slate-500">
                <span>Thực tế: <b class="text-slate-900 dark:text-white font-mono">${totalParticipants.toLocaleString('vi-VN')}</b></span>
                <span>Chỉ tiêu: <b class="font-mono">${(kpi.targetParticipants || 1500).toLocaleString('vi-VN')}</b></span>
              </div>
            </div>

            <!-- 3. Chỉ tiêu Huy chương -->
            <div class="p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[15px] text-amber-500">military_tech</span>
                  <span>Thành tích Huy chương</span>
                </span>
                <span class="text-xs font-bold font-mono ${medalPct >= 100 ? 'text-amber-600' : 'text-slate-600'}">${medalPct}%</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div id="bar_medal_pct" class="bg-amber-500 h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
              </div>
              <div class="flex justify-between items-center text-[11px] text-slate-500">
                <span>Thực tế: <b class="text-slate-900 dark:text-white font-mono">${totalMedals}</b> HC</span>
                <span>Chỉ tiêu: <b class="font-mono">${kpi.targetMedals || 30}</b> HC</span>
              </div>
            </div>

            <!-- 4. Duy trì CLB cơ sở -->
            <div class="p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[15px] text-slate-600 dark:text-slate-400">diversity_3</span>
                  <span>CLB TDTT duy trì</span>
                </span>
                <span class="text-xs font-bold font-mono ${clubPct >= 100 ? 'text-slate-700 dark:text-slate-300' : 'text-slate-600'}">${clubPct}%</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div id="bar_club_pct" class="bg-slate-600 dark:bg-slate-400 h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
              </div>
              <div class="flex justify-between items-center text-[11px] text-slate-500">
                <span>Thực tế: <b class="text-slate-900 dark:text-white font-mono">${clubCount}</b> CLB</span>
                <span>Chỉ tiêu: <b class="font-mono">${kpi.targetClubs || 5}</b> CLB</span>
              </div>
            </div>

          </div>
        </div>
      `;
    }

    export function openKpiTargetsModal() {
      const kpi = state.kpiTargets || {
        targetActivities: 20,
        targetParticipants: 1500,
        targetMedals: 30,
        targetClubs: 5,
        planTitle: 'Kế hoạch phát triển TDTT Phường Tân Khai năm 2026'
      };

      const modal = document.createElement('div');
      modal.id = 'modalContainer';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm';
      modal.innerHTML = `
        <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 modal-animate text-left">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Thiết Lập Chỉ Tiêu Thi Đua Năm</h3>
              <p class="text-[11px] text-slate-400">Căn cứ theo Kế hoạch UBND phường và Trung tâm DVTH giao</p>
            </div>
            <button onclick="window.closeModal()" class="p-1 rounded-lg text-slate-400 hover:text-slate-600"><span class="material-symbols-outlined">close</span></button>
          </div>

          <form onsubmit="handleSaveKpiTargets(event)" class="mt-4 space-y-3 text-xs">
            <div>
              <label class="block font-bold mb-1">Tên Kế hoạch / Căn cứ giao chỉ tiêu</label>
              <input id="kpi_title" type="text" value="${kpi.planTitle || 'Kế hoạch phát triển TDTT Phường Tân Khai năm 2026'}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-100" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Chỉ tiêu Giải đấu (giải)</label>
                <input id="kpi_acts" type="number" min="1" value="${kpi.targetActivities || 20}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold" />
              </div>
              <div>
                <label class="block font-bold mb-1">Chỉ tiêu Lượt VĐV (lượt)</label>
                <input id="kpi_parts" type="number" min="1" value="${kpi.targetParticipants || 1500}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Chỉ tiêu Huy chương (HC)</label>
                <input id="kpi_medals" type="number" min="0" value="${kpi.targetMedals || 30}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold" />
              </div>
              <div>
                <label class="block font-bold mb-1">Chỉ tiêu Duy trì CLB (CLB)</label>
                <input id="kpi_clubs" type="number" min="1" value="${kpi.targetClubs || 5}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold" />
              </div>
            </div>

            <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button type="button" onclick="window.closeModal()" class="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">Hủy</button>
              <button type="submit" class="px-5 py-2 rounded-xl font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-sm btn-press">Lưu chỉ tiêu</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
    }

    export function handleSaveKpiTargets(e) {
      e.preventDefault();
      state.kpiTargets = {
        planTitle: document.getElementById('kpi_title').value.trim() || 'Kế hoạch phát triển TDTT Phường Tân Khai',
        targetActivities: parseInt(document.getElementById('kpi_acts').value) || 20,
        targetParticipants: parseInt(document.getElementById('kpi_parts').value) || 1500,
        targetMedals: parseInt(document.getElementById('kpi_medals').value) || 30,
        targetClubs: parseInt(document.getElementById('kpi_clubs').value) || 5
      };
      saveAll();
      window.closeModal();
      showToast('Đã lưu chỉ tiêu thi đua', 'Hệ thống đã cập nhật tỷ lệ hoàn thành kế hoạch năm.');
      window.renderApp();
    }

    export function handleDashboardSearch(query) {
      if (!query.trim()) return;
      state.tournamentsFilter.search = query.trim();
      switchTab('quan-ly-giai-dau');
    }

    let donutChartInstance = null;
    let barChartInstance = null;

    export function initDashboardCharts() {
      const filteredActs = state.selectedYear === 'all'
        ? state.activities
        : state.activities.filter(a => String(a.year || extractYearFromDate(a.date)) === String(state.selectedYear));

      // 1. Group by Sport
      const sportCounts = {};
      filteredActs.forEach(a => {
        const s = a.sport || 'Khác';
        sportCounts[s] = (sportCounts[s] || 0) + 1;
      });

      const donutEl = document.getElementById('sportsDonutChart');
      if (donutEl) {
        if (donutChartInstance) donutChartInstance.destroy();
        donutChartInstance = new Chart(donutEl, {
          type: 'doughnut',
          data: {
            labels: Object.keys(sportCounts),
            datasets: [{
              data: Object.values(sportCounts),
              backgroundColor: ['#059669', '#0d9488', '#0284c7', '#d97706', '#ea580c', '#7c3aed', '#db2777'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
            },
            cutout: '68%'
          }
        });
      }

      // 2. Group by Month
      const monthData = Array(12).fill(0);
      filteredActs.forEach(a => {
        const m = parseInt(a.month) || (a.date ? parseInt(a.date.split('/')[1]) : 1);
        if (m >= 1 && m <= 12) {
          monthData[m - 1] += parseInt(a.participants) || 0;
        }
      });

      const barEl = document.getElementById('timelineBarChart');
      if (barEl) {
        if (barChartInstance) barChartInstance.destroy();
        barChartInstance = new Chart(barEl, {
          type: 'bar',
          data: {
            labels: ['Th 1', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'Th 8', 'Th 9', 'Th 10', 'Th 11', 'Th 12'],
            datasets: [{
              label: 'Số lượng VĐV tham gia',
              data: monthData,
              backgroundColor: 'rgba(5, 150, 105, 0.75)',
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } },
              x: { grid: { display: false } }
            },
            plugins: {
              legend: { display: false }
            }
          }
        });
      }

      // 3. Kích hoạt hiệu ứng Anime.js cho KPI Cards & Progress Bars & Recent Table
      try {
        const totalActs = filteredActs.length;
        const totalParticipants = filteredActs.reduce((acc, a) => acc + (parseInt(a.participants) || 0), 0);
        const totalMedals = filteredActs.reduce((acc, a) => acc + (parseInt(a.totalMedals) || 0), 0);
        const totalBudget = filteredActs.reduce((acc, a) => acc + (parseInt(a.budgetTotal) || 0), 0);

        const kpi = state.kpiTargets || {
          targetActivities: 20,
          targetParticipants: 1500,
          targetMedals: 30,
          targetClubs: 5
        };

        const actPct = Math.round((totalActs / (kpi.targetActivities || 20)) * 100);
        const partPct = Math.round((totalParticipants / (kpi.targetParticipants || 1500)) * 100);
        const medalPct = Math.round((totalMedals / (kpi.targetMedals || 30)) * 100);
        const clubCount = (state.clubs || []).length;
        const clubPct = Math.round((clubCount / (kpi.targetClubs || 5)) * 100);

        // Hiệu ứng nhảy số
        animateCounter('#stat_total_acts', totalActs, { duration: 900 });
        animateCounter('#stat_total_parts', totalParticipants, { duration: 1100 });
        animateCounter('#stat_total_medals', totalMedals, { duration: 1000 });
        animateCounter('#stat_total_budget', totalBudget / 1000000, {
          duration: 1200,
          formatter: (v) => v.toFixed(1) + ' tr đ'
        });

        // Hiệu ứng thanh tiến độ
        animateProgressBar('#bar_act_pct', actPct, { delay: 100, duration: 800 });
        animateProgressBar('#bar_part_pct', partPct, { delay: 200, duration: 800 });
        animateProgressBar('#bar_medal_pct', medalPct, { delay: 300, duration: 800 });
        animateProgressBar('#bar_club_pct', clubPct, { delay: 400, duration: 800 });

        // Hiệu ứng lướt hàng bảng hoạt động gần đây
        animateStagger('#dashboard_recent_table tbody tr', { delayStep: 35, duration: 320 });
      } catch (err) {
        console.warn('Dashboard animation error:', err);
      }
    }


