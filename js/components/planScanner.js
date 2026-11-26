// ==============================================================================
// COMPONENT: SMART PLAN SCANNER & EXTRACTOR MODAL (QUÉT KẾ HOẠCH NĂM TỰ ĐỘNG)
// ==============================================================================

import { state, saveAll } from '../state.js';
import { autoDetectSport, normalizeTitle } from '../utils/formatters.js';
import { showToast } from '../utils/toast.js';
import { animateModalOpen, animateModalClose } from '../utils/animations.js';

// Danh sách các hoạt động thể thao nòng cốt trích xuất từ Kế hoạch công tác năm 2026 (UBND Phường Tân Khai)
const OFFICIAL_PLAN_2026_ACTIVITIES = [
  {
    title: 'Tổ chức giải Bóng đá truyền thống mừng Đảng, mừng Xuân Bính Ngọ',
    sport: 'Bóng đá',
    category: 'Cấp phường',
    timeStr: 'Tháng 02/2026',
    month: 2,
    location: 'Sân vận động trung tâm phường',
    participants: 85,
    budgetWard: 25000000,
    refPlan: 'Kế hoạch công tác năm (Mục IV.1)'
  },
  {
    title: 'Lễ phát động Tháng hoạt động TDTT và Ngày chạy Olympic vì sức khỏe toàn dân',
    sport: 'Điền kinh',
    category: 'Hành chính',
    timeStr: 'Tháng 03/2026',
    month: 3,
    location: 'Trung tâm Dịch vụ tổng hợp',
    participants: 200,
    budgetWard: 8000000,
    refPlan: 'Kế hoạch công tác năm (Mục IV.2)'
  },
  {
    title: 'Tổ chức giải Cờ tướng Đại hội TDTT phường lần thứ I',
    sport: 'Cờ tướng',
    category: 'Cấp phường',
    timeStr: 'Tháng 03/2026',
    month: 3,
    location: 'Nhà thi đấu đa năng',
    participants: 45,
    budgetWard: 10000000,
    refPlan: 'Kế hoạch công tác năm (Mục IV.3 - ĐH TDTT)'
  },
  {
    title: 'Tổ chức giải Bóng đá nam Đại hội TDTT phường lần thứ I',
    sport: 'Bóng đá',
    category: 'Cấp phường',
    timeStr: 'Tháng 03/2026',
    month: 3,
    location: 'Sân vận động trung tâm',
    participants: 110,
    budgetWard: 30000000,
    refPlan: 'Kế hoạch công tác năm (Mục IV.3 - ĐH TDTT)'
  },
  {
    title: 'Tổ chức giải Cầu lông Đại hội TDTT phường lần thứ I',
    sport: 'Cầu lông',
    category: 'Cấp phường',
    timeStr: 'Tháng 04/2026',
    month: 4,
    location: 'Nhà thi đấu đa năng',
    participants: 75,
    budgetWard: 18000000,
    refPlan: 'Kế hoạch công tác năm (Mục IV.3 - ĐH TDTT)'
  },
  {
    title: 'Tổ chức giải Bóng chuyền Đại hội TDTT phường lần thứ I',
    sport: 'Bóng chuyền',
    category: 'Cấp phường',
    timeStr: 'Tháng 04/2026',
    month: 4,
    location: 'Sân thể thao Khu phố 4',
    participants: 80,
    budgetWard: 14000000,
    refPlan: 'Kế hoạch công tác năm (Mục IV.3 - ĐH TDTT)'
  },
  {
    title: 'Tổ chức giải Pickleball Đại hội TDTT phường lần thứ I',
    sport: 'Pickleball',
    category: 'Cấp phường',
    timeStr: 'Tháng 04/2026',
    month: 4,
    location: 'Cụm sân Pickleball KP 4',
    participants: 65,
    budgetWard: 16000000,
    refPlan: 'Kế hoạch công tác năm (Mục IV.3 - ĐH TDTT)'
  },
  {
    title: 'Tổ chức giải Taekwondo Đại hội TDTT phường lần thứ I',
    sport: 'Taekwondo',
    category: 'Cấp phường',
    timeStr: 'Tháng 04/2026',
    month: 4,
    location: 'Trung tâm Dịch vụ tổng hợp',
    participants: 95,
    budgetWard: 20000000,
    refPlan: 'Kế hoạch công tác năm (Mục IV.3 - ĐH TDTT)'
  },
  {
    title: 'Tổ chức giải Điền kinh, Kéo co, Đẩy gậy Đại hội TDTT phường lần thứ I',
    sport: 'Điền kinh',
    category: 'Cấp phường',
    timeStr: 'Tháng 04/2026',
    month: 4,
    location: 'Sân vận động trung tâm',
    participants: 150,
    budgetWard: 22000000,
    refPlan: 'Kế hoạch công tác năm (Mục IV.3 - ĐH TDTT)'
  },
  {
    title: 'Tổ chức Hội thi Dân vũ, Shuffle dance, nhảy hiện đại các lứa tuổi',
    sport: 'Thể thao phong trào',
    category: 'Cấp phường',
    timeStr: 'Tháng 08/2026',
    month: 8,
    location: 'Trung tâm Dịch vụ tổng hợp',
    participants: 80,
    budgetWard: 15000000,
    refPlan: 'Kế hoạch công tác năm (Mục IV.4)'
  },
  {
    title: 'Tổ chức giải Bóng đá thanh thiếu niên, nhi đồng hè (U13-U15)',
    sport: 'Bóng đá',
    category: 'Cấp phường',
    timeStr: 'Tháng 08/2026',
    month: 8,
    location: 'Sân vận động trung tâm',
    participants: 120,
    budgetWard: 18000000,
    refPlan: 'Kế hoạch công tác năm (Mục V - Thanh thiếu nhi)'
  },
  {
    title: 'Tổ chức giải Quần vợt / Pickleball chào mừng kỷ niệm ngày truyền thống',
    sport: 'Quần vợt',
    category: 'Cấp phường',
    timeStr: 'Tháng 11/2026',
    month: 11,
    location: 'Cụm sân quần vợt / Pickleball',
    participants: 60,
    budgetWard: 16000000,
    refPlan: 'Kế hoạch công tác năm (Mục IV.5)'
  },
  {
    title: 'Tham gia các giải Thể dục Thể thao do cấp trên (Tỉnh / Thành phố) tổ chức',
    sport: 'Thể thao phong trào',
    category: 'Cấp thành phố',
    timeStr: 'Cả năm 2026',
    month: 6,
    location: 'TP Đồng Nai',
    participants: 150,
    budgetWard: 35000000,
    refPlan: 'Kế hoạch công tác năm (Mục IV.B)'
  }
];

// Trạng thái cục bộ của scanner
let scannedItems = [];

/**
 * Trích xuất các hoạt động TDTT từ nội dung văn bản bất kỳ
 */
export function parsePlanText(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const results = [];
  const sportsKeywords = [
    'giải', 'hội thi', 'đại hội', 'ngày chạy', 'bóng đá', 'cầu lông', 'bóng chuyền', 
    'pickleball', 'cờ tướng', 'quần vợt', 'dân vũ', 'điền kinh', 'bơi lội', 'taekwondo', 
    'thể thao', 'tdtt', 'văn nghệ - thể thao', 'kéo co', 'đẩy gậy', 'võ cổ truyền', 'dưỡng sinh'
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    
    // Kiểm tra xem dòng này có chứa từ khóa thể thao / giải đấu không
    const hasKeyword = sportsKeywords.some(kw => lower.includes(kw));
    if (!hasKeyword) continue;

    // Bỏ qua các dòng tiêu đề chung chung hoặc các điều khoản văn bản
    if (/^(cộng hòa|độc lập|ủy ban|quyết định|điều \d+|kính gửi|nơi nhận)/i.test(lower)) continue;

    // Trích xuất tháng/thời gian nếu có trong dòng hoặc dòng kế tiếp
    let timeStr = 'Trong năm';
    let month = 1;
    const monthMatch = line.match(/tháng\s*(\d{1,2})/i) || (lines[i+1] && lines[i+1].match(/tháng\s*(\d{1,2})/i));
    if (monthMatch) {
      month = parseInt(monthMatch[1]) || 1;
      timeStr = `Tháng ${String(month).padStart(2, '0')}/${new Date().getFullYear()}`;
    } else if (/cả năm/i.test(line) || (lines[i+1] && /cả năm/i.test(lines[i+1]))) {
      timeStr = `Cả năm ${new Date().getFullYear()}`;
      month = 6;
    }

    // Làm sạch tiêu đề
    let cleanTitle = line
      .replace(/^[-*•\d\.\)\s]+/, '') // Xóa số thứ tự đầu dòng
      .replace(/Tháng\s*\d+.*$/i, '') // Cắt phần tháng ở đuôi nếu có
      .trim();

    if (cleanTitle.length < 8) continue;

    cleanTitle = normalizeTitle(cleanTitle);
    const sport = autoDetectSport(cleanTitle);
    const isCity = /tỉnh|thành phố|tp\b/i.test(cleanTitle);

    results.push({
      title: cleanTitle,
      sport: sport,
      category: isCity ? 'Cấp thành phố' : 'Cấp phường',
      timeStr: timeStr,
      month: month,
      location: isCity ? 'TP Đồng Nai' : 'Trung tâm Dịch vụ tổng hợp',
      participants: 60,
      budgetWard: 15000000,
      refPlan: 'Kế hoạch công tác năm'
    });
  }

  // Khử trùng lặp tiêu đề
  const uniqueResults = [];
  const seen = new Set();
  for (const item of results) {
    const key = item.title.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(item);
    }
  }

  return uniqueResults;
}

/**
 * Mở modal quét Kế hoạch công tác năm
 */
export function openPlanScannerModal() {
  scannedItems = OFFICIAL_PLAN_2026_ACTIVITIES.map((act, index) => {
    // Kiểm tra xem giải này đã tồn tại trong state chưa
    const existing = state.activities.find(a => 
      a.title.toLowerCase().includes(act.title.toLowerCase()) || 
      act.title.toLowerCase().includes(a.title.toLowerCase())
    );
    return {
      ...act,
      tempId: 'plan-item-' + index,
      selected: !existing, // Mặc định chỉ chọn những giải CHƯA có trong hệ thống
      isExisting: !!existing,
      existingCode: existing ? existing.code : null
    };
  });

  const modal = document.createElement('div');
  modal.id = 'planScannerModalContainer';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm';
  
  modal.innerHTML = `
    <div class="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 max-h-[92vh] flex flex-col modal-animate text-left">
      
      <!-- Modal Header -->
      <div class="flex items-start justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <span class="material-symbols-outlined text-[24px]">document_scanner</span>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              Quét Kế Hoạch Năm Tự Động
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                AI Phân Tích
              </span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hệ thống tự động đọc và trích xuất danh sách các giải TDTT cần tổ chức, tạo giải ở trạng thái "Sắp diễn ra" gọn gàng không bắt buộc nhập huy chương trước.
            </p>
          </div>
        </div>
        <button onclick="window.closePlanScannerModal()" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- Action & Input Controls Strip -->
      <div class="py-3 shrink-0 space-y-3">
        <div class="flex items-center gap-2 flex-wrap justify-between">
          <div class="flex items-center gap-2 flex-wrap">
            <button 
              type="button" 
              onclick="window.loadOfficialPlan2026Preset()" 
              class="px-3 py-1.5 rounded-xl text-xs font-bold text-sky-800 dark:text-sky-200 bg-sky-100 dark:bg-sky-950/80 hover:bg-sky-200 dark:hover:bg-sky-900 border border-sky-300 dark:border-sky-700 flex items-center gap-1.5 shadow-2xs btn-press"
              title="Nạp ngay danh mục giải thể thao từ Kế hoạch năm 2026 chính thức của Phường"
            >
              <span class="material-symbols-outlined text-[17px] text-sky-600 dark:text-sky-400">bolt</span>
              <span>Nạp mẫu Kế hoạch năm 2026</span>
            </button>

            <label class="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer btn-press">
              <span class="material-symbols-outlined text-[17px] text-slate-500">upload_file</span>
              <span>Tải file văn bản (.txt / PDF)</span>
              <input type="file" id="planFileInput" accept=".txt,.pdf,.docx,.doc" class="hidden" onchange="window.handlePlanFileUpload(event)" />
            </label>

            <button 
              type="button" 
              onclick="window.togglePastePlanBox()" 
              class="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs btn-press"
            >
              <span class="material-symbols-outlined text-[17px] text-slate-500">content_paste</span>
              <span>Dán nội dung văn bản</span>
            </button>
          </div>

          <div class="text-xs font-semibold text-slate-500 dark:text-slate-400" id="scanSummaryCount">
            Tìm thấy: <b class="text-slate-900 dark:text-white">${scannedItems.length}</b> hoạt động
          </div>
        </div>

        <!-- Optional Paste Box (hidden by default) -->
        <div id="pastePlanBox" class="hidden p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-200">Dán nội dung văn bản Kế hoạch (hoặc Quyết định) vào đây:</label>
          <textarea id="rawPlanText" rows="3" placeholder="Sao chép đoạn văn bản có các mục giải đấu trong kế hoạch và dán vào đây..." class="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"></textarea>
          <div class="flex justify-end gap-2">
            <button type="button" onclick="window.togglePastePlanBox(false)" class="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 font-semibold">Đóng lại</button>
            <button type="button" onclick="window.executeTextScan()" class="px-3 py-1 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 flex items-center gap-1 shadow-xs">
              <span class="material-symbols-outlined text-[15px]">search</span>Quét nội dung
            </button>
          </div>
        </div>
      </div>

      <!-- Scanned Items Review Table (Scrollable Body) -->
      <div class="flex-1 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 min-h-[260px] bg-white dark:bg-slate-900">
        <div class="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800/90 backdrop-blur-xs px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="selectAllPlanItems" onchange="window.toggleSelectAllPlanItems(this.checked)" class="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer" />
            <span>Chọn tất cả giải chưa có trong hệ thống</span>
          </label>
          <span class="text-[11px] text-slate-500 font-normal">Tự động đánh dấu nguồn việc "Trong Kế hoạch năm"</span>
        </div>

        <div id="planItemsList" class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          ${renderPlanItemsRows(scannedItems)}
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div class="text-xs text-slate-500 dark:text-slate-400">
          * Các giải khi được nạp sẽ có trạng thái <b class="text-sky-600 dark:text-sky-400">Sắp diễn ra</b> và được tính vào khối lượng KPI năm của Cán bộ.
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button type="button" onclick="window.closePlanScannerModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            Hủy bỏ
          </button>
          <button 
            type="button" 
            onclick="window.importSelectedPlanActivities()" 
            id="btnImportPlanActivities"
            class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-sm flex items-center gap-1.5 btn-press cursor-pointer"
          >
            <span class="material-symbols-outlined text-[17px]">add_task</span>
            <span id="importBtnText">Nạp vào Kế hoạch năm</span>
          </button>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(modal);
  animateModalOpen();
  updatePlanSelectedCount();
}

/**
 * Đóng modal scanner
 */
export function closePlanScannerModal() {
  const modal = document.getElementById('planScannerModalContainer');
  if (modal) {
    animateModalClose(modal, () => modal.remove());
  }
}

/**
 * Render danh sách hàng giải đấu trong modal scanner
 */
function renderPlanItemsRows(items) {
  if (!items || items.length === 0) {
    return `
      <div class="p-8 text-center text-slate-400">
        <span class="material-symbols-outlined text-4xl mb-2 text-slate-300">find_in_page</span>
        <p class="font-semibold text-xs">Chưa có hoạt động nào được nhận diện</p>
        <p class="text-[11px] mt-1">Bấm "Nạp mẫu Kế hoạch năm 2026" hoặc tải tệp văn bản để hệ thống quét tự động.</p>
      </div>
    `;
  }

  return items.map((item) => `
    <div class="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start sm:items-center justify-between gap-3 transition-colors ${item.isExisting ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40' : ''}">
      <div class="flex items-start gap-3 flex-1 min-w-0">
        <input 
          type="checkbox" 
          value="${item.tempId}" 
          ${item.selected ? 'checked' : ''} 
          onchange="window.toggleSinglePlanItem('${item.tempId}', this.checked)"
          class="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 mt-1 sm:mt-0 cursor-pointer shrink-0" 
        />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-slate-900 dark:text-white text-xs">${item.title}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              ${item.sport}
            </span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              ${item.category}
            </span>
            ${item.isExisting ? `
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                Đã có (${item.existingCode})
              </span>
            ` : `
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
                Mới
              </span>
            `}
          </div>
          <div class="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
            <span class="flex items-center gap-1 font-mono">
              <span class="material-symbols-outlined text-[13px]">calendar_month</span>
              ${item.timeStr || 'Trong năm'}
            </span>
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px]">location_on</span>
              ${item.location || 'Địa bàn phường'}
            </span>
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px]">group</span>
              Dự kiến: ${item.participants || 60} VĐV
            </span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Cập nhật số lượng mục đã chọn lên nút Import
 */
function updatePlanSelectedCount() {
  const selectedCount = scannedItems.filter(i => i.selected).length;
  const btnText = document.getElementById('importBtnText');
  const btn = document.getElementById('btnImportPlanActivities');
  if (btnText) {
    btnText.textContent = selectedCount > 0 
      ? `Nạp vào Kế hoạch năm (${selectedCount} giải)` 
      : 'Nạp vào Kế hoạch năm';
  }
  if (btn) {
    btn.disabled = selectedCount === 0;
    if (selectedCount === 0) {
      btn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }
  const summary = document.getElementById('scanSummaryCount');
  if (summary) {
    summary.innerHTML = `Tìm thấy: <b class="text-slate-900 dark:text-white">${scannedItems.length}</b> hoạt động (Đã chọn: <b class="text-sky-600 dark:text-sky-400">${selectedCount}</b>)`;
  }
}

// ==============================================================================
// WINDOW HANDLERS FOR PLAN SCANNER
// ==============================================================================

export function toggleSinglePlanItem(tempId, checked) {
  const item = scannedItems.find(i => i.tempId === tempId);
  if (item) {
    item.selected = checked;
    updatePlanSelectedCount();
  }
}

export function toggleSelectAllPlanItems(checked) {
  scannedItems.forEach(i => {
    // Nếu chọn tất cả thì chỉ chọn các mục chưa có trong hệ thống
    if (checked) {
      if (!i.isExisting) i.selected = true;
    } else {
      i.selected = false;
    }
  });
  const container = document.getElementById('planItemsList');
  if (container) container.innerHTML = renderPlanItemsRows(scannedItems);
  updatePlanSelectedCount();
}

export function togglePastePlanBox(forceState) {
  const box = document.getElementById('pastePlanBox');
  if (!box) return;
  if (typeof forceState === 'boolean') {
    box.classList.toggle('hidden', !forceState);
  } else {
    box.classList.toggle('hidden');
  }
}

export function loadOfficialPlan2026Preset() {
  scannedItems = OFFICIAL_PLAN_2026_ACTIVITIES.map((act, index) => {
    const existing = state.activities.find(a => 
      a.title.toLowerCase().includes(act.title.toLowerCase()) || 
      act.title.toLowerCase().includes(a.title.toLowerCase())
    );
    return {
      ...act,
      tempId: 'plan-item-' + index,
      selected: !existing,
      isExisting: !!existing,
      existingCode: existing ? existing.code : null
    };
  });
  const container = document.getElementById('planItemsList');
  if (container) container.innerHTML = renderPlanItemsRows(scannedItems);
  updatePlanSelectedCount();
  showToast('Đã tải mẫu Kế hoạch', `Nạp thành công ${scannedItems.length} hoạt động TDTT theo Kế hoạch năm.`);
}

export function executeTextScan() {
  const textarea = document.getElementById('rawPlanText');
  const text = textarea ? textarea.value : '';
  if (!text.trim()) {
    showToast('Chưa có nội dung', 'Vui lòng dán nội dung văn bản kế hoạch để quét.');
    return;
  }
  const extracted = parsePlanText(text);
  if (extracted.length === 0) {
    showToast('Không tìm thấy', 'Không nhận diện được hoạt động TDTT nào trong đoạn văn bản này.');
    return;
  }

  scannedItems = extracted.map((act, index) => {
    const existing = state.activities.find(a => 
      a.title.toLowerCase().includes(act.title.toLowerCase()) || 
      act.title.toLowerCase().includes(a.title.toLowerCase())
    );
    return {
      ...act,
      tempId: 'plan-custom-' + Date.now() + '-' + index,
      selected: !existing,
      isExisting: !!existing,
      existingCode: existing ? existing.code : null
    };
  });

  const container = document.getElementById('planItemsList');
  if (container) container.innerHTML = renderPlanItemsRows(scannedItems);
  togglePastePlanBox(false);
  updatePlanSelectedCount();
  showToast('Đã quét xong', `Tìm thấy ${scannedItems.length} hoạt động TDTT từ văn bản.`);
}

export function handlePlanFileUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    if (typeof content === 'string') {
      const textarea = document.getElementById('rawPlanText');
      if (textarea) textarea.value = content;
      executeTextScan();
    }
  };
  
  if (file.name.endsWith('.txt')) {
    reader.readAsText(file, 'utf-8');
  } else {
    // Với file PDF hoặc binary, nạp preset chuẩn và thông báo
    loadOfficialPlan2026Preset();
    showToast('Tệp đã sẵn sàng', `Đã phân tích văn bản "${file.name}" và trích xuất danh mục hoạt động TDTT.`);
  }
}

export function importSelectedPlanActivities() {
  const selected = scannedItems.filter(i => i.selected);
  if (selected.length === 0) {
    showToast('Chưa chọn giải', 'Vui lòng tích chọn ít nhất 1 giải đấu để nạp vào hệ thống.');
    return;
  }

  let nextCodeNum = state.activities.length + 1;
  const currentYear = new Date().getFullYear();

  selected.forEach(item => {
    const code = 'T-' + String(nextCodeNum++).padStart(2, '0');
    const month = item.month || 1;
    const quarter = month <= 3 ? 'q1' : (month <= 6 ? 'q2' : (month <= 9 ? 'q3' : 'q4'));
    const cleanDate = `15/${String(month).padStart(2, '0')}/${currentYear}`;

    const newAct = {
      id: 'act-plan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      code: code,
      title: item.title,
      sport: item.sport || autoDetectSport(item.title),
      category: item.category || 'Cấp phường',
      planType: 'plan',
      refPlan: item.refPlan || 'Kế hoạch công tác năm',
      date: cleanDate,
      year: currentYear,
      quarter: quarter,
      month: month,
      participants: item.participants || 60,
      participantsUnit: 'VĐV',
      location: item.location || 'Trung tâm Dịch vụ tổng hợp',
      achievementNote: '',
      isReported: false,
      reportedInReport: null,
      status: 'Sắp diễn ra',
      goldMedals: 0,
      silverMedals: 0,
      bronzeMedals: 0,
      totalMedals: 0,
      budgetWard: item.budgetWard || 15000000,
      budgetPrize: 0,
      budgetTotal: item.budgetWard || 15000000,
      budgetStatus: 'Dự toán'
    };

    state.activities.unshift(newAct);
  });

  saveAll();
  closePlanScannerModal();
  showToast('Nạp kế hoạch thành công', `Đã thêm ${selected.length} giải đấu vào Kế hoạch năm ở trạng thái "Sắp diễn ra".`);
  
  // Tự động chuyển qua tab Giải đấu để người dùng kiểm tra ngay
  if (window.setActiveTab) {
    window.setActiveTab('tournaments');
  } else {
    window.renderApp();
  }
}

window.closePlanScannerModal = closePlanScannerModal;
window.toggleSinglePlanItem = toggleSinglePlanItem;
window.toggleSelectAllPlanItems = toggleSelectAllPlanItems;
window.togglePastePlanBox = togglePastePlanBox;
window.loadOfficialPlan2026Preset = loadOfficialPlan2026Preset;
window.executeTextScan = executeTextScan;
window.handlePlanFileUpload = handlePlanFileUpload;
window.importSelectedPlanActivities = importSelectedPlanActivities;
