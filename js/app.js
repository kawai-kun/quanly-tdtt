// ==============================================================================
// TRUNG TÂM ĐIỀU PHỐI ỨNG DỤNG (APPLICATION ROOT BOOTSTRAP)
// HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO - PHƯỜNG TÂN KHAI
// Kiến trúc Native ES Modules (Phương án A) - Tách biệt độc lập từng phân hệ
// ==============================================================================

// 1. STATE & CORE STORAGE
import {
  state,
  saveAll,
  lsGet,
  lsSet,
  healDataEncoding,
  getActivityReportStatus,
  toggleActivityReportStatus
} from './state.js';

// 2. UTILS
import { showToast, toggleDarkMode, initTheme, setColorTheme } from './utils/toast.js';
import { anime, animateStagger } from './utils/animations.js';
import { triggerDownloadWithMotion } from './utils/fileMotion.js';
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
  renderTournamentsTable,
  initTournamentsAnimations
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
  handleSaveActivity,
  confirmDeleteActivity,
  openSyncModal
} from './components/modals.js';

import {
  openCommandPalette,
  closeCommandPalette,
  handleCommandPaletteSearch,
  handleCommandPaletteKeydown,
  isCommandPaletteOpen
} from './components/commandPalette.js';

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
  setColorTheme,
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
  showToast,
  triggerDownloadWithMotion,
  anime,
  initTournamentsAnimations,

  // Command Palette (Ctrl+K)
  openCommandPalette,
  closeCommandPalette,
  handleCommandPaletteSearch,
  handleCommandPaletteKeydown
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

  // BẢN 4 DUY NHẤT: CHÍNH QUYỀN SỐ & SỔ BỘ HÀNH CHÍNH PHƯỜNG TÂN KHAI
  app.innerHTML = `
    <div class="min-h-screen flex flex-col w-full text-slate-800 dark:text-slate-100">
      ${renderHeader()}
      <main class="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-12 max-w-[1780px] w-full mx-auto">
        ${contentHTML}
      </main>
    </div>
    ${renderBottomNav()}
    ${renderMobileDrawer()}
    <div id="commandPaletteContainer"></div>
  `;

  if (state.currentTab === 'bang-dieu-khien') {
    setTimeout(initDashboardCharts, 50);
  } else if (state.currentTab === 'quan-ly-giai-dau') {
    setTimeout(initTournamentsAnimations, 50);
  } else if (['quan-ly-clb', 'lich-sinh-hoat', 'co-so-vat-chat', 'kinh-phi'].includes(state.currentTab)) {
    setTimeout(() => {
      try {
        animateStagger('main table tbody tr, main .grid > div', { delayStep: 25, duration: 280 });
      } catch (e) {}
    }, 50);
  }
}

// ==============================================================================
// 7. KHỞI CHẠY HỆ THỐNG & ĐỒNG BỘ NỀN (LIFECYCLE INITIALIZATION)
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const qTab = params.get('tab');
    if (qTab && ['bang-dieu-khien', 'quan-ly-giai-dau', 'quan-ly-clb', 'lich-sinh-hoat', 'co-so-vat-chat', 'kinh-phi', 'bao-cao'].includes(qTab)) {
      state.currentTab = qTab;
    }
  } catch (e) {}

  initTheme();
  window.renderApp();

  // Tự động kiểm tra và đồng bộ dữ liệu mới nhất từ Google Drive ngay khi tải trang
  setTimeout(() => {
    if (state.apiUrl) pullFromGoogleSheet(true);
  }, 600);
});

// Phím tắt nhanh cho cán bộ (Enterprise Shortcuts)
document.addEventListener('keydown', (e) => {
  // Phím tắt Ctrl+K hoặc Cmd+K mở Command Palette
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    if (isCommandPaletteOpen()) closeCommandPalette();
    else openCommandPalette();
    return;
  }

  if (e.key === 'Escape') {
    if (isCommandPaletteOpen()) {
      closeCommandPalette();
      return;
    }
    window.closeModal();
    return;
  }
  const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
  if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

  // Phím '/' để nhảy nhanh vào ô tìm kiếm giải đấu
  if (e.key === '/') {
    const searchInput = document.getElementById('tournament_search_input');
    if (searchInput) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  }

  // Phím 'N' hoặc 'n' để mở form thêm giải đấu mới
  if (e.key === 'n' || e.key === 'N') {
    if (!document.getElementById('modalContainer')) {
      e.preventDefault();
      window.openActivityModal();
    }
  }
});

// Định kỳ kiểm tra ngầm mỗi 60 giây để cập nhật giải đấu mới thêm từ Telegram mà không gây lag hay giật màn hình
let lastSyncTimestamp = Date.now();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && Date.now() - lastSyncTimestamp > 60000) {
    lastSyncTimestamp = Date.now();
    pullFromGoogleSheet(true);
  }
});

setInterval(() => {
  if (document.visibilityState === 'visible') {
    lastSyncTimestamp = Date.now();
    pullFromGoogleSheet(true);
  }
}, 60000);
