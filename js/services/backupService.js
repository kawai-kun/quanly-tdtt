/**
 * HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO - PHƯỜNG TÂN KHAI
 * Backup, Restore & Party Member Review Export Service
 * Chức năng: Sao lưu & Phục hồi JSON, Xuất bản Kiểm điểm Đảng viên (.doc)
 */

import { state, saveAll, healDataEncoding } from '../state.js';
import { showToast } from '../utils/toast.js';
import { formatVNCurrency } from '../utils/formatters.js';

/**
 * Xuất toàn bộ cơ sở dữ liệu hệ thống ra file JSON
 */
export function exportBackupJSON() {
  try {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = `TDTT_TanKhai_Backup_${dateStr}.json`;

    const data = {
      system: 'TDTT_PHUONG_TAN_KHAI',
      version: '2026.4',
      exportedAt: now.toISOString(),
      officer: 'Trần Quốc Được',
      stats: {
        activitiesCount: state.activities.length,
        clubsCount: state.clubs.length,
        facilitiesCount: state.facilities.length,
        schedulesCount: state.schedules.length,
        budgetCount: state.budgetItems.length,
        reportsCount: state.savedReports.length,
        extraTasksCount: (state.extraTasks || []).length
      },
      activities: state.activities,
      clubs: state.clubs,
      facilities: state.facilities,
      schedules: state.schedules,
      budgetItems: state.budgetItems,
      savedReports: state.savedReports,
      extraTasks: state.extraTasks || [],
      kpiTargets: state.kpiTargets,
      telegramSettings: state.telegramSettings
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(url);
    }, 500);

    showToast('Sao lưu thành công', `Đã xuất dữ liệu ${state.activities.length} giải đấu ra file ${filename}`);
  } catch (err) {
    console.error('Lỗi sao lưu JSON:', err);
    showToast('Lỗi sao lưu', 'Không thể tạo file sao lưu: ' + err.message);
  }
}

/**
 * Kích hoạt hộp thoại chọn file JSON phục hồi
 */
export function triggerRestoreSystemData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.style.display = 'none';

  input.onchange = function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        const json = JSON.parse(evt.target.result);
        applyRestoredData(json, file.name);
      } catch (err) {
        showToast('Lỗi định dạng', 'File tải lên không phải định dạng JSON hợp lệ: ' + err.message);
      }
    };
    reader.readAsText(file);
    input.remove();
  };

  document.body.appendChild(input);
  input.click();
}

/**
 * Xác nhận và ghi đè dữ liệu phục hồi an toàn
 */
export function applyRestoredData(data, fileName = '') {
  if (!data || (!data.activities && !data.system)) {
    showToast('Lỗi kiểm tra', 'File sao lưu không chứa cấu trúc dữ liệu của Hệ thống Quản lý TDTT Tân Khai.');
    return;
  }

  const actCount = Array.isArray(data.activities) ? data.activities.length : 0;
  const clubCount = Array.isArray(data.clubs) ? data.clubs.length : 0;

  // Hiển thị modal xác nhận ghi đè
  const modal = document.createElement('div');
  modal.id = 'restoreConfirmModal';
  modal.className = 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 modal-animate text-slate-800 dark:text-slate-100 text-left">
      <div class="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-3">
        <span class="material-symbols-outlined text-[32px]">warning</span>
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Xác nhận phục hồi dữ liệu</h3>
          <span class="text-xs text-slate-500">File: ${fileName || 'Dữ liệu sao lưu'}</span>
        </div>
      </div>

      <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
        Hành động này sẽ cập nhật dữ liệu hiện tại bằng thông tin trong file sao lưu:
      </p>

      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs font-medium mb-4">
        <div class="flex justify-between"><span>Số lượng giải đấu:</span><strong class="font-bold text-emerald-700 dark:text-emerald-400">${actCount} giải</strong></div>
        <div class="flex justify-between"><span>Câu lạc bộ:</span><strong class="font-bold text-slate-800 dark:text-slate-200">${clubCount} CLB</strong></div>
        <div class="flex justify-between"><span>Ngày tạo sao lưu:</span><strong class="text-slate-500">${data.exportedAt ? new Date(data.exportedAt).toLocaleString('vi-VN') : 'Không rõ'}</strong></div>
      </div>

      <div class="flex justify-end gap-2.5">
        <button onclick="document.getElementById('restoreConfirmModal').remove()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
          Hủy bỏ
        </button>
        <button id="btnConfirmRestoreAction" class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md btn-press">
          Đồng ý phục hồi
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('btnConfirmRestoreAction').onclick = function () {
    try {
      if (Array.isArray(data.activities)) state.activities = data.activities;
      if (Array.isArray(data.clubs)) state.clubs = data.clubs;
      if (Array.isArray(data.facilities)) state.facilities = data.facilities;
      if (Array.isArray(data.schedules)) state.schedules = data.schedules;
      if (Array.isArray(data.budgetItems)) state.budgetItems = data.budgetItems;
      if (Array.isArray(data.savedReports)) state.savedReports = data.savedReports;
      if (Array.isArray(data.extraTasks)) state.extraTasks = data.extraTasks;
      if (data.kpiTargets) state.kpiTargets = data.kpiTargets;
      if (data.telegramSettings) state.telegramSettings = data.telegramSettings;

      saveAll();
      healDataEncoding();

      modal.remove();
      showToast('Phục hồi thành công', `Đã phục hồi hoàn tất ${actCount} giải đấu và dữ liệu liên quan.`);
      if (typeof window.renderApp === 'function') window.renderApp();
    } catch (err) {
      showToast('Lỗi phục hồi', 'Không thể áp dụng dữ liệu: ' + err.message);
    }
  };
}

/**
 * Xuất Bản Kiểm điểm Đảng viên & Đánh giá KPI Cán bộ (.doc)
 * Chuẩn thể thức Đảng / Nhà nước font Times New Roman
 */
export function exportPartyMemberReviewDoc() {
  const planActs = state.activities.filter(a => a.planType === 'plan');
  const extraActs = state.activities.filter(a => a.planType !== 'plan');
  const extraTasks = state.extraTasks || [];

  const totalParticipants = state.activities.reduce((acc, a) => acc + (parseInt(a.participants) || 0), 0);
  const totalMedals = state.activities.reduce((acc, a) => acc + (parseInt(a.totalMedals) || 0), 0);
  const totalGold = state.activities.reduce((acc, a) => acc + (parseInt(a.goldMedals) || 0), 0);
  const totalSilver = state.activities.reduce((acc, a) => acc + (parseInt(a.silverMedals) || 0), 0);
  const totalBronze = state.activities.reduce((acc, a) => acc + (parseInt(a.bronzeMedals) || 0), 0);
  const totalBudget = state.activities.reduce((acc, a) => acc + (parseInt(a.budgetTotal) || 0), 0);

  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Bản kiểm điểm Đảng viên năm 2026 - Trần Quốc Được</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.4; color: #000; margin: 2cm; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12pt; }
        th, td { border: 1px solid #000; padding: 6px 8px; vertical-align: top; }
        th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
        .no-border td { border: none; padding: 4px; }
        h1, h2, h3, h4 { margin: 6px 0; font-family: 'Times New Roman', Times, serif; }
        p { margin: 6px 0; text-align: justify; text-indent: 1cm; }
        .no-indent { text-indent: 0; }
      </style>
    </head>
    <body>
      <table class="no-border" style="margin-bottom: 20px;">
        <tr>
          <td style="width: 50%; text-align: center;">
            <span class="font-bold">ĐẢNG BỘ PHƯỜNG TÂN KHAI</span><br/>
            <span class="font-bold">CHI BỘ TRUNG TÂM DV TỔNG HỢP</span><br/>
            <span>*</span>
          </td>
          <td style="width: 50%; text-align: center;">
            <span class="font-bold uppercase">ĐẢNG CỘNG SẢN VIỆT NAM</span><br/><br/>
            <i>Tân Khai, ngày 25 tháng 11 năm 2026</i>
          </td>
        </tr>
      </table>

      <div class="text-center" style="margin-bottom: 24px;">
        <h2 class="uppercase font-bold" style="font-size: 16pt;">BẢN KIỂM ĐIỂM CÁ NHÂN ĐẢNG VIÊN</h2>
        <p class="no-indent font-bold" style="text-align: center; font-size: 13pt;">Năm 2026</p>
      </div>

      <div style="margin-bottom: 16px;">
        <p class="no-indent"><b>Họ và tên:</b> TRẦN QUỐC ĐƯỢC</p>
        <p class="no-indent"><b>Ngày, tháng, năm sinh:</b> 15/08/1990</p>
        <p class="no-indent"><b>Chức vụ Đảng:</b> Đảng viên</p>
        <p class="no-indent"><b>Chức vụ chính quyền, đoàn thể:</b> Cán bộ Trung tâm Dịch vụ Tổng hợp • Phụ trách Thể dục Thể thao & Chuyển đổi số</p>
        <p class="no-indent"><b>Đơn vị công tác:</b> Trung tâm Dịch vụ Tổng hợp UBND Phường Tân Khai</p>
        <p class="no-indent"><b>Chi bộ sinh hoạt:</b> Chi bộ Trung tâm Dịch vụ Tổng hợp</p>
        <p class="no-indent"><b>Căn cứ phân công nhiệm vụ:</b> Quyết định phân công nhiệm vụ của Giám đốc Trung tâm DVTH (Mục 8: Phụ trách TDTT, TDTT thanh thiếu nhi, Công nghệ thông tin & chuyển đổi số); Kế hoạch hoạt động công tác năm được UBND Phường phê duyệt.</p>
      </div>

      <h3 class="font-bold">I. ƯU ĐIỂM, KẾT QUẢ ĐẠT ĐƯỢC</h3>
      
      <p><b>1. Về tư tưởng chính trị:</b> Luôn kiên định với chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh và đường lối đổi mới của Đảng; chấp hành nghiêm túc các chủ trương, đường lối, nghị quyết của Đảng, chính sách pháp luật của Nhà nước. Không ngừng rèn luyện bản lĩnh chính trị, giữ vững phẩm chất người đảng viên.</p>

      <p><b>2. Về phẩm chất đạo đức, lối sống:</b> Luôn nêu cao tinh thần gương mẫu, giản dị, trung thực; thực hiện nghiêm quy định những điều đảng viên không được làm. Luôn có tinh thần đoàn kết nội bộ, lắng nghe ý kiến quần chúng nhân dân và đồng nghiệp.</p>

      <p><b>3. Về thực hiện chức trách, nhiệm vụ được giao (Kết quả cụ thể):</b></p>
      <p>Trong năm 2026, bản thân được phân công phụ trách mảng Thể dục thể thao, TDTT thanh thiếu nhi và Công nghệ thông tin - Chuyển đổi số. Bản thân đã chủ động tham mưu và tổ chức thực hiện thắng lợi toàn diện các mục tiêu, nhiệm vụ được giao:</p>

      <p><b>a) Kết quả thực hiện nhiệm vụ theo Kế hoạch năm:</b></p>
      <p>Đã chủ trì tham mưu, tổ chức và hoàn thành <b>${planActs.length} hoạt động TDTT nòng cốt</b> theo đúng kế hoạch được phê duyệt (Đạt 100% chỉ tiêu giao): Tổ chức thành công Lễ phát động Tháng hoạt động TDTT & Ngày chạy Olympic vì sức khỏe toàn dân; Đại hội TDTT Phường Tân Khai lần thứ I với các môn thi đấu (Bóng đá, Cờ tướng, Cầu lông, Bóng chuyền, Pickleball, Điền kinh); Giải bóng đá thiếu niên hè và Giải bóng đá mừng Đảng mừng Xuân.</p>

      <table>
        <thead>
          <tr>
            <th style="width: 8%;">STT</th>
            <th style="width: 15%;">Mã giải</th>
            <th style="width: 42%;">Tên giải đấu trong Kế hoạch</th>
            <th style="width: 15%;">Số VĐV</th>
            <th style="width: 20%;">Căn cứ / Kết quả</th>
          </tr>
        </thead>
        <tbody>
          ${planActs.map((a, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td class="text-center">${a.code || ''}</td>
              <td><b>${a.title}</b></td>
              <td class="text-center">${a.participants || 0} VĐV</td>
              <td>${a.refPlan || 'Kế hoạch năm'}<br/>${a.achievementNote ? '<i>' + a.achievementNote + '</i>' : 'Hoàn thành xuất sắc'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <p><b>b) Kết quả thực hiện các nhiệm vụ phát sinh ngoài kế hoạch & cấp thành phố:</b></p>
      <p>Ngoài các nhiệm vụ theo kế hoạch giao, bản thân đã tích cực tham mưu tổ chức và đưa đoàn VĐV tham dự <b>${extraActs.length} giải đấu phát sinh ngoài kế hoạch</b> (các giải Đại hội TDTT cấp thành phố Đồng Nai, giải giao hữu Tứ hùng, Ngày hội toàn dân BVANTQ, giải Người cao tuổi...). Tổng số giải tổ chức và tham gia thực tế là <b>${state.activities.length} giải</b>, huy động <b>${totalParticipants.toLocaleString('vi-VN')} lượt vận động viên</b>, đạt tổng cộng <b>${totalMedals} Huy chương</b> (${totalGold} Vàng, ${totalSilver} Bạc, ${totalBronze} Đồng).</p>

      <p><b>c) Kết quả công tác CNTT, Chuyển đổi số & Các nhiệm vụ đột xuất:</b></p>
      <table>
        <thead>
          <tr>
            <th style="width: 8%;">STT</th>
            <th style="width: 37%;">Nội dung nhiệm vụ</th>
            <th style="width: 20%;">Mảng phụ trách</th>
            <th style="width: 35%;">Kết quả đạt được</th>
          </tr>
        </thead>
        <tbody>
          ${extraTasks.map((t, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td><b>${t.title}</b><br/><i>${t.basis || ''}</i></td>
              <td class="text-center">${t.domainLabel || t.domain}</td>
              <td>${t.result || t.statusLabel || 'Hoàn thành tốt'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <p><b>4. Về ý thức tổ chức kỷ luật:</b> Chấp hành tuyệt đối sự phân công, điều động của cấp ủy, Ban Giám đốc Trung tâm; thực hiện nghiêm túc chế độ báo cáo công văn, quyết toán kinh phí minh bạch đúng quy định của Nhà nước.</p>

      <h3 class="font-bold">II. HẠN CHẾ, KHUYẾT ĐIỂM VÀ NGUYÊN NHÂN</h3>
      <p><b>1. Hạn chế:</b> Do khối lượng giải đấu và sự kiện phong trào trong năm 2026 rất lớn (30 giải), đôi lúc việc tổng hợp một số báo cáo chuyên đề còn gấp gáp về thời gian.</p>
      <p><b>2. Nguyên nhân:</b> Đội ngũ cán bộ chuyên trách TDTT cơ sở còn mỏng, đa số kiêm nhiệm nhiều mảng công tác (TDTT, Thiếu nhi, CNTT & CSVC).</p>

      <h3 class="font-bold">III. PHƯƠNG HƯỚNG, BIỆN PHÁP KHẮC PHỤC</h3>
      <p>Tiếp tục ứng dụng mạnh mẽ Cổng điều hành số và các công cụ tự động hóa trong quản lý TDTT để nâng cao năng suất; chủ động xây dựng kế hoạch từ đầu từng quý để phân bổ thời gian hợp lý hơn.</p>

      <h3 class="font-bold">IV. TỰ NHẬN XẾP LOẠI CHẤT LƯỢNG</h3>
      <p class="no-indent font-bold">Xếp loại chất lượng cán bộ, đảng viên: <u>HOÀN THÀNH XUẤT SẮC NHIỆM VỤ</u>.</p>

      <table class="no-border" style="margin-top: 40px;">
        <tr>
          <td style="width: 50%; text-align: center;">
            <span class="font-bold">Ý KIẾN ĐÁNH GIÁ CỦA CHI BỘ</span><br/>
            <i>(Ký và ghi rõ họ tên)</i>
            <br/><br/><br/><br/><br/>
          </td>
          <td style="width: 50%; text-align: center;">
            <span class="font-bold">NGƯỜI TỰ KIỂM ĐIỂM</span><br/>
            <i>(Ký và ghi rõ họ tên)</i>
            <br/><br/><br/><br/><br/>
            <span class="font-bold">Trần Quốc Được</span>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([docHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Ban_Kiem_Diem_Dang_Vien_2026_TranQuocDuoc.doc`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 500);

  showToast('Xuất bản kiểm điểm thành công', 'Đã tải xuống file văn bản Bản Kiểm điểm Đảng viên năm 2026 (.doc)');
}

// Bind to window for global access
window.backupSystemData = exportBackupJSON;
window.triggerRestoreSystemData = triggerRestoreSystemData;
window.exportPartyMemberReviewDoc = exportPartyMemberReviewDoc;
