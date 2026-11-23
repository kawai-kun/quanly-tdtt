// ==============================================================================
// COMPONENT: QUẢN LÝ KINH PHÍ & QUYẾT TOÁN (BUDGET) - FULL CRUD
// ==============================================================================

import { state, saveAll } from '../state.js';
import { showToast } from '../utils/toast.js';
import { formatVNCurrency } from '../utils/formatters.js';

       13. TAB 6: QUẢN LÝ KINH PHÍ & QUYẾT TOÁN (BUDGET) - FULL CRUD
       ============================================================================== */
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
        <div class="space-y-6 tab-pane-animate">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                Kinh Phí & Quyết Toán TDTT
              </h1>
              <p class="text-xs text-slate-500 mt-1">
                Theo dõi nguồn kinh phí phân bổ, thanh quyết toán và hồ sơ chứng từ (${items.length} hạng mục)
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="openBudgetModal()" class="px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-glow-brand flex items-center gap-2 cursor-pointer btn-press">
                <span class="material-symbols-outlined text-[18px]">add_card</span>
                <span>Thêm mục kinh phí</span>
              </button>
              <button onclick="exportAllExcel()" class="px-3.5 py-2.5 glass-card border border-slate-200/90 dark:border-slate-800 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer btn-press">
                <span class="material-symbols-outlined text-[18px]">download</span>
                <span class="hidden sm:inline">Xuất Excel</span>
              </button>
            </div>
          </div>

          <!-- Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-5 rounded-3xl glass-card border border-slate-200/90 dark:border-slate-800 shadow-mobbin card-lift">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Dự toán ngân sách duyệt</span>
              <p class="text-2xl font-display font-extrabold text-brand-700 dark:text-brand-400 mt-2">${totalEstimated.toLocaleString('vi-VN')} đ</p>
              <p class="text-[11px] text-slate-400 mt-1">Bao gồm ngân sách phường & sự nghiệp</p>
            </div>
            <div class="p-5 rounded-3xl glass-card border border-slate-200/90 dark:border-slate-800 shadow-mobbin card-lift">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Đã thực chi quyết toán</span>
              <p class="text-2xl font-display font-extrabold text-amber-600 mt-2">${totalActual.toLocaleString('vi-VN')} đ</p>
              <p class="text-[11px] text-amber-700 dark:text-amber-400 mt-1 font-semibold">Đã hoàn thành thủ tục hóa đơn, chứng từ</p>
            </div>
            <div class="p-5 rounded-3xl glass-card border border-slate-200/90 dark:border-slate-800 shadow-mobbin card-lift">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Tổng giải ngân thể thao toàn diện</span>
              <p class="text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-2">${totalAllDisbursed.toLocaleString('vi-VN')} đ</p>
              <p class="text-[11px] text-emerald-600 font-bold mt-1">Đạt 100% chỉ tiêu quyết toán năm</p>
            </div>
          </div>

          <!-- Interactive Budget Table -->
          <div class="overflow-x-auto -webkit-overflow-scrolling-touch rounded-3xl glass-card border border-slate-200/90 dark:border-slate-800 shadow-mobbin">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100/70 dark:bg-slate-900/70 text-slate-500 font-bold border-b border-slate-200/90 dark:border-slate-800">
                <tr>
                  <th class="p-3.5 align-middle whitespace-nowrap w-20">Mã</th>
                  <th class="p-3.5 align-middle min-w-[220px]">Hạng mục kinh phí / Hoạt động</th>
                  <th class="p-3.5 align-middle whitespace-nowrap text-center">Năm</th>
                  <th class="p-3.5 align-middle whitespace-nowrap">Nguồn chi</th>
                  <th class="p-3.5 align-middle whitespace-nowrap text-right">Dự toán</th>
                  <th class="p-3.5 align-middle whitespace-nowrap text-right">Thực chi</th>
                  <th class="p-3.5 align-middle whitespace-nowrap">Chứng từ / QĐ</th>
                  <th class="p-3.5 align-middle whitespace-nowrap text-center">Trạng thái</th>
                  <th class="p-3.5 align-middle whitespace-nowrap text-right w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${items.map(b => `
                  <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="p-3.5 align-middle whitespace-nowrap font-mono font-bold text-brand-700">${b.code}</td>
                    <td class="p-3.5 align-middle min-w-[220px] max-w-sm">
                      <div class="font-bold text-slate-900 dark:text-slate-100 leading-snug">${b.title}</div>
                      ${b.note ? `<p class="text-[10px] text-slate-400 font-normal mt-0.5">${b.note}</p>` : ''}
                    </td>
                    <td class="p-3.5 align-middle whitespace-nowrap font-bold text-center">${b.year}</td>
                    <td class="p-3.5 align-middle whitespace-nowrap"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">${b.source}</span></td>
                    <td class="p-3.5 align-middle whitespace-nowrap text-right font-semibold text-slate-700 dark:text-slate-300">${(parseInt(b.budgetEstimated) || 0).toLocaleString('vi-VN')} đ</td>
                    <td class="p-3.5 align-middle whitespace-nowrap text-right font-bold text-brand-700 dark:text-brand-400">${(parseInt(b.budgetActual) || 0).toLocaleString('vi-VN')} đ</td>
                    <td class="p-3.5 align-middle whitespace-nowrap font-mono text-slate-500">${b.refDoc || 'Chưa lập'}</td>
                    <td class="p-3.5 align-middle whitespace-nowrap text-center">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${b.status === 'Đã quyết toán' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'}">
                        ${b.status}
                      </span>
                    </td>
                    <td class="p-3.5 align-middle whitespace-nowrap text-right space-x-1">
                      <button onclick="openBudgetModal('${b.id}')" title="Sửa" class="p-1.5 rounded-lg text-slate-500 hover:text-brand-700 hover:bg-brand-50 btn-press"><span class="material-symbols-outlined text-[17px]">edit</span></button>
                      <button onclick="confirmDeleteBudgetItem('${b.id}')" title="Xóa" class="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 btn-press"><span class="material-symbols-outlined text-[17px]">delete</span></button>
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
        <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 modal-animate text-left">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">${b ? 'Chỉnh Sửa Mục Kinh Phí' : 'Thêm Mục Kinh Phí Mới'}</h3>
              <p class="text-[11px] text-slate-400">Dự toán ngân sách và thanh quyết toán</p>
            </div>
            <button onclick="closeModal()" class="p-1 rounded-lg text-slate-400"><span class="material-symbols-outlined">close</span></button>
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
              <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Hủy</button>
              <button type="submit" class="px-5 py-2 rounded-xl font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-glow-brand btn-press">Lưu khoản chi</button>
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
      closeModal();
      showToast('Đã lưu kinh phí', `Hạng mục "${item.title}" đã được cập nhật.`);
      renderApp();
    }

export function confirmDeleteBudgetItem(id) {
      if (confirm('Bạn có chắc chắn muốn xóa mục kinh phí này?')) {
        state.budgetItems = state.budgetItems.filter(b => b.id !== id);
        saveAll();
        showToast('Đã xóa', 'Hạng mục kinh phí đã được xóa.');
        renderApp();
      }
    }

    /* ==============================================================================
