/**
 * HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO - PHƯỜNG TÂN KHAI
 * Toast Notification System & Theme Management
 */

import { state, lsSet } from '../state.js';
import { animateToastIn, animateToastOut } from './animations.js';

    export function showToast(title, msg, type = 'success') {
      const container = document.getElementById('toastContainer');
      if (!container) return;
      const el = document.createElement('div');
      const isErr = type === 'error';
      const icon = isErr ? 'error' : (type === 'warning' ? 'warning' : 'check_circle');
      const borderCol = isErr ? 'border-rose-500' : 'border-brand-500';

      el.className = `pointer-events-auto flex items-start gap-3 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border-l-4 ${borderCol} shadow-mobbin-hover text-slate-800 dark:text-slate-100 max-w-sm`;
      el.innerHTML = `
        <span class="material-symbols-outlined text-[20px] ${isErr ? 'text-rose-500' : 'text-brand-600'} shrink-0 mt-0.5">${icon}</span>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold leading-tight">${title}</p>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">${msg}</p>
        </div>
      `;
      container.appendChild(el);
      animateToastIn(el);

      setTimeout(() => {
        animateToastOut(el);
      }, 3500);
    }

    export function setColorTheme(themeName) {
      state.colorTheme = themeName;
      lsSet('tk_color_theme', themeName);
      applyColorTheme();
      try {
        const url = new URL(window.location);
        url.searchParams.set('theme', themeName);
        window.history.replaceState({}, '', url);
      } catch (e) {}
      window.renderApp();
    }

    export function applyColorTheme() {
      const root = document.documentElement;
      root.classList.remove('theme-sapphire', 'theme-crimson', 'theme-carbon', 'theme-titanium', 'theme-emerald');
      if (state.colorTheme && state.colorTheme !== 'emerald') {
        root.classList.add(`theme-${state.colorTheme}`);
      }
    }

    export function toggleDarkMode() {
      state.darkMode = !state.darkMode;
      lsSet('tk_dark', state.darkMode);
      initTheme();
      window.renderApp();
    }

    export function initTheme() {
      try {
        const params = new URLSearchParams(window.location.search);
        const qTheme = params.get('theme');
        if (qTheme && ['sapphire', 'crimson', 'carbon', 'titanium', 'emerald'].includes(qTheme)) {
          state.colorTheme = qTheme;
          lsSet('tk_color_theme', qTheme);
        }
      } catch (e) {}

      applyColorTheme();

      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

