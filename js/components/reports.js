// ==============================================================================
// COMPONENT: BÁO CÁO & SỔ LƯU TRỮ (REPORTS & REGISTRY)
// ==============================================================================

import { state, saveAll } from '../state.js';
import { showToast } from '../utils/toast.js';
import { getReportRange, getReportData, getPeriodTitle, getPeriodSubtitle, exportDocxFile } from '../services/docExport.js';
import { getAvailableYears, formatDateVN } from '../utils/formatters.js';

    export function renderReports() {
      const sub = state.reportSubTab || 'document';
      const availableYears = getAvailableYears();

      // Số báo cáo tiếp theo tự động
      const maxRepNum = state.savedReports.reduce((m, r) => Math.max(m, parseInt(r.reportNumber) || 0), 0);
      const nextReportNum = String(maxRepNum + 1).padStart(2, '0');
      const nextReportCode = state.reportMode === 'party' ? `${nextReportNum}/BC-CB` : `${nextReportNum}/BC-TDTT`;

      let activeRep = state.savedReports.find(r => r.id === state.activeReportId) || state.savedReports[0];

      const activeSchedCount = (state.telegramSchedules || []).filter(s => s.enabled).length;
      const totalSchedCount = (state.telegramSchedules || []).length;

      return `
        <div class="space-y-6 tab-pane-animate">
          <!-- Header & Sub-Tab Switcher -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2.5">
                <h1 class="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  Báo cáo & Sổ Lưu trữ Văn bản
                </h1>
                <span class="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Chuẩn hành chính
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1 font-normal">Đơn vị lập: <b>Bộ phận Thể dục thể thao</b> • Trung tâm Dịch vụ tổng hợp UBND Phường Tân Khai</p>
            </div>

            <!-- Sub Tabs & Telegram Config Button -->
            <div class="flex items-center gap-2 flex-wrap">
              <button onclick="openTelegramConfigModal('list')" class="btn-glass-tactile px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${activeSchedCount > 0 ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400'}" title="Quản lý các cấu hình tự động gửi báo cáo qua Telegram">
                <span class="material-symbols-outlined text-[16px] text-sky-500">schedule_send</span>
                <span>Lịch Telegram (${activeSchedCount}/${totalSchedCount})</span>
                ${activeSchedCount > 0 ? `<span class="neon-dot-green-sm"></span>` : ''}
              </button>

              <div class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-inner">
                <button onclick="setReportSubTab('document')" class="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${sub === 'document' ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs ring-1 ring-slate-200 dark:ring-slate-600 font-semibold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}">
                  <span class="material-symbols-outlined text-[16px]">description</span>
                  <span>Văn bản báo cáo</span>
                </button>
                <button onclick="setReportSubTab('registry')" class="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${sub === 'registry' ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs ring-1 ring-slate-200 dark:ring-slate-600 font-semibold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}">
                  <span class="material-symbols-outlined text-[16px]">format_list_numbered</span>
                  <span>Sổ lưu trữ (${state.savedReports.length})</span>
                </button>
              </div>
            </div>
          </div>

          ${sub === 'document' ? renderReportDocumentView(activeRep, nextReportCode, availableYears) : renderReportRegistryView()}
        </div>
      `;
    }

    export function setReportSubTab(tab) {
      state.reportSubTab = tab;
      window.renderApp();
    }

    export function setReportFilter(key, val) {
      state[key] = val;
      saveAll();
      window.renderApp();
    }

        export function renderReportDocumentView(rep, nextCode, availableYears) {
      const isParty = state.reportMode === 'party';
      const range = getReportRange();
      const list = getReportData();
      const periodTitle = getPeriodTitle();
      const periodSubtitle = getPeriodSubtitle();

      const totalActs = list.length;
      const totalParticipants = list.reduce((a, b) => a + (parseInt(b.participants) || 0), 0);
      const totalMedals = list.reduce((a, b) => a + (parseInt(b.totalMedals) || 0), 0);
      const totalGold = list.reduce((a, b) => a + (parseInt(b.goldMedals) || 0), 0);
      const totalSilver = list.reduce((a, b) => a + (parseInt(b.silverMedals) || 0), 0);
      const totalBronze = list.reduce((a, b) => a + (parseInt(b.bronzeMedals) || 0), 0);
      const totalBudget = list.reduce((a, b) => a + (parseInt(b.budgetTotal) || 0), 0);

      // Phân loại hoạt động theo cấp độ
      const sec1 = list.filter(a => a.category === 'Cấp phường');
      const sec2 = list.filter(a => a.category === 'Cấp thành phố');
      const sec3 = list.filter(a => a.category !== 'Cấp phường' && a.category !== 'Cấp thành phố');

      // Đơn vị nhận báo cáo (chuẩn nghiệp vụ: gửi Văn phòng Trung tâm hoặc Phòng Văn hóa, không gửi thẳng UBND phường)
      let recipientText = 'Văn phòng Trung tâm Dịch vụ Tổng hợp phường Tân Khai';
      if (isParty) {
        recipientText = 'Chi bộ Trung tâm Dịch vụ Tổng hợp phường Tân Khai';
      } else if (state.reportRecipient === 'phong_vanhoa') {
        recipientText = 'Phòng Văn hóa và Thông tin';
      }

      const today = new Date();
      const dateLine = `Tân Khai, ngày ${String(today.getDate()).padStart(2, '0')} tháng ${String(today.getMonth() + 1).padStart(2, '0')} năm ${today.getFullYear()}`;
      const code = rep ? rep.code : nextCode;

      return `
        <div class="space-y-4">
          <!-- Control Actions & Period Filters Bar (No-Print) -->
          <div class="no-print p-4 sm:p-5 rounded-xl glass-card border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            <!-- Row 1: Thể thức (Nhà nước / Chi bộ) + Kỳ báo cáo (Tháng, Quý, 6T, 9T, Năm) -->
            <div class="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-200/80 dark:border-slate-800">
              
              <!-- Segmented: Thể thức -->
              <div class="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <button onclick="setReportFilter('reportMode', 'state')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${!isParty ? 'bg-brand-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}">
                  <span class="material-symbols-outlined text-[15px]">account_balance</span>
                  <span>Mẫu Nhà nước</span>
                </button>
                <button onclick="setReportFilter('reportMode', 'party')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${isParty ? 'bg-red-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}">
                  <span class="material-symbols-outlined text-[15px]">flag</span>
                  <span>Mẫu Chi bộ</span>
                </button>
              </div>

              <!-- Filter Selector: Kỳ báo cáo -->
              <div class="flex items-center gap-2 flex-wrap">
                <div class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                  <button onclick="setReportFilter('reportPeriod', 'month')" class="px-2.5 py-1 rounded-xl font-bold transition-all ${state.reportPeriod === 'month' ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-400 shadow-sm' : 'text-slate-500'}">Tháng</button>
                  <button onclick="setReportFilter('reportPeriod', 'quarter')" class="px-2.5 py-1 rounded-xl font-bold transition-all ${state.reportPeriod === 'quarter' ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-400 shadow-sm' : 'text-slate-500'}">Quý</button>
                  <button onclick="setReportFilter('reportPeriod', 'half')" class="px-2.5 py-1 rounded-xl font-bold transition-all ${state.reportPeriod === 'half' ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-400 shadow-sm' : 'text-slate-500'}">6 Tháng</button>
                  <button onclick="setReportFilter('reportPeriod', 'nine')" class="px-2.5 py-1 rounded-xl font-bold transition-all ${state.reportPeriod === 'nine' ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-400 shadow-sm' : 'text-slate-500'}">9 Tháng</button>
                  <button onclick="setReportFilter('reportPeriod', 'year')" class="px-2.5 py-1 rounded-xl font-bold transition-all ${state.reportPeriod === 'year' ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-400 shadow-sm' : 'text-slate-500'}">Cả Năm</button>
                </div>
              </div>

            </div>

            <!-- Row 2: Bộ chọn chi tiết (Tháng/Quý/Năm) & Cơ quan nhận báo cáo -->
            <div class="flex flex-wrap items-center justify-between gap-3 text-xs">
              
              <div class="flex items-center gap-2 flex-wrap">
                ${state.reportPeriod === 'month' ? `
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-slate-500">Tháng:</span>
                    <select onchange="setReportFilter('reportMonth', parseInt(this.value))" class="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-brand-700 dark:text-brand-400">
                      ${Array.from({length: 12}, (_, i) => i + 1).map(m => `
                        <option value="${m}" ${state.reportMonth === m ? 'selected' : ''}>Tháng ${m}</option>
                      `).join('')}
                    </select>
                  </div>
                ` : ''}

                ${state.reportPeriod === 'quarter' ? `
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-slate-500">Quý:</span>
                    <select onchange="setReportFilter('reportQuarter', parseInt(this.value))" class="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-brand-700 dark:text-brand-400">
                      <option value="1" ${state.reportQuarter === 1 ? 'selected' : ''}>Quý I (Tháng 1-3)</option>
                      <option value="2" ${state.reportQuarter === 2 ? 'selected' : ''}>Quý II (Tháng 4-6)</option>
                      <option value="3" ${state.reportQuarter === 3 ? 'selected' : ''}>Quý III (Tháng 7-9)</option>
                      <option value="4" ${state.reportQuarter === 4 ? 'selected' : ''}>Quý IV (Tháng 10-12)</option>
                    </select>
                  </div>
                ` : ''}

                ${state.reportPeriod === 'half' ? `
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-slate-500">Giai đoạn:</span>
                    <select onchange="setReportFilter('reportHalf', parseInt(this.value))" class="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-brand-700 dark:text-brand-400">
                      <option value="1" ${state.reportHalf === 1 ? 'selected' : ''}>6 tháng đầu năm (Tháng 1-6)</option>
                      <option value="2" ${state.reportHalf === 2 ? 'selected' : ''}>6 tháng cuối năm (Tháng 7-12)</option>
                    </select>
                  </div>
                ` : ''}

                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-slate-500">Năm:</span>
                  <select onchange="setReportFilter('reportYear', parseInt(this.value))" class="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold">
                    ${availableYears.map(y => `
                      <option value="${y}" ${state.reportYear === y ? 'selected' : ''}>${y}</option>
                    `).join('')}
                  </select>
                </div>

                <!-- Đơn vị nhận báo cáo (chỉ hiển thị khi ở chế độ Nhà nước) -->
                ${!isParty ? `
                  <div class="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
                    <span class="font-bold text-slate-500">Gửi đến:</span>
                    <select onchange="setReportFilter('reportRecipient', this.value)" class="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
                      <option value="vp_trungtam" ${state.reportRecipient === 'vp_trungtam' ? 'selected' : ''}>Văn phòng Trung tâm Dịch vụ Tổng hợp</option>
                      <option value="phong_vanhoa" ${state.reportRecipient === 'phong_vanhoa' ? 'selected' : ''}>Phòng Văn hóa và Thông tin</option>
                    </select>
                  </div>
                ` : ''}
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-2 flex-wrap">
                <button onclick="saveCurrentReportAsNew()" class="btn-glass-tactile px-3.5 py-1.5 font-sport font-bold text-xs tracking-wider rounded-lg flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400" title="Lưu báo cáo vào Sổ lưu trữ">
                  <span class="material-symbols-outlined text-[16px]">bookmark_add</span>
                  <span>LƯU SỔ</span>
                </button>
                <button onclick="exportDocxFile()" class="btn-top-tier px-3.5 py-1.5 font-sport font-bold text-xs tracking-wider rounded-lg flex items-center gap-1.5" title="Xuất văn bản Word chuẩn thể thức Times New Roman, A4">
                  <span class="material-symbols-outlined text-[16px]">article</span>
                  <span>XUẤT FILE WORD</span>
                </button>
                <button onclick="printReport()" class="btn-glass-tactile px-3 py-1.5 text-slate-700 dark:text-slate-200 font-sport font-bold text-xs tracking-wider rounded-lg flex items-center gap-1.5" title="In trực tiếp hoặc Lưu file PDF">
                  <span class="material-symbols-outlined text-[16px]">print</span>
                  <span>IN / PDF</span>
                </button>
                <button onclick="sendCurrentReportToTelegram()" class="btn-glass-tactile px-3 py-1.5 text-sky-600 dark:text-sky-400 font-sport font-bold text-xs tracking-wider rounded-lg flex items-center gap-1.5" title="Gửi nội dung báo cáo này đến Telegram">
                  <span class="material-symbols-outlined text-[16px]">send</span>
                  <span>TELEGRAM</span>
                </button>
              </div>

            </div>

            <!-- Row 3: Chu kỳ tính ngày & Cơ chế tự động rà soát chuyển tiếp -->
            <div class="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] flex-wrap">
              <div class="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span class="material-symbols-outlined text-[15px] ${!isParty ? 'text-sky-600' : 'text-rose-600'}">event_note</span>
                <span><b>Chu kỳ tính số liệu:</b> ${!isParty ? `Từ ngày <b>${formatDateVN(range.startDate)}</b> đến ngày <b>${formatDateVN(range.endDate)}</b> (Chu kỳ từ 10 tháng trước đến 10 tháng này)` : `Từ ngày <b>${formatDateVN(range.startDate)}</b> đến ngày <b>${formatDateVN(range.endDate)}</b> (Chu kỳ trọn tháng từ 01 đến cuối tháng)`}</span>
              </div>
              <div class="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800">
                <span class="material-symbols-outlined text-[14px]">auto_mode</span>
                <span>Tự động rà soát: Hoạt động kỳ trước chưa báo cáo được chuyển sang kỳ này</span>
              </div>
            </div>

          </div>

          <!-- Official Administrative Document Container (Times New Roman, A4 Standard, Crisp Typography) -->
          <div id="reportDocumentContent" class="print-container admin-doc-paper bg-white text-slate-900 p-8 sm:p-14 rounded-xl shadow-xl border border-slate-200 leading-relaxed text-[14px] max-w-4xl mx-auto">
            
            ${isParty ? `
              <!-- LETTERHEAD MẪU CHI BỘ -->
              <div class="flex justify-between items-start border-b pb-4 mb-6">
                <div class="text-center w-5/12">
                  <p class="text-[12px] font-bold uppercase tracking-wide">ĐẢNG BỘ PHƯỜNG TÂN KHAI</p>
                  <p class="text-[13px] font-extrabold uppercase text-red-800 mt-0.5">CHI BỘ TRUNG TÂM DVTH</p>
                  <div class="w-24 h-0.5 bg-red-800 mx-auto mt-1 mb-2"></div>
                  <p class="text-xs font-mono font-bold">Số: ${code}</p>
                </div>

                <div class="text-center w-6/12">
                  <p class="text-[12px] font-bold uppercase tracking-wider text-red-800">ĐẢNG CỘNG SẢN VIỆT NAM</p>
                  <p class="text-xs italic mt-3">${dateLine}</p>
                </div>
              </div>

              <!-- Tiêu đề Mẫu Chi bộ -->
              <div class="text-center my-6">
                <h2 class="text-base font-bold uppercase tracking-tight text-red-900">BÁO CÁO</h2>
                <p class="text-xs font-bold uppercase mt-1">KẾT QUẢ THỰC HIỆN NHIỆM VỤ ĐẢNG VIÊN ${periodTitle}</p>
                <p class="text-xs italic text-slate-600 mt-1">(Từ ngày ${formatDateVN(range.startDate)} đến ngày ${formatDateVN(range.endDate)})</p>
              </div>

              <!-- Kính gửi & Thông tin Đảng viên -->
              <div class="mb-5 text-[13.5px] space-y-1">
                <p>Kính gửi: <b>Chi bộ Trung tâm Dịch vụ Tổng hợp phường Tân Khai</b></p>
                <p>Họ và tên đảng viên: <b>Trần Quốc Được</b></p>
                <p>Chức vụ Đảng: <b>Đảng viên</b></p>
                <p>Lĩnh vực phụ trách: <b>Thể dục thể thao và Thể dục thể thao thanh thiếu nhi.</b></p>
                <p class="text-justify pt-1 indent-8">
                  Thực hiện nhiệm vụ đảng viên và công việc chuyên môn được Chi bộ phân công, tôi xin báo cáo kết quả thực hiện nhiệm vụ cá nhân ${periodSubtitle} như sau:
                </p>
              </div>

              <!-- Nội dung Báo cáo Chi bộ (Đã tối ưu, bỏ phần CSVC sân bãi & kinh phí không cần thiết) -->
              <div class="space-y-4 text-[13.5px] leading-relaxed text-justify">
                <div>
                  <h4 class="font-bold text-slate-900 uppercase">I. TƯ TƯỞNG CHÍNH TRỊ, ĐẠO ĐỨC LỐI SỐNG VÀ Ý THỨC KỶ LUẬT</h4>
                  <p class="mt-1">
                    - Bản thân luôn kiên định với đường lối đổi mới của Đảng, chấp hành nghiêm túc Cương lĩnh chính trị, Điều lệ Đảng, Nghị quyết, Chỉ thị của các cấp ủy Đảng và chính sách, pháp luật của Nhà nước.
                  </p>
                  <p class="mt-1">
                    - Giữ gìn phẩm chất đạo đức lối sống trong sạch, lành mạnh; thực hiện tốt tinh thần đoàn kết nội bộ, tích cực đấu tranh ngăn chặn các biểu hiện suy thoái về tư tưởng chính trị, đạo đức lối sống; luôn nêu cao tinh thần trách nhiệm trong công việc được giao.
                  </p>
                </div>

                <div>
                  <h4 class="font-bold text-slate-900 uppercase">II. KẾT QUẢ THỰC HIỆN NHIỆM VỤ CHUYÊN MÔN ĐƯỢC PHÂN CÔNG</h4>
                  <p class="mt-1">
                    Trong ${periodSubtitle}, bản thân đã chủ động tham mưu và phối hợp tổ chức triển khai <b>${totalActs} hoạt động & giải thi đấu thể dục thể thao</b>, thu hút khoảng <b>${totalParticipants.toLocaleString('vi-VN')} lượt người tham gia</b>. Kết quả cụ thể:
                  </p>
                  
                  <div class="pl-3 mt-2 space-y-2 border-l-2 border-slate-200">
                    <p class="font-bold text-slate-800">1. Công tác tổ chức các hoạt động TDTT tại cơ sở (Cấp phường):</p>
                    ${sec1.length ? sec1.map(a => `
                      <p class="text-[13px]">• Giải/hoạt động: <b>${a.title}</b> (Ngày ${a.date}) - Quy mô: <b>${a.participants} VĐV</b>. ${a.achievementNote ? `Ghi chú: <i>${a.achievementNote}</i>` : ''}</p>
                    `).join('') : '<p class="text-[13px] italic text-slate-500">• Trong kỳ không có hoạt động mới phát sinh ở mục này.</p>'}

                    <p class="font-bold text-slate-800 pt-1">2. Công tác TDTT thanh thiếu nhi & tham gia các giải Đại hội (Cấp thành phố):</p>
                    ${sec2.length ? sec2.map(a => `
                      <p class="text-[13px]">• Tham gia giải: <b>${a.title}</b> (Ngày ${a.date}) - VĐV: <b>${a.participants}</b> - Đạt: <b>${a.totalMedals} HC</b> (${a.goldMedals || 0}V, ${a.silverMedals || 0}B, ${a.bronzeMedals || 0}Đ). ${a.achievementNote ? `Điểm nhấn: <i>${a.achievementNote}</i>` : ''}</p>
                    `).join('') : '<p class="text-[13px] italic text-slate-500">• Duy trì tập luyện, chuẩn bị lực lượng cho các giải thi đấu sắp tới.</p>'}
                  </div>
                </div>

                <div>
                  <h4 class="font-bold text-slate-900 uppercase">III. TỰ ĐÁNH GIÁ ƯU ĐIỂM, HẠN CHẾ VÀ PHƯƠNG HƯỚNG TỚI</h4>
                  <p class="mt-1">
                    <b>- Ưu điểm:</b> Chủ động, bám sát chỉ đạo của Chi bộ và Ban Giám đốc Trung tâm; tận tụy với công việc, huy động tốt nguồn lực xã hội hóa cho các giải thể thao.
                  </p>
                  <p class="mt-1">
                    <b>- Tự đánh giá mức độ hoàn thành nhiệm vụ:</b> Hoàn thành tốt nhiệm vụ được giao.
                  </p>
                  <p class="mt-1">
                    <b>- Phương hướng:</b> Tiếp tục trau dồi chuyên môn, mở rộng phong trào rèn luyện thể thao cho đối tượng thanh thiếu niên và người cao tuổi.
                  </p>
                </div>

                <p class="pt-3 text-justify indent-8">
                  Trên đây là báo cáo kết quả thực hiện nhiệm vụ đảng viên ${periodSubtitle} của bản thân. Kính báo cáo Chi bộ Trung tâm Dịch vụ Tổng hợp xem xét, theo dõi và tổng hợp.
                </p>
              </div>

              <!-- Chữ ký Đảng viên -->
              <div class="mt-10 flex justify-end">
                <div class="text-center w-64">
                  <p class="font-bold uppercase text-xs">ĐẢNG VIÊN BÁO CÁO</p>
                  <p class="text-[10px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
                  <div class="h-16 flex items-center justify-center italic text-slate-400 font-sans text-xs">
                    (Đã ký điện tử)
                  </div>
                  <p class="font-bold text-xs uppercase text-slate-900">Trần Quốc Được</p>
                </div>
              </div>

            ` : `
              <!-- LETTERHEAD MẪU NHÀ NƯỚC (QUỐC HIỆU + ĐƠN VỊ LẬP) -->
              <div class="flex justify-between items-start border-b pb-4 mb-6">
                <div class="text-center w-5/12">
                  <p class="text-[11px] font-bold uppercase tracking-wider text-slate-600">TRUNG TÂM DỊCH VỤ TỔNG HỢP</p>
                  <p class="text-xs font-extrabold uppercase text-brand-800 mt-1">BỘ PHẬN THỂ DỤC THỂ THAO</p>
                  <div class="w-24 h-0.5 bg-slate-800 mx-auto mt-1 mb-2"></div>
                  <p class="text-xs font-mono font-bold">Số: ${code}</p>
                </div>

                <div class="text-center w-6/12">
                  <p class="text-[11px] font-bold uppercase tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p class="text-xs font-bold underline underline-offset-4 mt-1">Độc lập - Tự do - Hạnh phúc</p>
                  <p class="text-xs italic mt-3">${dateLine}</p>
                </div>
              </div>

              <!-- Tiêu đề Mẫu Nhà nước -->
              <div class="text-center my-6">
                <h2 class="text-base font-bold uppercase tracking-tight text-slate-900">BÁO CÁO</h2>
                <p class="text-xs font-bold uppercase text-slate-700 mt-1">KẾT QUẢ THỰC HIỆN NHIỆM VỤ CÔNG TÁC THỂ DỤC THỂ THAO ${periodTitle}</p>
                <p class="text-xs italic text-slate-600 mt-1">(Từ ngày ${formatDateVN(range.startDate)} đến ngày ${formatDateVN(range.endDate)})</p>
              </div>

              <!-- Kính gửi (Chuẩn: gửi Văn phòng Trung tâm / Phòng Văn hóa, không gửi thẳng UBND) -->
              <div class="mb-5 text-[13.5px] space-y-1">
                <p>Kính gửi: <b>${recipientText}</b></p>
                <p>Họ và tên người báo cáo: <b>Trần Quốc Được</b></p>
                <p>Chức danh / Vị trí: <b>Cán bộ phụ trách Thể dục thể thao</b></p>
                <p>Lĩnh vực phụ trách: <b>Thể dục thể thao và Thể dục thể thao thanh thiếu nhi.</b></p>
                <p class="text-justify pt-1 indent-8">
                  Thực hiện nhiệm vụ chuyên môn được phân công, Bộ phận Thể dục thể thao kính báo cáo kết quả tổ chức các hoạt động và phát triển phong trào TDTT ${periodSubtitle} như sau:
                </p>
              </div>

              <!-- Nội dung Báo cáo Nhà nước (Đã bỏ phần CSVC sân bãi & kinh phí không cần thiết) -->
              <div class="space-y-4 text-[13.5px] leading-relaxed text-justify">
                <div>
                  <h4 class="font-bold text-slate-900 uppercase">I. CÔNG TÁC TỔ CHỨC CÁC HOẠT ĐỘNG THỂ DỤC THỂ THAO CẤP PHƯỜNG</h4>
                  <p class="mt-1">
                    Trong ${periodSubtitle}, Bộ phận TDTT đã chủ động tham mưu và phối hợp tổ chức tốt các hoạt động thể thao quần chúng trên địa bàn:
                  </p>
                  <div class="pl-3 mt-1.5 space-y-1.5 border-l-2 border-slate-200">
                    ${sec1.length ? sec1.map(a => `
                      <p class="text-[13px]">• <b>${a.title}</b> (Ngày ${a.date}) tại ${a.location}: Quy mô <b>${a.participants} ${a.participantsUnit || 'VĐV'}</b> tham gia sôi nổi. ${a.achievementNote ? `Kết quả: <i>${a.achievementNote}</i>` : ''}</p>
                    `).join('') : '<p class="text-[13px] italic text-slate-500">• Trong kỳ duy trì hoạt động rèn luyện thường xuyên của nhân dân tại các khu phố.</p>'}
                  </div>
                </div>

                <div>
                  <h4 class="font-bold text-slate-900 uppercase">II. CÔNG TÁC THỂ DỤC THỂ THAO THANH THIẾU NHI VÀ THAM GIA ĐẠI HỘI THỂ THAO CẤP THÀNH PHỐ</h4>
                  <p class="mt-1">
                    Tập trung tuyển chọn, tập huấn các đội tuyển thế mạnh đại diện tham gia các giải thể thao cấp thành phố và khu vực:
                  </p>
                  <div class="pl-3 mt-1.5 space-y-1.5 border-l-2 border-slate-200">
                    ${sec2.length ? sec2.map(a => `
                      <p class="text-[13px]">• Tham gia <b>${a.title}</b> (Ngày ${a.date}): Đoàn gồm <b>${a.participants} VĐV</b>, đạt thành tích xuất sắc <b>${a.totalMedals} huy chương</b> (${a.goldMedals || 0} Vàng, ${a.silverMedals || 0} Bạc, ${a.bronzeMedals || 0} Đồng). ${a.achievementNote ? `Điểm nhấn: <i>${a.achievementNote}</i>` : ''}</p>
                    `).join('') : '<p class="text-[13px] italic text-slate-500">• Chuẩn bị lực lượng thanh thiếu nhi sẵn sàng tham gia các đợt thi đấu trong năm.</p>'}
                  </div>
                  ${totalMedals > 0 ? `
                    <p class="mt-2 text-slate-800 font-semibold bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[12.5px]">
                      ★ Tổng thành tích đạt được trong kỳ: <b>${totalMedals} huy chương các loại</b> (${totalGold} HCV, ${totalSilver} HCB, ${totalBronze} HCĐ).
                    </p>
                  ` : ''}
                </div>

                <div>
                  <h4 class="font-bold text-slate-900 uppercase">III. ĐÁNH GIÁ CHUNG VÀ PHƯƠNG HƯỚNG KỲ TỚI</h4>
                  <p class="mt-1">
                    - Nhìn chung công tác TDTT trong kỳ đã bám sát kế hoạch đề ra, phong trào quần chúng tiếp tục lan tỏa sâu rộng, chất lượng chuyên môn tại các giải thi đấu được nâng lên rõ rệt.
                  </p>
                  <p class="mt-1">
                    - Thời gian tới, Bộ phận TDTT tiếp tục duy trì luyện tập, tổ chức các giải phong trào và triển khai hiệu quả nhiệm vụ được phân công.
                  </p>
                </div>

                <p class="pt-3 text-justify indent-8">
                  Kính báo cáo ${recipientText} xem xét, theo dõi và tổng hợp.
                </p>
              </div>

              <!-- Chữ ký Người lập báo cáo (Chỉ có 1 chữ ký của Cán bộ Trung tâm) -->
              <div class="mt-10 flex justify-end">
                <div class="text-center w-64">
                  <p class="font-bold uppercase text-xs">NGƯỜI LẬP BÁO CÁO</p>
                  <p class="text-[10px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
                  <div class="h-16 flex items-center justify-center italic text-slate-400 font-sans text-xs">
                    (Đã ký điện tử)
                  </div>
                  <p class="font-bold text-xs uppercase text-slate-900">Trần Quốc Được</p>
                  <p class="text-[10px] text-slate-500">Cán bộ phụ trách Thể dục thể thao</p>
                </div>
              </div>
            `}

          </div>
        </div>
      `;
    }

    export function saveCurrentReportToRegistry() {
      const maxRepNum = state.savedReports.reduce((m, r) => Math.max(m, parseInt(r.reportNumber) || 0), 0);
      const nextNum = maxRepNum + 1;
      const numStr = String(nextNum).padStart(2, '0');
      const isParty = state.reportMode === 'party';
      const code = isParty ? `${numStr}/BC-CB` : `${numStr}/BC-TDTT`;

      const list = getReportData();
      const newRep = {
        id: 'rep-' + Date.now(),
        reportNumber: nextNum,
        code: code,
        title: `Báo cáo ${isParty ? 'nhiệm vụ Đảng viên' : 'công tác Thể dục Thể thao'} ${getPeriodSubtitle()}`,
        reportDate: new Date().toLocaleDateString('vi-VN'),
        year: String(state.reportYear),
        period: state.reportPeriod,
        mode: state.reportMode,
        author: 'Trần Quốc Được',
        position: isParty ? 'Đảng viên' : 'Cán bộ Trung tâm Dịch vụ tổng hợp',
        summaryActs: list.length,
        summaryParticipants: list.reduce((a, b) => a + (parseInt(b.participants) || 0), 0),
        summaryMedals: list.reduce((a, b) => a + (parseInt(b.totalMedals) || 0), 0),
        summaryBudget: list.reduce((a, b) => a + (parseInt(b.budgetTotal) || 0), 0),
        reportedActIds: list.map(a => a.id),
        createdAt: new Date().toISOString()
      };

      state.savedReports.unshift(newRep);
      state.activeReportId = newRep.id;
      saveAll();
      showToast('Đã lưu vào Sổ', `Đã lưu báo cáo số ${newRep.code} vào Sổ lưu trữ.`);
      window.renderApp();
    }

    export function renderReportRegistryView() {
      return `
        <div class="space-y-4">
          <div class="p-4 rounded-xl luxury-card border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 class="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Sổ lưu trữ văn bản báo cáo</h3>
              <p class="text-xs text-slate-500 mt-0.5 font-normal">Quản lý số hiệu công văn, lưu trữ hồ sơ và rà soát các văn bản báo cáo theo đúng thẩm quyền</p>
            </div>
            <button onclick="createNewReportPrompt()" class="btn-top-tier px-3.5 py-1.5 font-medium text-xs rounded-lg flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[17px]">add_circle</span>
              <span>Tạo báo cáo số mới</span>
            </button>
          </div>

          <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
            <table class="referee-table w-full text-left text-xs border-collapse">
              <thead class="bg-slate-900 text-white font-semibold uppercase tracking-wider">
                <tr>
                  <th class="p-3 text-center whitespace-nowrap w-36">SỐ HIỆU VĂN BẢN</th>
                  <th class="p-3 min-w-[260px]">TIÊU ĐỀ BÁO CÁO</th>
                  <th class="p-3 text-center whitespace-nowrap">NGÀY LẬP</th>
                  <th class="p-3 text-center whitespace-nowrap">NĂM</th>
                  <th class="p-3 text-center whitespace-nowrap">NGƯỜI LẬP BÁO CÁO</th>
                  <th class="p-3 text-center whitespace-nowrap w-36">THAO TÁC</th>
                </tr>
              </thead>
              <tbody class="text-slate-800 dark:text-slate-200">
                ${state.savedReports.map(r => `
                  <tr class="hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors">
                    <td class="p-3 text-center font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">${r.code}</td>
                    <td class="p-3 min-w-[260px] max-w-md font-bold text-slate-900 dark:text-slate-100 leading-snug">${r.title}</td>
                    <td class="p-3 text-center text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">${r.reportDate}</td>
                    <td class="p-3 text-center"><span class="px-2 py-0.5 rounded font-sport font-bold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${r.year || '2026'}</span></td>
                    <td class="p-3 text-center font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">${r.author || 'Trần Quốc Được'}</td>
                    <td class="p-3 text-center whitespace-nowrap">
                      <div class="flex items-center justify-center gap-1">
                        <button onclick="viewReport('${r.id}')" title="Xem & In" class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 transition-colors btn-press"><span class="material-symbols-outlined text-[17px]">visibility</span></button>
                        <button onclick="editReportModal('${r.id}')" title="Sửa số / Tiêu đề" class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 transition-colors btn-press"><span class="material-symbols-outlined text-[17px]">edit</span></button>
                        <button onclick="deleteReport('${r.id}')" title="Xóa báo cáo này" class="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors btn-press"><span class="material-symbols-outlined text-[17px]">delete</span></button>
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

    export function viewReport(repId) {
      state.activeReportId = repId;
      state.reportSubTab = 'document';
      window.renderApp();
    }

    export function createNewReportPrompt() {
      const maxRepNum = state.savedReports.reduce((m, r) => Math.max(m, parseInt(r.reportNumber) || 0), 0);
      const nextNum = maxRepNum + 1;
      const numStr = String(nextNum).padStart(2, '0');
      const isParty = state.reportMode === 'party';
      const newRep = {
        id: 'rep-' + Date.now(),
        reportNumber: nextNum,
        code: isParty ? `${numStr}/BC-CB` : `${numStr}/BC-TDTT`,
        title: `Báo cáo ${isParty ? 'nhiệm vụ đảng viên' : 'công tác phát triển TDTT'} năm ${new Date().getFullYear()}`,
        reportDate: new Date().toLocaleDateString('vi-VN'),
        year: String(state.selectedYear === 'all' ? new Date().getFullYear() : state.selectedYear),
        quarter: 'all',
        author: 'Trần Quốc Được',
        position: isParty ? 'Đảng viên' : 'Cán bộ Trung tâm Dịch vụ tổng hợp',
        createdAt: new Date().toISOString()
      };
      state.savedReports.unshift(newRep);
      state.activeReportId = newRep.id;
      saveAll();
      showToast('Đã tạo báo cáo mới', `Đã thêm báo cáo số ${newRep.code} vào Sổ.`);
      window.renderApp();
    }

    export function saveCurrentReportAsNew() {
      saveCurrentReportToRegistry();
    }

    export function editReportModal(repId) {
      const rep = state.savedReports.find(r => r.id === repId);
      if (!rep) return;

      const modal = document.createElement('div');
      modal.id = 'modalContainer';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm';
      modal.innerHTML = `
        <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 modal-animate text-left">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Chỉnh Sửa Báo Cáo Trong Sổ</h3>
            <button onclick="window.closeModal()" class="p-1 rounded-lg text-slate-400"><span class="material-symbols-outlined">close</span></button>
          </div>
          <form onsubmit="handleSaveEditReport(event, '${rep.id}')" class="mt-4 space-y-3.5 text-xs">
            <div>
              <label class="block font-bold mb-1">Số thứ tự báo cáo (Ví dụ: 09)</label>
              <input id="edit_rep_num" type="number" required value="${rep.reportNumber}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono" />
            </div>
            <div>
              <label class="block font-bold mb-1">Ký hiệu đầy đủ</label>
              <input id="edit_rep_code" type="text" required value="${rep.code}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-brand-700" />
            </div>
            <div>
              <label class="block font-bold mb-1">Tiêu đề báo cáo</label>
              <textarea id="edit_rep_title" rows="3" required class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">${rep.title}</textarea>
            </div>
            <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button type="button" onclick="window.closeModal()" class="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Hủy</button>
              <button type="submit" class="px-5 py-2 rounded-xl font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-sm btn-press">Cập nhật</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('edit_rep_num')?.addEventListener('input', function() {
        const val = String(this.value).padStart(2, '0');
        document.getElementById('edit_rep_code').value = `${val}/BC-TTDVTH`;
      });
    }

    export function handleSaveEditReport(e, repId) {
      e.preventDefault();
      const rep = state.savedReports.find(r => r.id === repId);
      if (rep) {
        rep.reportNumber = parseInt(document.getElementById('edit_rep_num').value) || rep.reportNumber;
        rep.code = document.getElementById('edit_rep_code').value.trim();
        rep.title = document.getElementById('edit_rep_title').value.trim();
        saveAll();
        window.closeModal();
        showToast('Đã cập nhật báo cáo', `Báo cáo số ${rep.code} đã được chỉnh sửa.`);
        window.renderApp();
      }
    }

    export function deleteReport(repId) {
      const rep = state.savedReports.find(r => r.id === repId);
      if (confirm(`Bạn có chắc chắn muốn xóa báo cáo "${rep ? rep.code : ''}" khỏi Sổ lưu trữ?`)) {
        state.savedReports = state.savedReports.filter(r => r.id !== repId);
        if (state.activeReportId === repId && state.savedReports.length) {
          state.activeReportId = state.savedReports[0].id;
        }
        saveAll();
        showToast('Đã xóa báo cáo', 'Báo cáo đã được xóa khỏi sổ.');
        window.renderApp();
      }
    }

    export function printReport() {
      window.print();
    }

