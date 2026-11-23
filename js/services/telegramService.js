// ==============================================================================
// DỊCH VỤ TELEGRAM BOT & LỊCH TỰ ĐỘNG GỬI BÁO CÁO (TELEGRAM SERVICE)
// ==============================================================================

import { state, saveAll } from '../state.js';
import { INITIAL_TELEGRAM_SCHEDULES } from '../data/initialData.js';
import { showToast } from '../utils/toast.js';
import { getReportRange, getReportData, getPeriodTitle, buildReportHTMLForWord } from './docExport.js';
import { pushToGoogleSheet } from './googleSync.js';

function closeModal() {
  if (typeof window.closeModal === 'function') window.closeModal();
  else {
    const m = document.getElementById('modalContainer');
    if (m) m.remove();
  }
}

function renderApp() {
  if (typeof window.renderApp === 'function') window.renderApp();
}

        /* ==============================================================================
       QUẢN LÝ LỊCH VÀ CẤU HÌNH TỰ ĐỘNG GỬI BÁO CÁO QUA TELEGRAM BOT
       (Multi-Scheduler Engine: Quản lý nhiều cấu hình, tự do chọn ngày 1-31, gửi KPI + File Word)
       ============================================================================== */

export function openTelegramConfigModal(tab = 'list') {
      state.telegramModalTab = tab || 'list';
      const schedules = state.telegramSchedules || [];
      const activeCount = schedules.filter(s => s.enabled).length;
      const totalCount = schedules.length;
      const settings = state.telegramSettings || {
        botToken: '9210349656:AAHjejkU7x5MWi71IBoHpQlhKAG59Z3BJA',
        chatId: '6403485662'
      };

      // Đóng modal cũ nếu đang mở
      const oldModal = document.getElementById('modalContainer');
      if (oldModal) oldModal.remove();

      const modal = document.createElement('div');
      modal.id = 'modalContainer';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm';
      modal.innerHTML = `
        <div class="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 max-h-[90vh] flex flex-col modal-animate text-left">
          
          <!-- Header -->
          <div class="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-sm">
                <span class="material-symbols-outlined text-[20px]">schedule_send</span>
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Quản Lý Lịch Gửi Báo Cáo Telegram</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${activeCount > 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}">
                    ${activeCount}/${totalCount} đang chạy
                  </span>
                </h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Tự động tổng hợp số liệu KPI và đính kèm file báo cáo Word (.doc) gửi thẳng vào Telegram</p>
              </div>
            </div>
            <button onclick="window.closeModal()" class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"><span class="material-symbols-outlined text-[20px]">close</span></button>
          </div>

          <!-- Navigation Tabs -->
          <div class="flex items-center justify-between gap-2 mt-3.5 pb-2 border-b border-slate-100 dark:border-slate-800/80 shrink-0 flex-wrap">
            <div class="flex items-center gap-1.5 flex-wrap">
              <button onclick="switchTelegramModalTab('list')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${state.telegramModalTab === 'list' ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800' : 'text-slate-500 hover:text-slate-700'}">
                <span class="material-symbols-outlined text-[16px]">list_alt</span>
                <span>Lịch tự động (${totalCount})</span>
              </button>
              <button onclick="switchTelegramModalTab('commands')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${state.telegramModalTab === 'commands' ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700' : 'text-slate-500 hover:text-slate-700'}">
                <span class="material-symbols-outlined text-[16px] text-amber-600">smart_toy</span>
                <span>Trợ lý Ảo Nhận Lệnh (2 chiều)</span>
              </button>
              <button onclick="switchTelegramModalTab('settings')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${state.telegramModalTab === 'settings' ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800' : 'text-slate-500 hover:text-slate-700'}">
                <span class="material-symbols-outlined text-[16px]">key</span>
                <span>Cài đặt Bot Token</span>
              </button>
            </div>

            ${state.telegramModalTab === 'list' ? `
              <button onclick="openEditScheduleModal()" class="px-3 py-1.5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1 cursor-pointer btn-press">
                <span class="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Thêm cấu hình mới</span>
              </button>
            ` : ''}
          </div>

          <!-- Tab Content Body (Scrollable) -->
          <div class="mt-3.5 overflow-y-auto flex-1 pr-1 space-y-3.5 text-xs text-left">
            ${state.telegramModalTab === 'list' 
              ? renderTelegramSchedulesListHtml(schedules) 
              : (state.telegramModalTab === 'commands' 
                  ? renderTelegramCommandsTabHtml() 
                  : renderTelegramSettingsFormHtml(settings))}
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

export function switchTelegramModalTab(tab) {
      state.telegramModalTab = tab;
      const modal = document.getElementById('modalContainer');
      if (modal) {
        modal.remove();
        openTelegramConfigModal(tab);
      }
    }

export function renderTelegramSchedulesListHtml(schedules) {
      if (!schedules || schedules.length === 0) {
        return `
          <div class="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">schedule_send</span>
            <p class="font-bold text-slate-700 dark:text-slate-300">Chưa có cấu hình gửi báo cáo nào</p>
            <p class="text-xs text-slate-400 mt-1 mb-4">Bạn có thể tạo cấu hình mới hoặc khôi phục 2 cấu hình mẫu (Nhà nước và Chi bộ)</p>
            <div class="flex items-center justify-center gap-2">
              <button onclick="restoreDefaultTelegramSchedules()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl btn-press">
                Khôi phục 2 cấu hình mẫu
              </button>
              <button onclick="openEditScheduleModal()" class="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs rounded-xl btn-press">
                + Thêm cấu hình mới
              </button>
            </div>
          </div>
        `;
      }

      return `
        <div class="space-y-3">
          <!-- Card: Trợ lý Nhắc việc trước ngày làm Báo cáo (Ngày 9 & Ngày 29) -->
          <div class="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-800/70 shadow-sm space-y-2.5">
            <div class="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div class="flex items-start gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <span class="material-symbols-outlined text-[20px]">smart_toy</span>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-slate-900 dark:text-white">Trợ lý Nhắc lịch Báo cáo</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">Tự động (Ngày 9 & 29)</span>
                  </div>
                  <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Vào <b>ngày 9</b> (trước hạn nộp BC Nhà nước) và <b>ngày 29</b> (trước hạn nộp BC Chi bộ), Bot tự động gửi tin nhắn ngắn nhắc anh Được rà soát dữ liệu.
                  </p>
                </div>
              </div>
              <button onclick="sendDaiCaReminderTelegram(true)" title="Bấm để gửi thử tin nhắn này ngay vào Telegram" class="shrink-0 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm btn-press">
                <span class="material-symbols-outlined text-[15px]">send</span>
                <span>Gửi thử tin nhắc</span>
              </button>
            </div>

            <!-- Ô chỉnh sửa câu nhắc nhở trực tiếp ngay trên giao diện -->
            <div class="pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
              <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Nội dung tin nhắn nhắc nhở (Tùy ý sửa đổi trực tiếp):</span>
                <span class="text-[10px] text-slate-400 font-normal">Tự động áp dụng ngay không cần sửa code</span>
              </label>
              <div class="flex items-center gap-2">
                <div class="relative flex-1">
                  <span class="material-symbols-outlined text-[16px] text-amber-600 absolute left-3 top-2">edit_note</span>
                  <input id="tg_quick_reminder_msg" type="text" value="${state.telegramSettings?.reminderMsg || 'Sếp ơi, ngày mai em làm báo cáo tháng, Sếp xem có gì cần bổ sung không ạ!'}" class="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500" placeholder="Nhập câu nhắc nhở..." />
                </div>
                <button onclick="saveQuickReminderMsg()" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 btn-press" title="Lưu lại câu nhắc mới này">
                  <span class="material-symbols-outlined text-[15px]">save</span>
                  <span>Lưu câu nhắc</span>
                </button>
              </div>
            </div>
          </div>

          ${schedules.map((s) => {
            const isParty = s.mode === 'party';
            const periodLabel = s.period === 'quarter' ? 'Hàng Quý' : (s.period === 'half' ? '6 Tháng' : (s.period === 'nine' ? '9 Tháng' : (s.period === 'year' ? 'Hàng Năm' : 'Hàng Tháng')));
            const timingText = s.scheduleType === 'weekly' 
              ? `Thứ ${s.dayOfWeek || 2} hàng tuần lúc ${s.timeOfDay || '08:00'}`
              : (s.scheduleType === 'quarterly' 
                ? `Ngày ${s.dayOfMonth || 28} cuối Quý lúc ${s.timeOfDay || '08:00'}`
                : `Ngày ${s.dayOfMonth || (isParty ? 28 : 11)} hàng tháng lúc ${s.timeOfDay || (isParty ? '08:30' : '08:00')}`);
            
            let recipientName = 'Văn phòng Trung tâm DVTH';
            if (isParty || s.recipient === 'Chi bộ Trung tâm DVTH') {
              recipientName = 'Chi bộ Trung tâm DVTH';
            } else if (s.recipient === 'phong_vanhoa') {
              recipientName = 'Phòng Văn hóa và Thông tin';
            }

            return `
              <div class="p-4 rounded-2xl glass-card border ${s.enabled ? 'border-sky-300/80 dark:border-sky-900/60 bg-sky-50/20 dark:bg-sky-950/10' : 'border-slate-200 dark:border-slate-800 opacity-75'} shadow-sm transition-all">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-start gap-3">
                    <label class="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0" title="${s.enabled ? 'Bấm để tắt cấu hình này' : 'Bấm để bật cấu hình này'}">
                      <input type="checkbox" ${s.enabled ? 'checked' : ''} onchange="toggleTelegramSchedule('${s.id}')" class="sr-only peer">
                      <div class="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>

                    <div>
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="font-bold text-slate-900 dark:text-white text-xs">${s.name}</span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isParty ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300' : 'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300'}">
                          ${isParty ? '⭐ Mẫu Chi bộ' : '🏛️ Mẫu Nhà nước'}
                        </span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          ${periodLabel}
                        </span>
                      </div>

                      <div class="mt-1.5 flex items-center gap-2 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
                        <span class="flex items-center gap-1">
                          <span class="material-symbols-outlined text-[14px] text-sky-500">alarm</span>
                          <span>${timingText}</span>
                        </span>
                        <span>•</span>
                        <span class="flex items-center gap-1">
                          <span class="material-symbols-outlined text-[14px] text-brand-600">domain</span>
                          <span>Nơi nhận: <b>${recipientName}</b></span>
                        </span>
                      </div>
                      <div class="mt-1 text-[10px] text-slate-500 dark:text-slate-400 italic">
                        ${!isParty ? '📅 Chu kỳ số liệu: Từ ngày 10 tháng trước đến ngày 10 tháng này (Tự động gộp hoạt động chưa báo cáo)' : '📅 Chu kỳ số liệu: Trọn tháng từ ngày 01 đến ngày cuối tháng (Tự động gộp hoạt động chưa báo cáo)'}
                      </div>

                      <div class="mt-2 flex items-center gap-1.5 flex-wrap">
                        <span class="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200/50 dark:border-emerald-900/50">
                          <span class="material-symbols-outlined text-[12px]">analytics</span>
                          <span>Số liệu KPI</span>
                        </span>
                        <span class="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center gap-1 border border-blue-200/50 dark:border-blue-900/50">
                          <span class="material-symbols-outlined text-[12px]">description</span>
                          <span>Kèm File Word (.doc)</span>
                        </span>
                        ${s.lastSent ? `
                          <span class="text-[10px] text-slate-400 italic">Gửi lần cuối: ${s.lastSent}</span>
                        ` : `
                          <span class="text-[10px] text-slate-400 italic">Chưa gửi lần nào</span>
                        `}
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center gap-1 shrink-0">
                    <button onclick="executeTelegramSchedule('${s.id}', true)" title="Gửi thử ngay báo cáo này vào Telegram" class="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center gap-1 border border-sky-200 dark:border-sky-800 btn-press">
                      <span class="material-symbols-outlined text-[15px]">send</span>
                      <span class="hidden sm:inline">Gửi thử ngay</span>
                    </button>
                    <button onclick="openEditScheduleModal('${s.id}')" title="Chỉnh sửa cấu hình" class="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 btn-press">
                      <span class="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button onclick="deleteTelegramSchedule('${s.id}')" title="Xóa cấu hình này" class="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 btn-press">
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

export function renderTelegramSettingsFormHtml(settings) {
      return `
        <form onsubmit="handleSaveTelegramSettings(event)" class="space-y-3.5">
          <div>
            <label class="block font-bold mb-1 text-slate-800 dark:text-slate-200">Telegram Bot Token <span class="text-rose-500">*</span></label>
            <input id="tg_bot_token" type="text" required placeholder="Ví dụ: 9210349656:AAHjejkU7x5MWi71IBoHpQlhKAG59Z3BJA" value="${settings.botToken || ''}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white" />
            <span class="text-[10px] text-slate-400 mt-0.5 block">Mã token được cấp từ @BotFather khi tạo con Bot.</span>
          </div>

          <div>
            <label class="block font-bold mb-1 text-slate-800 dark:text-slate-200">Telegram Chat ID của anh Trần Quốc Được <span class="text-rose-500">*</span></label>
            <input id="tg_chat_id" type="text" required placeholder="Ví dụ: 6403485662" value="${settings.chatId || ''}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white" />
            <span class="text-[10px] text-slate-400 mt-0.5 block">Chat ID cá nhân của anh Được (xem bằng bot @userinfobot).</span>
          </div>

          <div>
            <label class="block font-bold mb-1 text-slate-800 dark:text-slate-200">Nội dung tin nhắn nhắc việc tự động (Ngày 9 & 29) <span class="text-rose-500">*</span></label>
            <input id="tg_setting_reminder_msg" type="text" required placeholder="Nhập câu nhắc nhở..." value="${settings.reminderMsg || 'Sếp ơi, ngày mai em làm báo cáo tháng, Sếp xem có gì cần bổ sung không ạ!'}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-900 dark:text-white" />
            <span class="text-[10px] text-slate-400 mt-0.5 block">Nội dung Bot sẽ tự động gửi vào ngày 9 và ngày 29 hàng tháng (có thể sửa đổi bất kỳ lúc nào).</span>
          </div>

          <!-- Hướng dẫn chi tiết -->
          <div class="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 space-y-1.5 text-[11px] leading-relaxed">
            <p class="font-bold flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300">
              <span class="material-symbols-outlined text-[16px]">info</span>
              <span>LƯU Ý QUAN TRỌNG ĐỂ BOT GỬI ĐƯỢC TIN NHẮN & FILE:</span>
            </p>
            <p>1. <b>Mở cuộc trò chuyện với con Bot của anh</b> trên ứng dụng Telegram và bấm nút <b>START</b> (Bắt đầu). Telegram có cơ chế bảo mật: Nếu chưa bấm Start, Bot sẽ báo lỗi <i>"Bad Request: chat not found"</i>.</p>
            <p>2. Dán đúng <b>Bot Token</b> và <b>Chat ID</b> rồi bấm nút <b>Kiểm tra kết nối Bot</b> bên dưới để thử nghiệm nhận tin nhắn ngay!</p>
          </div>

          <div class="pt-2 flex items-center justify-between gap-2">
            <button type="button" onclick="sendTestBotGreeting()" class="px-3.5 py-2 rounded-xl font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 border border-sky-200 dark:border-sky-800 flex items-center gap-1.5 btn-press">
              <span class="material-symbols-outlined text-[16px]">send</span>
              <span>Kiểm tra kết nối Bot</span>
            </button>

            <button type="submit" class="px-5 py-2 rounded-xl font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-sm btn-press">
              Lưu cài đặt Telegram
            </button>
          </div>
        </form>
      `;
    }

export function renderTelegramCommandsTabHtml() {
      const settings = state.telegramSettings || {};
      const botToken = settings.botToken || '';
      const defaultFullApiUrl = 'https://script.google.com/macros/s/AKfycbyC4Wt2w_6PXcX2W0_ISqXyVhpPpHEEwjFPI6nqgokrvYZKpzLKu1sx8MekFXwrlQ8/exec';
      const currentApiUrl = (state.apiUrl && state.apiUrl.length > 30) ? state.apiUrl : defaultFullApiUrl;

      return `
        <div class="space-y-4">
          <!-- Banner Kích hoạt Trợ lý ảo nhận lệnh 2 chiều -->
          <div class="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-300 dark:border-amber-800/80 shadow-sm space-y-3">
            <div class="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[24px]">smart_toy</span>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Trợ Lý Ảo Telegram 2 Chiều</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">Tính năng cao cấp</span>
                  </div>
                  <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Cho phép anh Được <b>nhắn tin ra lệnh trực tiếp cho Bot</b> ngay trên điện thoại: yêu cầu xuất báo cáo gửi qua tin nhắn hoặc cập nhật thêm giải đấu mới mà không cần vào web!
                  </p>
                </div>
              </div>
            </div>

            <!-- Cấu hình đường link Google Apps Script để kết nối Telegram Webhook -->
            <div class="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-900/60 space-y-2">
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Đường link Web App Google Apps Script của anh (kết thúc bằng /exec) <span class="text-rose-500">*</span>:
              </label>
              <div class="flex items-center gap-2">
                <input id="tg_webhook_api_url" type="url" value="${currentApiUrl}" placeholder="Ví dụ: https://script.google.com/macros/s/AKfycb.../exec" class="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" />
                <button onclick="activateTelegramWebhook()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0 btn-press">
                  <span class="material-symbols-outlined text-[17px]">bolt</span>
                  <span>Kích hoạt Webhook</span>
                </button>
                <button onclick="checkTelegramWebhookStatus()" class="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 shrink-0 btn-press" title="Kiểm tra xem Telegram đã nhận diện Web App chưa">
                  <span class="material-symbols-outlined text-[17px]">stethoscope</span>
                  <span>Kiểm tra trạng thái</span>
                </button>
              </div>
              <p class="text-[10px] text-slate-400">
                📌 Lưu ý: Trong Google Apps Script, khi bấm Triển khai (Deploy), mục <b>Ai có quyền truy cập (Who has access)</b> BẮT BUỘC phải chọn <b>Bất kỳ ai (Anyone)</b> thì Telegram mới gửi tin nhắn vào được.
              </p>
            </div>

            <!-- Bảo mật cá nhân -->
            <div class="flex items-center gap-2 p-2 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 text-[11px] text-amber-900 dark:text-amber-200">
              <span class="material-symbols-outlined text-[16px] text-amber-700">lock</span>
              <span><b>Bảo mật độc quyền:</b> Bot chỉ chấp nhận lệnh từ Chat ID của anh Trần Quốc Được (<code>${settings.chatId || '6403485662'}</code>). Người lạ nhắn vào Bot sẽ từ chối.</span>
            </div>
          </div>

          <!-- Danh sách câu lệnh mẫu & Hướng dẫn sử dụng -->
          <div class="space-y-2.5">
            <h4 class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-brand-600">terminal</span>
              <span>CÁC CÂU LỆNH ANH CÓ THỂ NHẮN CHO BOT TRÊN TELEGRAM:</span>
            </h4>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              
              <!-- 1. Thêm giải đấu -->
              <div class="p-3 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[15px]">add_circle</span>
                    <span>1. Thêm giải đấu mới</span>
                  </span>
                  <span class="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg font-bold">Mới nhất</span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                  Nhắn: <code>Thêm giải</code> hoặc <code>/themgiai</code>
                </p>
                <p class="text-[10px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-lg">
                  ↳ Bot gửi lại mẫu form để anh sửa thông tin (Tên giải, Ngày, VĐV, Huy chương...) rồi gửi lại. Bot tự lưu và đẩy lên vị trí #1!
                </p>
              </div>

              <!-- 2. Xuất báo cáo qua tin nhắn -->
              <div class="p-3 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[15px]">description</span>
                    <span>2. Yêu cầu xuất Báo cáo</span>
                  </span>
                  <span class="text-[10px] bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-lg font-bold">Xuất file .doc</span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                  Nhắn: <code>Gửi tôi báo cáo chi bộ tháng 9</code> hoặc <code>Báo cáo TDTT tháng 10</code>
                </p>
                <p class="text-[10px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-lg">
                  ↳ Bot tự động lên hệ thống xuất văn bản Word chuẩn thể thức hành chính và gửi trả ngay file .doc trong 2 giây.
                </p>
              </div>

              <!-- 3. Tra cứu KPI / Tiến độ -->
              <div class="p-3 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[15px]">analytics</span>
                    <span>3. Tra cứu Tiến độ thi đua</span>
                  </span>
                  <span class="text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-lg font-bold">KPI Năm</span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                  Nhắn: <code>KPI</code> hoặc <code>Tiến độ</code> hoặc <code>Chỉ tiêu</code>
                </p>
                <p class="text-[10px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-lg">
                  ↳ Bot báo cáo nhanh % hoàn thành: Số giải, Lượt VĐV, Huy chương và xếp loại thi đua.
                </p>
              </div>

              <!-- 4. Tra cứu giải mới nhất & CLB -->
              <div class="p-3 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[15px]">search</span>
                    <span>4. Tra cứu nhanh khác</span>
                  </span>
                  <span class="text-[10px] bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-lg font-bold">Tiện ích</span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                  Nhắn: <code>Giải mới nhất</code> hoặc <code>CLB</code>
                </p>
                <p class="text-[10px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-lg">
                  ↳ Xem ngay thông tin giải #1 hoặc danh sách số điện thoại Chủ nhiệm 5 CLB để gọi/nhắn Zalo.
                </p>
              </div>

            </div>
          </div>
        </div>
      `;
    }

export async function activateTelegramWebhook() {
      const settings = state.telegramSettings || {};
      const botToken = settings.botToken || document.getElementById('tg_bot_token')?.value.trim();
      const inputEl = document.getElementById('tg_webhook_api_url');
      let apiUrl = inputEl ? inputEl.value.trim() : state.apiUrl;

      if (!apiUrl) {
        alert('Vui lòng nhập đường link Google Apps Script Web App của anh (kết thúc bằng /exec) trước khi kích hoạt!');
        return;
      }

      if (!botToken) {
        alert('Vui lòng kiểm tra lại Bot Token trong tab Cài đặt Bot Token!');
        return;
      }

      state.apiUrl = apiUrl;
      saveAll();

      // Đồng bộ ngay botToken và chatId lên Google Apps Script để backend biết token mà trả lời
      try {
        fetch(apiUrl + (apiUrl.includes('?') ? '&' : '?') + 'action=saveTelegramToken&botToken=' + encodeURIComponent(botToken) + '&chatId=' + encodeURIComponent(settings.chatId || '6403485662'));
      } catch (e) {}

      const tgWebhookUrl = `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(apiUrl)}&drop_pending_updates=true`;

      try {
        const resp = await fetch(tgWebhookUrl);
        const res = await resp.json();
        if (res.ok) {
          alert('🎉 KÍCH HOẠT THÀNH CÔNG!\n\nTelegram đã kết nối Webhook tới Google Apps Script của anh!\n\n👉 Bây giờ anh hãy mở ứng dụng Telegram trên điện thoại, nhắn tin cho Bot câu "Thêm giải" hoặc "Gửi tôi báo cáo chi bộ tháng 9" để kiểm tra phản hồi nhé!');
        } else {
          alert('Telegram phản hồi: ' + (res.description || 'Không thể thiết lập Webhook.'));
        }
      } catch (err) {
        window.open(tgWebhookUrl, '_blank');
        alert('Đã mở tab mới để kích hoạt Webhook trực tiếp. Anh kiểm tra nếu trang hiện {"ok":true,"description":"Webhook was set"} là thành công 100% nhé!');
      }
    }

export async function checkTelegramWebhookStatus() {
      const settings = state.telegramSettings || {};
      const botToken = settings.botToken || document.getElementById('tg_bot_token')?.value.trim();
      if (!botToken) {
        alert('Chưa có Bot Token để kiểm tra!');
        return;
      }

      const tgInfoUrl = `https://api.telegram.org/bot${botToken}/getWebhookInfo`;
      try {
        const resp = await fetch(tgInfoUrl);
        const res = await resp.json();
        if (res.ok) {
          const info = res.result;
          let msg = `🔍 KẾT QUẢ KIỂM TRA WEBHOOK TELEGRAM:\n\n`;
          msg += `• Đường link Webhook đang liên kết: ${info.url || '(Chưa liên kết)'}\n`;
          msg += `• Số tin nhắn đang chờ xử lý: ${info.pending_update_count || 0}\n`;
          if (info.last_error_message) {
            msg += `\n⚠️ CẢNH BÁO LỖI GẦN NHẤT TỪ GOOGLE APPS SCRIPT:\n${info.last_error_message}\n(Thời điểm: ${new Date(info.last_error_date * 1000).toLocaleString('vi-VN')})\n\n👉 Cách khắc phục:\n1. Dán code mới dùng HtmlService vào Apps Script.\n2. Bấm 'Kích hoạt Webhook' để xóa sạch các tin nhắn bị tắc cũ.\n3. Gửi tin nhắn mới cho Bot.`;
          } else if (info.url) {
            msg += `\n✅ Trạng thái: KẾT NỐI HOÀN TOÀN TỐT! Webhook đang hoạt động thông suốt.`;
          }
          alert(msg);
        } else {
          alert('Lỗi Telegram API: ' + (res.description || 'Không thể kiểm tra thông tin webhook.'));
        }
      } catch (err) {
        window.open(tgInfoUrl, '_blank');
      }
    }

export function openEditScheduleModal(schedId = null) {
      const existing = schedId ? (state.telegramSchedules || []).find(s => s.id === schedId) : null;
      const sched = existing || {
        id: 'sched-' + Date.now(),
        name: 'Báo cáo công tác TDTT định kỳ (Mẫu Nhà nước)',
        enabled: true,
        mode: 'state',
        period: 'month',
        recipient: 'vp_trungtam',
        scheduleType: 'monthly',
        dayOfMonth: 11,
        timeOfDay: '08:00',
        sendKpiSummary: true,
        sendFullDocument: true,
        lastSent: ''
      };

      // Đóng modal cũ
      const oldModal = document.getElementById('modalContainer');
      if (oldModal) oldModal.remove();

      const modal = document.createElement('div');
      modal.id = 'modalContainer';
      modal.className = 'fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm';
      modal.innerHTML = `
        <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 max-h-[90vh] overflow-y-auto modal-animate text-left">
          
          <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                ${existing ? 'Chỉnh Sửa Cấu Hình Gửi Báo Cáo' : 'Thêm Cấu Hình Gửi Báo Cáo Mới'}
              </h3>
              <p class="text-[11px] text-slate-400">Tự do chọn ngày gửi (1-31), giờ gửi và thể thức báo cáo gửi Telegram</p>
            </div>
            <button onclick="window.closeModal(); openTelegramConfigModal('list');" class="p-1 rounded-lg text-slate-400 hover:text-slate-600"><span class="material-symbols-outlined text-[18px]">close</span></button>
          </div>

          <form onsubmit="handleSaveScheduleConfig(event)" class="mt-4 space-y-3.5 text-xs">
            <input type="hidden" id="cfg_id" value="${sched.id}" />

            <!-- Tên cấu hình -->
            <div>
              <label class="block font-bold mb-1">Tên cấu hình / Tiêu đề gợi nhớ <span class="text-rose-500">*</span></label>
              <input id="cfg_name" type="text" required value="${sched.name}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white" />
            </div>

            <!-- Thể thức báo cáo & Kỳ -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">Thể thức văn bản</label>
                <select id="cfg_mode" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <option value="state" ${sched.mode === 'state' ? 'selected' : ''}>🏛️ Mẫu Nhà nước (TDTT)</option>
                  <option value="party" ${sched.mode === 'party' ? 'selected' : ''}>⭐ Mẫu Chi bộ (Đảng viên)</option>
                </select>
              </div>

              <div>
                <label class="block font-bold mb-1">Kỳ dữ liệu báo cáo</label>
                <select id="cfg_period" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <option value="month" ${sched.period === 'month' ? 'selected' : ''}>Hàng Tháng (Tháng hiện tại)</option>
                  <option value="quarter" ${sched.period === 'quarter' ? 'selected' : ''}>Hàng Quý (Quý hiện tại)</option>
                  <option value="half" ${sched.period === 'half' ? 'selected' : ''}>6 Tháng (Đầu / Cuối năm)</option>
                  <option value="nine" ${sched.period === 'nine' ? 'selected' : ''}>9 Tháng đầu năm</option>
                  <option value="year" ${sched.period === 'year' ? 'selected' : ''}>Cả Năm</option>
                </select>
              </div>
            </div>

            <!-- Cơ quan / Đơn vị nhận -->
            <div>
              <label class="block font-bold mb-1">Cơ quan / Đơn vị nhận báo cáo</label>
              <select id="cfg_recipient" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <option value="vp_trungtam" ${sched.recipient === 'vp_trungtam' ? 'selected' : ''}>Văn phòng Trung tâm Dịch vụ Tổng hợp</option>
                <option value="phong_vanhoa" ${sched.recipient === 'phong_vanhoa' ? 'selected' : ''}>Phòng Văn hóa và Thông tin</option>
                <option value="Chi bộ Trung tâm DVTH" ${sched.recipient === 'Chi bộ Trung tâm DVTH' ? 'selected' : ''}>Chi bộ Trung tâm Dịch vụ Tổng hợp</option>
              </select>
              <span class="text-[10px] text-slate-400 mt-1 block italic">📌 Báo cáo của bộ phận gửi lên Văn phòng Trung tâm DVTH hoặc Phòng VHTT, không gửi thẳng lên UBND phường.</span>
            </div>

            <!-- Thiết lập thời gian gửi tự chọn -->
            <div class="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/60 space-y-3">
              <p class="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">event_repeat</span>
                <span>Thiết lập lịch hẹn gửi (Tự chọn ngày & giờ linh hoạt):</span>
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label class="block font-medium mb-1">Chu kỳ lặp lại</label>
                  <select id="cfg_sched_type" onchange="handleScheduleTypeChange()" class="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <option value="monthly" ${sched.scheduleType === 'monthly' ? 'selected' : ''}>Hàng tháng</option>
                    <option value="quarterly" ${sched.scheduleType === 'quarterly' ? 'selected' : ''}>Hàng quý</option>
                    <option value="weekly" ${sched.scheduleType === 'weekly' ? 'selected' : ''}>Hàng tuần</option>
                  </select>
                </div>

                <div id="dayOfMonthBox">
                  <label class="block font-medium mb-1">Chọn ngày gửi (1 - 31)</label>
                  <select id="cfg_day_month" class="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    ${Array.from({length: 31}, (_, i) => i + 1).map(d => `
                      <option value="${d}" ${(parseInt(sched.dayOfMonth) || 25) === d ? 'selected' : ''}>Ngày ${d} hàng tháng</option>
                    `).join('')}
                  </select>
                </div>

                <div>
                  <label class="block font-medium mb-1">Giờ gửi trong ngày</label>
                  <input id="cfg_time_day" type="time" value="${sched.timeOfDay || '08:00'}" class="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                </div>
              </div>
            </div>

            <!-- Tùy chọn nội dung đính kèm -->
            <div class="space-y-2 pt-1">
              <label class="block font-bold">Nội dung gửi kèm:</label>
              
              <label class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input id="cfg_send_kpi" type="checkbox" ${sched.sendKpiSummary !== false ? 'checked' : ''} class="rounded text-brand-600 focus:ring-brand-500 w-4 h-4">
                <div>
                  <span class="font-bold block text-slate-800 dark:text-slate-200">Gửi bảng tóm tắt số liệu KPI</span>
                  <span class="text-[11px] text-slate-400">Tin nhắn Telegram chứa tổng số giải, VĐV, huy chương, kinh phí & giải mới nhất (#1)</span>
                </div>
              </label>

              <label class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input id="cfg_send_doc" type="checkbox" ${sched.sendFullDocument !== false ? 'checked' : ''} class="rounded text-brand-600 focus:ring-brand-500 w-4 h-4">
                <div>
                  <span class="font-bold block text-slate-800 dark:text-slate-200">Đính kèm file báo cáo Word (.doc) hoàn chỉnh</span>
                  <span class="text-[11px] text-slate-400">Tự động xuất và upload file văn bản A4 chuẩn thể thức hành chính vào cuộc trò chuyện</span>
                </div>
              </label>
            </div>

            <!-- Trạng thái kích hoạt -->
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-900 dark:text-white block">Kích hoạt cấu hình này</span>
                <span class="text-[11px] text-slate-400">Bật để hệ thống tự động chạy theo lịch hẹn</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input id="cfg_enabled" type="checkbox" ${sched.enabled ? 'checked' : ''} class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <!-- Submit -->
            <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button type="button" onclick="window.closeModal(); openTelegramConfigModal('list');" class="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                Hủy
              </button>
              <button type="submit" class="px-5 py-2 rounded-xl font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-sm btn-press">
                Lưu cấu hình
              </button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
    }

export function handleScheduleTypeChange() {
      const type = document.getElementById('cfg_sched_type')?.value;
      const box = document.getElementById('dayOfMonthBox');
      if (!box) return;
      if (type === 'weekly') {
        box.innerHTML = `
          <label class="block font-medium mb-1">Chọn thứ trong tuần</label>
          <select id="cfg_day_month" class="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <option value="2">Thứ Hai</option>
            <option value="3">Thứ Ba</option>
            <option value="4">Thứ Tư</option>
            <option value="5">Thứ Năm</option>
            <option value="6">Thứ Sáu</option>
            <option value="7">Thứ Bảy</option>
            <option value="1">Chủ Nhật</option>
          </select>
        `;
      } else {
        box.innerHTML = `
          <label class="block font-medium mb-1">Chọn ngày gửi (1 - 31)</label>
          <select id="cfg_day_month" class="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            ${Array.from({length: 31}, (_, i) => i + 1).map(d => `
              <option value="${d}">Ngày ${d} ${type === 'quarterly' ? 'cuối quý' : 'hàng tháng'}</option>
            `).join('')}
          </select>
        `;
      }
    }

export function handleSaveScheduleConfig(e) {
      e.preventDefault();
      const id = document.getElementById('cfg_id').value;
      const name = document.getElementById('cfg_name').value.trim();
      const mode = document.getElementById('cfg_mode').value;
      const period = document.getElementById('cfg_period').value;
      const recipient = document.getElementById('cfg_recipient').value;
      const schedType = document.getElementById('cfg_sched_type').value;
      const dayOfMonth = parseInt(document.getElementById('cfg_day_month').value) || 25;
      const timeOfDay = document.getElementById('cfg_time_day').value || '08:00';
      const sendKpiSummary = document.getElementById('cfg_send_kpi').checked;
      const sendFullDocument = document.getElementById('cfg_send_doc').checked;
      const enabled = document.getElementById('cfg_enabled').checked;

      const idx = (state.telegramSchedules || []).findIndex(s => s.id === id);
      const item = {
        id: id,
        name: name,
        enabled: enabled,
        mode: mode,
        period: period,
        recipient: recipient,
        scheduleType: schedType,
        dayOfMonth: dayOfMonth,
        timeOfDay: timeOfDay,
        sendKpiSummary: sendKpiSummary,
        sendFullDocument: sendFullDocument,
        lastSent: idx !== -1 ? state.telegramSchedules[idx].lastSent : ''
      };

      if (!state.telegramSchedules) state.telegramSchedules = [];
      if (idx !== -1) {
        state.telegramSchedules[idx] = item;
      } else {
        state.telegramSchedules.push(item);
      }

      saveAll();
      window.closeModal();
      openTelegramConfigModal('list');
      showToast('Đã lưu cấu hình', `Cấu hình "${name}" đã được lưu vào danh sách.`);
      window.renderApp();
    }

export function toggleTelegramSchedule(schedId) {
      const sched = (state.telegramSchedules || []).find(s => s.id === schedId);
      if (sched) {
        sched.enabled = !sched.enabled;
        saveAll();
        showToast(sched.enabled ? 'Đã bật cấu hình' : 'Đã tắt cấu hình', `Cấu hình "${sched.name}" đã ${sched.enabled ? 'được kích hoạt' : 'tạm dừng'}.`);
        window.closeModal();
        openTelegramConfigModal('list');
        window.renderApp();
      }
    }

export function deleteTelegramSchedule(schedId) {
      const sched = (state.telegramSchedules || []).find(s => s.id === schedId);
      if (!sched) return;
      if (confirm(`Bạn có chắc chắn muốn xóa cấu hình "${sched.name}" khỏi danh sách?`)) {
        state.telegramSchedules = state.telegramSchedules.filter(s => s.id !== schedId);
        saveAll();
        showToast('Đã xóa cấu hình', `Cấu hình "${sched.name}" đã được xóa.`);
        window.closeModal();
        openTelegramConfigModal('list');
        window.renderApp();
      }
    }

export function restoreDefaultTelegramSchedules() {
      state.telegramSchedules = JSON.parse(JSON.stringify(INITIAL_TELEGRAM_SCHEDULES));
      saveAll();
      showToast('Đã khôi phục', 'Đã cài đặt lại 2 cấu hình mẫu (Nhà nước và Chi bộ).');
      window.closeModal();
      openTelegramConfigModal('list');
      window.renderApp();
    }

export async function handleSaveTelegramSettings(e) {
      e.preventDefault();
      const botToken = document.getElementById('tg_bot_token').value.trim();
      const chatId = document.getElementById('tg_chat_id').value.trim();
      const reminderMsg = document.getElementById('tg_setting_reminder_msg') ? document.getElementById('tg_setting_reminder_msg').value.trim() : 'Sếp ơi, ngày mai em làm báo cáo tháng, Sếp xem có gì cần bổ sung không ạ!';

      state.telegramSettings = {
        botToken: botToken,
        chatId: chatId,
        reminderMsg: reminderMsg || 'Sếp ơi, ngày mai em làm báo cáo tháng, Sếp xem có gì cần bổ sung không ạ!'
      };
      saveAll();

      // Đồng bộ ngay lên Google Apps Script và Google Sheet
      if (state.apiUrl) {
        try {
          fetch(state.apiUrl + (state.apiUrl.includes('?') ? '&' : '?') + 'action=saveTelegramToken&botToken=' + encodeURIComponent(botToken) + '&chatId=' + encodeURIComponent(chatId));
          pushToGoogleSheet(false);
        } catch (err) {}
      }

      showToast('Đã lưu cài đặt Telegram', 'Bot Token, Chat ID và nội dung tin nhắn nhắc việc đã được lưu an toàn.');
    }

export function saveQuickReminderMsg() {
      const input = document.getElementById('tg_quick_reminder_msg');
      if (!input) return;
      const val = input.value.trim();
      if (!val) {
        alert('Vui lòng không để trống nội dung tin nhắn nhắc việc!');
        return;
      }
      if (!state.telegramSettings) state.telegramSettings = {};
      state.telegramSettings.reminderMsg = val;
      saveAll();
      showToast('Đã lưu nội dung nhắc nhở', 'Đã cập nhật câu nhắc việc mới thành công.');
    }

export async function sendTestBotGreeting() {
      const botToken = document.getElementById('tg_bot_token')?.value.trim() || state.telegramSettings?.botToken;
      const chatId = document.getElementById('tg_chat_id')?.value.trim() || state.telegramSettings?.chatId;

      if (!botToken || !chatId) {
        alert('Vui lòng nhập đầy đủ Telegram Bot Token và Chat ID trước khi kiểm tra!');
        return;
      }

      const today = new Date().toLocaleDateString('vi-VN');
      const latest = state.activities[0] || {};
      const totalActs = state.activities.length;
      const totalMedals = state.activities.reduce((a, b) => a + (parseInt(b.totalMedals) || 0), 0);

      const msg = `🏆 <b>HỆ THỐNG QUẢN LÝ TDTT - PHƯỜNG TÂN KHAI</b>\n` +
                  `📍 <i>Trung tâm Dịch vụ tổng hợp</i>\n` +
                  `📅 Ngày kiểm tra: <b>${today}</b>\n` +
                  `👤 Cán bộ: <b>Trần Quốc Được</b>\n\n` +
                  `✅ <b>KẾT NỐI TELEGRAM BOT THÀNH CÔNG!</b>\n` +
                  `• Hiện có: <b>${(state.telegramSchedules || []).length}</b> cấu hình gửi báo cáo\n` +
                  `• Đang hoạt động: <b>${(state.telegramSchedules || []).filter(s => s.enabled).length}</b> cấu hình\n` +
                  `• Tổng số giải đấu: <b>${totalActs} giải</b>\n` +
                  `• Tổng huy chương: <b>${totalMedals} HC</b>\n` +
                  (latest.title ? `• Giải mới nhất (#1): <b>${latest.title}</b> (${latest.date})\n` : '') +
                  `\n📌 <i>Hệ thống đã sẵn sàng gửi số liệu KPI và đính kèm file báo cáo Word (.doc) tự động theo lịch của anh!</i>`;

      try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: msg,
            parse_mode: 'HTML'
          })
        });
        const res = await resp.json();
        if (res.ok) {
          alert('🎉 Tuyệt vời! Kết nối thành công! Tin nhắn đã được gửi thẳng vào Telegram của anh Trần Quốc Được!');
        } else {
          if (res.description && res.description.toLowerCase().includes('chat not found')) {
            alert('⚠️ Lỗi Telegram: "Bad Request: chat not found"\n\nNguyên nhân: Telegram có quy định bảo mật là Bot KHÔNG THỂ tự ý gửi tin nhắn trước nếu anh chưa từng bấm "Start" với con Bot đó.\n\n👉 Cách khắc phục ngay (mất 5 giây):\n1. Mở ứng dụng Telegram của anh.\n2. Mở cuộc trò chuyện với con Bot mà anh vừa tạo từ @BotFather.\n3. Bấm nút "START" (Bắt đầu) ở dưới đáy màn hình (hoặc gõ chữ "hi" hay "/start" gửi cho con Bot).\n4. Quay lại đây bấm nút "Kiểm tra kết nối Bot" là sẽ nhận được tin nhắn ngay lập tức!');
          } else {
            alert('Lỗi Telegram API: ' + (res.description || 'Không thể gửi tin nhắn. Hãy kiểm tra lại Bot Token và Chat ID.'));
          }
        }
      } catch (err) {
        alert('Lỗi kết nối mạng hoặc CORS: ' + err.message);
      }
    }

export async function sendDaiCaReminderTelegram(isManual = false) {
      const settings = state.telegramSettings || {};
      const botToken = settings.botToken || '9210349656:AAHjejkU7x5MWi71IBoHpQlhKAG59Z3BJA';
      const chatId = settings.chatId || '6403485662';

      if (!botToken || !chatId) {
        alert('Vui lòng nhập Bot Token và Chat ID trong Cài đặt Telegram trước!');
        return;
      }

      // Lấy câu nhắc việc ngắn gọn theo đúng yêu cầu
      const quickInput = document.getElementById('tg_quick_reminder_msg');
      const msg = (quickInput && quickInput.value.trim()) 
        ? quickInput.value.trim() 
        : ((settings.reminderMsg && settings.reminderMsg.trim()) 
            ? settings.reminderMsg.trim() 
            : 'Sếp ơi, ngày mai em làm báo cáo tháng, Sếp xem có gì cần bổ sung không ạ!');

      try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: msg,
            parse_mode: 'HTML'
          })
        });
        const res = await resp.json();
        if (res.ok) {
          if (isManual) {
            alert('🎉 Tuyệt vời! Đã gửi tin nhắn nhắc nhở "Sếp ơi..." vào Telegram của anh Trần Quốc Được!');
          }
          return true;
        } else {
          if (isManual) {
            alert('Lỗi Telegram API: ' + (res.description || 'Không thể gửi tin nhắn.'));
          }
          return false;
        }
      } catch (err) {
        if (isManual) {
          alert('Lỗi kết nối khi gửi Telegram: ' + err.message);
        }
        return false;
      }
    }

export async function executeTelegramSchedule(schedId, isManual = false) {
      const sched = (state.telegramSchedules || []).find(s => s.id === schedId);
      if (!sched) {
        alert('Không tìm thấy cấu hình gửi báo cáo này!');
        return;
      }

      const settings = state.telegramSettings || {};
      const botToken = settings.botToken;
      const chatId = settings.chatId;

      if (!botToken || !chatId) {
        if (confirm('Anh chưa lưu Telegram Bot Token và Chat ID. Anh có muốn mở tab Cài đặt ngay bây giờ không?')) {
          window.closeModal();
          openTelegramConfigModal('settings');
        }
        return;
      }

      const isParty = sched.mode === 'party';
      let recipientText = 'Văn phòng Trung tâm Dịch vụ Tổng hợp';
      if (isParty || sched.recipient === 'Chi bộ Trung tâm DVTH') {
        recipientText = 'Chi bộ Trung tâm Dịch vụ Tổng hợp';
      } else if (sched.recipient === 'phong_vanhoa') {
        recipientText = 'Phòng Văn hóa và Thông tin';
      }

      // Lấy dữ liệu và phạm vi chuẩn xác theo quy định:
      // - Mẫu Nhà nước: từ ngày 10 tháng trước đến ngày 10 tháng này
      // - Mẫu Chi bộ: từ ngày 1 đến ngày cuối cùng của tháng
      const today = new Date();
      const year = state.reportYear || today.getFullYear();
      const curM = today.getMonth() + 1;
      const q = Math.floor(today.getMonth() / 3) + 1;

      const range = getReportRange({
        mode: sched.mode,
        period: sched.period,
        year: year,
        month: curM,
        quarter: q
      });

      const filteredActs = getReportData({
        mode: sched.mode,
        period: sched.period,
        year: year,
        month: curM,
        quarter: q,
        range: range
      });

      const periodLabel = getPeriodTitle({
        period: sched.period,
        year: year,
        month: curM,
        quarter: q
      });

      const totalActs = filteredActs.length;
      const totalParticipants = filteredActs.reduce((a, b) => a + (parseInt(b.participants) || 0), 0);
      const totalMedals = filteredActs.reduce((a, b) => a + (parseInt(b.totalMedals) || 0), 0);
      const totalGold = filteredActs.reduce((a, b) => a + (parseInt(b.goldMedals) || 0), 0);
      const totalSilver = filteredActs.reduce((a, b) => a + (parseInt(b.silverMedals) || 0), 0);
      const totalBronze = filteredActs.reduce((a, b) => a + (parseInt(b.bronzeMedals) || 0), 0);
      const totalBudget = filteredActs.reduce((a, b) => a + (parseInt(b.budgetTotal) || 0), 0);

      // Thông điệp gửi báo cáo ngắn gọn, lịch sự theo yêu cầu người dùng
      const repTypeTitle = isParty ? 'Chi bộ' : 'công tác Thể dục Thể thao';
      const cleanPeriodTitle = periodLabel.replace(/^BÁO CÁO\s*/i, '').trim();
      const shortReportMsg = `Em gửi sếp báo cáo ${repTypeTitle} ${cleanPeriodTitle.toLowerCase()} ạ!`;

      // 1. GỬI TIN NHẮN THÔNG BÁO NGẮN GỌN (Nếu không gửi file Word hoặc nếu bật tùy chọn)
      if (sched.sendKpiSummary !== false && sched.sendFullDocument === false) {
        try {
          const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: shortReportMsg,
              parse_mode: 'HTML'
            })
          });
          const res = await resp.json();
          if (!res.ok) {
            if (res.description && res.description.toLowerCase().includes('chat not found')) {
              alert('⚠️ Lỗi: Telegram báo "Bad Request: chat not found"!\n\nAnh Được chỉ cần mở con Bot của mình trên Telegram và bấm nút START (hoặc gửi 1 tin nhắn cho Bot), sau đó quay lại gửi lại là được ngay ạ!');
              return;
            } else {
              throw new Error(res.description || 'Không thể gửi tin nhắn Telegram.');
            }
          }
        } catch (e) {
          alert('Lỗi gửi tin nhắn báo cáo: ' + e.message);
          return;
        }
      }

      // 2. GỬI FILE VĂN BẢN WORD (.DOC) HOÀN CHỈNH KÈM LỜI NHẮN NGẮN GỌN
      if (sched.sendFullDocument !== false) {
        try {
          const wordHtml = buildReportHTMLForWord({
            mode: sched.mode,
            period: sched.period,
            recipient: sched.recipient,
            year: year,
            month: curM,
            quarter: q,
            range: range,
            list: filteredActs,
            periodTitle: periodLabel
          });

          const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword;charset=utf-8' });
          const modeTag = isParty ? 'ChiBo' : 'TDTT';
          const periodTag = periodLabel.replace(/[\s\/\\]+/g, '_');
          const fileName = `BaoCao_${modeTag}_${periodTag}_TranQuocDuoc.doc`;

          const formData = new FormData();
          formData.append('chat_id', chatId);
          formData.append('document', blob, fileName);
          formData.append('caption', shortReportMsg);
          formData.append('parse_mode', 'HTML');

          const docResp = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
            method: 'POST',
            body: formData
          });
          const docRes = await docResp.json();
          if (!docRes.ok) {
            throw new Error(docRes.description || 'Không thể gửi file Word qua Telegram.');
          }
        } catch (docErr) {
          alert('Lỗi gửi file Word đính kèm: ' + docErr.message);
          return;
        }
      }

      // Cập nhật thời điểm gửi gần nhất
      sched.lastSent = new Date().toLocaleString('vi-VN');
      saveAll();

      if (isManual) {
        alert(`🎉 Thành công!\n\nHệ thống đã gửi số liệu KPI${sched.sendFullDocument !== false ? ' kèm File báo cáo Word (.doc)' : ''} vào Telegram của anh Trần Quốc Được theo cấu hình "${sched.name}".`);
      } else {
        showToast('Đã gửi báo cáo Telegram', `Đã gửi báo cáo "${sched.name}" thành công.`);
      }
      window.closeModal();
      openTelegramConfigModal('list');
      window.renderApp();
    }

export async function sendCurrentReportToTelegram() {
      const settings = state.telegramSettings;
      if (!settings || !settings.botToken || !settings.chatId) {
        if (confirm('Anh chưa cấu hình Telegram Bot Token và Chat ID. Anh có muốn mở bảng thiết lập ngay bây giờ không?')) {
          openTelegramConfigModal('settings');
        }
        return;
      }

      const isParty = state.reportMode === 'party';
      const range = getReportRange();
      const list = getReportData();
      const totalActs = list.length;
      const totalParticipants = list.reduce((a, b) => a + (parseInt(b.participants) || 0), 0);
      const totalMedals = list.reduce((a, b) => a + (parseInt(b.totalMedals) || 0), 0);
      const totalGold = list.reduce((a, b) => a + (parseInt(b.goldMedals) || 0), 0);
      const totalSilver = list.reduce((a, b) => a + (parseInt(b.silverMedals) || 0), 0);
      const totalBronze = list.reduce((a, b) => a + (parseInt(b.bronzeMedals) || 0), 0);
      const totalBudget = list.reduce((a, b) => a + (parseInt(b.budgetTotal) || 0), 0);

      let recipientText = 'Văn phòng Trung tâm Dịch vụ Tổng hợp';
      if (isParty) {
        recipientText = 'Chi bộ Trung tâm Dịch vụ Tổng hợp';
      } else if (state.reportRecipient === 'phong_vanhoa') {
        recipientText = 'Phòng Văn hóa và Thông tin';
      }

      // Thông điệp ngắn gọn, lịch sự theo yêu cầu người dùng
      const repTypeTitle = isParty ? 'Chi bộ' : 'công tác Thể dục Thể thao';
      const cleanPeriod = getPeriodTitle().replace(/^BÁO CÁO\s*/i, '').trim();
      const shortCaption = `Em gửi sếp báo cáo ${repTypeTitle} ${cleanPeriod.toLowerCase()} ạ!`;

      try {
        // 1. Đính kèm gửi File Word .doc hoàn chỉnh kèm lời nhắn ngắn gọn
        const wordHtml = buildReportHTMLForWord();
        const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword;charset=utf-8' });
        const modeTag = isParty ? 'ChiBo' : 'TDTT';
        const cleanFilePeriod = getPeriodTitle().replace(/[\s\/\\]+/g, '_');
        const fileName = `BaoCao_${modeTag}_${cleanFilePeriod}_TranQuocDuoc.doc`;

        const formData = new FormData();
        formData.append('chat_id', settings.chatId);
        formData.append('document', blob, fileName);
        formData.append('caption', shortCaption);
        formData.append('parse_mode', 'HTML');

        const docResp = await fetch(`https://api.telegram.org/bot${settings.botToken}/sendDocument`, {
          method: 'POST',
          body: formData
        });
        const docRes = await docResp.json();
        if (!docRes.ok) {
          if (docRes.description && docRes.description.toLowerCase().includes('chat not found')) {
            alert('⚠️ Lỗi: Telegram báo "Bad Request: chat not found"!\n\nAnh chỉ cần mở con Bot của mình trên Telegram và bấm nút START (hoặc gửi 1 tin nhắn cho Bot), sau đó quay lại gửi lại là được ngay ạ!');
            return;
          } else {
            throw new Error(docRes.description || 'Lỗi gửi file báo cáo qua Telegram.');
          }
        }

        showToast('Đã gửi Telegram', `Đã gửi báo cáo "${shortCaption}" vào Telegram của anh Được.`);
      } catch (err) {
        alert('Lỗi kết nối Telegram: ' + err.message);
      }
    }


