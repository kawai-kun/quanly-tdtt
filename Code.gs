/**
 * ==============================================================================
 * HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO
 * TRUNG TÂM DỊCH VỤ TỔNG HỢP - UBND PHƯỜNG TÂN KHAI
 * Backend Google Apps Script (REST API & Web App) - v4.1
 * ==============================================================================
 */

// ID Google Sheet của bạn trên Google Drive
const MY_SPREADSHEET_ID = '1UFPIHG-TzG5h0imx6o5-Irf3klK1fhQ226sTe34HPx8';
const DB_SHEET_NAME     = 'Database_TDTT';
const BACKUP_SHEET      = 'Backup_TDTT';
const DB_CELL           = 'A1';
const DB_META_CELL      = 'B1';
const CHUNK_SIZE        = 45000;
const MAX_BACKUPS       = 3;
const CURRENT_VERSION   = '4.0';

/**
 * ==============================================================================
 * HTTP GET HANDLER (Hỗ trợ gọi từ GitHub Pages lẫn mở trực tiếp Web App)
 * ==============================================================================
 */
function doGet(e) {
  // 1. Kiểm tra xem có tham số gọi API từ GitHub Pages không
  if (e && e.parameter && e.parameter.action) {
    var action = e.parameter.action;
    var result = {};

    try {
      if (action === 'getAppData' || action === 'load_all') {
        var data = getAppData();
        result = {
          success: true,
          status: 'success',
          data: data,
          timestamp: new Date().toISOString()
        };
      } else if (action === 'info') {
        result = {
          success: true,
          data: getStorageInfo(),
          timestamp: new Date().toISOString()
        };
      } else if (action === 'listBackups') {
        result = {
          success: true,
          data: listBackups(),
          timestamp: new Date().toISOString()
        };
      } else if (action === 'test') {
        result = {
          success: true,
          message: 'Kết nối Google Apps Script API Phường Tân Khai thành công!',
          spreadsheetId: MY_SPREADSHEET_ID,
          version: CURRENT_VERSION,
          timestamp: new Date().toISOString()
        };
      } else if (action === 'sendTelegram') {
        var token = e.parameter.botToken;
        var chat = e.parameter.chatId;
        var text = e.parameter.text || generateTelegramSummaryReport();
        var tgRes = sendTelegramMessage(token, chat, text);
        result = {
          success: true,
          message: 'Đã gửi báo cáo Telegram thành công!',
          telegramResponse: tgRes,
          timestamp: new Date().toISOString()
        };
      } else if (action === 'setupTelegramTrigger') {
        var sched = e.parameter.schedule || 'monthly_25';
        var trigRes = setupTelegramTrigger(sched);
        result = {
          success: true,
          message: trigRes.message,
          timestamp: new Date().toISOString()
        };
      } else {
        result = {
          success: false,
          error: 'Hành động không hợp lệ: ' + action
        };
      }
    } catch (err) {
      result = {
        success: false,
        error: err.toString()
      };
    }

    // Hỗ trợ JSONP nếu có callback
    if (e.parameter.callback) {
      return ContentService.createTextOutput(e.parameter.callback + '(' + JSON.stringify(result) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 2. Nếu mở trực tiếp URL Web App (không truyền action), hiển thị giao diện HTML
  try {
    return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('UBND Phường Tân Khai - Quản lý TDTT')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      message: 'API Google Apps Script Phường Tân Khai đang hoạt động bình thường.',
      status: 'online',
      spreadsheetId: MY_SPREADSHEET_ID,
      version: CURRENT_VERSION
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ==============================================================================
 * HTTP POST HANDLER (Nhận dữ liệu đồng bộ từ GitHub Pages lưu vào Google Sheet)
 * ==============================================================================
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Không nhận được dữ liệu (Empty payload)');
    }

    var contents = e.postData.contents;
    var body = JSON.parse(contents);

    // Dữ liệu có thể được bọc trong field data hoặc gửi trực tiếp
    var appData = body.data || body;
    var saveResult = saveAppData(appData);

    var response = {
      success: true,
      status: 'success',
      message: 'Đã đồng bộ thành công vào Google Sheet trên Google Drive!',
      saveResult: saveResult,
      timestamp: new Date().toISOString()
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    var errorResponse = {
      success: false,
      status: 'error',
      error: 'Lỗi khi đồng bộ lên Google Sheet: ' + err.toString(),
      message: 'Lỗi khi đồng bộ lên Google Sheet: ' + err.toString(),
      timestamp: new Date().toISOString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ==============================================================================
 * QUẢN LÝ SPREADSHEET & SHEET LƯU TRỮ
 * ==============================================================================
 */
function getOrCreateDatabaseSheet() {
  var ss;
  try {
    ss = SpreadsheetApp.openById(MY_SPREADSHEET_ID);
  } catch (e) {
    throw new Error('Không thể mở Google Spreadsheet. Vui lòng kiểm tra lại ID (' + MY_SPREADSHEET_ID + ') và quyền truy cập: ' + e.toString());
  }

  var sheet = ss.getSheetByName(DB_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(DB_SHEET_NAME);
    sheet.getRange('A2').setValue('KHÔNG XÓA SHEET NÀY - Nơi lưu trữ dữ liệu hệ thống Quản lý TDTT Phường Tân Khai');
    sheet.getRange('A2').setFontColor('#ff0000').setFontWeight('bold');
    sheet.getRange('B2').setValue('Metadata (không xóa):');
    sheet.getRange('B2').setFontColor('#006948').setFontWeight('bold');
  }
  return sheet;
}

function getOrCreateBackupSheet() {
  var ss = SpreadsheetApp.openById(MY_SPREADSHEET_ID);
  var sheet = ss.getSheetByName(BACKUP_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(BACKUP_SHEET);
    sheet.getRange('A1').setValue('Thời gian');
    sheet.getRange('B1').setValue('Kích thước (bytes)');
    sheet.getRange('C1').setValue('Số Giải đấu');
    sheet.getRange('D1').setValue('Số CLB');
    sheet.getRange('E1').setValue('JSON (Bản sao lưu)');
    sheet.getRange('A1:E1').setFontWeight('bold').setBackground('#dbeafe');
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(2, 120);
    sheet.setColumnWidth(3, 100);
    sheet.setColumnWidth(4, 100);
    sheet.setColumnWidth(5, 400);
  }
  return sheet;
}

/**
 * ==============================================================================
 * ĐỌC DỮ LIỆU TỪ GOOGLE SHEET (Tự động nhận diện Chunked / Standard)
 * ==============================================================================
 */
function getAppData() {
  try {
    var sheet = getOrCreateDatabaseSheet();
    var metaRaw = sheet.getRange(DB_META_CELL).getValue();
    var a1Raw = sheet.getRange(DB_CELL).getValue();

    if ((!a1Raw || a1Raw.toString().trim() === '') && (!metaRaw || metaRaw.toString().trim() === '')) {
      return null;
    }

    // 1. Ưu tiên đọc metadata chunked (nếu dung lượng lớn)
    if (metaRaw && typeof metaRaw === 'string' && metaRaw.trim() !== '') {
      try {
        var meta = JSON.parse(metaRaw);
        if (meta && meta._chunked) {
          var count = meta.count || 0;
          var joined = '';
          for (var i = 1; i <= count; i++) {
            var chunk = sheet.getRange('A' + i).getValue();
            if (chunk) joined += chunk;
          }
          if (joined.trim() !== '') return JSON.parse(joined);
        }
      } catch (e) {
        // Fallback tiếp tục đọc ô A1 nếu metadata lỗi
      }
    }

    // 2. Đọc trực tiếp ô A1
    if (a1Raw && typeof a1Raw === 'string' && a1Raw.trim() !== '') {
      try {
        return JSON.parse(a1Raw);
      } catch (e) {
        // Ghép các chunk ở cột A nếu A1 chưa đủ
        var parts = [];
        var row = 1;
        while (row <= 100) {
          var v = sheet.getRange('A' + row).getValue();
          if (!v || String(v).trim() === '') break;
          parts.push(v);
          row++;
        }
        if (parts.length) {
          try { return JSON.parse(parts.join('')); } catch (e2) {}
        }
      }
    }

    return null;
  } catch (e) {
    Logger.log('Lỗi getAppData: ' + e.toString());
    throw new Error('Không thể đọc dữ liệu: ' + e.toString());
  }
}

/**
 * ==============================================================================
 * GHI DỮ LIỆU VÀO GOOGLE SHEET (Tự động Backup 3 bản + Chunking)
 * ==============================================================================
 */
function saveAppData(data) {
  try {
    if (!data || typeof data !== 'object') {
      throw new Error('Dữ liệu không hợp lệ');
    }

    var sheet = getOrCreateDatabaseSheet();
    var jsonStr = JSON.stringify(data);
    var size = jsonStr.length;

    // 1. Tự động sao lưu dữ liệu cũ vào sheet Backup_TDTT
    try {
      var oldData = getAppData();
      if (oldData && (oldData.activities || oldData.clubs || oldData.schedules || oldData.facilities)) {
        _saveBackup(oldData);
      }
    } catch (e) {
      Logger.log('Không thể sao lưu (bỏ qua): ' + e.toString());
    }

    // 2. Xóa vùng dữ liệu cũ (A1:A50, B1)
    sheet.getRange('A1:A50').clearContent();
    sheet.getRange(DB_META_CELL).clearContent();

    // 3. Ghi dữ liệu mới
    if (size <= CHUNK_SIZE) {
      sheet.getRange(DB_CELL).setValue(jsonStr);
      Logger.log('Đã lưu trực tiếp A1: ' + size + ' bytes');
    } else {
      var chunks = [];
      for (var i = 0; i < size; i += CHUNK_SIZE) {
        chunks.push(jsonStr.substring(i, i + CHUNK_SIZE));
      }
      for (var j = 0; j < chunks.length; j++) {
        sheet.getRange('A' + (j + 1)).setValue(chunks[j]);
      }
      var meta = {
        _chunked: true,
        count: chunks.length,
        totalSize: size,
        version: CURRENT_VERSION,
        updatedAt: new Date().toISOString()
      };
      sheet.getRange(DB_META_CELL).setValue(JSON.stringify(meta));
      Logger.log('Đã lưu dạng chunked: ' + chunks.length + ' chunks, tổng ' + size + ' bytes');
    }

    return {
      success: true,
      size: size,
      chunked: size > CHUNK_SIZE,
      version: CURRENT_VERSION,
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    Logger.log('Lỗi saveAppData: ' + e.toString());
    throw new Error('Không thể lưu dữ liệu: ' + e.toString());
  }
}

/**
 * ==============================================================================
 * SAO LƯU (BACKUP) DỮ LIỆU
 * ==============================================================================
 */
function _saveBackup(data) {
  try {
    var sheet = getOrCreateBackupSheet();
    var jsonStr = JSON.stringify(data);
    var acts = (data.activities || []).length;
    var clubs = (data.clubs || []).length;

    // Chèn dòng mới ở dòng 2 (ngay sau tiêu đề)
    sheet.insertRowAfter(1);
    var r = sheet.getRange(2, 1, 1, 5);
    r.setValues([[
      new Date(),
      jsonStr.length,
      acts,
      clubs,
      jsonStr
    ]]);

    // Giữ lại đúng MAX_BACKUPS bản mới nhất
    var lastRow = sheet.getLastRow();
    if (lastRow > MAX_BACKUPS + 1) {
      sheet.deleteRows(MAX_BACKUPS + 2, lastRow - MAX_BACKUPS - 1);
    }
    Logger.log('Đã tạo bản sao lưu: ' + acts + ' giải đấu, ' + clubs + ' CLB');
  } catch (e) {
    Logger.log('Backup thất bại: ' + e.toString());
  }
}

/**
 * ==============================================================================
 * TIỆN ÍCH HỆ THỐNG & DANH SÁCH BACKUP
 * ==============================================================================
 */
function getDatabaseUrl() {
  var sheet = getOrCreateDatabaseSheet();
  return sheet.getParent().getUrl();
}

function getStorageInfo() {
  try {
    var data = getAppData();
    var jsonStr = data ? JSON.stringify(data) : '';
    var size = jsonStr.length;
    var sheet = getOrCreateDatabaseSheet();
    var metaRaw = sheet.getRange(DB_META_CELL).getValue();
    var chunked = false;
    var chunks = 1;
    if (metaRaw) {
      try {
        var m = JSON.parse(metaRaw);
        if (m && m._chunked) { chunked = true; chunks = m.count || 1; }
      } catch (e) {}
    }
    return {
      activities: data && data.activities ? data.activities.length : 0,
      clubs: data && data.clubs ? data.clubs.length : 0,
      schedules: data && data.schedules ? data.schedules.length : 0,
      facilities: data && data.facilities ? data.facilities.length : 0,
      reports: data && data.savedReports ? data.savedReports.length : 0,
      sizeBytes: size,
      sizeKB: (size / 1024).toFixed(2),
      chunked: chunked,
      chunks: chunks,
      usagePercent: ((size / 50000) * 100).toFixed(1) + '%',
      spreadsheetId: MY_SPREADSHEET_ID,
      url: getDatabaseUrl(),
      version: CURRENT_VERSION
    };
  } catch (e) {
    return { error: e.toString() };
  }
}

function listBackups() {
  try {
    var sheet = getOrCreateBackupSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    var rows = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
    var result = [];
    for (var i = 0; i < rows.length; i++) {
      result.push({
        row: i + 2,
        timestamp: rows[i][0],
        sizeBytes: rows[i][1],
        activities: rows[i][2],
        clubs: rows[i][3]
      });
    }
    return result;
  } catch (e) {
    return [];
  }
}

function restoreFromBackup(backupRow) {
  try {
    var sheet = getOrCreateBackupSheet();
    var row = backupRow || 2;
    var jsonStr = sheet.getRange(row, 5).getValue();
    if (!jsonStr) return { success: false, error: 'Không tìm thấy bản backup ở dòng ' + row };
    var data = JSON.parse(jsonStr);
    saveAppData(data);
    return { success: true, activities: (data.activities || []).length };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * ==============================================================================
 * TỰ ĐỘNG GỬI BÁO CÁO QUA TELEGRAM BOT (Định kỳ hoặc theo yêu cầu)
 * ==============================================================================
 */
function sendTelegramMessage(botToken, chatId, text) {
  if (!botToken || !chatId || !text) {
    throw new Error('Thiếu Bot Token, Chat ID hoặc Nội dung tin nhắn');
  }
  var url = 'https://api.telegram.org/bot' + encodeURIComponent(botToken) + '/sendMessage';
  var payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  var response = UrlFetchApp.fetch(url, options);
  var resCode = response.getResponseCode();
  var resText = response.getContentText();
  if (resCode !== 200) {
    throw new Error('Lỗi gửi Telegram (HTTP ' + resCode + '): ' + resText);
  }
  return JSON.parse(resText);
}

function generateTelegramSummaryReport() {
  var data = getAppData();
  if (!data) return 'Không tìm thấy dữ liệu trên hệ thống.';
  var acts = data.activities || [];
  var clubs = data.clubs || [];
  
  // Sắp xếp giải mới nhất lên đầu
  acts.sort(function(a, b) {
    var pA = (a.date || '').split('/');
    var pB = (b.date || '').split('/');
    var dA = pA.length === 3 ? new Date(+pA[2], +pA[1]-1, +pA[0]).getTime() : 0;
    var dB = pB.length === 3 ? new Date(+pB[2], +pB[1]-1, +pB[0]).getTime() : 0;
    return dB - dA;
  });

  var totalParticipants = 0;
  var totalMedals = 0;
  var totalGold = 0, totalSilver = 0, totalBronze = 0;
  var totalBudget = 0;
  for (var i = 0; i < acts.length; i++) {
    totalParticipants += parseInt(acts[i].participants) || 0;
    totalMedals += parseInt(acts[i].totalMedals) || 0;
    totalGold += parseInt(acts[i].goldMedals) || 0;
    totalSilver += parseInt(acts[i].silverMedals) || 0;
    totalBronze += parseInt(acts[i].bronzeMedals) || 0;
    totalBudget += parseInt(acts[i].budgetTotal) || 0;
  }

  var latest = acts[0] || {};
  var today = new Date();
  var dateStr = String(today.getDate()).padStart(2, '0') + '/' + String(today.getMonth() + 1).padStart(2, '0') + '/' + today.getFullYear();

  var msg = '🏆 <b>HỆ THỐNG QUẢN LÝ TDTT - PHƯỜNG TÂN KHAI</b>\n';
  msg += '📍 <i>Trung tâm Dịch vụ tổng hợp</i>\n';
  msg += '📅 <i>Thời điểm báo cáo: ' + dateStr + '</i>\n';
  msg += '👤 <b>Người lập:</b> Trần Quốc Được (Cán bộ TDTT)\n';
  msg += '📤 <b>Nơi nhận:</b> Văn phòng Trung tâm Dịch vụ Tổng hợp\n\n';
  msg += '📊 <b>CHỈ SỐ TỔNG QUAN HIỆN TẠI:</b>\n';
  msg += '• Tổng giải đấu/hoạt động: <b>' + acts.length + '</b> giải\n';
  msg += '• Tổng lượt VĐV tham gia: <b>' + totalParticipants.toLocaleString('vi-VN') + '</b> lượt\n';
  msg += '• Tổng thành tích huy chương: <b>' + totalMedals + '</b> HC (' + totalGold + '🥇, ' + totalSilver + '🥈, ' + totalBronze + '🥉)\n';
  msg += '• Mạng lưới CLB cơ sở: <b>' + clubs.length + '</b> CLB\n';
  msg += '• Tổng kinh phí đã giải ngân: <b>' + totalBudget.toLocaleString('vi-VN') + ' đ</b>\n\n';

  if (latest && latest.title) {
    msg += '⭐ <b>GIẢI ĐẤU MỚI TỔ CHỨC GẦN ĐÂY NHẤT (#1):</b>\n';
    msg += '• <b>' + latest.title + '</b>\n';
    msg += '  - Mã: ' + latest.code + ' | Ngày: ' + latest.date + '\n';
    msg += '  - Quy mô: ' + (latest.participants || 0) + ' VĐV | Thành tích: ' + (latest.totalMedals || 0) + ' HC\n';
    if (latest.achievementNote) msg += '  - Điểm nhấn: ' + latest.achievementNote + '\n';
  }
  msg += '\n📌 <i>Kính báo cáo Văn phòng Trung tâm Dịch vụ Tổng hợp xem xét, theo dõi và tổng hợp.</i>';
  return msg;
}

function scheduledTelegramReportTrigger() {
  try {
    var data = getAppData();
    if (!data || !data.telegramConfig || !data.telegramConfig.enabled) {
      Logger.log('Telegram report is not enabled.');
      return;
    }
    var cfg = data.telegramConfig;
    if (!cfg.botToken || !cfg.chatId) {
      Logger.log('Missing Telegram botToken or chatId.');
      return;
    }
    var msg = generateTelegramSummaryReport();
    sendTelegramMessage(cfg.botToken, cfg.chatId, msg);
    Logger.log('Sent scheduled Telegram report successfully.');
  } catch (e) {
    Logger.log('Error in scheduledTelegramReportTrigger: ' + e.toString());
  }
}

function setupTelegramTrigger(scheduleType) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'scheduledTelegramReportTrigger') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  if (!scheduleType || scheduleType === 'disabled') {
    return { success: true, message: 'Đã hủy lịch gửi báo cáo tự động.' };
  }

  if (scheduleType === 'weekly_monday') {
    ScriptApp.newTrigger('scheduledTelegramReportTrigger')
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.MONDAY)
      .atHour(8)
      .create();
  } else {
    // Mặc định chạy vào ngày 25 hàng tháng lúc 8h sáng
    ScriptApp.newTrigger('scheduledTelegramReportTrigger')
      .timeBased()
      .onMonthDay(25)
      .atHour(8)
      .create();
  }

  return { success: true, message: 'Đã kích hoạt lịch tự động gửi báo cáo Telegram (' + scheduleType + ').' };
}
