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
      } else if (action === 'setTelegramWebhook') {
        var webAppUrl = e.parameter.webAppUrl || ScriptApp.getService().getUrl();
        var token = e.parameter.botToken || '9210349656:AAHjejkU7x5MWi71IBoHpQlhKAG59Z3BJA';
        var webhookRes = registerTelegramWebhook(token, webAppUrl);
        result = {
          success: true,
          message: 'Đã kích hoạt Webhook Telegram thành công!',
          webAppUrl: webAppUrl,
          telegramResponse: webhookRes,
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

    // 1. Phân biệt Telegram Webhook (Nhận lệnh từ Telegram Bot)
    if (body.update_id || body.message || body.callback_query) {
      return handleTelegramWebhook(body);
    }

    // 2. Dữ liệu có thể được bọc trong field data hoặc gửi trực tiếp từ Web App
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
      error: 'Lỗi khi xử lý: ' + err.toString(),
      message: 'Lỗi khi xử lý: ' + err.toString(),
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
    if (!data) return;

    var token = (data.telegramSettings && data.telegramSettings.botToken) || (data.telegramConfig && data.telegramConfig.botToken) || '9210349656:AAHjejkU7x5MWi71IBoHpQlhKAG59Z3BJA';
    var chat = (data.telegramSettings && data.telegramSettings.chatId) || (data.telegramConfig && data.telegramConfig.chatId) || '6403485662';

    if (!token || !chat) {
      Logger.log('Missing Telegram Bot Token or Chat ID');
      return;
    }

    var schedules = data.telegramSchedules || [];
    var today = new Date();
    var curDay = today.getDate();

    // 1. Nhắc nhở ngắn gọn vào ngày 9 (trước BC Nhà nước) và ngày 29 (trước BC Chi bộ)
    if (curDay === 9 || curDay === 29) {
      var reminderText = (data.telegramSettings && data.telegramSettings.reminderMsg && data.telegramSettings.reminderMsg.trim()) 
        ? data.telegramSettings.reminderMsg.trim() 
        : 'Sếp ơi, ngày mai em làm báo cáo tháng, Sếp xem có gì cần bổ sung không ạ!';
      sendTelegramMessage(token, chat, reminderText);
      Logger.log('Sent reminder message on day: ' + curDay);
    }

    // 2. Chạy gửi báo cáo theo lịch cấu hình đã thiết lập (ngắn gọn, chuẩn mực)
    if (schedules.length > 0) {
      for (var s = 0; s < schedules.length; s++) {
        var sched = schedules[s];
        if (sched.enabled && (sched.dayOfMonth === curDay || sched.scheduleType === 'daily')) {
          var isParty = sched.mode === 'party';
          var repType = isParty ? 'Chi bộ' : 'công tác Thể dục Thể thao';
          var curM = today.getMonth() + 1;
          var curY = today.getFullYear();
          var timeTitle = 'tháng ' + curM + ' năm ' + curY;
          if (sched.period === 'quarter') {
            timeTitle = 'Quý ' + Math.floor((curM - 1) / 3 + 1) + ' năm ' + curY;
          } else if (sched.period === 'year') {
            timeTitle = 'năm ' + curY;
          }
          var msg = 'Em gửi sếp báo cáo ' + repType + ' ' + timeTitle + ' ạ!';
          sendTelegramMessage(token, chat, msg);
          Logger.log('Sent Telegram schedule: ' + sched.name);
        }
      }
    } else {
      var msg = 'Em gửi sếp báo cáo công tác Thể dục Thể thao tháng ' + (today.getMonth() + 1) + ' năm ' + today.getFullYear() + ' ạ!';
      sendTelegramMessage(token, chat, msg);
      Logger.log('Sent default Telegram report message.');
    }
  } catch (e) {
    Logger.log('Error in scheduledTelegramReportTrigger: ' + e.toString());
  }
}

function sendTelegramDocument(botToken, chatId, fileBlob, filename, caption) {
  if (!botToken || !chatId || !fileBlob) {
    throw new Error('Thiếu Bot Token, Chat ID hoặc fileBlob');
  }
  var url = 'https://api.telegram.org/bot' + encodeURIComponent(botToken) + '/sendDocument';
  var payload = {
    chat_id: chatId,
    document: fileBlob.setName(filename),
    caption: caption || '',
    parse_mode: 'HTML'
  };
  var options = {
    method: 'post',
    payload: payload,
    muteHttpExceptions: true
  };
  var response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
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

/**
 * ==============================================================================
 * TRỢ LÝ ẢO TELEGRAM 2 CHIỀU (INTERACTIVE BOT - NHẬN LỆNH & THÊM GIẢI QUA TIN NHẮN)
 * ==============================================================================
 */

/**
 * Đăng ký Webhook Telegram liên kết với Google Apps Script Web App
 */
function registerTelegramWebhook(token, webAppUrl) {
  if (!token || !webAppUrl) {
    throw new Error('Thiếu Bot Token hoặc Web App URL');
  }
  var url = 'https://api.telegram.org/bot' + encodeURIComponent(token) + '/setWebhook?url=' + encodeURIComponent(webAppUrl);
  var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  return JSON.parse(resp.getContentText());
}

/**
 * Xử lý sự kiện tin nhắn người dùng gửi tới Bot qua Webhook
 */
function handleTelegramWebhook(update) {
  try {
    if (!update || !update.message) {
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    var msgObj = update.message;
    var chatId = String(msgObj.chat.id);
    var rawText = (msgObj.text || '').trim();
    var lowerText = rawText.toLowerCase();

    var data = getAppData() || {};
    var token = (data.telegramSettings && data.telegramSettings.botToken) || '9210349656:AAHjejkU7x5MWi71IBoHpQlhKAG59Z3BJA';
    var myChatId = (data.telegramSettings && String(data.telegramSettings.chatId)) || '6403485662';

    // 1. Kiểm tra quyền hạn bảo mật: Chỉ phục vụ đồng chí Trần Quốc Được
    if (chatId !== myChatId) {
      sendTelegramMessage(token, chatId, '⚠️ <b>TRUY CẬP BỊ TỪ CHỐI</b>\n\nXin lỗi, tôi là trợ lý nghiệp vụ độc quyền của đồng chí <b>Trần Quốc Được</b> (Cán bộ phụ trách Thể dục thể thao Phường Tân Khai).');
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. NHÓM LỆNH: YÊU CẦU MẪU ĐIỀN FORM THÊM GIẢI ĐẤU
    if (lowerText === '/themgiai' || lowerText === 'thêm giải' || lowerText === 'them giai' || lowerText === 'cập nhật giải' || lowerText === 'cap nhat giai' || lowerText === 'nhập giải' || lowerText === 'nhap giai') {
      var template = '📝 <b>MẪU CẬP NHẬT GIẢI ĐẤU MỚI</b>\n\n' +
                     'Anh Được bấm giữ để <b>Sao chép (Copy)</b> mẫu bên dưới, sửa lại thông tin thực tế rồi gửi lại cho em nhé:\n\n' +
                     '<code>Tên giải: \n' +
                     'Ngày: 15/10/2026\n' +
                     'Bộ môn: Bóng đá\n' +
                     'Số VĐV: 60\n' +
                     'Địa điểm: Trung tâm DVTH Phường Tân Khai\n' +
                     'Huy chương: 1 vàng, 1 bạc, 2 đồng\n' +
                     'Kinh phí: 15.000.000\n' +
                     'Ghi chú: Đạt giải Nhất toàn đoàn</code>';
      sendTelegramMessage(token, chatId, template);
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. NHÓM LỆNH: NHẬN DỮ LIỆU ĐIỀN FORM VỪA GỬI ĐỂ LƯU VÀO HỆ THỐNG
    if (lowerText.indexOf('tên giải:') !== -1 || lowerText.indexOf('ten giai:') !== -1 || (lowerText.indexOf('tên:') !== -1 && lowerText.indexOf('ngày:') !== -1)) {
      var addRes = parseAndAddNewActivity(rawText, data);
      if (addRes.success) {
        saveAppData(data); // Lưu trực tiếp vào Google Sheet trên Drive
        var act = addRes.activity;
        var reply = '✅ <b>ĐÃ THÊM GIẢI ĐẤU THÀNH CÔNG VÀO HỆ THỐNG!</b>\n\n' +
                    '🏆 <b>Tên giải:</b> ' + act.title + '\n' +
                    '🏷️ <b>Mã giải:</b> ' + act.code + ' (Vị trí #1 Mới nhất)\n' +
                    '📅 <b>Ngày tổ chức:</b> ' + act.date + '\n' +
                    '⚽ <b>Bộ môn:</b> ' + act.sport + '\n' +
                    '👥 <b>Quy mô:</b> ' + act.participants + ' VĐV | 📍 ' + act.location + '\n' +
                    '🥇 <b>Thành tích:</b> ' + act.totalMedals + ' HC (' + act.goldMedals + '🥇, ' + act.silverMedals + '🥈, ' + act.bronzeMedals + '🥉)\n' +
                    (act.achievementNote ? ('⭐ <b>Điểm nhấn:</b> ' + act.achievementNote + '\n') : '') +
                    '💰 <b>Kinh phí:</b> ' + (act.budgetTotal || 0).toLocaleString('vi-VN') + ' đ\n\n' +
                    '🌐 <i>Dữ liệu đã tự động đồng bộ lên Google Sheet & hệ thống web của anh!</i>';
        sendTelegramMessage(token, chatId, reply);
      } else {
        sendTelegramMessage(token, chatId, '⚠️ <b>Lỗi khi thêm giải:</b> ' + addRes.error + '\n\nAnh Được hãy kiểm tra lại mẫu form hoặc gõ <b>Thêm giải</b> để lấy lại mẫu chuẩn nhé.');
      }
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. NHÓM LỆNH: YÊU CẦU XUẤT VÀ GỬI BÁO CÁO QUA TIN NHẮN
    if (lowerText.indexOf('báo cáo') !== -1 || lowerText.indexOf('bao cao') !== -1) {
      var isParty = lowerText.indexOf('chi bộ') !== -1 || lowerText.indexOf('chibo') !== -1;
      var curM = new Date().getMonth() + 1;
      var curY = new Date().getFullYear();

      // Nhận diện tháng
      var monthMatch = lowerText.match(/tháng\s*(\d+)/i) || lowerText.match(/thg\s*(\d+)/i) || lowerText.match(/t\s*(\d+)/i);
      if (monthMatch && monthMatch[1]) {
        curM = parseInt(monthMatch[1]);
      }

      // Nhận diện quý
      var quarterMatch = lowerText.match(/quý\s*(\d+)/i) || lowerText.match(/quy\s*(\d+)/i) || lowerText.match(/q\s*(\d+)/i);
      var isQuarter = !!quarterMatch;
      var curQ = isQuarter ? parseInt(quarterMatch[1]) : 1;

      var repType = isParty ? 'Chi bộ' : 'công tác Thể dục Thể thao';
      var timeText = isQuarter ? ('Quý ' + curQ + ' năm ' + curY) : ('tháng ' + curM + ' năm ' + curY);

      // Tạo Blob Word và gửi
      var wordBlob = generateReportWordBlob(data, isParty, isQuarter ? 'quarter' : 'month', curM, curQ, curY);
      var fileName = 'BaoCao_' + (isParty ? 'ChiBo' : 'TDTT') + '_' + (isQuarter ? ('Q' + curQ) : ('T' + curM)) + '_' + curY + '_TranQuocDuoc.doc';
      var caption = 'Em gửi sếp báo cáo ' + repType + ' ' + timeText + ' ạ!';

      sendTelegramDocument(token, chatId, wordBlob, fileName, caption);
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    // 5. NHÓM LỆNH: TRA CỨU TIẾN ĐỘ THI ĐUA / CHỈ TIÊU (KPI)
    if (lowerText === '/kpi' || lowerText === 'kpi' || lowerText.indexOf('tiến độ') !== -1 || lowerText.indexOf('tien do') !== -1 || lowerText.indexOf('chỉ tiêu') !== -1) {
      var kpiReply = generateKpiStatusMessage(data);
      sendTelegramMessage(token, chatId, kpiReply);
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    // 6. NHÓM LỆNH: GIẢI ĐẤU MỚI NHẤT
    if (lowerText.indexOf('mới nhất') !== -1 || lowerText.indexOf('moi nhat') !== -1 || lowerText === '/latest') {
      var acts = data.activities || [];
      if (acts.length === 0) {
        sendTelegramMessage(token, chatId, 'Hệ thống hiện chưa ghi nhận giải đấu nào.');
      } else {
        var top1 = acts[0];
        var top1Msg = '⭐ <b>GIẢI ĐẤU MỚI TỔ CHỨC GẦN ĐÂY NHẤT (#1):</b>\n\n' +
                      '🏆 <b>' + top1.title + '</b>\n' +
                      '🏷️ Mã giải: <b>' + top1.code + '</b> | Ngày: <b>' + top1.date + '</b>\n' +
                      '⚽ Bộ môn: ' + top1.sport + ' | Cấp độ: ' + top1.category + '\n' +
                      '👥 Quy mô: ' + (top1.participants || 0) + ' VĐV | 📍 ' + top1.location + '\n' +
                      '🥇 Thành tích: ' + (top1.totalMedals || 0) + ' HC (' + (top1.goldMedals || 0) + '🥇, ' + (top1.silverMedals || 0) + '🥈, ' + (top1.bronzeMedals || 0) + '🥉)\n' +
                      (top1.achievementNote ? ('🎖️ Điểm nhấn: ' + top1.achievementNote + '\n') : '') +
                      '💰 Kinh phí: ' + (top1.budgetTotal || 0).toLocaleString('vi-VN') + ' đ\n\n' +
                      '📌 <i>Đang xếp ở vị trí số 1 trên hệ thống.</i>';
        sendTelegramMessage(token, chatId, top1Msg);
      }
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    // 7. NHÓM LỆNH: MẠNG LƯỚI & DANH BẠ CLB
    if (lowerText.indexOf('clb') !== -1 || lowerText.indexOf('danh bạ') !== -1 || lowerText.indexOf('danh ba') !== -1) {
      var clubs = data.clubs || [];
      var clbMsg = '🤝 <b>MẠNG LƯỚI CÂU LẠC BỘ TDTT CƠ SỞ (' + clubs.length + ' CLB):</b>\n\n';
      for (var c = 0; c < clubs.length; c++) {
        var clb = clubs[c];
        clbMsg += (c + 1) + '. <b>' + clb.name + '</b> (' + (clb.membersCount || 0) + ' HV)\n' +
                  '   👤 Chủ nhiệm: ' + (clb.leaderName || 'Đang cập nhật') + ' - 📞 <code>' + (clb.leaderPhone || 'Chưa có SĐT') + '</code>\n';
      }
      sendTelegramMessage(token, chatId, clbMsg);
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    // 8. TIN NHẮN MẶC ĐỊNH / MENU HƯỚNG DẪN (/start, /help)
    var helpMsg = '👋 <b>KÍNH CHÀO SẾP TRẦN QUỐC ĐƯỢC!</b>\n' +
                  '<i>Em là Trợ lý ảo Quản lý TDTT Phường Tân Khai.</i>\n\n' +
                  'Sếp có thể nhắn tin cho em các câu lệnh sau:\n\n' +
                  '1️⃣ <b>Thêm giải:</b> Nhận mẫu form điền để thêm giải mới vào hệ thống.\n' +
                  '2️⃣ <b>Gửi tôi báo cáo chi bộ tháng 9:</b> Xuất và gửi ngay file Word báo cáo Chi bộ.\n' +
                  '3️⃣ <b>Báo cáo TDTT tháng 10:</b> Xuất và gửi file Word báo cáo Nhà nước.\n' +
                  '4️⃣ <b>KPI</b> hoặc <b>Tiến độ:</b> Xem tỷ lệ hoàn thành chỉ tiêu năm.\n' +
                  '5️⃣ <b>Giải mới nhất:</b> Xem thông tin giải đấu #1.\n' +
                  '6️⃣ <b>CLB:</b> Xem danh bạ và SĐT các Chủ nhiệm CLB.';
    sendTelegramMessage(token, chatId, helpMsg);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Error handleTelegramWebhook: ' + err.toString());
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Phân tích chuỗi form nhập giải đấu từ tin nhắn của người dùng và lưu vào data
 */
function parseAndAddNewActivity(text, data) {
  var lines = text.split('\n');
  var fields = {};

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;
    var colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      var key = line.substring(0, colonIdx).trim().toLowerCase();
      var val = line.substring(colonIdx + 1).trim();
      fields[key] = val;
    }
  }

  var title = fields['tên giải'] || fields['ten giai'] || fields['tên'] || fields['ten'];
  if (!title) {
    return { success: false, error: 'Chưa nhập Tên giải đấu.' };
  }

  // Chuẩn hóa Tên giải
  title = title.replace(/\s+/g, ' ').trim();
  title = title.split(' ').map(function(w) {
    return w ? (w.charAt(0).toUpperCase() + w.slice(1)) : '';
  }).join(' ');

  var date = fields['ngày'] || fields['ngay'] || '';
  if (!date) {
    var now = new Date();
    date = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
  }

  var sport = fields['bộ môn'] || fields['bo mon'] || fields['môn'] || fields['mon'] || '';
  if (!sport) {
    var lowerTitle = title.toLowerCase();
    if (lowerTitle.indexOf('bóng đá') !== -1) sport = 'Bóng đá';
    else if (lowerTitle.indexOf('cầu lông') !== -1) sport = 'Cầu lông';
    else if (lowerTitle.indexOf('bóng chuyền') !== -1) sport = 'Bóng chuyền';
    else if (lowerTitle.indexOf('pickleball') !== -1) sport = 'Pickleball';
    else if (lowerTitle.indexOf('cờ tướng') !== -1 || lowerTitle.indexOf('cờ vua') !== -1) sport = 'Cờ tướng';
    else if (lowerTitle.indexOf('điền kinh') !== -1 || lowerTitle.indexOf('chạy') !== -1) sport = 'Điền kinh';
    else sport = 'Thể thao tổng hợp';
  }

  var participants = parseInt((fields['số vđv'] || fields['so vdv'] || fields['vđv'] || fields['vdv'] || '60').replace(/[^\d]/g, '')) || 60;
  var location = fields['địa điểm'] || fields['dia diem'] || 'Trung tâm Dịch vụ tổng hợp Phường Tân Khai';
  var note = fields['ghi chú'] || fields['ghi chu'] || fields['thành tích'] || fields['thanh tich'] || '';

  // Phân tích huy chương
  var medalsStr = (fields['huy chương'] || fields['huy chuong'] || '').toLowerCase();
  var gold = 0, silver = 0, bronze = 0;
  var goldM = medalsStr.match(/(\d+)\s*(?:vàng|vang|hcv)/i);
  if (goldM) gold = parseInt(goldM[1]) || 0;
  var silverM = medalsStr.match(/(\d+)\s*(?:bạc|bac|hcb)/i);
  if (silverM) silver = parseInt(silverM[1]) || 0;
  var bronzeM = medalsStr.match(/(\d+)\s*(?:đồng|dong|hcđ|hcd)/i);
  if (bronzeM) bronze = parseInt(bronzeM[1]) || 0;

  // Nếu người dùng chỉ gõ 1 số (vd: "3 huy chương" hoặc "3")
  if (gold === 0 && silver === 0 && bronze === 0) {
    var singleNum = parseInt(medalsStr.replace(/[^\d]/g, '')) || 0;
    if (singleNum > 0) gold = singleNum;
  }
  var totalMedals = gold + silver + bronze;

  // Kinh phí
  var budgetStr = (fields['kinh phí'] || fields['kinh phi'] || fields['tiền'] || '0').replace(/[^\d]/g, '');
  var budgetTotal = parseInt(budgetStr) || 0;
  var budgetWard = Math.round(budgetTotal * 0.7);
  var budgetPrize = budgetTotal - budgetWard;

  if (!data.activities) data.activities = [];
  var newCode = 'T-' + String(data.activities.length + 1).padStart(2, '0');

  var pDate = date.split('/');
  var year = pDate.length === 3 ? parseInt(pDate[2]) : new Date().getFullYear();
  var month = pDate.length === 3 ? parseInt(pDate[1]) : (new Date().getMonth() + 1);
  var quarter = Math.floor((month - 1) / 3) + 1;

  var item = {
    id: 'act-' + new Date().getTime(),
    code: newCode,
    title: title,
    sport: sport,
    category: 'Cấp phường',
    date: date,
    year: year,
    quarter: quarter,
    month: month,
    participants: participants,
    participantsUnit: 'VĐV',
    location: location,
    achievementNote: note,
    isReported: false,
    reportedInReport: null,
    status: 'Đã hoàn thành',
    goldMedals: gold,
    silverMedals: silver,
    bronzeMedals: bronze,
    totalMedals: totalMedals,
    budgetWard: budgetWard,
    budgetPrize: budgetPrize,
    budgetTotal: budgetTotal,
    budgetStatus: 'Đã quyết toán'
  };

  // Đưa lên đầu danh sách (Vị trí #1 Mới nhất)
  data.activities.unshift(item);

  return { success: true, activity: item };
}

/**
 * Tạo file Word Báo cáo chuẩn thể thức hành chính từ dữ liệu Google Sheet
 */
function generateReportWordBlob(data, isParty, periodType, month, quarter, year) {
  var acts = data.activities || [];
  var filteredActs = [];

  // Lọc hoạt động theo kỳ
  if (periodType === 'quarter') {
    filteredActs = acts.filter(function(a) {
      return a.quarter === quarter && a.year === year;
    });
  } else {
    // Tháng
    if (isParty) {
      // Chi bộ: từ ngày 1 đến cuối tháng
      filteredActs = acts.filter(function(a) {
        return a.month === month && a.year === year;
      });
    } else {
      // Nhà nước: từ ngày 10 tháng trước đến ngày 10 tháng này
      filteredActs = acts.filter(function(a) {
        return (a.month === month && a.year === year) || (a.isCarryOver);
      });
    }
  }

  var recipientText = isParty ? 'Chi bộ Trung tâm Dịch vụ Tổng hợp' : 'Văn phòng Trung tâm Dịch vụ Tổng hợp';
  var timeTitle = periodType === 'quarter' ? ('QUÝ ' + quarter + ' NĂM ' + year) : ('THÁNG ' + month + ' NĂM ' + year);

  var totalParticipants = 0, totalMedals = 0, totalGold = 0, totalSilver = 0, totalBronze = 0, totalBudget = 0;
  for (var i = 0; i < filteredActs.length; i++) {
    totalParticipants += parseInt(filteredActs[i].participants) || 0;
    totalMedals += parseInt(filteredActs[i].totalMedals) || 0;
    totalGold += parseInt(filteredActs[i].goldMedals) || 0;
    totalSilver += parseInt(filteredActs[i].silverMedals) || 0;
    totalBronze += parseInt(filteredActs[i].bronzeMedals) || 0;
    totalBudget += parseInt(filteredActs[i].budgetTotal) || 0;
  }

  var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
    '<head><meta charset="utf-8"><style>' +
    'body { font-family: "Times New Roman", Times, serif; font-size: 14pt; line-height: 1.6; color: #000; margin: 20mm; }' +
    'h1, h2, h3 { font-family: "Times New Roman", Times, serif; text-align: center; }' +
    'table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }' +
    'th, td { border: 1px solid #000; padding: 6px 8px; font-size: 13pt; text-align: left; }' +
    'th { background-color: #f2f2f2; text-align: center; font-weight: bold; }' +
    '</style></head><body>' +
    '<table style="border:none; margin-bottom: 20px;">' +
    '<tr style="border:none;">' +
    '<td style="border:none; width: 45%; text-align: center; vertical-align: top;">' +
    '<b>UBND PHƯỜNG TÂN KHAI</b><br><b>TRUNG TÂM DỊCH VỤ TỔNG HỢP</b><br>────────' +
    '</td>' +
    '<td style="border:none; width: 55%; text-align: center; vertical-align: top;">' +
    '<b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br><b>Độc lập - Tự do - Hạnh phúc</b><br>────────' +
    '</td></tr></table>' +
    '<h2 style="margin-bottom: 4px;">KẾT QUẢ THỰC HIỆN NHIỆM VỤ CÔNG TÁC THỂ DỤC THỂ THAO ' + timeTitle + '</h2>' +
    '<p style="text-align: center; font-style: italic; margin-top: 0;">' + (isParty ? '(Phục vụ sinh hoạt Chi bộ định kỳ)' : '(Gửi Văn phòng Trung tâm DVTH)') + '</p>' +
    '<p><b>Kính gửi:</b> ' + recipientText + '</p>' +
    '<p>Họ và tên người báo cáo: <b>Trần Quốc Được</b><br>' +
    'Chức danh / Vị trí: ' + (isParty ? 'Đảng viên - Cán bộ phụ trách Thể dục Thể thao' : 'Cán bộ phụ trách Thể dục Thể thao') + '<br>' +
    'Lĩnh vực phụ trách: Thể dục thể thao và Thể dục thể thao thanh thiếu nhi.</p>' +
    '<p>Thực hiện nhiệm vụ chuyên môn được phân công, bộ phận Thể dục thể thao kính báo cáo kết quả tổ chức các hoạt động và phát triển phong trào TDTT ' + timeTitle.toLowerCase() + ' như sau:</p>' +
    '<p><b>I. CÔNG TÁC TỔ CHỨC CÁC HOẠT ĐỘNG THỂ DỤC THỂ THAO CẤP PHƯỜNG</b></p>';

  if (filteredActs.length === 0) {
    html += '<p><i>Trong kỳ báo cáo, không phát sinh giải đấu quy mô lớn. Duy trì các hoạt động tập luyện thể thao thường xuyên tại các CLB cơ sở.</i></p>';
  } else {
    for (var j = 0; j < filteredActs.length; j++) {
      var a = filteredActs[j];
      html += '<p>• <b>' + a.title + '</b> (Ngày ' + a.date + ') tại ' + a.location + '. Quy mô: ' + a.participants + ' VĐV tham gia sôi nổi. ' +
        (a.achievementNote ? ('Kết quả: ' + a.achievementNote + '. ') : '') +
        (a.totalMedals > 0 ? ('Đạt ' + a.totalMedals + ' huy chương (' + a.goldMedals + ' HCV, ' + a.silverMedals + ' HCB, ' + a.bronzeMedals + ' HCĐ).') : '') +
        '</p>';
    }
  }

  html += '<p><b>II. ĐÁNH GIÁ CHUNG VÀ PHƯƠNG HƯỚNG KỲ TỚI</b></p>' +
    '<p>- Nhìn chung công tác TDTT trong kỳ đã bám sát kế hoạch đề ra, phong trào quần chúng tiếp tục lan tỏa sâu rộng, chất lượng chuyên môn tại các giải thi đấu được nâng lên rõ rệt.</p>' +
    '<p>- Thời gian tới, Bộ phận TDTT tiếp tục duy trì luyện tập, tổ chức các giải phong trào và quản lý khai thác hiệu quả cơ sở vật chất thể thao hiện có.</p>' +
    '<p style="font-style: italic;">Kính báo cáo ' + recipientText + ' xem xét, theo dõi và tổng hợp.</p>' +
    '<table style="border:none; margin-top: 30px;">' +
    '<tr style="border:none;">' +
    '<td style="border:none; width: 50%;"></td>' +
    '<td style="border:none; width: 50%; text-align: center;">' +
    '<i>Tân Khai, ngày ' + new Date().getDate() + ' tháng ' + (new Date().getMonth() + 1) + ' năm ' + new Date().getFullYear() + '</i><br>' +
    '<b>NGƯỜI LẬP BÁO CÁO</b><br><br><br><br>' +
    '<b>Trần Quốc Được</b>' +
    '</td></tr></table></body></html>';

  return Utilities.newBlob(html, 'application/msword', 'BaoCao.doc');
}

/**
 * Tạo tin nhắn báo cáo tiến độ KPI thi đua năm
 */
function generateKpiStatusMessage(data) {
  var acts = data.activities || [];
  var kpi = data.kpiTargets || { targetActivities: 20, targetParticipants: 1500, targetMedals: 30, targetClubs: 5 };
  var totalActs = acts.length;
  var totalParticipants = 0;
  var totalMedals = 0;
  for (var i = 0; i < acts.length; i++) {
    totalParticipants += parseInt(acts[i].participants) || 0;
    totalMedals += parseInt(acts[i].totalMedals) || 0;
  }
  var totalClubs = (data.clubs || []).length;

  var actPct = Math.round((totalActs / (kpi.targetActivities || 20)) * 100);
  var partPct = Math.round((totalParticipants / (kpi.targetParticipants || 1500)) * 100);
  var medalPct = Math.round((totalMedals / (kpi.targetMedals || 30)) * 100);
  var clubPct = Math.round((totalClubs / (kpi.targetClubs || 5)) * 100);
  var avgPct = Math.round((actPct + partPct + medalPct + clubPct) / 4);

  var msg = '📊 <b>TIẾN ĐỘ THỰC HIỆN CHỈ TIÊU THI ĐUA NĂM ' + new Date().getFullYear() + '</b>\n' +
    '⭐ Xếp loại: <b>' + (avgPct >= 100 ? 'XUẤT SẮC - VƯỢT CHỈ TIÊU' : 'ĐẠT KẾ HOẠCH') + ' (' + avgPct + '%)</b>\n\n' +
    '1. 🏆 <b>Giải đấu:</b> ' + totalActs + ' / ' + kpi.targetActivities + ' giải (' + actPct + '%)\n' +
    '2. 👥 <b>Lượt VĐV:</b> ' + totalParticipants.toLocaleString('vi-VN') + ' / ' + (kpi.targetParticipants || 1500).toLocaleString('vi-VN') + ' lượt (' + partPct + '%)\n' +
    '3. 🥇 <b>Huy chương:</b> ' + totalMedals + ' / ' + kpi.targetMedals + ' HC (' + medalPct + '%)\n' +
    '4. 🤝 <b>CLB duy trì:</b> ' + totalClubs + ' / ' + kpi.targetClubs + ' CLB (' + clubPct + '%)\n\n' +
    '📌 <i>Phong trào TDTT Phường Tân Khai đã hoàn thành và vượt mức toàn bộ các chỉ tiêu kế hoạch năm được giao.</i>';

  return msg;
}

/**
 * ==============================================================================
 * HÀM KÍCH HOẠT ỦY QUYỀN GOOGLE (BẮT BUỘC CHẠY 1 LẦN)
 * ==============================================================================
 */
function capQuyenTelegram() {
  // Lệnh gọi trực tiếp không dùng try-catch để buộc Google bật cửa sổ cấp quyền
  var resp = UrlFetchApp.fetch('https://api.telegram.org');
  Logger.log('Đã cấp quyền kết nối Telegram thành công! Mã: ' + resp.getResponseCode());
}
