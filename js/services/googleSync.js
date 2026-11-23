/**
 * HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO - PHƯỜNG TÂN KHAI
 * Google Apps Script Cloud Sync Service (Google Drive & Google Sheet)
 */

import { state, lsSet } from '../state.js';
import { DEFAULT_API_URL } from '../data/constants.js';
import { sortActivitiesByLatest } from '../utils/formatters.js';
import { showToast } from '../utils/toast.js';
import { animateSpin } from '../utils/animations.js';

export function mergeActivitiesSmartly(localActs, remoteActs) {
  if (!Array.isArray(localActs)) localActs = [];
  if (!Array.isArray(remoteActs)) remoteActs = [];

  // Loại bỏ giải test Cờ Vây nếu có từ bất kỳ nguồn nào
  localActs = localActs.filter(a => !(a.title || '').toLowerCase().includes('cờ vây'));
  remoteActs = remoteActs.filter(a => !(a.title || '').toLowerCase().includes('cờ vây'));

  const merged = [...remoteActs];
  const seen = new Set();

  remoteActs.forEach(a => {
    if (a.id) seen.add(String(a.id));
    const cleanTitle = (a.title || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const key = cleanTitle + '_' + (a.date || '').trim();
    seen.add(key);
  });

  localActs.forEach(l => {
    const cleanTitle = (l.title || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const key = cleanTitle + '_' + (l.date || '').trim();
    const idStr = l.id ? String(l.id) : null;
    if (!seen.has(key) && (!idStr || !seen.has(idStr))) {
      merged.push(l);
      seen.add(key);
      if (idStr) seen.add(idStr);
    }
  });

  return sortActivitiesByLatest(merged);
}

export async function pushToGoogleSheet(isManual = false) {
  if (!state.apiUrl) {
    state.apiUrl = DEFAULT_API_URL;
    lsSet('tk_api_url', DEFAULT_API_URL);
  }

  state.syncStatus = 'syncing';
  if (window.renderSyncPill) window.renderSyncPill();

  const payload = {
    action: 'save_all',
    activities: state.activities,
    clubs: state.clubs,
    schedules: state.schedules,
    facilities: state.facilities,
    budget: state.budgetItems,
    reports: state.savedReports,
    telegramSettings: state.telegramSettings,
    telegramSchedules: state.telegramSchedules,
    timestamp: new Date().toISOString()
  };

  try {
    const resp = await fetch(state.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const res = await resp.json();
    if (res.status === 'success' || res.success) {
      state.syncStatus = 'success';
      state.lastSyncTime = new Date().toLocaleTimeString('vi-VN');
      lsSet('tk_last_sync', state.lastSyncTime);
      if (isManual) showToast('Đồng bộ thành công', 'Toàn bộ dữ liệu đã được lưu an toàn lên Google Drive.');
    } else {
      state.syncStatus = 'error';
      if (isManual) showToast('Lỗi lưu Sheet', res.message || res.error || 'Không thể ghi vào Google Sheet', 'error');
    }
  } catch (err) {
    state.syncStatus = 'error';
    if (isManual) showToast('Lỗi kết nối', 'Không thể kết nối với Web App Google Drive.', 'error');
  } finally {
    if (window.renderSyncPill) window.renderSyncPill();
  }
}

export async function pullFromGoogleSheet(silent = false) {
  if (!state.apiUrl) {
    state.apiUrl = DEFAULT_API_URL;
    lsSet('tk_api_url', DEFAULT_API_URL);
  }

  if (!silent) {
    state.syncStatus = 'syncing';
    try {
      const syncIcons = document.querySelectorAll('button .material-symbols-outlined');
      syncIcons.forEach(icon => {
        if (icon.textContent.trim() === 'sync') animateSpin(icon, 2);
      });
    } catch (e) {}
    if (window.renderSyncPill) window.renderSyncPill();
  }

  try {
    const url = state.apiUrl + (state.apiUrl.includes('?') ? '&' : '?') + 'action=load_all';
    const resp = await fetch(url);
    const res = await resp.json();
    if ((res.status === 'success' || res.success) && res.data) {
      const oldLen = (state.activities || []).length;
      const oldChecksum = JSON.stringify((state.activities || []).map(a => a.id + (a.status || '') + (a.reportStatus || '') + (a.participants || '')));
      const remoteActs = (res.data.activities && Array.isArray(res.data.activities)) ? res.data.activities : [];
      
      // Hợp nhất thông minh dữ liệu cục bộ và dữ liệu Google Drive
      const mergedActs = mergeActivitiesSmartly(state.activities, remoteActs);
      state.activities = mergedActs;

      if (res.data.clubs && Array.isArray(res.data.clubs)) state.clubs = res.data.clubs;
      if (res.data.schedules && Array.isArray(res.data.schedules)) state.schedules = res.data.schedules;
      if (res.data.facilities && Array.isArray(res.data.facilities)) state.facilities = res.data.facilities;
      if (res.data.budget && Array.isArray(res.data.budget)) state.budgetItems = res.data.budget;
      if (res.data.reports && Array.isArray(res.data.reports)) state.savedReports = res.data.reports;

      state.syncStatus = 'success';
      state.lastSyncTime = new Date().toLocaleTimeString('vi-VN');
      lsSet('tk_last_sync', state.lastSyncTime);

      // Cập nhật localStorage
      lsSet('tk_activities', state.activities);
      lsSet('tk_clubs', state.clubs);
      lsSet('tk_schedules', state.schedules);
      lsSet('tk_facilities', state.facilities);
      lsSet('tk_budget', state.budgetItems);
      lsSet('tk_saved_reports', state.savedReports);

      // Nếu có giải cục bộ chưa có trên Sheet, tự động đồng bộ ngược lên Drive
      if (mergedActs.length > remoteActs.length) {
        pushToGoogleSheet(false);
      }

      const newChecksum = JSON.stringify((state.activities || []).map(a => a.id + (a.status || '') + (a.reportStatus || '') + (a.participants || '')));
      const hasActualChanges = (mergedActs.length !== oldLen) || (oldChecksum !== newChecksum);

      if (!silent) {
        showToast('Nạp dữ liệu thành công', `Đã đồng bộ và hợp nhất ${state.activities.length} giải đấu từ Google Drive.`);
        if (window.closeModal) window.closeModal();
      } else if (hasActualChanges && state.activities.length > oldLen) {
        showToast('Cập nhật mới từ Telegram', `Đã nhận thêm giải đấu: ${state.activities[0]?.title || ''}.`);
      }
      
      // CHỐNG CHỚP TẮT GIẬT MÀN HÌNH:
      // Nếu là chạy ngầm (silent = true) và dữ liệu không hề thay đổi, TUYỆT ĐỐI không render lại DOM!
      if (!silent || hasActualChanges) {
        if (window.updateTournamentsOnly && state.currentTab === 'quan-ly-giai-dau') {
          window.updateTournamentsOnly(false);
        } else if (window.renderApp) {
          window.renderApp();
        }
      }
    } else {
      if (!silent) {
        state.syncStatus = 'error';
        showToast('Lỗi nạp', res.message || res.error || 'Không có dữ liệu trên Sheet', 'error');
      }
    }
  } catch (err) {
    if (!silent) {
      state.syncStatus = 'error';
      showToast('Lỗi kết nối', 'Không thể tải dữ liệu từ Google Drive.', 'error');
    }
  } finally {
    if (window.renderSyncPill) window.renderSyncPill();
  }
}

export function saveApiUrl() {
  const input = document.getElementById('sync_api_url');
  if (!input) return;
  const v = input.value.trim();
  state.apiUrl = v;
  lsSet('tk_api_url', v);
  showToast('Đã lưu URL', 'Hệ thống sẽ đồng bộ với Apps Script Web App này.');
  if (window.renderSyncPill) window.renderSyncPill();
}

export function toggleAutoSync(v) {
  state.autoSync = v;
  lsSet('tk_auto_sync', v);
}

export function exportAllExcel() {
  if (typeof XLSX === 'undefined') {
    showToast('Lỗi xuất file', 'Thư viện SheetJS chưa được tải.', 'error');
    return;
  }
  try {
    const wb = XLSX.utils.book_new();

    // 1. Sheet Hoạt động
    const wsActs = XLSX.utils.json_to_sheet(state.activities.map((a, i) => ({
      'STT': i + 1,
      'Mã giải': a.code,
      'Tên giải đấu': a.title,
      'Bộ môn': a.sport,
      'Cấp độ': a.category,
      'Ngày tổ chức': a.date,
      'Số VĐV': a.participants,
      'Địa điểm': a.location,
      'Vàng': a.goldMedals || 0,
      'Bạc': a.silverMedals || 0,
      'Đồng': a.bronzeMedals || 0,
      'Tổng HC': a.totalMedals || 0,
      'Tổng kinh phí': a.budgetTotal || 0,
      'Trạng thái BC': a.isReported ? 'Đã báo cáo' : 'Chưa báo cáo',
      'Ghi chú': a.achievementNote || ''
    })));
    XLSX.utils.book_append_sheet(wb, wsActs, 'Hoạt động TDTT');

    // 2. Sheet CLB
    const wsClubs = XLSX.utils.json_to_sheet(state.clubs.map((c, i) => ({
      'STT': i + 1,
      'Mã CLB': c.code,
      'Tên câu lạc bộ': c.name,
      'Bộ môn': c.sport,
      'Chủ nhiệm': c.leader,
      'Số điện thoại': c.phone,
      'Số hội viên': c.membersCount,
      'Địa điểm': c.location,
      'Năm thành lập': c.establishedYear,
      'Trạng thái': c.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'
    })));
    XLSX.utils.book_append_sheet(wb, wsClubs, 'Câu lạc bộ');

    // 3. Sheet Kinh phí
    const wsBudget = XLSX.utils.json_to_sheet(state.budgetItems.map((b, i) => ({
      'STT': i + 1,
      'Mã KP': b.code,
      'Nội dung chi': b.title,
      'Năm': b.year,
      'Nguồn': b.source,
      'Dự toán': b.budgetEstimated,
      'Thực chi': b.budgetActual,
      'Căn cứ': b.refDoc,
      'Trạng thái': b.status,
      'Ghi chú': b.note || ''
    })));
    XLSX.utils.book_append_sheet(wb, wsBudget, 'Kinh phí TDTT');

    const fileName = `So_Lieu_TDTT_Phuong_Tan_Khai_${new Date().getFullYear()}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast('Xuất Excel thành công', `Đã lưu file: ${fileName}`);
  } catch (err) {
    showToast('Lỗi xuất file', err.message, 'error');
  }
}
