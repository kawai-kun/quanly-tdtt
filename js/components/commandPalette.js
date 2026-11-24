// ==============================================================================
// COMPONENT: COMMAND PALETTE (CTRL+K / SPOTLIGHT WORKSPACE)
// Hệ thống Quản lý TDTT - Phường Tân Khai
// ==============================================================================

import { state } from '../state.js';
import { formatVNCurrency } from '../utils/formatters.js';

let commandPaletteOpen = false;
let selectedIndex = 0;
let currentResults = [];

export function isCommandPaletteOpen() {
  return commandPaletteOpen;
}

export function openCommandPalette() {
  commandPaletteOpen = true;
  selectedIndex = 0;
  renderCommandPalette();
  setTimeout(() => {
    const input = document.getElementById('cmdPaletteInput');
    if (input) {
      input.focus();
      input.select();
    }
  }, 30);
}

export function closeCommandPalette() {
  commandPaletteOpen = false;
  const box = document.getElementById('commandPaletteContainer');
  if (box) box.innerHTML = '';
}

export function handleCommandPaletteSearch(query) {
  selectedIndex = 0;
  renderPaletteResults(query);
}

function getPaletteItems(query = '') {
  const q = query.trim().toLowerCase();

  const actions = [
    { type: 'action', title: 'Thêm giải đấu mới (Phím N)', icon: 'add_circle', action: "window.closeCommandPalette(); window.openActivityModal();", category: 'Tác vụ nhanh' },
    { type: 'action', title: 'Đồng bộ hai chiều với Google Drive', icon: 'cloud_sync', action: "window.closeCommandPalette(); window.pullFromGoogleSheet(false);", category: 'Tác vụ nhanh' },
    { type: 'action', title: 'Cấu hình Bot Telegram & Lịch nhắc việc', icon: 'send', action: "window.closeCommandPalette(); window.openTelegramConfigModal();", category: 'Tác vụ nhanh' },
    { type: 'action', title: 'Xuất văn bản Báo cáo Word (NĐ 30/2020)', icon: 'description', action: "window.closeCommandPalette(); window.switchTab('bao-cao');", category: 'Tác vụ nhanh' },
    { type: 'action', title: 'Xuất toàn bộ dữ liệu ra Excel', icon: 'file_download', action: "window.closeCommandPalette(); window.exportAllExcel();", category: 'Tác vụ nhanh' },
    { type: 'action', title: 'Chuyển đổi giao diện Sáng / Tối', icon: 'dark_mode', action: "window.closeCommandPalette(); window.toggleDarkMode();", category: 'Cài đặt' }
  ];

  const tabs = [
    { type: 'tab', title: 'Đi tới Bảng điều khiển (IOC Sports)', icon: 'dashboard', action: "window.closeCommandPalette(); window.switchTab('bang-dieu-khien');", category: 'Chuyển trang' },
    { type: 'tab', title: 'Đi tới Quản lý Giải đấu (30 giải)', icon: 'emoji_events', action: "window.closeCommandPalette(); window.switchTab('quan-ly-giai-dau');", category: 'Chuyển trang' },
    { type: 'tab', title: 'Đi tới Quản lý Câu lạc bộ', icon: 'groups_2', action: "window.closeCommandPalette(); window.switchTab('quan-ly-clb');", category: 'Chuyển trang' },
    { type: 'tab', title: 'Đi tới Lịch sinh hoạt & Tập luyện', icon: 'calendar_month', action: "window.closeCommandPalette(); window.switchTab('lich-sinh-hoat');", category: 'Chuyển trang' },
    { type: 'tab', title: 'Đi tới Quản lý Cơ sở vật chất', icon: 'stadium', action: "window.closeCommandPalette(); window.switchTab('co-so-vat-chat');", category: 'Chuyển trang' },
    { type: 'tab', title: 'Đi tới Quản lý Kinh phí & Quyết toán', icon: 'account_balance_wallet', action: "window.closeCommandPalette(); window.switchTab('kinh-phi');", category: 'Chuyển trang' },
    { type: 'tab', title: 'Đi tới Báo cáo & Sổ lưu trữ công văn', icon: 'summarize', action: "window.closeCommandPalette(); window.switchTab('bao-cao');", category: 'Chuyển trang' }
  ];

  const tournamentItems = (state.activities || []).map(a => ({
    type: 'tournament',
    title: a.name,
    subtitle: `${a.sport || 'Thể thao'} • ${a.level || 'Cấp phường'} • Ngày: ${a.date || 'Chưa rõ'} • Kinh phí: ${formatVNCurrency(a.budgetTotal || 0)}`,
    icon: 'emoji_events',
    action: `window.closeCommandPalette(); window.switchTab('quan-ly-giai-dau'); window.openActivityModal('${a.id}');`,
    category: 'Giải đấu'
  }));

  const clubItems = (state.clubs || []).map(c => ({
    type: 'club',
    title: c.name,
    subtitle: `${c.sport || 'CLB'} • Chủ nhiệm: ${c.leader || 'Chưa rõ'} • ${c.members || 0} thành viên`,
    icon: 'groups_2',
    action: `window.closeCommandPalette(); window.switchTab('quan-ly-clb');`,
    category: 'Câu lạc bộ'
  }));

  const all = [...actions, ...tabs, ...tournamentItems, ...clubItems];

  if (!q) return all.slice(0, 10);

  return all.filter(item => {
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  }).slice(0, 12);
}

function renderPaletteResults(query = '') {
  currentResults = getPaletteItems(query);
  const listEl = document.getElementById('cmdPaletteResults');
  if (!listEl) return;

  if (currentResults.length === 0) {
    listEl.innerHTML = `
      <div class="py-10 text-center text-slate-400">
        <span class="material-symbols-outlined text-[36px] text-slate-300 dark:text-slate-600">search_off</span>
        <p class="text-xs mt-2 font-medium">Không tìm thấy kết quả nào phù hợp với từ khóa "${query}"</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = currentResults.map((item, idx) => {
    const isSelected = idx === selectedIndex;
    return `
      <div 
        id="cmd-item-${idx}"
        onclick="${item.action}"
        class="flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
          isSelected 
            ? 'bg-emerald-600 text-white shadow-sm' 
            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
        }"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isSelected 
              ? 'bg-white/20 text-white' 
              : 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400'
          }">
            <span class="material-symbols-outlined text-[18px]">${item.icon}</span>
          </div>
          <div class="truncate text-left">
            <p class="text-xs font-bold leading-tight truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}">
              ${item.title}
            </p>
            ${item.subtitle ? `
              <p class="text-[10px] truncate mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}">
                ${item.subtitle}
              </p>
            ` : ''}
          </div>
        </div>
        <span class="text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ml-2 ${
          isSelected 
            ? 'bg-white/20 text-white' 
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
        }">
          ${item.category}
        </span>
      </div>
    `;
  }).join('');
}

export function renderCommandPalette() {
  const box = document.getElementById('commandPaletteContainer');
  if (!box) return;

  box.innerHTML = `
    <div class="fixed inset-0 z-50 command-palette-backdrop flex items-start justify-center pt-16 sm:pt-24 px-4 select-none" onclick="if(event.target===this) window.closeCommandPalette();">
      <div class="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl command-palette-box overflow-hidden flex flex-col max-h-[80vh]">
        
        <!-- Input Search Bar -->
        <div class="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <span class="material-symbols-outlined text-[22px] text-emerald-600 dark:text-emerald-400">search</span>
          <input 
            id="cmdPaletteInput"
            type="text" 
            placeholder="Tìm kiếm giải đấu, CLB, tác vụ hoặc gõ phím tắt..." 
            class="w-full bg-transparent border-none text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            oninput="window.handleCommandPaletteSearch(this.value)"
            onkeydown="window.handleCommandPaletteKeydown(event)"
          />
          <kbd class="hidden sm:inline-block text-[10px] font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 shadow-xs">ESC để đóng</kbd>
        </div>

        <!-- Search Results List -->
        <div id="cmdPaletteResults" class="p-2 sm:p-3 space-y-1 overflow-y-auto max-h-[50vh]">
        </div>

        <!-- Footer Shortcuts Help -->
        <div class="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div class="flex items-center gap-3">
            <span><strong class="text-slate-600 dark:text-slate-300">↑↓</strong> để chọn</span>
            <span><strong class="text-slate-600 dark:text-slate-300">Enter</strong> để mở</span>
            <span><strong class="text-slate-600 dark:text-slate-300">Esc</strong> đóng</span>
          </div>
          <span class="font-bold text-emerald-600 dark:text-emerald-400">TDTT Phường Tân Khai 4.0</span>
        </div>
      </div>
    </div>
  `;

  renderPaletteResults('');
}

export function handleCommandPaletteKeydown(e) {
  if (e.key === 'Escape') {
    closeCommandPalette();
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (currentResults.length > 0) {
      selectedIndex = (selectedIndex + 1) % currentResults.length;
      renderPaletteResults(document.getElementById('cmdPaletteInput')?.value || '');
      document.getElementById(`cmd-item-${selectedIndex}`)?.scrollIntoView({ block: 'nearest' });
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (currentResults.length > 0) {
      selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
      renderPaletteResults(document.getElementById('cmdPaletteInput')?.value || '');
      document.getElementById(`cmd-item-${selectedIndex}`)?.scrollIntoView({ block: 'nearest' });
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (currentResults[selectedIndex]) {
      const fn = new Function(currentResults[selectedIndex].action);
      fn();
    }
  }
}
