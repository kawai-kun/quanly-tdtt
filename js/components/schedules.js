import { getSportBadge } from '../utils/sportBadges.js';
import { normalizeTitle } from '../utils/formatters.js';
// ==============================================================================
// COMPONENT: LỊCH SINH HOẠT & TẬP LUYỆN (SCHEDULES) - FULL CRUD
// ==============================================================================

import { state, saveAll } from '../state.js';
import { showToast } from '../utils/toast.js';

    export function renderSchedules() {
      return `
        <div class="space-y-6 tab-pane-animate text-left">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2.5">
                <h1 class="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  Lịch Sinh hoạt & Tập luyện
                </h1>
                <span class="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  ${state.schedules.length} khung giờ
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1 font-normal">
                Thời khóa biểu tập luyện thể thao định kỳ các câu lạc bộ trực thuộc Trung tâm Dịch vụ tổng hợp
              </p>
            </div>
            <button onclick="openScheduleModal()" class="btn-top-tier px-3.5 py-1.5 font-medium text-xs rounded-lg flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[17px]">more_time</span>
              <span>Thêm lịch mới</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${state.schedules.map(s => {
              const badge = getSportBadge(s.sport || s.clubName);
              return `
                <div class="luxury-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                  <div class="w-12 h-12 rounded-xl ${badge.bg} ${badge.text} flex items-center justify-center shrink-0 shadow-2xs">
                    <span class="material-symbols-outlined text-[26px]">${badge.icon}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 uppercase tracking-wide">${s.days}</span>
                      <div class="flex items-center gap-1">
                        <button onclick="openScheduleModal('${s.id}')" title="Sửa lịch" class="text-slate-400 hover:text-blue-600 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors btn-press">
                          <span class="material-symbols-outlined text-[17px]">edit</span>
                        </button>
                        <button onclick="confirmDeleteSchedule('${s.id}')" title="Xóa lịch" class="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors btn-press">
                          <span class="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <h3 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mt-2 leading-snug">${s.clubName}</h3>
                    <p class="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium"><span class="material-symbols-outlined text-[15px] text-blue-500">location_on</span>${s.location}</p>
                    <p class="text-sm text-slate-700 dark:text-slate-200 mt-3 font-medium bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 font-medium leading-relaxed">${s.description}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    export function openScheduleModal(schedId = null) {
      if (typeof window.requireAdminElevation === 'function' && !state.isAdminElevated) {
        return window.requireAdminElevation(
          () => openScheduleModal(schedId),
          schedId ? 'chỉnh sửa lịch tập luyện' : 'thêm lịch tập luyện mới'
        );
      }
      const sched = schedId ? state.schedules.find(s => s.id === schedId) : null;
      const modal = document.createElement('div');
      modal.id = 'modalContainer';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm';
      modal.innerHTML = `
        <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 modal-animate text-left">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">${sched ? 'Chỉnh Sửa Lịch Sinh Hoạt' : 'Thêm Lịch Sinh Hoạt Mới'}</h3>
              <p class="text-[11px] text-slate-400">Thời gian và địa điểm tập luyện thường xuyên</p>
            </div>
            <button onclick="window.closeModal()" class="p-1 rounded-lg text-slate-400"><span class="material-symbols-outlined">close</span></button>
          </div>

          <form onsubmit="handleSaveSchedule(event)" class="mt-4 space-y-3.5 text-xs">
            <input type="hidden" id="sched_id" value="${sched ? sched.id : ''}" />

            <div>
              <label class="block font-bold mb-1">Tên CLB / Đội thể thao <span class="text-rose-500">*</span></label>
              <input id="sched_club" type="text" required value="${sched ? sched.clubName : ''}" placeholder="Ví dụ: CLB Cầu lông Tân Khai..." class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Môn thể thao</label>
                <input id="sched_sport" type="text" value="${sched ? (sched.sport || 'Cầu lông') : 'Cầu lông'}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
              <div>
                <label class="block font-bold mb-1">Thời gian (Ngày & Giờ) <span class="text-rose-500">*</span></label>
                <input id="sched_days" type="text" required value="${sched ? sched.days : 'Thứ 2, 4, 6 (17:30 - 19:30)'}" placeholder="Ví dụ: Thứ 2, 4, 6 (18:00 - 20:00)" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
            </div>

            <div>
              <label class="block font-bold mb-1">Địa điểm sân bãi</label>
              <input id="sched_loc" type="text" required value="${sched ? sched.location : 'Nhà thi đấu đa năng phường'}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            </div>

            <div>
              <label class="block font-bold mb-1">Nội dung sinh hoạt / Lưu ý</label>
              <textarea id="sched_desc" rows="3" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">${sched ? sched.description : 'Tập luyện kỹ thuật và rèn luyện thể lực phong trào.'}</textarea>
            </div>

            <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button type="button" onclick="window.closeModal()" class="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Hủy</button>
              <button type="submit" class="px-5 py-2 rounded-xl font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-sm btn-press">Lưu lịch</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
    }

    export function handleSaveSchedule(e) {
      e.preventDefault();
      const id = document.getElementById('sched_id').value;
      const item = {
        id: id || 'sched-' + Date.now(),
        clubName: normalizeTitle(document.getElementById('sched_club').value),
        sport: normalizeTitle(document.getElementById('sched_sport').value),
        days: document.getElementById('sched_days').value.trim(),
        location: normalizeTitle(document.getElementById('sched_loc').value),
        description: document.getElementById('sched_desc').value.trim()
      };

      if (id) {
        const idx = state.schedules.findIndex(s => s.id === id);
        if (idx !== -1) state.schedules[idx] = item;
      } else {
        state.schedules.unshift(item);
      }
      saveAll();
      window.closeModal();
      showToast('Đã lưu lịch tập', `Lịch sinh hoạt "${item.clubName}" đã được cập nhật.`);
      window.renderApp();
    }

    export function confirmDeleteSchedule(id) {
      if (confirm('Bạn có chắc chắn muốn xóa lịch sinh hoạt này?')) {
        state.schedules = state.schedules.filter(s => s.id !== id);
        saveAll();
        showToast('Đã xóa', 'Lịch sinh hoạt đã được xóa.');
        window.renderApp();
      }
    }


