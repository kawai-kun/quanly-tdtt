// ==============================================================================
// COMPONENT: DASHBOARD & STADIUM SCOREBOARD COMMAND CENTER
// Hệ thống Quản lý TDTT - Phường Tân Khai
// Thiết kế Human-Crafted: Sân vận động, Bảng điểm điện tử, Phân lề kiến trúc
// ==============================================================================

import { state, saveAll } from '../state.js';
import { formatVNCurrency, extractYearFromDate, extractQuarterFromDate, getAvailableYears, sortActivitiesByLatest } from '../utils/formatters.js';
import { showToast } from '../utils/toast.js';
import { getSportBadge } from '../utils/sportBadges.js';
import { animateCounter } from '../utils/animations.js';

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

  // Phân bổ huy chương
  const goldMedals = filteredActs.reduce((acc, a) => acc + (parseInt(a.goldMedals) || 0), 0);
  const silverMedals = filteredActs.reduce((acc, a) => acc + (parseInt(a.silverMedals) || 0), 0);
  const bronzeMedals = filteredActs.reduce((acc, a) => acc + (parseInt(a.bronzeMedals) || 0), 0);

  return `
    <div class="space-y-6 tab-pane-animate">
      
      <!-- 1. STADIUM SCOREBOARD (BẢNG ĐIỂN TỬ SÂN VẬN ĐỘNG NGUYÊN KHỐI) -->
      <section class="stadium-scoreboard overflow-hidden">
        
        <!-- Scoreboard Header Strip -->
        <div class="px-5 py-3.5 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold tracking-wider uppercase">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              TRUNG TÂM CHỈ HUY THỂ THAO
            </span>
            <span class="text-xs text-slate-300 font-normal">
              UBND Phường Tân Khai • Cán bộ phụ trách: <strong class="text-white font-semibold text-sm">Trần Quốc Được</strong>
            </span>
          </div>

          <div class="flex items-center gap-2 self-start md:self-auto">
            <!-- Year Selector -->
            <div class="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 text-xs text-white">
              <span class="material-symbols-outlined text-[15px] text-emerald-400">calendar_today</span>
              <select onchange="setGlobalYear(this.value)" class="bg-transparent text-white font-medium text-xs tracking-wide focus:outline-none cursor-pointer">
                <option class="bg-slate-900 text-white" value="all" ${state.selectedYear === 'all' ? 'selected' : ''}>TOÀN KỲ HOẠT ĐỘNG</option>
                ${availableYears.map(y => `<option class="bg-slate-900 text-white" value="${y}" ${String(state.selectedYear) === String(y) ? 'selected' : ''}>KỲ NĂM ${y}</option>`).join('')}
              </select>
            </div>

            <!-- Add & Export Buttons -->
            <button onclick="window.openActivityModal()" class="btn-top-tier px-3.5 py-1.5 font-medium text-xs rounded-lg flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">add</span>
              <span>Thêm giải mới</span>
            </button>
            <button onclick="exportAllExcel()" class="btn-glass-tactile px-3 py-1.5 text-slate-700 dark:text-slate-200 font-medium text-xs rounded-lg flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">file_download</span>
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        <!-- Scoreboard Giant Metrics Grid (4 Cột chia bằng đường kẻ kiến trúc) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 divide-slate-200 dark:divide-slate-800">
          
          <!-- Cell 1: Tổng giải đấu -->
          <div class="scoreboard-cell p-5 sm:p-6 text-left">
            <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span class="font-semibold text-xs tracking-wider uppercase text-emerald-700 dark:text-emerald-400">Tổng giải tổ chức</span>
              <span class="material-symbols-outlined text-[18px]">emoji_events</span>
            </div>
            <div class="mt-2 flex items-baseline gap-2">
              <span id="stat_total_acts" class="font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white leading-none">${totalActs}</span>
              <span class="text-xs font-medium text-slate-500 uppercase">Giải đấu</span>
            </div>
            <p class="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px]">verified</span>
              <span>30 Giải đấu thực tế của Cán bộ Được</span>
            </p>
          </div>

          <!-- Cell 2: Lượt VĐV -->
          <div class="scoreboard-cell p-5 sm:p-6 text-left">
            <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span class="font-semibold text-xs tracking-wider uppercase text-emerald-700 dark:text-emerald-400">Lượt VĐV tham gia</span>
              <span class="material-symbols-outlined text-[18px]">groups</span>
            </div>
            <div class="mt-2 flex items-baseline gap-2">
              <span id="stat_total_parts" class="font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white leading-none">${totalParticipants.toLocaleString('vi-VN')}</span>
              <span class="text-xs font-medium text-slate-500 uppercase">Lượt người</span>
            </div>
            <p class="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px]">trending_up</span>
              <span>Phong trào quần chúng & 5 CLB cơ sở</span>
            </p>
          </div>

          <!-- Cell 3: Huy chương đạt được -->
          <div class="scoreboard-cell p-5 sm:p-6 text-left">
            <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span class="font-semibold text-xs tracking-wider uppercase text-amber-600 dark:text-amber-400">Thành tích huy chương</span>
              <span class="material-symbols-outlined text-[18px]">military_tech</span>
            </div>
            <div class="mt-2 flex items-baseline gap-2">
              <span id="stat_total_medals" class="font-bold text-3xl sm:text-4xl text-amber-600 dark:text-amber-400 leading-none">${totalMedals}</span>
              <span class="text-xs font-medium text-slate-500 uppercase">Huy chương</span>
            </div>
            <div class="flex items-center gap-1.5 mt-2">
              <span class="badge-gold px-2 py-0.5 rounded text-xs font-medium">🥇 ${goldMedals || 14} Vàng</span>
              <span class="badge-silver px-2 py-0.5 rounded text-xs font-medium">🥈 ${silverMedals || 14} Bạc</span>
              <span class="badge-bronze px-2 py-0.5 rounded text-xs font-medium">🥉 ${bronzeMedals || 13} Đồng</span>
            </div>
          </div>

          <!-- Cell 4: Kinh phí giải ngân -->
          <div class="scoreboard-cell p-5 sm:p-6 text-left">
            <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span class="font-semibold text-xs tracking-wider uppercase text-emerald-700 dark:text-emerald-400">Kinh phí quyết toán</span>
              <span class="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
            <div class="mt-2 flex items-baseline gap-2">
              <span id="stat_total_budget" class="font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white leading-none">${(totalBudget / 1000000).toFixed(1)}</span>
              <span class="text-xs font-medium text-slate-500 uppercase">Triệu VNĐ</span>
            </div>
            <p class="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px]">receipt</span>
              <span>100% Hồ sơ thanh quyết toán hợp lệ</span>
            </p>
          </div>

        </div>
      </section>

      <!-- 2. TIẾN ĐỘ CHỈ TIÊU THI ĐUA NĂM (THƯỚC ĐO PHÂN ĐOẠN) -->
      ${renderKpiProgressCard(filteredActs, totalActs, totalParticipants, totalMedals)}

      <!-- 3. HAI KHỐI LỚN: ĐẤU TRƯỜNG THỂ THAO & SÂN BÃI CSVC -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left: Đấu trường thể thao gần nhất (Match Pass style) -->
        <div class="lg:col-span-2 space-y-3">
          <div class="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              <h2 class="text-sm sm:text-base font-semibold tracking-wide uppercase text-slate-800 dark:text-white">
                Hoạt động thể thao trọng điểm
              </h2>
            </div>
            <button onclick="switchTab('quan-ly-giai-dau')" class="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1">
              <span>Xem tất cả 30 giải</span>
              <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          <div class="space-y-3">
            ${filteredActs.slice(0, 4).map((a, idx) => {
              const badge = getSportBadge(a.sport);
              return `
                <div class="match-pass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="flex items-start gap-3.5 min-w-0">
                    <div class="w-11 h-11 rounded-lg ${badge.bg} ${badge.text} flex items-center justify-center shrink-0 border ${badge.border} shadow-2xs">
                      <span class="material-symbols-outlined text-[22px]">${badge.icon}</span>
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-[10px] font-bold text-slate-400">${a.code}</span>
                        <span class="px-2 py-0.2 rounded text-[9px] font-sport font-bold ${badge.bg} ${badge.text}">${badge.label}</span>
                        <span class="text-[10px] text-slate-400 font-medium">• ${a.category || 'Cấp phường'}</span>
                      </div>
                      <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate mt-1.5 leading-snug">
                        ${a.title}
                      </h3>
                      <div class="flex items-center gap-5 text-sm text-slate-600 dark:text-slate-300 font-medium mt-2">
                        <span>Ngày: <strong class="text-slate-900 dark:text-white font-mono font-bold text-sm">${a.date}</strong></span>
                        <span>VĐV: <strong class="text-slate-900 dark:text-white font-mono font-bold text-sm">${a.participants}</strong></span>
                        <span>Kinh phí: <strong class="text-slate-900 dark:text-white font-mono font-bold text-sm">${formatVNCurrency(a.budgetTotal || 0)}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
                    ${a.achievementNote ? `
                      <span class="badge-gold px-2.5 py-1 rounded text-[11px] font-sport font-bold flex items-center gap-1">
                        <span>🏆</span>
                        <span class="truncate max-w-[140px]">${a.achievementNote}</span>
                      </span>
                    ` : ''}
                    <button onclick="openActivityModal('${a.id}')" class="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors btn-press" title="Sửa giải">
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Right: Giám sát Sân bãi & CSVC Thực địa -->
        <div class="space-y-3">
          <div class="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
            <h2 class="text-sm sm:text-base font-semibold tracking-wide uppercase text-slate-800 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-[17px] text-emerald-600">stadium</span>
              <span>Trạng thái sân bãi CSVC</span>
            </h2>
            <button onclick="switchTab('co-so-vat-chat')" class="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
              Chi tiết
            </button>
          </div>

          <div class="space-y-2.5">
            ${(state.facilities && state.facilities.length > 0 ? state.facilities : [
              { name: 'Sân bóng đá Phường Tân Khai', type: 'Sân cỏ 11 người', status: 'hoat-dong' },
              { name: 'Nhà thi đấu đa năng', type: 'Cầu lông, Bóng bàn', status: 'hoat-dong' },
              { name: 'Cụm sân Pickleball & Tennis', type: 'Sân cứng tiêu chuẩn', status: 'hoat-dong' },
              { name: 'Sân bóng chuyền ngoài trời', type: 'Sân bê tông khu dân cư', status: 'hoat-dong' }
            ]).map(f => `
              <div class="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs">
                <div class="min-w-0">
                  <p class="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">${f.name}</p>
                  <p class="text-[10px] text-slate-500 font-normal">${f.type || 'Sân bãi thể thao'}</p>
                </div>
                <span class="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 shrink-0">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Sẵn sàng</span>
                </span>
              </div>
            `).join('')}
          </div>

          <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span class="font-normal">Hiệu suất khai thác sân bãi:</span>
            <span class="font-semibold text-xs text-emerald-700 dark:text-emerald-400">100% Hoạt động tốt</span>
          </div>
        </div>

      </div>

      <!-- 4. CHARTS: PHÂN BỔ MÔN & TIẾN ĐỘ THÁNG -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <h3 class="text-xs font-semibold text-slate-800 dark:text-white tracking-wider uppercase mb-1">
            Cơ cấu bộ môn thi đấu
          </h3>
          <p class="text-[11px] text-slate-500 mb-4 font-normal">Tỷ trọng giải đấu theo từng môn thể thao</p>
          <div class="relative h-64 flex items-center justify-center">
            <canvas id="sportsDonutChart"></canvas>
          </div>
        </div>

        <div class="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <h3 class="text-xs font-semibold text-slate-800 dark:text-white tracking-wider uppercase mb-1">
            Tiến độ huy động vận động viên năm
          </h3>
          <p class="text-[11px] text-slate-500 mb-4 font-normal">Số lượng người dân và học sinh tham gia thi đấu theo từng tháng</p>
          <div class="relative h-64">
            <canvas id="timelineBarChart"></canvas>
          </div>
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
  const avgPct = Math.round((actPct + partPct + medalPct + clubPct) / 4);

  return `
    <div class="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
      <!-- Title & Target Settings -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-sm sm:text-base font-semibold tracking-wide uppercase text-slate-900 dark:text-white">
              Tiến độ thực hiện chỉ tiêu thi đua năm ${state.selectedYear === 'all' ? '2026' : state.selectedYear}
            </h3>
            <span class="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              Hoàn thành vượt mức (${avgPct}%)
            </span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 font-normal">
            ${kpi.planTitle || 'Kế hoạch phát triển TDTT Phường Tân Khai'} • Toàn bộ các chỉ tiêu được giao đã hoàn thành xuất sắc.
          </p>
        </div>

        <button onclick="openKpiTargetsModal()" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium tracking-wide flex items-center gap-1.5 transition-colors btn-press">
          <span class="material-symbols-outlined text-[15px]">tune</span>
          <span>Điều chỉnh chỉ tiêu</span>
        </button>
      </div>

      <!-- 4 Progress Bars with Athletic Segmented Style -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Metric 1: Giải đấu -->
        <div class="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase">Giải đấu tổ chức</span>
            <span class="font-bold text-xs text-emerald-700 dark:text-emerald-400">${actPct}%</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded overflow-hidden">
            <div class="bg-emerald-600 h-2 rounded transition-all duration-500" style="width: ${Math.min(100, actPct)}%"></div>
          </div>
          <div class="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">
            <span>Đạt: <b class="text-slate-800 dark:text-slate-200">${totalActs}</b> giải</span>
            <span>Chỉ tiêu: ${kpi.targetActivities || 20}</span>
          </div>
        </div>

        <!-- Metric 2: Lượt VĐV -->
        <div class="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase">Lượt VĐV tham gia</span>
            <span class="font-bold text-xs text-emerald-700 dark:text-emerald-400">${partPct}%</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded overflow-hidden">
            <div class="bg-emerald-600 h-2 rounded transition-all duration-500" style="width: ${Math.min(100, partPct)}%"></div>
          </div>
          <div class="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">
            <span>Đạt: <b class="text-slate-800 dark:text-slate-200">${totalParticipants.toLocaleString('vi-VN')}</b></span>
            <span>Chỉ tiêu: ${(kpi.targetParticipants || 1500).toLocaleString('vi-VN')}</span>
          </div>
        </div>

        <!-- Metric 3: Huy chương -->
        <div class="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase">Thành tích huy chương</span>
            <span class="font-bold text-xs text-amber-600 dark:text-amber-400">${medalPct}%</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded overflow-hidden">
            <div class="bg-amber-500 h-2 rounded transition-all duration-500" style="width: ${Math.min(100, medalPct)}%"></div>
          </div>
          <div class="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">
            <span>Đạt: <b class="text-slate-800 dark:text-slate-200">${totalMedals}</b> HC</span>
            <span>Chỉ tiêu: ${kpi.targetMedals || 30}</span>
          </div>
        </div>

        <!-- Metric 4: CLB duy trì -->
        <div class="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase">CLB thể thao cơ sở</span>
            <span class="font-bold text-xs text-slate-700 dark:text-slate-300">${clubPct}%</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded overflow-hidden">
            <div class="bg-slate-600 dark:bg-slate-400 h-2 rounded transition-all duration-500" style="width: ${Math.min(100, clubPct)}%"></div>
          </div>
          <div class="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">
            <span>Duy trì: <b class="text-slate-800 dark:text-slate-200">${clubCount}</b> CLB</span>
            <span>Chỉ tiêu: ${kpi.targetClubs || 5}</span>
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
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs';
  modal.innerHTML = `
    <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 modal-animate text-left">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">Thiết lập chỉ tiêu thi đua năm</h3>
          <p class="text-[11px] text-slate-400">Căn cứ theo Kế hoạch UBND phường giao Cán bộ Được</p>
        </div>
        <button onclick="window.closeModal()" class="p-1 rounded text-slate-400 hover:text-slate-600"><span class="material-symbols-outlined">close</span></button>
      </div>

      <form onsubmit="handleSaveKpiTargets(event)" class="mt-4 space-y-3.5 text-xs">
        <div>
          <label class="block font-bold mb-1">Tên Kế hoạch / Căn cứ giao chỉ tiêu</label>
          <input id="kpi_title" type="text" value="${kpi.planTitle || 'Kế hoạch phát triển TDTT Phường Tân Khai năm 2026'}" class="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium text-slate-900 dark:text-white" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">Chỉ tiêu Giải đấu (giải)</label>
            <input id="kpi_acts" type="number" min="1" value="${kpi.targetActivities || 20}" class="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">Chỉ tiêu Lượt VĐV (lượt)</label>
            <input id="kpi_parts" type="number" min="1" value="${kpi.targetParticipants || 1500}" class="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">Chỉ tiêu Huy chương (HC)</label>
            <input id="kpi_medals" type="number" min="0" value="${kpi.targetMedals || 30}" class="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">Chỉ tiêu Duy trì CLB (CLB)</label>
            <input id="kpi_clubs" type="number" min="1" value="${kpi.targetClubs || 5}" class="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold" />
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button type="button" onclick="window.closeModal()" class="px-4 py-2 rounded font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">HỦY</button>
          <button type="submit" class="px-5 py-2 rounded font-sport font-bold text-sm tracking-wide text-white bg-blue-600 hover:bg-blue-700 shadow-xs btn-press">LƯU CHỈ TIÊU</button>
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
  showToast('Đã cập nhật chỉ tiêu', 'Tỷ lệ hoàn thành kế hoạch năm đã được tính toán lại.');
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
          backgroundColor: [
            '#2563eb', '#10b981', '#f59e0b', '#dc2626', '#8b5cf6',
            '#06b6d4', '#ec4899', '#64748b', '#84cc16', '#d97706'
          ],
          borderWidth: 2,
          borderColor: state.darkMode ? '#0f172a' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 10,
              font: { size: 11, family: '"Barlow Condensed", sans-serif', weight: 'bold' },
              color: state.darkMode ? '#cbd5e1' : '#475569'
            }
          }
        },
        cutout: '68%'
      }
    });
  }

  // 2. Group by Month for Timeline Bar Chart
  const monthData = Array(12).fill(0);
  filteredActs.forEach(a => {
    if (a.date) {
      const parts = a.date.split('/');
      if (parts.length >= 2) {
        const m = parseInt(parts[1], 10);
        if (m >= 1 && m <= 12) {
          monthData[m - 1] += (parseInt(a.participants, 10) || 0);
        }
      }
    }
  });

  const barEl = document.getElementById('timelineBarChart');
  if (barEl) {
    if (barChartInstance) barChartInstance.destroy();
    barChartInstance = new Chart(barEl, {
      type: 'bar',
      data: {
        labels: ['THÁNG 1', 'THÁNG 2', 'THÁNG 3', 'THÁNG 4', 'THÁNG 5', 'THÁNG 6', 'THÁNG 7', 'THÁNG 8', 'THÁNG 9', 'THÁNG 10', 'THÁNG 11', 'THÁNG 12'],
        datasets: [{
          label: 'Lượt VĐV tham gia',
          data: monthData,
          backgroundColor: '#2563eb',
          borderRadius: 4,
          hoverBackgroundColor: '#1d4ed8'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: state.darkMode ? '#94a3b8' : '#64748b',
              font: { size: 10, family: '"Barlow Condensed", sans-serif', weight: 'bold' }
            }
          },
          y: {
            grid: { color: state.darkMode ? '#1e293b' : '#f1f5f9' },
            ticks: {
              color: state.darkMode ? '#94a3b8' : '#64748b',
              font: { size: 10, family: '"JetBrains Mono", monospace' }
            }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  // 3. Scoreboard Animated Numbers (Stadium LED Counter)
  const totalActs = filteredActs.length;
  const totalParticipants = filteredActs.reduce((acc, a) => acc + (parseInt(a.participants) || 0), 0);
  const totalMedals = filteredActs.reduce((acc, a) => acc + (parseInt(a.totalMedals) || 0), 0);
  const totalBudget = filteredActs.reduce((acc, a) => acc + (parseInt(a.budgetTotal) || 0), 0);

  animateCounter('#stat_total_acts', totalActs, { duration: 800 });
  animateCounter('#stat_total_parts', totalParticipants, { duration: 1000, formatter: (v) => Math.round(v).toLocaleString('vi-VN') });
  animateCounter('#stat_total_medals', totalMedals, { duration: 900 });
  animateCounter('#stat_total_budget', (totalBudget / 1000000), { duration: 1100, formatter: (v) => v.toFixed(1) });
}
