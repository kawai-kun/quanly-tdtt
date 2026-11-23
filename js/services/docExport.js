// ==============================================================================
// DỊCH VỤ XUẤT VĂN BẢN VÀ TÍNH TOÁN BÁO CÁO (DOC EXPORT SERVICE)
// Chuẩn thể thức hành chính Nhà nước (Nghị định 30/2020/NĐ-CP) & Thể thức Đảng
// ==============================================================================

import { state } from '../state.js';
import { parseDateVN, sortActivitiesByLatest } from '../utils/formatters.js';
import { showToast } from '../utils/toast.js';

export     function getReportMonths(opts = {}) {
      const p = opts.period || state.reportPeriod || 'month';
      if (p === 'month') {
        const m = parseInt(opts.month || state.reportMonth) || (new Date().getMonth() + 1);
        return { start: m, end: m };
      }
      if (p === 'quarter') {
        const q = parseInt(opts.quarter || state.reportQuarter) || 1;
        const s = (q - 1) * 3 + 1;
        return { start: s, end: s + 2 };
      }
      if (p === 'half') {
        const h = parseInt(opts.half || state.reportHalf) || 1;
        return h === 2 ? { start: 7, end: 12 } : { start: 1, end: 6 };
      }
      if (p === 'nine') return { start: 1, end: 9 };
      return { start: 1, end: 12 };
    }

export     function getReportRange(opts = {}) {
      const mode = opts.mode || state.reportMode || 'state';
      const period = opts.period || state.reportPeriod || 'month';
      const year = parseInt(opts.year || state.reportYear) || new Date().getFullYear();

      if (mode === 'state') {
        // BÁO CÁO NHÀ NƯỚC (Gửi Văn phòng Trung tâm DVTH): Lấy từ ngày 10 tháng trước đến ngày 10 tháng này
        if (period === 'month') {
          const curM = parseInt(opts.month || state.reportMonth) || (new Date().getMonth() + 1);
          let prevM = curM - 1;
          let prevY = year;
          if (prevM < 1) {
            prevM = 12;
            prevY = year - 1;
          }
          const startDate = new Date(prevY, prevM - 1, 10, 0, 0, 0);
          const endDate = new Date(year, curM - 1, 10, 23, 59, 59);
          return { startDate, endDate, isStateMonthly: true, prevM, curM, year };
        } else if (period === 'quarter') {
          const q = parseInt(opts.quarter || state.reportQuarter) || 1;
          const endMonth = q * 3;
          let startMonth = endMonth - 3;
          let startYear = year;
          if (startMonth < 1) {
            startMonth = 12;
            startYear = year - 1;
          }
          const startDate = new Date(startYear, startMonth - 1, 10, 0, 0, 0);
          const endDate = new Date(year, endMonth - 1, 10, 23, 59, 59);
          return { startDate, endDate };
        } else if (period === 'half') {
          const h = parseInt(opts.half || state.reportHalf) || 1;
          const startDate = h === 1 ? new Date(year - 1, 11, 10, 0, 0, 0) : new Date(year, 5, 10, 0, 0, 0);
          const endDate = h === 1 ? new Date(year, 5, 10, 23, 59, 59) : new Date(year, 11, 10, 23, 59, 59);
          return { startDate, endDate };
        } else if (period === 'nine') {
          return {
            startDate: new Date(year - 1, 11, 10, 0, 0, 0),
            endDate: new Date(year, 8, 10, 23, 59, 59)
          };
        } else {
          return {
            startDate: new Date(year - 1, 11, 10, 0, 0, 0),
            endDate: new Date(year, 11, 10, 23, 59, 59)
          };
        }
      } else {
        // BÁO CÁO CHI BỘ: Từ ngày 1 đầu tháng đến ngày cuối cùng của tháng
        const months = getReportMonths(opts);
        const startDate = new Date(year, months.start - 1, 1, 0, 0, 0);
        const endDate = new Date(year, months.end, 0, 23, 59, 59);
        return { startDate, endDate, isPartyMonthly: true };
      }
    }


export     function getReportData(opts = {}) {
      const mode = opts.mode || state.reportMode || 'state';
      const range = opts.range || getReportRange(opts);

      // 1. Hoạt động nằm đúng trong kỳ báo cáo
      const list = (state.activities || []).filter(a => {
        if (!a.date) return false;
        const d = parseDateVN(a.date);
        return d && d >= range.startDate && d <= range.endDate;
      }).map(a => ({ ...a, isCarryOver: false }));

      // 2. Tự động rà soát hoạt động của kỳ trước chưa được báo cáo (Catch-up / Carry-over)
      // Tìm các hoạt động diễn ra trước range.startDate (trong vòng 45 ngày trước)
      const lookbackDate = new Date(range.startDate.getTime() - 45 * 24 * 60 * 60 * 1000);

      // Tập hợp ID các giải đấu đã được lưu trong các báo cáo chính thức trước đó
      const reportedActIds = new Set();
      (state.savedReports || []).forEach(r => {
        if (r.mode === mode && Array.isArray(r.reportedActIds)) {
          r.reportedActIds.forEach(id => reportedActIds.add(id));
        }
      });

      const carryOverActs = (state.activities || []).filter(a => {
        if (!a.date) return false;
        const d = parseDateVN(a.date);
        if (!d) return false;
        if (d >= lookbackDate && d < range.startDate) {
          if (!list.some(item => item.id === a.id)) {
            if (!reportedActIds.has(a.id) || a.forceCarryOver) {
              return true;
            }
          }
        }
        return false;
      }).map(a => ({
        ...a,
        isCarryOver: true,
        achievementNote: a.achievementNote ? `${a.achievementNote} (Bổ sung kỳ trước)` : 'Bổ sung từ kỳ trước chưa báo cáo'
      }));

      const combined = [...list, ...carryOverActs];
      return sortActivitiesByLatest(combined);
    }


export     function getPeriodTitle(opts = {}) {
      const p = opts.period || state.reportPeriod || 'month';
      const y = opts.year || state.reportYear || new Date().getFullYear();
      if (p === 'month') {
        const m = opts.month || state.reportMonth || (new Date().getMonth() + 1);
        return `THÁNG ${m} NĂM ${y}`;
      }
      if (p === 'quarter') {
        const q = opts.quarter || state.reportQuarter || 1;
        const roman = ['I', 'II', 'III', 'IV'][q - 1];
        return `QUÝ ${roman} NĂM ${y}`;
      }
      if (p === 'half') {
        const h = opts.half || state.reportHalf || 1;
        return (h === 1 ? '6 THÁNG ĐẦU NĂM ' : '6 THÁNG CUỐI NĂM ') + y;
      }
      if (p === 'nine') return `9 THÁNG ĐẦU NĂM ${y}`;
      return `NĂM ${y}`;
    }


export     function getPeriodSubtitle(opts = {}) {
      const p = opts.period || state.reportPeriod || 'month';
      const y = opts.year || state.reportYear || new Date().getFullYear();
      if (p === 'month') {
        const m = opts.month || state.reportMonth || (new Date().getMonth() + 1);
        return `tháng ${m} năm ${y}`;
      }
      if (p === 'quarter') {
        const q = opts.quarter || state.reportQuarter || 1;
        const roman = ['I', 'II', 'III', 'IV'][q - 1];
        return `quý ${roman} năm ${y}`;
      }
      if (p === 'half') {
        const h = opts.half || state.reportHalf || 1;
        return (h === 1 ? '6 tháng đầu năm ' : '6 tháng cuối năm ') + y;
      }
      if (p === 'nine') return `9 tháng đầu năm ${y}`;
      return `năm ${y}`;
    }


export     function buildReportHTMLForWord(opts = {}) {
      const mode = opts.mode || state.reportMode || 'state';
      const isParty = mode === 'party';
      let range = opts.range;
      let list = opts.list;
      let periodTitle = opts.periodTitle;
      let periodSubtitle = opts.periodSubtitle;

      if (!range) {
        range = getReportRange({ ...opts, mode });
        list = opts.list || getReportData({ ...opts, mode, range });
        periodTitle = opts.periodTitle || getPeriodTitle(opts);
        periodSubtitle = opts.periodSubtitle || getPeriodSubtitle(opts);
      }

      const totalActs = list.length;
      const totalParticipants = list.reduce((a, b) => a + (parseInt(b.participants) || 0), 0);
      const totalMedals = list.reduce((a, b) => a + (parseInt(b.totalMedals) || 0), 0);
      const totalGold = list.reduce((a, b) => a + (parseInt(b.goldMedals) || 0), 0);
      const totalSilver = list.reduce((a, b) => a + (parseInt(b.silverMedals) || 0), 0);
      const totalBronze = list.reduce((a, b) => a + (parseInt(b.bronzeMedals) || 0), 0);
      const totalBudget = list.reduce((a, b) => a + (parseInt(b.budgetTotal) || 0), 0);

      const sec1 = list.filter(a => a.category === 'Cấp phường');
      const sec2 = list.filter(a => a.category === 'Cấp thành phố');

      const recipientParam = opts.recipient || state.reportRecipient;
      let recipientText = 'Văn phòng Trung tâm Dịch vụ Tổng hợp phường Tân Khai';
      if (isParty) {
        recipientText = 'Chi bộ Trung tâm Dịch vụ Tổng hợp phường Tân Khai';
      } else if (recipientParam === 'phong_vanhoa') {
        recipientText = 'Phòng Văn hóa và Thông tin';
      }

      const today = new Date();
      const dateLine = `Tân Khai, ngày ${String(today.getDate()).padStart(2, '0')} tháng ${String(today.getMonth() + 1).padStart(2, '0')} năm ${today.getFullYear()}`;
      const fnt = "font-family:'Times New Roman',Times,serif;";

      let headerBlock = '';
      if (isParty) {
        headerBlock = `
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
            <tr>
              <td width="50%" align="center" valign="top" style="text-align:center;vertical-align:top;padding:0;">
                <div style="${fnt}font-size:12pt;font-weight:bold;line-height:1.4;">ĐẢNG BỘ PHƯỜNG TÂN KHAI</div>
                <div style="${fnt}font-size:13pt;font-weight:bold;line-height:1.4;color:#b91c1c;">CHI BỘ TRUNG TÂM DVTH</div>
                <div style="width:120px;height:0;border-top:1.5px solid #b91c1c;margin:4px auto;"></div>
                <div style="${fnt}font-size:12pt;margin-top:4px;">Số: .... /BC-CB</div>
              </td>
              <td width="50%" align="center" valign="top" style="text-align:center;vertical-align:top;padding:0;">
                <div style="${fnt}font-size:12pt;font-weight:bold;line-height:1.4;color:#b91c1c;">ĐẢNG CỘNG SẢN VIỆT NAM</div>
                <div style="${fnt}font-size:12pt;font-style:italic;margin-top:14px;">${dateLine}</div>
              </td>
            </tr>
          </table>
        `;
      } else {
        headerBlock = `
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
            <tr>
              <td width="48%" align="center" valign="top" style="text-align:center;vertical-align:top;padding:0;">
                <div style="${fnt}font-size:11pt;font-weight:bold;line-height:1.4;">TRUNG TÂM DỊCH VỤ TỔNG HỢP</div>
                <div style="${fnt}font-size:12pt;font-weight:bold;line-height:1.4;color:#006948;">BỘ PHẬN THỂ DỤC THỂ THAO</div>
                <div style="width:120px;height:0;border-top:1.5px solid #000;margin:4px auto;"></div>
                <div style="${fnt}font-size:11pt;margin-top:4px;">Số: .... /BC-TDTT</div>
              </td>
              <td width="52%" align="center" valign="top" style="text-align:center;vertical-align:top;padding:0;">
                <div style="${fnt}font-size:12pt;font-weight:bold;line-height:1.4;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div style="${fnt}font-size:13pt;font-weight:bold;line-height:1.4;">Độc lập – Tự do – Hạnh phúc</div>
                <div style="width:160px;height:0;border-top:1.5px solid #000;margin:4px auto;"></div>
                <div style="${fnt}font-size:12pt;font-style:italic;margin-top:8px;">${dateLine}</div>
              </td>
            </tr>
          </table>
        `;
      }

      return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Báo Cáo ${isParty ? 'Chi Bộ' : 'TDTT'} - ${periodTitle}</title>
  <style>
    @page { size: A4 portrait; margin: 20mm 20mm 20mm 30mm; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 14pt; line-height: 1.55; color: #000; background: #fff; margin: 0; padding: 20px; }
    p { margin: 6px 0; line-height: 1.55; text-align: justify; }
    .title { text-align: center; font-size: 15pt; font-weight: bold; margin: 18px 0 4px 0; }
    .subtitle { text-align: center; font-size: 13pt; font-style: italic; margin-bottom: 16px; }
    .section-title { font-weight: bold; margin-top: 14px; margin-bottom: 4px; }
    .indent { text-indent: 1.27cm; }
  </style>
</head>
<body>
  ${headerBlock}

  <div class="title">BÁO CÁO</div>
  <div class="subtitle">Kết quả thực hiện nhiệm vụ ${isParty ? 'đảng viên' : 'công tác Thể dục Thể thao'} ${periodSubtitle}<br/>(Từ ngày ${formatDateVN(range.startDate)} đến ngày ${formatDateVN(range.endDate)})</div>

  <p><b>Kính gửi:</b> ${recipientText}</p>
  <p>Họ và tên: <b>Trần Quốc Được</b></p>
  <p>Chức vụ: <b>${isParty ? 'Đảng viên' : 'Cán bộ phụ trách Thể dục thể thao'}</b></p>
  <p>Lĩnh vực phụ trách: <b>Thể dục thể thao và Thể dục thể thao thanh thiếu nhi.</b></p>

  <p class="indent">
    Thực hiện nhiệm vụ được phân công, tôi xin báo cáo kết quả thực hiện nhiệm vụ ${periodSubtitle} như sau:
  </p>

  <p class="section-title">1. Công tác tổ chức các hoạt động thể dục thể thao tại cơ sở</p>
  ${sec1.length ? sec1.map(a => `
    <p style="margin-left: 20px;">• ${a.title} (Ngày ${a.date}) tại ${a.location}: Quy mô khoảng <b>${a.participants} VĐV</b>. ${a.achievementNote ? `Kết quả: ${a.achievementNote}` : ''}</p>
  `).join('') : '<p style="margin-left: 20px; font-style: italic;">• Duy trì nền nếp rèn luyện thể dục thể thao quần chúng thường xuyên tại địa bàn.</p>'}

  <p class="section-title">2. Công tác thể thao thanh thiếu nhi và tham gia thi đấu các giải cấp thành phố</p>
  ${sec2.length ? sec2.map(a => `
    <p style="margin-left: 20px;">• ${a.title} (Ngày ${a.date}): Đoàn tham gia gồm <b>${a.participants} VĐV</b>, đạt <b>${a.totalMedals} huy chương</b> (${a.goldMedals || 0}V, ${a.silverMedals || 0}B, ${a.bronzeMedals || 0}Đ). ${a.achievementNote ? `Điểm nhấn: ${a.achievementNote}` : ''}</p>
  `).join('') : '<p style="margin-left: 20px; font-style: italic;">• Chuẩn bị lực lượng thanh thiếu nhi sẵn sàng tham gia các giải sắp tới.</p>'}
  ${totalMedals > 0 ? `<p style="margin-left: 20px;"><b>Tổng thành tích trong kỳ:</b> Đạt ${totalMedals} huy chương các loại (${totalGold} HCV, ${totalSilver} HCB, ${totalBronze} HCĐ).</p>` : ''}

  <p class="section-title">3. Đánh giá chung và phương hướng kỳ tới</p>
  <p style="margin-left: 20px;">- Nhìn chung công tác TDTT trong kỳ đã bám sát kế hoạch đề ra, phong trào thể thao quần chúng tiếp tục lan tỏa sâu rộng, chất lượng chuyên môn tại các giải đấu được nâng lên rõ rệt.</p>
  <p style="margin-left: 20px;">- Thời gian tới, Bộ phận TDTT tiếp tục duy trì luyện tập, tổ chức các giải phong trào và triển khai hiệu quả nhiệm vụ được giao.</p>

  <p class="indent" style="margin-top: 16px;">
    Kính báo cáo ${recipientText} xem xét, theo dõi và tổng hợp.
  </p>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:35px;page-break-inside:avoid;">
    <tr>
      <td width="55%"></td>
      <td width="45%" align="center" style="text-align:center;">
        <div style="${fnt}font-size:13pt;font-weight:bold;">${isParty ? 'ĐẢNG VIÊN BÁO CÁO' : 'NGƯỜI LẬP BÁO CÁO'}</div>
        <div style="${fnt}font-size:11pt;font-style:italic;margin-top:4px;">(Ký và ghi rõ họ tên)</div>
        <div style="height:65px;">&nbsp;</div>
        <div style="${fnt}font-size:13pt;font-weight:bold;">Trần Quốc Được</div>
      </td>
    </tr>
  </table>
</body>
</html>`;
    }



export     function exportDocxFile() {
      const html = buildReportHTMLForWord();
      const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const modeName = state.reportMode === 'party' ? 'ChiBo' : 'NhaNuoc';
      const cleanPeriod = getPeriodTitle().replace(/\s+/g, '_');
      link.download = `BaoCao_${modeName}_${cleanPeriod}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('Đã xuất file Word', `Báo cáo ${getPeriodTitle()} đã được tải về máy.`);
    }

