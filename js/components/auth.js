// ==============================================================================
// COMPONENT: MÀN HÌNH ĐĂNG NHẬP & BẢO MẬT (AUTH)
// ==============================================================================

import { state, lsSet } from '../state.js';
import { showToast, toggleDarkMode } from '../utils/toast.js';

    export function renderLogin() {
      return `
        <div class="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
          <!-- Background Sports Atmosphere -->
          <div class="absolute inset-0 bg-gradient-to-br from-brand-950/90 via-slate-900 to-emerald-950 pointer-events-none"></div>
          <div class="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Login Container Card -->
          <div class="w-full max-w-md relative z-10 glass-card rounded-xl shadow-2xl border border-white/10 p-8 sm:p-10 text-center modal-animate">
            
            <!-- Pristine Official Circular Emblem -->
            <div class="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-5 rounded-full p-1 bg-white/95 dark:bg-slate-800/95 shadow-xl ring-4 ring-brand-700/10 dark:ring-white/10 flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 group">
              <img src="logo.png" onerror="if(typeof EMBEDDED_LOGO_B64!=='undefined') this.src=EMBEDDED_LOGO_B64" class="w-full h-full object-contain rounded-full" alt="Huy hiệu UBND Phường Tân Khai" />
            </div>

            <div class="mb-6">
              <h3 class="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">ỦY BAN NHÂN DÂN PHƯỜNG TÂN KHAI</h3>
              <h2 class="text-xs font-extrabold uppercase tracking-wide text-brand-700 dark:text-brand-400 mt-1">TRUNG TÂM DỊCH VỤ TỔNG HỢP</h2>
              <h1 class="text-xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5">
                Quản Lý Thể Dục Thể Thao
              </h1>
            </div>

            <!-- Clean Login Form (KHÔNG HIỂN THỊ TÊN ĐĂNG NHẬP HOẶC MẬT KHẨU MẶC ĐỊNH) -->
            <form onsubmit="handleLoginSubmit(event)" class="space-y-4 text-left">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tài khoản cán bộ</label>
                <div class="relative">
                  <span class="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-2.5">person</span>
                  <input id="login_user" type="text" required placeholder="Nhập tài khoản cán bộ..." class="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 dark:text-white" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mật khẩu</label>
                <div class="relative">
                  <span class="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-2.5">lock</span>
                  <input id="login_pass" type="password" required placeholder="Nhập mật khẩu..." class="w-full pl-9 pr-9 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 dark:text-white" />
                  <button type="button" onclick="togglePassVisibility()" class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    <span id="eyeIcon" class="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs pt-1">
                <label class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 cursor-pointer">
                  <input type="checkbox" id="remember_me" class="w-4 h-4 rounded accent-brand-700 cursor-pointer" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <button type="button" onclick="toggleDarkMode()" class="text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">${state.darkMode ? 'light_mode' : 'dark_mode'}</span>
                </button>
              </div>

              <div class="pt-2 space-y-2">
                <button type="submit" class="w-full py-3 px-4 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer btn-press">
                  <span>Đăng nhập hệ thống</span>
                  <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
                <button type="button" onclick="state.isAuthenticated=true; lsSet('tk_auth',true); renderApp();" class="w-full py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 transition-all flex items-center justify-center gap-2 btn-press">
                  <span class="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>Vào xem trực tiếp (Cán bộ Trần Quốc Được)</span>
                </button>
              </div>
            </form>

            <div class="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80">
              <p class="text-[11px] text-slate-400 font-medium">Hệ thống thông tin nội bộ • Bảo mật chính quyền số</p>
            </div>
          </div>
        </div>
      `;
    }

    export function togglePassVisibility() {
      const pass = document.getElementById('login_pass');
      const icon = document.getElementById('eyeIcon');
      if (pass && icon) {
        if (pass.type === 'password') {
          pass.type = 'text';
          icon.textContent = 'visibility_off';
        } else {
          pass.type = 'password';
          icon.textContent = 'visibility';
        }
      }
    }

    export function handleLoginSubmit(e) {
      e.preventDefault();
      const u = document.getElementById('login_user').value.trim();
      const p = document.getElementById('login_pass').value;

      if ((u === 'admin' && p === 'D123@') || (u && p.length >= 4)) {
        state.isAuthenticated = true;
        lsSet('tk_auth', true);
        showToast('Đăng nhập thành công', 'Chào mừng Cán bộ Trung tâm Dịch vụ tổng hợp Phường Tân Khai.');
        window.renderApp();
      } else {
        showToast('Đăng nhập thất bại', 'Tài khoản hoặc mật khẩu không chính xác.', 'error');
      }
    }

    export function handleLogout() {
      if (confirm('Bạn có muốn đăng xuất khỏi hệ thống?')) {
        state.isAuthenticated = false;
        lsSet('tk_auth', false);
        window.renderApp();
      }
    }


