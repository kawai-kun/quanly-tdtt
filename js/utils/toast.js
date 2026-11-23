/**
 * HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO - PHƯỜNG TÂN KHAI
 * Toast Notification System & Theme Management
 */

import { state, lsSet } from '../state.js';

    export function showToast(title, msg, type = 'success') {
      const container = document.getElementById('toastContainer');
      if (!container) return;
      const el = document.createElement('div');
      const isErr = type === 'error';
      const icon = isErr ? 'error' : (type === 'warning' ? 'warning' : 'check_circle');
      const borderCol = isErr ? 'border-rose-500' : 'border-brand-500';

      el.className = `pointer-events-auto flex items-start gap-3 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border-l-4 ${borderCol} shadow-mobbin-hover text-slate-800 dark:text-slate-100 max-w-sm transition-all duration-300 transform translate-y-2 opacity-0`;
      el.innerHTML = `
        <span class="material-symbols-outlined text-[20px] ${isErr ? 'text-rose-500' : 'text-brand-600'} shrink-0 mt-0.5">${icon}</span>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold leading-tight">${title}</p>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">${msg}</p>
        </div>
      `;
      container.appendChild(el);
      requestAnimationFrame(() => {
        el.classList.remove('translate-y-2', 'opacity-0');
      });
      setTimeout(() => {
        el.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => el.remove(), 300);
      }, 3500);
    }

    export function toggleDarkMode() {
      state.darkMode = !state.darkMode;
      lsSet('tk_dark', state.darkMode);
      initTheme();
      window.renderApp();
    }

    export function initTheme() {
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

