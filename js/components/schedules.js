import { getSportBadge } from '../utils/sportBadges.js';
import { normalizeTitle } from '../utils/formatters.js';
// ==============================================================================
// COMPONENT: LỊCH SINH HOẠT & TẬP LUYỆN (SCHEDULES) - FULL CRUD
// ==============================================================================

import { state, saveAll } from '../state.js';
import { showToast } from '../utils/toast.js';

    export function renderSchedules() {
      return `
        <div class="space-y-6 tab-pane-animate">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                Lịch Sinh Hoạt & Tập Luyện
              </h1>
              <p class="text-xs text-slate-500 mt-1">
                Thời khóa biểu tập luyện thể thao định kỳ các câu lạc bộ (${state.schedules.length} lịch)
              </p>
            </div>
            <button onclick="openScheduleModal()" class="px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer btn-press">
              <span class="material-symbols-outlined text-[18px]">more_time</span>
              <span>Thêm lịch mới</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${state.schedules.map(s => {
              const badge = getSportBadge(s.sport || s.clubName);
              return `
                <div class="p-5 rounded-xl glass-card border border-slate-200 dark:border-slate-800 shadow-sm card-lift flex items-start gap-4">
                  <div class="w-12 h-12 rounded-2xl ${badge.bg} ${badge.text} flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-[24px]">${badge.icon}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-lg border border-brand-200/60 dark:border-brand-800/60">${s.days}</span>
                      <div class="flex items-center gap-1">
                        <button onclick="openScheduleModal('${s.id}')" title="Sửa lịch" class="text-slate-400 hover:text-brand-700 p-1 btn-press">
                          <span class="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button onclick="confirmDeleteSchedule('${s.id}')" title="Xóa lịch" class="text-slate-400 hover:text-rose-600 p-1 btn-press">
                          <span class="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">${s.clubName}</h3>
                    <p class="text-xs text-slate-500 mt-1 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">location_on</span>${s.location}</p>
                    <p class="text-xs text-slate-600 dark:text-slate-400 mt-2.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">${s.description}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    export function openScheduleModal(schedId = null) {
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


