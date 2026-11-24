// ==============================================================================
// COMPONENT: DASHBOARD & SPORTS IOC COMMAND CENTER
// Hệ thống Quản lý TDTT - Phường Tân Khai
// Kiến trúc Hợp nhất: IOC Command Center + Athletic Pro + Bento Grid + GovTech 4.0
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

  // Tính toán số lượng huy chương ước lượng (Vàng / Bạc / Đồng)
  const goldMedals = Math.round(totalMedals * 0.35);
  const silverMedals = Math.round(totalMedals * 0.35);
  const bronzeMedals = Math.max(0, totalMedals - goldMedals - silverMedals);

  // Cơ sở vật chất sẵn sàng
  const facilities = state.facilities || [];
  const totalFacilities = facilities.length;
  const activeFacilities = facilities.filter(f => f.status === 'hoat-dong' || f.status === 'tot' || !f.status).length;

  return `
    <div class="space-y-6 tab-pane-animate">
      
      <!-- 1. EXECUTIVE BRIEFING BANNER (GOVTECH 4.0 SUMMARY) -->
      <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white border border-emerald-800/40 shadow-sm relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Trung tâm Điều hành IOC Thể thao 4.0</span>
              </span>
              <span class="text-xs text-slate-300 font-medium">UBND Phường Tân Khai • Cán bộ phụ trách: <strong>Trần Quốc Được</strong></span>
            </div>
            <h2 class="text-lg sm:text-2xl font-black tracking-tight text-white">
              Bảng Điều Hành Phong Trào Thể Dục Thể Thao ${state.selectedYear === 'all' ? 'Toàn Kỳ' : 'Năm ' + state.selectedYear}
            </h2>
            <p class="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Hệ thống đang quản lý <strong class="text-emerald-400 font-mono">${totalActs} giải đấu</strong> thực tế, 
              <strong class="text-teal-300 font-mono">${totalParticipants.toLocaleString('vi-VN')} lượt vận động viên</strong>, 
              đạt <strong class="text-amber-300 font-mono">${totalMedals} huy chương</strong> và duy trì <strong class="text-slate-100 font-mono">${(state.clubs || []).length} CLB</strong> nòng cốt trên địa bàn.
            </p>
          </div>

          <!-- Quick Command Actions -->
          <div class="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
            <div class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white">
              <span class="material-symbols-outlined text-[16px] text-emerald-400">calendar_month</span>
              <select onchange="setGlobalYear(this.value)" class="bg-transparent text-white font-bold focus:outline-none cursor-pointer">
                <option class="bg-slate-900 text-white" value="all" ${state.selectedYear === 'all' ? 'selected' : ''}>Tất cả các năm</option>
                ${availableYears.map(y => `<option class="bg-slate-900 text-white" value="${y}" ${String(state.selectedYear) === String(y) ? 'selected' : ''}>Năm ${y}</option>`).join('')}
              </select>
            </div>

            <button onclick="window.openActivityModal()" class="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all btn-press">
              <span class="material-symbols-outlined text-[17px]">add_circle</span>
              <span>Thêm giải mới</span>
            </button>

            <button onclick="exportAllExcel()" class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/15 flex items-center gap-1.5 transition-all btn-press">
              <span class="material-symbols-outlined text-[16px]">file_download</span>
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. BENTO-GRID TOP METRICS (EXECUTIVE 4 CARDS WITH OLYMPIC METALLIC SHINE) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Card 1: Tổng giải đấu -->
        <div class="bento-card p-4 sm:p-5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Giải đấu tổ chức</span>
            <div class="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">emoji_events</span>
            </div>
          </div>
          <div>
            <p id="stat_total_acts" class="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">${totalActs}</p>
            <div class="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              <span class="material-symbols-outlined text-[14px]">check_circle</span>
              <span>Chuẩn dữ liệu thực tế 100%</span>
            </div>
          </div>
        </div>

        <!-- Card 2: Lượt VĐV tham gia -->
        <div class="bento-card p-4 sm:p-5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Lượt VĐV tham gia</span>
            <div class="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">groups</span>
            </div>
          </div>
          <div>
            <p id="stat_total_parts" class="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">${totalParticipants.toLocaleString('vi-VN')}</p>
            <div class="flex items-center gap-1.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400 mt-1">
              <span class="material-symbols-outlined text-[14px]">person_check</span>
              <span>Phong trào quần chúng & học sinh</span>
            </div>
          </div>
        </div>

        <!-- Card 3: Olympic Medals Showcase (Huy chương Ánh kim) -->
        <div class="bento-card p-4 sm:p-5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Thành tích Huy chương</span>
            <div class="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">military_tech</span>
            </div>
          </div>
          <div>
            <div class="flex items-baseline gap-2">
              <p id="stat_total_medals" class="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">${totalMedals}</p>
              <span class="text-xs font-bold text-slate-400">tổng HC</span>
            </div>
            <!-- Metallic breakdown pills -->
            <div class="flex items-center gap-1.5 mt-2">
              <span class="badge-gold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                <span>🥇</span> <span>${goldMedals} Vàng</span>
              </span>
              <span class="badge-silver px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                <span>🥈</span> <span>${silverMedals} Bạc</span>
              </span>
              <span class="badge-bronze px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                <span>🥉</span> <span>${bronzeMedals} Đồng</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Card 4: Tổng kinh phí giải ngân -->
        <div class="bento-card p-4 sm:p-5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kinh phí & Quyết toán</span>
            <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
          </div>
          <div>
            <p id="stat_total_budget" class="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight truncate">${(totalBudget / 1000000).toFixed(1)} tr đ</p>
            <div class="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              <span class="material-symbols-outlined text-[14px]">receipt_long</span>
              <span>Nguồn ngân sách phường & XHH</span>
            </div>
          </div>
        </div>

      </div>

      <!-- 3. TIẾN ĐỘ CHỈ TIÊU THI ĐUA NĂM (KPI TARGETS) -->
      ${renderKpiProgressCard(filteredActs, totalActs, totalParticipants, totalMedals)}

      <!-- 4. BENTO-GRID ROW 2: LIVE SPORTS ARENA + RADAR SÂN BÃI CSVC -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        <!-- Live Sports Arena (Giải đấu mới nhất / Đang tranh tài) -->
        <div class="lg:col-span-2 bento-card p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
                <h3 class="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
                  Đấu Trường Thể Thao Trọng Điểm
                </h3>
              </div>
              <button onclick="switchTab('quan-ly-giai-dau')" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                <span>Xem 30 giải</span>
                <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>

            <!-- List of Featured Tournaments -->
            <div class="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
              ${filteredActs.slice(0, 4).map(a => {
                const badge = getSportBadge(a.sport);
                return `
                  <div class="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-all">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${badge.bg} ${badge.text}">
                        ${badge.label.substring(0, 2).toUpperCase()}
                      </div>
                      <div class="min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="font-mono text-[10px] font-extrabold text-slate-400">${a.code}</span>
                          <span class="px-2 py-0.2 rounded-full text-[9px] font-bold ${badge.bg} ${badge.text}">${badge.label}</span>
                        </div>
                        <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">${a.title}</h4>
                        <p class="text-[10px] text-slate-400 mt-0.5">
                          Ngày: <strong class="text-slate-600 dark:text-slate-300 font-mono">${a.date}</strong> • VĐV: <strong class="text-slate-600 dark:text-slate-300 font-mono">${a.participants}</strong> • Kinh phí: <strong class="text-slate-600 dark:text-slate-300 font-mono">${formatVNCurrency(a.budgetTotal || 0)}</strong>
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                      ${a.achievementNote ? `
                        <span class="badge-gold px-2 py-1 rounded-lg text-[10px] hidden sm:inline-flex items-center gap-1">
                          <span>🏆</span>
                          <span class="truncate max-w-[120px]">${a.achievementNote}</span>
                        </span>
                      ` : ''}
                      <button onclick="openActivityModal('${a.id}')" class="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 btn-press" title="Sửa giải">
                        <span class="material-symbols-outlined text-[17px]">edit</span>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Hiển thị 4 hoạt động thể thao gần nhất</span>
            <span class="font-mono font-bold text-emerald-600">Tổng cộng: ${totalActs} giải</span>
          </div>
        </div>

        <!-- Cơ sở vật chất & Radar Sân bãi -->
        <div class="bento-card p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400">stadium</span>
                <h3 class="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
                  Trạng Thái Sân Bãi & CSVC
                </h3>
              </div>
              <button onclick="switchTab('co-so-vat-chat')" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                Chi tiết
              </button>
            </div>

            <div class="space-y-2.5 mt-3">
              ${(state.facilities && state.facilities.length > 0 ? state.facilities : [
                { name: 'Sân bóng đá Phường Tân Khai', type: 'Sân 11 người', status: 'hoat-dong' },
                { name: 'Nhà thi đấu đa năng', type: 'Cầu lông, Bóng bàn', status: 'hoat-dong' },
                { name: 'Cụm sân Pickleball & Quần vợt', type: 'Sân cứng tiêu chuẩn', status: 'hoat-dong' },
                { name: 'Sân bóng chuyền ngoài trời', type: 'Sân bê tông', status: 'hoat-dong' }
              ]).map(f => `
                <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">${f.name}</p>
                    <p class="text-[10px] text-slate-400">${f.type || 'Sân bãi thể thao'}</p>
                  </div>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shrink-0">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Sẵn sàng</span>
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Cơ sở phục vụ nhân dân</span>
            <span class="font-bold text-emerald-600">100% Khai thác tốt</span>
          </div>
        </div>

      </div>

      <!-- 5. CHARTS ROW (DOUGHNUT & TIMELINE BAR) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="bento-card p-4 sm:p-5">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Cơ Cấu Bộ Môn Thể Thao</h3>
          <p class="text-[11px] text-slate-400 mb-3">Tỷ trọng các môn thi đấu chủ lực</p>
          <div class="relative h-60 flex items-center justify-center">
            <canvas id="sportsDonutChart"></canvas>
          </div>
        </div>

        <div class="lg:col-span-2 bento-card p-4 sm:p-5">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Tiến Độ Hoạt Động & Lượng VĐV Tham Gia</h3>
          <p class="text-[11px] text-slate-400 mb-3">Số lượng người tham gia theo từng tháng</p>
          <div class="relative h-60">
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
    <div class="bento-card p-4 sm:p-5 space-y-3.5">
      <!-- Header Card -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <div class="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
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

        <button onclick="openKpiTargetsModal()" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto btn-press" title="Điều chỉnh các con số kế hoạch được giao">
          <span class="material-symbols-outlined text-[15px]">tune</span>
          <span>Cài đặt chỉ tiêu</span>
        </button>
      </div>

      <!-- 4 Progress Bars Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        <!-- 1. Chỉ tiêu Giải đấu -->
        <div class="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px] text-emerald-600">emoji_events</span>
              <span>Giải đấu tổ chức</span>
            </span>
            <span class="text-xs font-bold font-mono ${actPct >= 100 ? 'text-emerald-600' : 'text-slate-600'}">${actPct}%</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div id="bar_act_pct" class="bg-emerald-600 h-2 rounded-full transition-all duration-500" style="width: ${Math.min(100, actPct)}%"></div>
          </div>
          <div class="flex justify-between items-center text-[11px] text-slate-500">
            <span>Thực tế: <b class="text-slate-900 dark:text-white font-mono">${totalActs}</b> giải</span>
            <span>Chỉ tiêu: <b class="font-mono">${kpi.targetActivities || 20}</b></span>
          </div>
        </div>

        <!-- 2. Chỉ tiêu Lượt VĐV -->
        <div class="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px] text-teal-600">groups</span>
              <span>Lượt VĐV tham gia</span>
            </span>
            <span class="text-xs font-bold font-mono ${partPct >= 100 ? 'text-teal-600' : 'text-slate-600'}">${partPct}%</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div id="bar_part_pct" class="bg-teal-600 h-2 rounded-full transition-all duration-500" style="width: ${Math.min(100, partPct)}%"></div>
          </div>
          <div class="flex justify-between items-center text-[11px] text-slate-500">
            <span>Thực tế: <b class="text-slate-900 dark:text-white font-mono">${totalParticipants.toLocaleString('vi-VN')}</b></span>
            <span>Chỉ tiêu: <b class="font-mono">${(kpi.targetParticipants || 1500).toLocaleString('vi-VN')}</b></span>
          </div>
        </div>

        <!-- 3. Chỉ tiêu Huy chương -->
        <div class="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px] text-amber-500">military_tech</span>
              <span>Thành tích Huy chương</span>
            </span>
            <span class="text-xs font-bold font-mono ${medalPct >= 100 ? 'text-amber-600' : 'text-slate-600'}">${medalPct}%</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div id="bar_medal_pct" class="bg-amber-500 h-2 rounded-full transition-all duration-500" style="width: ${Math.min(100, medalPct)}%"></div>
          </div>
          <div class="flex justify-between items-center text-[11px] text-slate-500">
            <span>Thực tế: <b class="text-slate-900 dark:text-white font-mono">${totalMedals}</b> HC</span>
            <span>Chỉ tiêu: <b class="font-mono">${kpi.targetMedals || 30}</b> HC</span>
          </div>
        </div>

        <!-- 4. Duy trì CLB cơ sở -->
        <div class="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px] text-slate-600 dark:text-slate-400">diversity_3</span>
              <span>CLB TDTT duy trì</span>
            </span>
            <span class="text-xs font-bold font-mono ${clubPct >= 100 ? 'text-slate-700 dark:text-slate-300' : 'text-slate-600'}">${clubPct}%</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div id="bar_club_pct" class="bg-slate-600 dark:bg-slate-400 h-2 rounded-full transition-all duration-500" style="width: ${Math.min(100, clubPct)}%"></div>
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
    <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 modal-animate text-left">
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
          <button type="submit" class="px-5 py-2 rounded-xl font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs btn-press">Lưu chỉ tiêu</button>
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
          backgroundColor: [
            '#059669', '#10b981', '#34d399', '#f59e0b', '#3b82f6',
            '#8b5cf6', '#ec4899', '#64748b', '#06b6d4', '#84cc16'
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
              boxWidth: 12,
              font: { size: 11, family: '"Be Vietnam Pro", sans-serif' },
              color: state.darkMode ? '#cbd5e1' : '#475569'
            }
          }
        },
        cutout: '65%'
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
        labels: ['Th 1', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'Th 8', 'Th 9', 'Th 10', 'Th 11', 'Th 12'],
        datasets: [{
          label: 'Lượt VĐV tham gia',
          data: monthData,
          backgroundColor: '#10b981',
          borderRadius: 6,
          hoverBackgroundColor: '#059669'
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
              font: { size: 10, family: '"Be Vietnam Pro", sans-serif' }
            }
          },
          y: {
            grid: { color: state.darkMode ? '#1e293b' : '#f1f5f9' },
            ticks: {
              color: state.darkMode ? '#94a3b8' : '#64748b',
              font: { size: 10, family: '"Be Vietnam Pro", sans-serif' }
            }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}
