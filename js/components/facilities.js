import { normalizeTitle } from '../utils/formatters.js';
// ==============================================================================
// COMPONENT: CƠ SỞ VẬT CHẤT & SÂN BÃI (FACILITIES) - FULL CRUD
// ==============================================================================

import { state, saveAll } from '../state.js';
import { showToast } from '../utils/toast.js';

    export function renderFacilities() {
      return `
        <div class="space-y-6 tab-pane-animate text-left">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2.5">
                <h1 class="text-xl sm:text-2xl font-sport font-black tracking-wide text-slate-900 dark:text-white uppercase leading-none">
                  CƠ SỞ VẬT CHẤT & SÂN BÃI THỂ THAO
                </h1>
                <span class="px-2 py-0.5 rounded text-[10px] font-sport font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  ${state.facilities.length} ĐỊA ĐIỂM
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1">
                Hệ thống sân bãi, nhà thi đấu do Trung tâm Dịch vụ tổng hợp UBND phường Tân Khai quản lý và vận hành
              </p>
            </div>
            <button onclick="openFacilityModal()" class="btn-top-tier px-3.5 py-1.5 font-sport font-bold text-xs tracking-wider rounded-lg flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[17px]">add_location_alt</span>
              <span>THÊM CƠ SỞ MỚI</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            ${state.facilities.map(f => `
              <div class="luxury-card p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div class="flex items-start justify-between">
                    <div>
                      <span class="px-2 py-0.5 rounded font-sport font-bold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">${f.type}</span>
                      <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-2 leading-snug">${f.name}</h3>
                      <p class="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium"><span class="material-symbols-outlined text-[15px] text-blue-500">location_on</span>${f.location}</p>
                    </div>
                    <span class="px-2.5 py-1 rounded font-sport font-bold text-xs ${f.status === 'Hoạt động tốt' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                      ● ${f.status.toUpperCase()}
                    </span>
                  </div>

                  <div class="mt-4 space-y-1.5">
                    <div class="flex justify-between text-xs font-semibold">
                      <span class="text-slate-500">Tỷ lệ khai thác sử dụng</span>
                      <span class="text-blue-600 dark:text-blue-400 font-mono font-bold">${f.usageRate || 75}%</span>
                    </div>
                    <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div class="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500" style="width: ${f.usageRate || 75}%"></div>
                    </div>
                  </div>

                  <p class="text-xs text-slate-600 dark:text-slate-400 mt-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 font-medium">${f.note || 'Cơ sở phục vụ hoạt động TDTT cộng đồng.'}</p>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 font-medium">
                  <span>Sức chứa: <b class="text-slate-800 dark:text-slate-200 font-mono">${f.capacity} người</b></span>
                  <span>Quản lý: <b class="text-slate-800 dark:text-slate-200">${f.manager || 'Cán bộ TDTT'}</b></span>
                  <div class="flex items-center gap-1">
                    <button onclick="openFacilityModal('${f.id}')" title="Sửa" class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 transition-colors btn-press"><span class="material-symbols-outlined text-[17px]">edit</span></button>
                    <button onclick="confirmDeleteFacility('${f.id}')" title="Xóa" class="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors btn-press"><span class="material-symbols-outlined text-[17px]">delete</span></button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    export function openFacilityModal(facId = null) {
      const fac = facId ? state.facilities.find(f => f.id === facId) : null;
      const modal = document.createElement('div');
      modal.id = 'modalContainer';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm';
      modal.innerHTML = `
        <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 modal-animate text-left">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">${fac ? 'Chỉnh Sửa Cơ Sở Vật Chất' : 'Thêm Cơ Sở Vật Chất Mới'}</h3>
              <p class="text-[11px] text-slate-400">Sân bãi và công trình thể thao công cộng</p>
            </div>
            <button onclick="window.closeModal()" class="p-1 rounded-lg text-slate-400"><span class="material-symbols-outlined">close</span></button>
          </div>

          <form onsubmit="handleSaveFacility(event)" class="mt-4 space-y-3.5 text-xs">
            <input type="hidden" id="fac_id" value="${fac ? fac.id : ''}" />

            <div>
              <label class="block font-bold mb-1">Tên cơ sở vật chất <span class="text-rose-500">*</span></label>
              <input id="fac_name" type="text" required value="${fac ? fac.name : ''}" placeholder="Ví dụ: Sân vận động trung tâm phường..." class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Loại hình cơ sở</label>
                <select id="fac_type" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <option value="Sân vận động" ${fac && fac.type === 'Sân vận động' ? 'selected' : ''}>Sân vận động</option>
                  <option value="Nhà thi đấu" ${fac && fac.type === 'Nhà thi đấu' ? 'selected' : ''}>Nhà thi đấu</option>
                  <option value="Hồ bơi" ${fac && fac.type === 'Hồ bơi' ? 'selected' : ''}>Hồ bơi</option>
                  <option value="Sân ngoài trời" ${fac && fac.type === 'Sân ngoài trời' ? 'selected' : ''}>Sân ngoài trời</option>
                  <option value="Công viên TDTT" ${fac && fac.type === 'Công viên TDTT' ? 'selected' : ''}>Công viên TDTT</option>
                </select>
              </div>
              <div>
                <label class="block font-bold mb-1">Địa điểm / Khu phố <span class="text-rose-500">*</span></label>
                <input id="fac_loc" type="text" required value="${fac ? fac.location : 'Khu phố 1, Phường Tân Khai'}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-bold mb-1">Sức chứa (người)</label>
                <input id="fac_capacity" type="number" min="10" value="${fac ? fac.capacity : 300}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
              <div>
                <label class="block font-bold mb-1">Tỷ lệ khai thác (%)</label>
                <input id="fac_usage" type="number" min="0" max="100" value="${fac ? (fac.usageRate || 80) : 80}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
              <div>
                <label class="block font-bold mb-1">Cán bộ quản lý</label>
                <input id="fac_manager" type="text" value="${fac ? (fac.manager || 'Cán bộ TDTT') : 'Nguyễn Văn Minh'}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
            </div>

            <div>
              <label class="block font-bold mb-1">Tình trạng cơ sở</label>
              <select id="fac_status" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <option value="Hoạt động tốt" ${!fac || fac.status === 'Hoạt động tốt' ? 'selected' : ''}>Hoạt động tốt</option>
                <option value="Bảo trì định kỳ" ${fac && fac.status === 'Bảo trì định kỳ' ? 'selected' : ''}>Bảo trì định kỳ</option>
                <option value="Cần nâng cấp" ${fac && fac.status === 'Cần nâng cấp' ? 'selected' : ''}>Cần nâng cấp</option>
              </select>
            </div>

            <div>
              <label class="block font-bold mb-1">Ghi chú kỹ thuật / Thiết bị</label>
              <textarea id="fac_note" rows="2" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">${fac ? (fac.note || '') : 'Mặt sân cỏ nhân tạo, hệ thống chiếu sáng đạt chuẩn.'}</textarea>
            </div>

            <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button type="button" onclick="window.closeModal()" class="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Hủy</button>
              <button type="submit" class="px-5 py-2 rounded-xl font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-sm btn-press">Lưu cơ sở</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('fac_name')?.addEventListener('blur', function() {
        this.value = normalizeTitle(this.value);
      });
    }

    export function handleSaveFacility(e) {
      e.preventDefault();
      const id = document.getElementById('fac_id').value;
      const item = {
        id: id || 'fac-' + Date.now(),
        name: normalizeTitle(document.getElementById('fac_name').value),
        type: document.getElementById('fac_type').value,
        location: normalizeTitle(document.getElementById('fac_loc').value),
        capacity: parseInt(document.getElementById('fac_capacity').value) || 0,
        usageRate: parseInt(document.getElementById('fac_usage').value) || 0,
        manager: normalizeTitle(document.getElementById('fac_manager').value),
        status: document.getElementById('fac_status').value,
        note: document.getElementById('fac_note').value.trim()
      };

      if (id) {
        const idx = state.facilities.findIndex(f => f.id === id);
        if (idx !== -1) state.facilities[idx] = item;
      } else {
        state.facilities.unshift(item);
      }
      saveAll();
      window.closeModal();
      showToast('Đã lưu cơ sở', `Cơ sở "${item.name}" đã được cập nhật.`);
      window.renderApp();
    }

    export function confirmDeleteFacility(id) {
      if (confirm('Bạn có chắc chắn muốn xóa cơ sở vật chất này?')) {
        state.facilities = state.facilities.filter(f => f.id !== id);
        saveAll();
        showToast('Đã xóa', 'Cơ sở vật chất đã được xóa khỏi danh sách.');
        window.renderApp();
      }
    }

