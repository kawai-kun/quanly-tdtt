import { normalizeTitle } from '../utils/formatters.js';
// ==============================================================================
// COMPONENT: QUẢN LÝ CÂU LẠC BỘ (CLUBS) - FULL CRUD
// ==============================================================================

import { state, saveAll } from '../state.js';
import { showToast } from '../utils/toast.js';
import { getSportBadge } from '../utils/sportBadges.js';

    export function renderClubs() {
      return `
        <div class="space-y-6 tab-pane-animate text-left">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2.5">
                <h1 class="text-2xl sm:text-3xl font-sport font-black tracking-wide text-slate-900 dark:text-white uppercase leading-none">
                  QUẢN LÝ CÂU LẠC BỘ THỂ THAO
                </h1>
                <span class="px-2 py-0.5 rounded text-xs font-sport font-black bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  ${state.clubs.length} CLB TRỰC THUỘC
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1">
                Các câu lạc bộ, hội viên trực thuộc Trung tâm Dịch vụ tổng hợp UBND phường Tân Khai quản lý
              </p>
            </div>
            <button onclick="openClubModal()" class="btn-top-tier px-3.5 py-1.5 font-sport font-bold text-xs tracking-wider rounded-lg flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[17px]">group_add</span>
              <span>THÊM CLB MỚI</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            ${state.clubs.map(c => {
              const badge = getSportBadge(c.sport);
              return `
                <div class="luxury-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between">
                      <div class="w-12 h-12 rounded-xl ${badge.bg} ${badge.text} flex items-center justify-center shadow-xs">
                        <span class="material-symbols-outlined text-[26px]">${badge.icon}</span>
                      </div>
                      <span class="px-2.5 py-0.5 rounded font-sport font-bold text-xs ${c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-200'}">
                        ${c.status === 'active' ? 'HOẠT ĐỘNG' : 'TẠM DỪNG'}
                      </span>
                    </div>
                    <h3 class="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-3.5 leading-snug">${c.name}</h3>
                    <p class="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5 font-sport uppercase tracking-wider">MÔN: ${c.sport}</p>

                    <div class="mt-4 space-y-1.5 text-sm text-slate-700 dark:text-slate-200 font-medium">
                      <div class="flex justify-between"><span class="text-slate-400">Chủ nhiệm:</span><b class="text-slate-800 dark:text-slate-200">${c.leader}</b></div>
                      <div class="flex justify-between"><span class="text-slate-400">Số ĐT:</span><span class="font-mono">${c.phone || 'Đang cập nhật'}</span></div>
                      <div class="flex justify-between"><span class="text-slate-400">Hội viên:</span><b class="text-blue-600 dark:text-blue-400 font-mono text-sm">${c.membersCount} người</b></div>
                      <div class="flex justify-between"><span class="text-slate-400">Địa bàn:</span><span class="truncate max-w-[170px]">${c.location}</span></div>
                    </div>
                  </div>
                  <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
                    <span class="font-mono text-[11px]">Năm TL: ${c.establishedYear || 2024}</span>
                    <div class="flex items-center gap-1">
                      <button onclick="openClubModal('${c.id}')" title="Sửa CLB" class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 transition-colors btn-press">
                        <span class="material-symbols-outlined text-[17px]">edit</span>
                      </button>
                      <button onclick="confirmDeleteClub('${c.id}')" title="Xóa CLB" class="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors btn-press">
                        <span class="material-symbols-outlined text-[17px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    export function openClubModal(clubId = null) {
      const club = clubId ? state.clubs.find(c => c.id === clubId) : null;
      const modal = document.createElement('div');
      modal.id = 'modalContainer';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm';
      modal.innerHTML = `
        <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 modal-animate text-left">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">${club ? 'Chỉnh Sửa Câu Lạc Bộ' : 'Thêm Câu Lạc Bộ Mới'}</h3>
              <p class="text-[11px] text-slate-400">Thông tin hội viên và ban chủ nhiệm CLB</p>
            </div>
            <button onclick="window.closeModal()" class="p-1 rounded-lg text-slate-400"><span class="material-symbols-outlined">close</span></button>
          </div>

          <form onsubmit="handleSaveClub(event)" class="mt-4 space-y-3.5 text-xs">
            <input type="hidden" id="club_id" value="${club ? club.id : ''}" />
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-bold mb-1">Mã CLB</label>
                <input id="club_code" type="text" value="${club ? club.code : 'CLB-' + String(state.clubs.length + 1).padStart(2, '0')}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold" />
              </div>
              <div class="sm:col-span-2">
                <label class="block font-bold mb-1">Tên CLB <span class="text-rose-500">*</span></label>
                <input id="club_name" type="text" required value="${club ? club.name : ''}" placeholder="Ví dụ: CLB Cầu lông Tân Khai..." class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Môn thể thao</label>
                <input id="club_sport" type="text" required value="${club ? club.sport : 'Bóng đá'}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
              <div>
                <label class="block font-bold mb-1">Chủ nhiệm CLB <span class="text-rose-500">*</span></label>
                <input id="club_leader" type="text" required value="${club ? club.leader : ''}" placeholder="Họ và tên chủ nhiệm" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-bold mb-1">Số điện thoại</label>
                <input id="club_phone" type="text" value="${club ? club.phone : ''}" placeholder="09xx..." class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono" />
              </div>
              <div>
                <label class="block font-bold mb-1">Số hội viên</label>
                <input id="club_members" type="number" min="1" value="${club ? club.membersCount : 25}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
              <div>
                <label class="block font-bold mb-1">Năm thành lập</label>
                <input id="club_year" type="number" value="${club ? (club.establishedYear || 2024) : 2024}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="sm:col-span-2">
                <label class="block font-bold mb-1">Địa bàn sinh hoạt</label>
                <input id="club_loc" type="text" value="${club ? club.location : 'Khu phố 1, Phường Tân Khai'}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
              <div>
                <label class="block font-bold mb-1">Trạng thái</label>
                <select id="club_status" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <option value="active" ${!club || club.status === 'active' ? 'selected' : ''}>Hoạt động</option>
                  <option value="paused" ${club && club.status === 'paused' ? 'selected' : ''}>Tạm dừng</option>
                </select>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button type="button" onclick="window.closeModal()" class="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Hủy</button>
              <button type="submit" class="px-5 py-2 rounded-xl font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-sm btn-press">Lưu CLB</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('club_name')?.addEventListener('blur', function() {
        this.value = normalizeTitle(this.value);
      });
      document.getElementById('club_leader')?.addEventListener('blur', function() {
        this.value = normalizeTitle(this.value);
      });
    }

    export function handleSaveClub(e) {
      e.preventDefault();
      const id = document.getElementById('club_id').value;
      const item = {
        id: id || 'club-' + Date.now(),
        code: document.getElementById('club_code').value.trim() || 'CLB-0' + (state.clubs.length + 1),
        name: normalizeTitle(document.getElementById('club_name').value),
        sport: normalizeTitle(document.getElementById('club_sport').value),
        leader: normalizeTitle(document.getElementById('club_leader').value),
        phone: document.getElementById('club_phone').value.trim(),
        membersCount: parseInt(document.getElementById('club_members').value) || 0,
        establishedYear: parseInt(document.getElementById('club_year').value) || 2024,
        location: normalizeTitle(document.getElementById('club_loc').value),
        status: document.getElementById('club_status').value
      };

      if (id) {
        const idx = state.clubs.findIndex(c => c.id === id);
        if (idx !== -1) state.clubs[idx] = item;
      } else {
        state.clubs.unshift(item);
      }
      saveAll();
      window.closeModal();
      showToast('Đã lưu CLB', `Câu lạc bộ "${item.name}" đã được cập nhật.`);
      window.renderApp();
    }

    export function confirmDeleteClub(id) {
      const c = state.clubs.find(item => item.id === id);
      if (confirm(`Bạn có chắc chắn muốn xóa "${c ? c.name : 'CLB này'}"?`)) {
        state.clubs = state.clubs.filter(item => item.id !== id);
        saveAll();
        showToast('Đã xóa CLB', 'Câu lạc bộ đã được xóa khỏi hệ thống.');
        window.renderApp();
      }
    }


