/**
 * HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO - PHƯỜNG TÂN KHAI
 * Central Reactive State & Persistence Store
 */

import {
  INITIAL_ACTIVITIES,
  INITIAL_CLUBS,
  INITIAL_SCHEDULES,
  INITIAL_FACILITIES,
  INITIAL_BUDGET_ITEMS,
  INITIAL_REPORTS,
  INITIAL_TELEGRAM_SCHEDULES
} from './data/initialData.js';
import { DEFAULT_API_URL } from './data/constants.js';
import { sortActivitiesByLatest } from './utils/formatters.js';
import { mergeActivitiesSmartly, pushToGoogleSheet } from './services/googleSync.js';
import { showToast } from './utils/toast.js';

export function lsGet(k, def) {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : def;
  } catch (e) {
    return def;
  }
}

export function lsSet(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {}
}

export const state = {
  isAuthenticated: lsGet('tk_auth', true),
  currentTab: 'bang-dieu-khien',
  darkMode: lsGet('tk_dark', false),
  colorTheme: 'titanium',
  apiUrl: lsGet('tk_api_url', '') || DEFAULT_API_URL,

  // Multi-Year Architecture
  selectedYear: lsGet('tk_selected_year', 'all'),

  // Data Collections - Tự động hợp nhất bảo toàn đủ 30 giải thực tế và xếp giải mới nhất ở vị trí #1
  activities: sortActivitiesByLatest(mergeActivitiesSmartly(lsGet('tk_activities', []), INITIAL_ACTIVITIES)),
  clubs: lsGet('tk_clubs', INITIAL_CLUBS),
  schedules: lsGet('tk_schedules', INITIAL_SCHEDULES),
  facilities: lsGet('tk_facilities', INITIAL_FACILITIES),
  budgetItems: lsGet('tk_budget', INITIAL_BUDGET_ITEMS),
  savedReports: lsGet('tk_saved_reports', INITIAL_REPORTS),

  // Sync status
  syncStatus: 'idle',
  lastSyncTime: lsGet('tk_last_sync', 'Chưa đồng bộ'),
  autoSync: lsGet('tk_auto_sync', true),

  // Reports Management State (Tháng, Quý, 6T, 9T, Năm - Nhà nước & Chi bộ)
  reportMode: lsGet('tk_rep_mode', 'state'),
  reportPeriod: lsGet('tk_rep_period', 'month'),
  reportMonth: lsGet('tk_rep_month', new Date().getMonth() + 1),
  reportQuarter: lsGet('tk_rep_quarter', Math.floor(new Date().getMonth() / 3) + 1),
  reportHalf: lsGet('tk_rep_half', new Date().getMonth() < 6 ? 1 : 2),
  reportYear: lsGet('tk_rep_year', new Date().getFullYear()),
  reportRecipient: lsGet('tk_rep_recipient', 'vp_trungtam'),
  reportSubTab: 'document',
  activeReportId: 'rep-09',

  // Telegram Multi-Scheduler Engine
  telegramSettings: lsGet('tk_telegram_settings', {
    botToken: lsGet('tk_telegram_config', {})?.botToken || '9210349656:AAHjejkU7x5MWi71IBoHpQlhKAG59Z3BJA',
    chatId: lsGet('tk_telegram_config', {})?.chatId || '6403485662'
  }),
  telegramSchedules: lsGet('tk_telegram_schedules', INITIAL_TELEGRAM_SCHEDULES),
  telegramModalTab: 'list',
  editingScheduleId: null,

  // Tournament Filter State
  tournamentsFilter: {
    category: 'all',
    sport: 'all',
    reportStatus: 'all',
    search: '',
    viewMode: 'cards'
  },

  // Kế hoạch & Chỉ tiêu Thi đua năm
  kpiTargets: lsGet('tk_kpi_targets', {
    targetActivities: 20,
    targetParticipants: 1500,
    targetMedals: 30,
    targetClubs: 5,
    planTitle: 'Kế hoạch phát triển TDTT Phường Tân Khai năm 2026'
  }),

  mobileDrawerOpen: false
};

let syncTimer = null;
export function queueAutoSync() {
  if (!state.autoSync || !state.apiUrl) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    pushToGoogleSheet(false);
  }, 2500);
}

export function saveAll() {
  lsSet('tk_activities', state.activities);
  lsSet('tk_clubs', state.clubs);
  lsSet('tk_schedules', state.schedules);
  lsSet('tk_facilities', state.facilities);
  lsSet('tk_budget', state.budgetItems);
  lsSet('tk_saved_reports', state.savedReports);
  lsSet('tk_rep_mode', state.reportMode);
  lsSet('tk_rep_period', state.reportPeriod);
  lsSet('tk_rep_month', state.reportMonth);
  lsSet('tk_rep_quarter', state.reportQuarter);
  lsSet('tk_rep_half', state.reportHalf);
  lsSet('tk_rep_year', state.reportYear);
  lsSet('tk_rep_recipient', state.reportRecipient);
  lsSet('tk_telegram_settings', state.telegramSettings);
  lsSet('tk_telegram_schedules', state.telegramSchedules);
  lsSet('tk_kpi_targets', state.kpiTargets);
  queueAutoSync();
}

export function healDataEncoding() {
  try {
    let changed = false;
    // 1. Chuẩn hóa họ tên tác giả Trần Quốc Được
    if (Array.isArray(state.savedReports)) {
      state.savedReports.forEach(r => {
        if (!r.author || r.author.includes('Đức') || r.author.includes('?') || r.author !== 'Trần Quốc Được') {
          r.author = 'Trần Quốc Được';
          changed = true;
        }
      });
    }

    // 2. Xóa giải test Cờ Vây nếu còn lưu trong localStorage (theo yêu cầu người dùng)
    if (Array.isArray(state.activities)) {
      const beforeLen = state.activities.length;
      state.activities = state.activities.filter(a => !(a.title || '').toLowerCase().includes('cờ vây'));
      if (state.activities.length !== beforeLen) {
        changed = true;
      }
    }

    // 3. Phục hồi các hoạt động bị lỗi font / ký tự hỏi chấm từ INITIAL_ACTIVITIES
    if (Array.isArray(state.activities)) {
      state.activities.forEach(a => {
        const init = INITIAL_ACTIVITIES.find(ia => ia.id === a.id);
        if (init) {
          if (/\?\s*ch|gi\?i|\?i\?n|lA'ng|Tr\?n/.test(a.title || '') || /\?\s*ch|gi\?i|\?i\?n|lA'ng|Tr\?n/.test(a.achievementNote || '')) {
            a.title = init.title;
            a.sport = init.sport;
            a.location = init.location;
            a.achievementNote = init.achievementNote;
            changed = true;
          }
        }
      });
    }

    // 4. Phục hồi các CLB nếu có chuỗi lỗi
    if (Array.isArray(state.clubs)) {
      state.clubs.forEach(c => {
        const initC = INITIAL_CLUBS.find(ic => ic.id === c.id);
        if (initC && (/\?/.test(c.name || '') || /\?/.test(c.sport || ''))) {
          c.name = initC.name;
          c.sport = initC.sport;
          c.location = initC.location;
          changed = true;
        }
      });
    }

    if (changed) {
      saveAll();
    }
  } catch (err) {
    console.warn('Auto-healer note:', err);
  }
}

// Khởi chạy kiểm tra toàn vẹn dữ liệu
healDataEncoding();


// Báo cáo trạng thái giải đấu
    export function getActivityReportStatus(act) {
      if (!act) return { isReported: false };
      if (act.isReported && act.reportedInReport) {
        return { isReported: true, reportCode: act.reportedInReport };
      }
      if (act.isReported === false) {
        return { isReported: false };
      }
      for (const r of (state.savedReports || [])) {
        if (Array.isArray(r.reportedActIds) && r.reportedActIds.includes(act.id)) {
          return { isReported: true, reportCode: r.code, reportTitle: r.title, reportDate: r.reportDate };
        }
      }
      return { isReported: false };
    }

    export function toggleActivityReportStatus(actId, event) {
      if (event) event.stopPropagation();
      const act = state.activities.find(a => a.id === actId);
      if (!act) return;
      const status = getActivityReportStatus(act);
      if (status.isReported) {
        if (confirm(`Giải đấu "${act.title}" đang được đánh dấu "Đã báo cáo (${status.reportCode})".\n\nBạn có muốn chuyển trạng thái sang "Chưa lập báo cáo" không?`)) {
          act.isReported = false;
          delete act.reportedInReport;
          (state.savedReports || []).forEach(r => {
            if (Array.isArray(r.reportedActIds)) {
              r.reportedActIds = r.reportedActIds.filter(id => id !== actId);
            }
          });
          saveAll();
          showToast('Đã chuyển trạng thái', `Giải "${act.title}" đã chuyển sang Chưa báo cáo.`);
          window.renderApp();
        }
      } else {
        act.isReported = true;
        act.reportedInReport = 'Đã chốt BC';
        saveAll();
        showToast('Đã đánh dấu Đã báo cáo', `Giải "${act.title}" đã được đánh dấu Đã báo cáo.`);
        window.renderApp();
      }
    }

