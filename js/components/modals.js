// ==============================================================================
// COMPONENT: CÁC MODAL DIALOGS (ACTIVITY MODAL, SYNC MODAL, CLOSE MODAL)
// ==============================================================================

import { state, saveAll, getActivityReportStatus } from '../state.js';
import { SPREADSHEET_ID } from '../data/constants.js';
import { normalizeTitle, normalizeCode, normalizeDate, extractYearFromDate, extractQuarterFromDate, autoDetectSport, sortActivitiesByLatest } from '../utils/formatters.js';
import { showToast } from '../utils/toast.js';
import { animateModalOpen, animateModalClose } from '../utils/animations.js';
import { triggerSafeDelete } from '../utils/undoToast.js';
import { requireAdminElevation } from '../utils/adminGuard.js';

    export function openActivityModal(actId = null) {
      if (!state.isAdminElevated) {
        return requireAdminElevation(
          () => openActivityModal(actId),
          actId ? 'chỉnh sửa thông tin giải đấu' : 'thêm giải đấu mới'
        );
      }
      const act = actId ? state.activities.find(a => a.id === actId) : null;
      // Nếu là giải mới hoặc giải đang ở trạng thái 'Sắp diễn ra'/'Đang diễn ra' -> Mặc định mở ở chế độ Kế hoạch (Tối giản)
      const initialMode = (!act || act.status !== 'Đã hoàn thành') ? 'plan' : 'completed';

      const modal = document.createElement('div');
      modal.id = 'modalContainer';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm';
      modal.innerHTML = `
        <div class="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 max-h-[92vh] overflow-y-auto modal-animate text-left">
          
          <!-- Header -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                ${act ? 'Chỉnh Sửa Giải Đấu' : 'Thêm Giải Đấu Mới'}
                <span id="badgeFormMode" class="text-[11px] font-bold px-2 py-0.5 rounded-full ${initialMode === 'plan' ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'}">
                  ${initialMode === 'plan' ? 'Kế hoạch / Sắp diễn ra' : 'Đã hoàn thành'}
                </span>
              </h3>
              <p class="text-[11px] text-slate-400">Tự động chuẩn hóa chữ hoa/thường, bộ môn và mã giải</p>
            </div>
            <button onclick="window.closeModal()" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"><span class="material-symbols-outlined text-[20px]">close</span></button>
          </div>

          <!-- Mode Selector Segmented Tabs -->
          <div class="mt-3.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl grid grid-cols-2 gap-1 border border-slate-200 dark:border-slate-700">
            <button 
              type="button" 
              id="btnModePlan" 
              onclick="window.switchActivityFormMode('plan')" 
              class="py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${initialMode === 'plan' ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-xs border border-sky-200 dark:border-sky-800' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}"
            >
              <span class="material-symbols-outlined text-[16px]">assignment</span>
              <span>Lên Kế hoạch / Sắp diễn ra (Tối giản)</span>
            </button>
            <button 
              type="button" 
              id="btnModeCompleted" 
              onclick="window.switchActivityFormMode('completed')" 
              class="py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${initialMode === 'completed' ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs border border-amber-200 dark:border-amber-800' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}"
            >
              <span class="material-symbols-outlined text-[16px]">military_tech</span>
              <span>Đã hoàn thành (Nhập kết quả & Huy chương)</span>
            </button>
          </div>

          <form onsubmit="handleSaveActivity(event)" class="mt-4 space-y-3.5">
            <input type="hidden" id="act_id" value="${act ? act.id : ''}" />
            <input type="hidden" id="act_formMode" value="${initialMode}" />

            <!-- Row 1: Mã & Tên giải -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-bold mb-1">Mã giải <span class="text-rose-500">*</span></label>
                <input id="act_code" type="text" required value="${act ? act.code : 'T-' + String(state.activities.length + 1).padStart(2, '0')}" class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-xs font-bold mb-1">Tên giải đấu / Hoạt động <span class="text-rose-500">*</span></label>
                <input id="act_title" type="text" required value="${act ? act.title : ''}" placeholder="Nhập tên giải (VD: Giải Bóng đá mừng Đảng mừng Xuân, Đại hội TDTT...)" class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium" />
              </div>
            </div>

            <!-- Row 2: Bộ môn, Cấp độ, Thời gian -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-bold mb-1">Bộ môn (tự nhận diện)</label>
                <input id="act_sport" type="text" value="${act ? (act.sport || '') : 'Bóng đá'}" placeholder="Tự điền khi gõ tên..." class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-brand-700 dark:text-brand-400" />
              </div>
              <div>
                <label class="block text-xs font-bold mb-1">Cấp độ</label>
                <select id="act_category" class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
                  <option value="Cấp phường" ${act && act.category === 'Cấp phường' ? 'selected' : ''}>Cấp phường</option>
                  <option value="Cấp thành phố" ${act && act.category === 'Cấp thành phố' ? 'selected' : ''}>Cấp thành phố</option>
                  <option value="Hành chính" ${act && act.category === 'Hành chính' ? 'selected' : ''}>Hành chính</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold mb-1">Thời gian (Dự kiến hoặc chính thức)</label>
                <input id="act_date" type="text" value="${act ? act.date : 'Tháng ' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear()}" placeholder="VD: Tháng 03/2026 hoặc 15/03/2026" class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-medium" />
              </div>
            </div>

            <!-- Row 3: VĐV & Địa điểm -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold mb-1">Số lượng VĐV / Người tham gia (dự kiến)</label>
                <input id="act_participants" type="number" min="1" value="${act ? act.participants : 60}" class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
              <div>
                <label class="block text-xs font-bold mb-1">Địa điểm tổ chức</label>
                <input id="act_location" type="text" value="${act ? act.location : 'Trung tâm Dịch vụ tổng hợp'}" class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
            </div>

            <!-- Row 4: Nguồn nhiệm vụ & Căn cứ văn bản -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/50">
              <div>
                <label class="block text-xs font-bold mb-1 text-sky-900 dark:text-sky-200">Phân loại nguồn việc</label>
                <select id="act_planType" class="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-700 font-semibold text-slate-800 dark:text-slate-100">
                  <option value="plan" ${!act || act.planType === 'plan' ? 'selected' : ''}>📋 Trong Kế hoạch năm</option>
                  <option value="extra" ${act && act.planType === 'extra' ? 'selected' : ''}>⚡ Phát sinh ngoài KH (Xã hội hóa / Triệu tập)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold mb-1 text-sky-900 dark:text-sky-200">Căn cứ văn bản / Chỉ đạo</label>
                <input id="act_refPlan" type="text" value="${act && act.refPlan ? act.refPlan : ''}" placeholder="VD: Kế hoạch TDTT năm hoặc Triệu tập cấp TP" class="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-700" />
              </div>
            </div>

            <!-- Row 5: Kinh phí dự toán / Phường cấp -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold mb-1">Kinh phí Phường cấp (Dự toán VNĐ)</label>
                <input id="act_budgetWard" type="number" min="0" value="${act ? act.budgetWard : 15000000}" class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
              <div id="field_budgetPrize_wrapper" class="${initialMode === 'plan' ? 'hidden' : ''}">
                <label class="block text-xs font-bold mb-1">Kinh phí khen thưởng (VNĐ)</label>
                <input id="act_budgetPrize" type="number" min="0" value="${act ? act.budgetPrize : 0}" class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
            </div>

            <!-- SECTION BỔ SUNG: CHỈ HIỂN THỊ KHI Ở CHẾ ĐỘ "ĐÃ HOÀN THÀNH" -->
            <div id="section_results_medals" class="${initialMode === 'plan' ? 'hidden' : ''} space-y-3 pt-1 border-t border-dashed border-amber-300 dark:border-amber-800">
              
              <!-- Field: Ghi chú / Thành tích bổ sung -->
              <div>
                <label class="block text-xs font-bold mb-1 flex items-center justify-between">
                  <span>Ghi chú / Thành tích bổ sung</span>
                  <span class="text-[10px] text-slate-400 font-normal">Tùy chọn: Giải Khuyến khích, Cúp Phong cách, Hạng Nhì toàn đoàn...</span>
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-amber-500">military_tech</span>
                  <input id="act_note" type="text" value="${act && act.achievementNote ? act.achievementNote : ''}" placeholder="Nhập ghi chú thành tích bổ sung nếu có..." class="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-amber-700 dark:text-amber-400 focus:ring-2 focus:ring-amber-500/20" />
                </div>
              </div>

              <!-- Kết quả huy chương -->
              <div class="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-xs font-bold text-amber-700 dark:text-amber-400">Kết quả huy chương thực tế</label>
                  <span id="act_total_medals_badge" class="text-[11px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg">Tổng: ${act ? act.totalMedals : 0} HC</span>
                </div>
                <div class="grid grid-cols-3 gap-2 sm:gap-3">
                  <div><span class="text-[11px] text-slate-500 font-semibold">HCV (Vàng)</span><input id="act_gold" type="number" min="0" value="${act ? act.goldMedals : 0}" class="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 font-bold text-amber-600 bg-white dark:bg-slate-800" /></div>
                  <div><span class="text-[11px] text-slate-500 font-semibold">HCB (Bạc)</span><input id="act_silver" type="number" min="0" value="${act ? act.silverMedals : 0}" class="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 font-bold text-slate-400 bg-white dark:bg-slate-800" /></div>
                  <div><span class="text-[11px] text-slate-500 font-semibold">HCĐ (Đồng)</span><input id="act_bronze" type="number" min="0" value="${act ? act.bronzeMedals : 0}" class="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 font-bold text-orange-600 bg-white dark:bg-slate-800" /></div>
                </div>
              </div>

              <!-- Tình trạng đưa vào Báo cáo định kỳ -->
              <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px] text-brand-600">assignment_turned_in</span>
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-100">Tình trạng báo cáo định kỳ</span>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-0.5">Đánh dấu nếu giải đấu này đã được tổng hợp gửi văn phòng/chi bộ</p>
                </div>
                <label class="inline-flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <input type="checkbox" id="act_isReported" ${act && getActivityReportStatus(act).isReported ? 'checked' : ''} class="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300">
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-200">Đã báo cáo</span>
                </label>
              </div>

            </div>

            <!-- Submit Buttons -->
            <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button type="button" onclick="window.closeModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Hủy</button>
              <button type="submit" class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-sm btn-press">
                ${act ? 'Cập nhật giải đấu' : 'Lưu giải đấu'}
              </button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
      animateModalOpen();

      const titleInput = document.getElementById('act_title');
      const sportInput = document.getElementById('act_sport');
      const codeInput = document.getElementById('act_code');
      const gInput = document.getElementById('act_gold');
      const sInput = document.getElementById('act_silver');
      const bInput = document.getElementById('act_bronze');
      const totalBadge = document.getElementById('act_total_medals_badge');

      titleInput?.addEventListener('blur', function() {
        this.value = normalizeTitle(this.value);
        if (!sportInput.value || sportInput.value === 'Bóng đá') {
          sportInput.value = autoDetectSport(this.value);
        }
      });

      codeInput?.addEventListener('blur', function() {
        this.value = normalizeCode(this.value, state.activities.length);
      });

      function updateMedalsCalc() {
        const total = (parseInt(gInput?.value) || 0) + (parseInt(sInput?.value) || 0) + (parseInt(bInput?.value) || 0);
        if (totalBadge) totalBadge.textContent = `Tổng: ${total} HC`;
      }
      gInput?.addEventListener('input', updateMedalsCalc);
      sInput?.addEventListener('input', updateMedalsCalc);
      bInput?.addEventListener('input', updateMedalsCalc);
    }

    // Chuyển đổi qua lại giữa chế độ Lên Kế hoạch và Đã Hoàn thành trong Form
    export function switchActivityFormMode(mode) {
      const modeInput = document.getElementById('act_formMode');
      const badge = document.getElementById('badgeFormMode');
      const btnPlan = document.getElementById('btnModePlan');
      const btnCompleted = document.getElementById('btnModeCompleted');
      const resultsSection = document.getElementById('section_results_medals');
      const prizeWrapper = document.getElementById('field_budgetPrize_wrapper');

      if (!modeInput) return;
      modeInput.value = mode;

      if (mode === 'plan') {
        if (badge) {
          badge.textContent = 'Kế hoạch / Sắp diễn ra';
          badge.className = 'text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800';
        }
        if (btnPlan) {
          btnPlan.className = 'py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-xs border border-sky-200 dark:border-sky-800';
        }
        if (btnCompleted) {
          btnCompleted.className = 'py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200';
        }
        if (resultsSection) resultsSection.classList.add('hidden');
        if (prizeWrapper) prizeWrapper.classList.add('hidden');
      } else {
        if (badge) {
          badge.textContent = 'Đã hoàn thành';
          badge.className = 'text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
        }
        if (btnCompleted) {
          btnCompleted.className = 'py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs border border-amber-200 dark:border-amber-800';
        }
        if (btnPlan) {
          btnPlan.className = 'py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200';
        }
        if (resultsSection) resultsSection.classList.remove('hidden');
        if (prizeWrapper) prizeWrapper.classList.remove('hidden');
      }
    }
    window.switchActivityFormMode = switchActivityFormMode;

    export function handleSaveActivity(e) {
      e.preventDefault();
      const id = document.getElementById('act_id').value;
      const formMode = document.getElementById('act_formMode') ? document.getElementById('act_formMode').value : 'plan';

      const g = (formMode === 'completed') ? (parseInt(document.getElementById('act_gold')?.value) || 0) : 0;
      const s = (formMode === 'completed') ? (parseInt(document.getElementById('act_silver')?.value) || 0) : 0;
      const b = (formMode === 'completed') ? (parseInt(document.getElementById('act_bronze')?.value) || 0) : 0;
      const bWard = parseInt(document.getElementById('act_budgetWard')?.value) || 0;
      const bPrize = (formMode === 'completed') ? (parseInt(document.getElementById('act_budgetPrize')?.value) || 0) : 0;

      const rawTitle = document.getElementById('act_title').value;
      const cleanTitle = normalizeTitle(rawTitle);

      const rawCode = document.getElementById('act_code').value;
      const cleanCode = normalizeCode(rawCode, state.activities.length);

      const rawDate = document.getElementById('act_date').value;
      const cleanDate = normalizeDate(rawDate);
      const year = extractYearFromDate(cleanDate);
      const quarter = extractQuarterFromDate(cleanDate);

      const rawSport = document.getElementById('act_sport').value;
      const sport = rawSport.trim() ? normalizeTitle(rawSport) : autoDetectSport(cleanTitle);

      const rawNote = (formMode === 'completed' && document.getElementById('act_note')) ? document.getElementById('act_note').value.trim() : '';
      const planTypeVal = document.getElementById('act_planType') ? document.getElementById('act_planType').value : 'plan';
      const refPlanVal = document.getElementById('act_refPlan') ? document.getElementById('act_refPlan').value.trim() : '';
      const isReportedChecked = (formMode === 'completed' && document.getElementById('act_isReported')) ? document.getElementById('act_isReported').checked : false;
      const prevAct = id ? state.activities.find(a => a.id === id) : null;
      let reportedInReport = prevAct ? prevAct.reportedInReport : null;
      if (isReportedChecked && !reportedInReport) {
        reportedInReport = 'Đã xác nhận';
      } else if (!isReportedChecked) {
        reportedInReport = null;
      }

      const isCompleted = (formMode === 'completed');
      const statusVal = isCompleted ? 'Đã hoàn thành' : (prevAct && prevAct.status === 'Đang diễn ra' ? 'Đang diễn ra' : 'Sắp diễn ra');
      const budgetStatusVal = isCompleted ? 'Đã quyết toán' : 'Dự toán';

      const item = {
        id: id || 'act-' + Date.now(),
        code: cleanCode,
        title: cleanTitle,
        sport: sport,
        category: document.getElementById('act_category').value,
        planType: planTypeVal,
        refPlan: refPlanVal || (planTypeVal === 'plan' ? 'Kế hoạch năm' : 'Phát sinh ngoài kế hoạch'),
        date: cleanDate,
        year: year,
        quarter: quarter,
        month: parseInt(cleanDate.split('/')[1]) || 1,
        participants: parseInt(document.getElementById('act_participants').value) || 0,
        participantsUnit: 'VĐV',
        location: normalizeTitle(document.getElementById('act_location').value),
        achievementNote: rawNote,
        isReported: isReportedChecked,
        reportedInReport: reportedInReport,
        status: statusVal,
        goldMedals: g,
        silverMedals: s,
        bronzeMedals: b,
        totalMedals: g + s + b,
        budgetWard: bWard,
        budgetPrize: bPrize,
        budgetTotal: bWard + bPrize,
        budgetStatus: budgetStatusVal
      };

      if (id) {
        const idx = state.activities.findIndex(a => a.id === id);
        if (idx !== -1) state.activities[idx] = item;
      } else {
        state.activities.unshift(item);
      }
      state.activities = sortActivitiesByLatest(state.activities);
      saveAll();
      window.closeModal();
      showToast('Đã lưu thành công', `Giải đấu "${item.title}" (${item.status}) đã được lưu trữ.`);
      window.renderApp();
    }

    export function confirmDeleteActivity(id) {
      const item = state.activities.find(a => a.id === id);
      if (!item) return;

      const removedIndex = state.activities.findIndex(a => a.id === id);
      state.activities = state.activities.filter(a => a.id !== id);
      saveAll();
      window.renderApp();

      triggerSafeDelete({
        itemName: item.title,
        duration: 5000,
        onUndo: () => {
          state.activities.splice(removedIndex, 0, item);
          saveAll();
          showToast('Đã phục hồi', `Đã khôi phục giải đấu "${item.title}".`);
          window.renderApp();
        },
        onCommit: () => {
          saveAll();
          showToast('Đã xóa vĩnh viễn', `Đã hoàn tất xóa giải đấu "${item.title}".`, 'info');
        }
      });
    }

    export function openSyncModal() {
      const modal = document.createElement('div');
      modal.id = 'modalContainer';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm';
      modal.innerHTML = `
        <div class="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-left max-h-[90vh] overflow-y-auto modal-animate">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                <span class="material-symbols-outlined text-[20px]">cloud_sync</span>
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">Cấu Hình Đồng Bộ Google Sheet (Drive)</h3>
                <p class="text-[11px] text-slate-400">Kết nối cơ sở dữ liệu trên Google Drive của bạn</p>
              </div>
            </div>
            <button onclick="window.closeModal()" class="p-1 rounded-lg text-slate-400"><span class="material-symbols-outlined">close</span></button>
          </div>

          <div class="mt-4 space-y-4 text-xs">
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <span class="text-slate-400 text-[10px]">Google Spreadsheet Target ID:</span>
                <p class="font-mono font-bold text-slate-800 dark:text-slate-200">${SPREADSHEET_ID}</p>
                <p class="text-[10px] text-emerald-600 font-semibold">Sheet lưu trữ: "Database_TDTT" & "Backup_TDTT"</p>
              </div>
              <a href="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}" target="_blank" class="p-2 text-brand-700 hover:bg-brand-50 rounded-xl" title="Mở Sheet trên Google Drive">
                <span class="material-symbols-outlined text-[18px]">open_in_new</span>
              </a>
            </div>

            <div>
              <label class="block font-bold mb-1">Google Apps Script Web App URL:</label>
              <div class="flex gap-2">
                <input id="sync_api_url" type="url" value="${state.apiUrl}" placeholder="https://script.google.com/macros/s/.../exec" class="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs" />
                <button onclick="saveApiUrl()" class="px-4 py-2 bg-brand-700 text-white font-bold rounded-xl cursor-pointer btn-press">Lưu URL</button>
              </div>
              <p class="text-[10px] text-slate-400 mt-1">Dán link triển khai Web App từ file Code.gs (Quyền: <i>Anyone / Bất kỳ ai</i>).</p>
            </div>

            <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div>
                <p class="font-bold">Tự động đồng bộ ngầm</p>
                <p class="text-[10px] text-slate-400">Tự động gửi lên Drive mỗi khi bạn thêm hoặc chỉnh sửa</p>
              </div>
              <input type="checkbox" ${state.autoSync ? 'checked' : ''} onchange="toggleAutoSync(this.checked)" class="w-4 h-4 accent-brand-700 cursor-pointer" />
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2">
              <button onclick="pushToGoogleSheet(true)" class="py-2.5 px-3 bg-brand-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer btn-press">
                <span class="material-symbols-outlined text-[16px]">cloud_upload</span>
                <span>Ghi lên Google Sheet</span>
              </button>
              <button onclick="pullFromGoogleSheet()" class="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer btn-press">
                <span class="material-symbols-outlined text-[16px]">cloud_download</span>
                <span>Nạp lại từ Sheet</span>
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      animateModalOpen();
    }

    export function closeModal() {
      animateModalClose();
    }

