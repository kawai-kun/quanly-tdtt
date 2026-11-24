// ==============================================================================
// COMPONENT: QUẢN LÝ KINH PHÍ & QUYẾT TOÁN (BUDGET) - FULL CRUD
// ==============================================================================

import { state, saveAll } from '../state.js';
import { showToast } from '../utils/toast.js';
import { formatVNCurrency, normalizeTitle } from '../utils/formatters.js';

    export function renderBudget() {
      const items = state.budgetItems;
      const totalEstimated = items.reduce((acc, b) => acc + (parseInt(b.budgetEstimated) || 0), 0);
      const totalActual = items.reduce((acc, b) => acc + (parseInt(b.budgetActual) || 0), 0);

      // Tính thêm từ activities
      const acts = state.activities;
      const totalWardActs = acts.reduce((acc, a) => acc + (parseInt(a.budgetWard) || 0), 0);
      const totalPrizeActs = acts.reduce((acc, a) => acc + (parseInt(a.budgetPrize) || 0), 0);
      const totalAllDisbursed = totalActual + totalWardActs + totalPrizeActs;

      return `
        <div class="space-y-6 tab-pane-animate text-left">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2.5">
                <h1 class="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  Kinh phí & Quyết toán Thể dục Thể thao
                </h1>
                <span class="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  ${items.length} hạng mục
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1 font-normal">
                Theo dõi phân bổ ngân sách nhà nước, thanh quyết toán và lưu trữ hồ sơ chứng từ theo luật NSNN
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="openBudgetModal()" class="btn-top-tier px-3.5 py-1.5 font-medium text-xs rounded-lg flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[17px]">add_card</span>
                <span>Thêm mục kinh phí</span>
              </button>
              <button onclick="exportAllExcel()" class="btn-glass-tactile px-3.5 py-1.5 font-medium text-xs rounded-lg flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                <span class="material-symbols-outlined text-[17px]">download</span>
                <span class="hidden sm:inline">Xuất Excel</span>
              </button>
            </div>
          </div>

          <!-- Summary Scoreboard Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="luxury-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <span class="font-semibold text-xs text-slate-600 dark:text-slate-300 uppercase tracking-wide">Dự toán ngân sách duyệt</span>
              <p class="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-2 font-mono">${totalEstimated.toLocaleString('vi-VN')} đ</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">Bao gồm ngân sách phường & sự nghiệp</p>
            </div>
            <div class="luxury-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <span class="font-semibold text-xs text-slate-600 dark:text-slate-300 uppercase tracking-wide">Đã thực chi quyết toán</span>
              <p class="text-2xl sm:text-3xl font-bold text-amber-600 mt-2 font-mono">${totalActual.toLocaleString('vi-VN')} đ</p>
              <p class="text-xs text-amber-700 dark:text-amber-400 mt-1 font-normal">Đã hoàn thành thủ tục hóa đơn, chứng từ</p>
            </div>
            <div class="luxury-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <span class="font-semibold text-xs text-slate-600 dark:text-slate-300 uppercase tracking-wide">Tổng giải ngân thể thao toàn diện</span>
              <p class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2 font-mono">${totalAllDisbursed.toLocaleString('vi-VN')} đ</p>
              <p class="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">Đạt 100% chỉ tiêu quyết toán năm</p>
            </div>
          </div>

          <!-- Interactive Budget Table (Sổ Cái Kinh Phí Phân Tách Cột Sắc Nét) -->
          <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
            <table class="referee-table w-full text-left text-sm border-collapse">
              <thead class="bg-slate-900 text-white font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th class="p-3 text-center w-24">MÃ SỐ</th>
                  <th class="p-3 min-w-[240px]">HẠNG MỤC KINH PHÍ / HOẠT ĐỘNG</th>
                  <th class="p-3 text-center whitespace-nowrap">NĂM</th>
                  <th class="p-3 text-center whitespace-nowrap">NGUỒN CHI</th>
                  <th class="p-3 text-right whitespace-nowrap">DỰ TOÁN</th>
                  <th class="p-3 text-right whitespace-nowrap">THỰC CHI</th>
                  <th class="p-3 text-center whitespace-nowrap">CHỨNG TỪ / QĐ</th>
                  <th class="p-3 text-center whitespace-nowrap">TRẠNG THÁI</th>
                  <th class="p-3 text-center whitespace-nowrap w-24">THAO TÁC</th>
                </tr>
              </thead>
              <tbody class="text-slate-800 dark:text-slate-200">
                ${items.map(b => `
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td class="p-3 text-center font-mono font-medium text-emerald-700 dark:text-emerald-400">${b.code}</td>
                    <td class="p-3 min-w-[240px] max-w-sm">
                      <div class="font-semibold text-slate-800 dark:text-slate-100 leading-snug">${b.title}</div>
                      ${b.note ? `<p class="text-xs text-slate-500 font-normal mt-0.5">${b.note}</p>` : ''}
                    </td>
                    <td class="p-3 font-mono font-medium text-center">${b.year}</td>
                    <td class="p-3 text-center"><span class="px-2 py-0.5 rounded font-medium text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${b.source}</span></td>
                    <td class="p-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">${(parseInt(b.budgetEstimated) || 0).toLocaleString('vi-VN')} đ</td>
                    <td class="p-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">${(parseInt(b.budgetActual) || 0).toLocaleString('vi-VN')} đ</td>
                    <td class="p-3 text-center font-mono text-slate-500 font-normal">${b.refDoc || 'Chưa lập'}</td>
                    <td class="p-3 text-center">
                      <span class="px-2 py-0.5 rounded font-medium text-xs ${b.status === 'Đã quyết toán' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'}">
                        ● ${b.status}
                      </span>
                    </td>
                    <td class="p-3 text-center whitespace-nowrap">
                      <div class="flex items-center justify-center gap-1">
                        <button onclick="openBudgetModal('${b.id}')" title="Sửa" class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 transition-colors btn-press"><span class="material-symbols-outlined text-[17px]">edit</span></button>
                        <button onclick="confirmDeleteBudgetItem('${b.id}')" title="Xóa" class="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors btn-press"><span class="material-symbols-outlined text-[17px]">delete</span></button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    export function openBudgetModal(budgetId = null) {
      const b = budgetId ? state.budgetItems.find(item => item.id === budgetId) : null;
      const modal = document.createElement('div');
      modal.id = 'modalContainer';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm';
      modal.innerHTML = `
        <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 modal-animate text-left">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">${b ? 'Chỉnh Sửa Mục Kinh Phí' : 'Thêm Mục Kinh Phí Mới'}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Dự toán ngân sách và thanh quyết toán</p>
            </div>
            <button onclick="window.closeModal()" class="p-1 rounded-lg text-slate-400"><span class="material-symbols-outlined">close</span></button>
          </div>

          <form onsubmit="handleSaveBudget(event)" class="mt-4 space-y-3.5 text-xs">
            <input type="hidden" id="bgt_id" value="${b ? b.id : ''}" />

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-bold mb-1">Mã khoản chi</label>
                <input id="bgt_code" type="text" value="${b ? b.code : 'KP-0' + (state.budgetItems.length + 1)}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold" />
              </div>
              <div class="sm:col-span-2">
                <label class="block font-bold mb-1">Tên mục chi / Hoạt động <span class="text-rose-500">*</span></label>
                <input id="bgt_title" type="text" required value="${b ? b.title : ''}" placeholder="Nhập tên hoạt động hoặc mục chi..." class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Năm ngân sách</label>
                <input id="bgt_year" type="number" value="${b ? b.year : new Date().getFullYear()}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold" />
              </div>
              <div>
                <label class="block font-bold mb-1">Nguồn kinh phí</label>
                <select id="bgt_source" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <option value="Ngân sách Phường" ${!b || b.source === 'Ngân sách Phường' ? 'selected' : ''}>Ngân sách Phường</option>
                  <option value="Xã hội hóa & Khen thưởng" ${b && b.source.includes('Xã hội hóa') ? 'selected' : ''}>Xã hội hóa & Khen thưởng</option>
                  <option value="Ngân sách Thành phố hỗ trợ" ${b && b.source.includes('Thành phố') ? 'selected' : ''}>Ngân sách TP hỗ trợ</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Dự toán phê duyệt (VNĐ) <span class="text-rose-500">*</span></label>
                <input id="bgt_est" type="number" min="0" required value="${b ? b.budgetEstimated : 15000000}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-brand-700" />
              </div>
              <div>
                <label class="block font-bold mb-1">Thực chi quyết toán (VNĐ)</label>
                <input id="bgt_act" type="number" min="0" value="${b ? b.budgetActual : 15000000}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-amber-600" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Số chứng từ / QĐ phê duyệt</label>
                <input id="bgt_doc" type="text" value="${b ? b.refDoc : 'QĐ ' + (state.budgetItems.length + 20) + '/QĐ-UBND'}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono" />
              </div>
              <div>
                <label class="block font-bold mb-1">Tình trạng quyết toán</label>
                <select id="bgt_status" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <option value="Đã quyết toán" ${!b || b.status === 'Đã quyết toán' ? 'selected' : ''}>Đã quyết toán</option>
                  <option value="Đang thẩm tra" ${b && b.status === 'Đang thẩm tra' ? 'selected' : ''}>Đang thẩm tra</option>
                  <option value="Dự toán mới" ${b && b.status === 'Dự toán mới' ? 'selected' : ''}>Dự toán mới</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-bold mb-1">Ghi chú nội dung chi</label>
              <textarea id="bgt_note" rows="2" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">${b ? (b.note || '') : 'Hồ sơ hóa đơn, bảng kê chứng từ đầy đủ.'}</textarea>
            </div>

            <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button type="button" onclick="window.closeModal()" class="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Hủy</button>
              <button type="submit" class="px-5 py-2 rounded-xl font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-sm btn-press">Lưu khoản chi</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('bgt_title')?.addEventListener('blur', function() {
        this.value = normalizeTitle(this.value);
      });
    }

    export function handleSaveBudget(e) {
      e.preventDefault();
      const id = document.getElementById('bgt_id').value;
      const item = {
        id: id || 'bgt-' + Date.now(),
        code: document.getElementById('bgt_code').value.trim() || 'KP-0' + (state.budgetItems.length + 1),
        title: normalizeTitle(document.getElementById('bgt_title').value),
        year: parseInt(document.getElementById('bgt_year').value) || new Date().getFullYear(),
        source: document.getElementById('bgt_source').value,
        budgetEstimated: parseInt(document.getElementById('bgt_est').value) || 0,
        budgetActual: parseInt(document.getElementById('bgt_act').value) || 0,
        refDoc: document.getElementById('bgt_doc').value.trim(),
        status: document.getElementById('bgt_status').value,
        note: document.getElementById('bgt_note').value.trim()
      };

      if (id) {
        const idx = state.budgetItems.findIndex(b => b.id === id);
        if (idx !== -1) state.budgetItems[idx] = item;
      } else {
        state.budgetItems.unshift(item);
      }
      saveAll();
      window.closeModal();
      showToast('Đã lưu kinh phí', `Hạng mục "${item.title}" đã được cập nhật.`);
      window.renderApp();
    }

    export function confirmDeleteBudgetItem(id) {
      if (confirm('Bạn có chắc chắn muốn xóa mục kinh phí này?')) {
        state.budgetItems = state.budgetItems.filter(b => b.id !== id);
        saveAll();
        showToast('Đã xóa', 'Hạng mục kinh phí đã được xóa.');
        window.renderApp();
      }
    }


