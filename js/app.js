// ==============================================================================
// TRUNG TÂM ĐIỀU PHỐI ỨNG DỤNG (APPLICATION ROOT BOOTSTRAP)
// HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO - PHƯỜNG TÂN KHAI
// Kiến trúc Native ES Modules (Phương án A) - Tách biệt độc lập từng phân hệ
// ==============================================================================

// 1. STATE & CORE STORAGE
import {
  state,
  initTheme,
  saveAll,
  lsGet,
  lsSet,
  healDataEncoding,
  getActivityReportStatus,
  toggleActivityReportStatus
} from './state.js';

// 2. UTILS
import { showToast, toggleDarkMode } from './utils/toast.js';
import {
  formatVNCurrency,
  formatDateVN,
  parseDateVN,
  getAvailableYears,
  extractYearFromDate,
  extractQuarterFromDate
} from './utils/formatters.js';
import { getLogoHTML, getSportBadge } from './utils/sportBadges.js';

// 3. SERVICES
import {
  pushToGoogleSheet,
  pullFromGoogleSheet,
  exportAllExcel,
  saveApiUrl,
  toggleAutoSync
} from './services/googleSync.js';

import {
  getReportMonths,
  getReportRange,
  getReportData,
  getPeriodTitle,
  getPeriodSubtitle,
  buildReportHTMLForWord,
  exportDocxFile
} from './services/docExport.js';

import {
  openTelegramConfigModal,
  switchTelegramModalTab,
  renderTelegramSchedulesListHtml,
  renderTelegramSettingsFormHtml,
  renderTelegramCommandsTabHtml,
  activateTelegramWebhook,
  checkTelegramWebhookStatus,
  openEditScheduleModal,
  handleScheduleTypeChange,
  handleSaveScheduleConfig,
  toggleTelegramSchedule,
  deleteTelegramSchedule,
  restoreDefaultTelegramSchedules,
  handleSaveTelegramSettings,
  saveQuickReminderMsg,
  sendTestBotGreeting,
  sendDaiCaReminderTelegram,
  executeTelegramSchedule,
  sendCurrentReportToTelegram
} from './services/telegramService.js';

// 4. UI COMPONENTS
import { renderHeader, setGlobalYear, renderSyncPillHTML, renderSyncPill } from './components/header.js';
import { switchTab, toggleMobileDrawer, renderSidebar, renderBottomNav, renderMobileDrawer } from './components/sidebar.js';
import {
  renderDashboard,
  renderKpiProgressCard,
  openKpiTargetsModal,
  handleSaveKpiTargets,
  handleDashboardSearch,
  initDashboardCharts
} from './components/dashboard.js';

import {
  renderTournaments,
  getFilteredTournamentsList,
  getTournamentsCountsHtml,
  handleTournamentSearchInput,
  updateTournamentsOnly,
  setTournamentsFilter,
  toggleTournamentsView,
  renderTournamentsGrid,
  renderTournamentsTable
} from './components/tournaments.js';

import { renderClubs, openClubModal, handleSaveClub, confirmDeleteClub } from './components/clubs.js';
import { renderSchedules, openScheduleModal, handleSaveSchedule, confirmDeleteSchedule } from './components/schedules.js';
import { renderFacilities, openFacilityModal, handleSaveFacility, confirmDeleteFacility } from './components/facilities.js';
import { renderBudget, openBudgetModal, handleSaveBudget, confirmDeleteBudgetItem } from './components/budget.js';

import {
  renderReports,
  setReportSubTab,
  setReportFilter,
  renderReportDocumentView,
  printReport,
  saveCurrentReportToRegistry,
  renderReportRegistryView,
  viewReport,
  createNewReportPrompt,
  saveCurrentReportAsNew,
  editReportModal,
  handleSaveEditReport,
  deleteReport
} from './components/reports.js';

import {
  closeModal,
  openActivityModal,
  updateMedalsCalc,
  handleSaveActivity,
  confirmDeleteActivity,
  openSyncModal
} from './components/modals.js';

import { renderLogin, togglePassVisibility, handleLoginSubmit, handleLogout } from './components/auth.js';

// ==============================================================================
// 5. GẮN TẤT CẢ HANDLER VÀO WINDOW CHO CÁC SỰ KIỆN INLINE HTML
// ==============================================================================
const globalBindings = {
  // Navigation & Layout
  switchTab,
  setGlobalYear,
  toggleMobileDrawer,
  toggleDarkMode,
  renderSyncPill,
  renderApp,

  // Auth
  renderLogin,
  togglePassVisibility,
  handleLoginSubmit,
  handleLogout,

  // Tournaments
  renderTournaments,
  handleTournamentSearchInput,
  updateTournamentsOnly,
  setTournamentsFilter,
  toggleTournamentsView,
  toggleActivityReportStatus,
  openActivityModal,
  updateMedalsCalc,
  handleSaveActivity,
  confirmDeleteActivity,

  // Dashboard
  openKpiTargetsModal,
  handleSaveKpiTargets,
  handleDashboardSearch,

  // Clubs
  openClubModal,
  handleSaveClub,
  confirmDeleteClub,

  // Schedules
  openScheduleModal,
  handleSaveSchedule,
  confirmDeleteSchedule,

  // Facilities
  openFacilityModal,
  handleSaveFacility,
  confirmDeleteFacility,

  // Budget
  openBudgetModal,
  handleSaveBudget,
  confirmDeleteBudgetItem,

  // Reports & Registry
  setReportSubTab,
  setReportFilter,
  printReport,
  saveCurrentReportToRegistry,
  viewReport,
  createNewReportPrompt,
  saveCurrentReportAsNew,
  editReportModal,
  handleSaveEditReport,
  deleteReport,
  exportDocxFile,

  // Google Sync
  openSyncModal,
  saveApiUrl,
  toggleAutoSync,
  pushToGoogleSheet,
  pullFromGoogleSheet,
  exportAllExcel,

  // Telegram Service
  openTelegramConfigModal,
  switchTelegramModalTab,
  activateTelegramWebhook,
  checkTelegramWebhookStatus,
  openEditScheduleModal,
  handleScheduleTypeChange,
  handleSaveScheduleConfig,
  toggleTelegramSchedule,
  deleteTelegramSchedule,
  restoreDefaultTelegramSchedules,
  handleSaveTelegramSettings,
  saveQuickReminderMsg,
  sendTestBotGreeting,
  sendDaiCaReminderTelegram,
  executeTelegramSchedule,
  sendCurrentReportToTelegram,

  // Modals & Notifications
  closeModal,
  showToast
};

for (const [key, fn] of Object.entries(globalBindings)) {
  window[key] = fn;
}

// ==============================================================================
// 6. RENDER APP CHÍNH (MAIN RENDER LOOP)
// ==============================================================================
export function renderApp() {
  const app = document.getElementById('appContainer');
  if (!app) return;

  if (!state.isAuthenticated) {
    app.innerHTML = renderLogin();
    return;
  }

  let contentHTML = '';
  if (state.currentTab === 'bang-dieu-khien') contentHTML = renderDashboard();
  else if (state.currentTab === 'quan-ly-giai-dau') contentHTML = renderTournaments();
  else if (state.currentTab === 'quan-ly-clb') contentHTML = renderClubs();
  else if (state.currentTab === 'lich-sinh-hoat') contentHTML = renderSchedules();
  else if (state.currentTab === 'co-so-vat-chat') contentHTML = renderFacilities();
  else if (state.currentTab === 'kinh-phi') contentHTML = renderBudget();
  else if (state.currentTab === 'bao-cao') contentHTML = renderReports();

  app.innerHTML = `
    ${renderSidebar()}
    <div class="lg:pl-[270px] flex-1 flex flex-col min-h-screen">
      ${renderHeader()}
      <main class="flex-1 p-3.5 sm:p-5 lg:p-7 pb-28 lg:pb-8 max-w-[1720px] w-full mx-auto">
        ${contentHTML}
      </main>
    </div>
    ${renderBottomNav()}
    ${renderMobileDrawer()}
  `;

  if (state.currentTab === 'bang-dieu-khien') {
    setTimeout(initDashboardCharts, 50);
  }
}

// ==============================================================================
// 7. KHỞI CHẠY HỆ THỐNG & ĐỒNG BỘ NỀN (LIFECYCLE INITIALIZATION)
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderApp();

  // Tự động kiểm tra và đồng bộ dữ liệu mới nhất từ Google Drive ngay khi tải trang
  setTimeout(() => {
    if (state.apiUrl) pullFromGoogleSheet(true);
  }, 600);
});

// Đóng modal khi bấm ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Tự động làm mới dữ liệu tức thì khi người dùng chuyển tab hoặc quay lại cửa sổ web
window.addEventListener('focus', () => {
  pullFromGoogleSheet(true);
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    pullFromGoogleSheet(true);
  }
});

// Định kỳ kiểm tra ngầm mỗi 10 giây để cập nhật tức thì giải đấu mới thêm từ Telegram mà không cần tải lại trang
setInterval(() => {
  if (document.visibilityState === 'visible') {
    pullFromGoogleSheet(true);
  }
}, 10000);
