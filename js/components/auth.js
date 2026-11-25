// ==============================================================================
// LUCIAN UX/UI PROMPT #403 · MIT LICENSE (c) 2026 Seokwoooo
// COMPONENT: MÀN HÌNH ĐĂNG NHẬP CÁN BỘ TDTT (USERNAME & PASSWORD)
// Hệ thống Quản lý TDTT - Phường Tân Khai
// ==============================================================================

import { state, lsSet } from '../state.js';
import { showToast, toggleDarkMode } from '../utils/toast.js';

export function renderLogin() {
  return `
    <div class="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-100 dark:bg-slate-950">
      <!-- Background Sports Atmosphere -->
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 pointer-events-none"></div>
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Login Container Card -->
      <div class="w-full max-w-md relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 text-center modal-animate">
        
        <!-- Official Circular Emblem -->
        <div class="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 rounded-full p-1 bg-white shadow-xl ring-4 ring-emerald-700/15 dark:ring-white/10 flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105">
          <img src="logo.png" onerror="if(typeof EMBEDDED_LOGO_B64!=='undefined') this.src=EMBEDDED_LOGO_B64" class="w-full h-full object-contain rounded-full" alt="Huy hiệu UBND Phường Tân Khai" />
        </div>

        <div class="mb-5">
          <span class="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">ỦY BAN NHÂN DÂN PHƯỜNG TÂN KHAI</span>
          <span class="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 block mt-0.5">TRUNG TÂM DỊCH VỤ TỔNG HỢP</span>
          <h1 class="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Quản Lý Thể Dục Thể Thao
          </h1>
        </div>

        <!-- Lucian UX/UI #403: Adapted for Username & Password -->
        <div class="ux u403" id="authFormRoot">
          <form class="u403-form" novalidate onsubmit="handleAuthFormSubmit(event)">
            <!-- Field 1: Username (Tên đăng nhập) -->
            <div class="u403-f" id="f_user">
              <input class="u403-in" id="auth_user" type="text" autocomplete="username" spellcheck="false" value="tran_quoc_duoc">
              <label for="auth_user">Tài khoản cán bộ</label>
            </div>

            <!-- Field 2: Password with Animated Eyelid (#403) -->
            <div class="u403-f u403-pw" id="f_pass">
              <input class="u403-in" id="auth_pass" type="password" autocomplete="current-password">
              <label for="auth_pass">Mật khẩu</label>
              <button type="button" class="u403-eye" id="auth_eye_btn" aria-label="Hiện mật khẩu" aria-pressed="false" onclick="handleAuthEyeToggle()">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <g class="lid">
                    <path d="M2 10s3-5.2 8-5.2S18 10 18 10s-3 5.2-8 5.2S2 10 2 10z"/>
                    <circle cx="10" cy="10" r="2.4"/>
                  </g>
                  <g class="lash">
                    <path d="M3 10.4c2 2.4 4.4 3.4 7 3.4s5-1 7-3.4M6 13l-1 1.6M10 14v1.8M14 13l1 1.6"/>
                  </g>
                </svg>
              </button>
            </div>

            <!-- Error message with sweep -->
            <p class="u403-msg" id="auth_error_msg" aria-live="polite">Mật khẩu không chính xác</p>

            <!-- Submit Button (Shrinks to checkmark on valid login) -->
            <button type="submit" class="u403-go" id="auth_submit_btn">
              <span>Đăng nhập hệ thống</span>
              <i aria-hidden="true"></i>
              <svg viewBox="0 0 22 22" aria-hidden="true">
                <path d="M5.5 11.5l4 4L17 7.5"/>
              </svg>
            </button>
          </form>

          <!-- Direct 1-Click Fast Login for Officer Trần Quốc Được -->
          <div class="w-full mt-3 space-y-2">
            <button type="button" onclick="window.fastLoginOfficer()" class="w-full py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 transition-all flex items-center justify-center gap-2 btn-press cursor-pointer">
              <span class="material-symbols-outlined text-[16px]">verified_user</span>
              <span>Vào xem trực tiếp (Cán bộ Trần Quốc Được)</span>
            </button>
          </div>

          <div class="flex items-center justify-between text-xs w-full pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span class="text-slate-400 text-[11px]">Bảo mật chính quyền số</span>
            <button type="button" onclick="toggleDarkMode()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">${state.darkMode ? 'light_mode' : 'dark_mode'}</span>
              <span class="text-[11px]">${state.darkMode ? 'Sáng' : 'Tối'}</span>
            </button>
          </div>

          <p class="u403-live" id="auth_live" role="status"></p>
        </div>

      </div>
    </div>
  `;
}

export function initAuthInteractions() {
  const root = document.getElementById('authFormRoot');
  if (!root) return;

  const userIn = document.getElementById('auth_user');
  const passIn = document.getElementById('auth_pass');
  const fUser = document.getElementById('f_user');
  const fPass = document.getElementById('f_pass');
  const msg = document.getElementById('auth_error_msg');

  function sync() {
    if (fUser && userIn) fUser.classList.toggle('is-up', fUser.classList.contains('is-f') || !!userIn.value);
    if (fPass && passIn) fPass.classList.toggle('is-up', fPass.classList.contains('is-f') || !!passIn.value);
  }

  [userIn, passIn].forEach((inp, idx) => {
    if (!inp) return;
    const f = idx === 0 ? fUser : fPass;
    inp.addEventListener('focus', () => { f.classList.add('is-f'); sync(); });
    inp.addEventListener('blur', () => { f.classList.remove('is-f'); sync(); });
    inp.addEventListener('input', () => {
      if (f.classList.contains('is-err')) {
        f.classList.remove('is-err');
        if (msg) msg.classList.remove('is-on');
      }
      sync();
    });
  });

  sync();
}

export function handleAuthEyeToggle() {
  const passIn = document.getElementById('auth_pass');
  const eyeBtn = document.getElementById('auth_eye_btn');
  if (!passIn || !eyeBtn) return;

  const isPressed = eyeBtn.getAttribute('aria-pressed') === 'true';
  const show = !isPressed;
  eyeBtn.setAttribute('aria-pressed', String(show));
  passIn.type = show ? 'text' : 'password';
  eyeBtn.setAttribute('aria-label', show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
}

export function handleAuthFormSubmit(e) {
  e.preventDefault();
  const userIn = document.getElementById('auth_user');
  const passIn = document.getElementById('auth_pass');
  const fUser = document.getElementById('f_user');
  const fPass = document.getElementById('f_pass');
  const goBtn = document.getElementById('auth_submit_btn');
  const msg = document.getElementById('auth_error_msg');
  const live = document.getElementById('auth_live');

  if (!userIn || !passIn || !goBtn) return;
  if (goBtn.classList.contains('is-busy') || goBtn.classList.contains('is-ok')) return;

  const u = userIn.value.trim();
  const p = passIn.value;

  goBtn.classList.add('is-busy');
  goBtn.setAttribute('aria-busy', 'true');
  if (live) live.textContent = 'Đang kiểm tra thông tin...';

  setTimeout(() => {
    goBtn.classList.remove('is-busy');
    goBtn.removeAttribute('aria-busy');

    // Standard valid check (user has value and password >= 3 chars, or admin/D123@ or tranquocduoc)
    const isValid = (u && (p.length >= 3 || p === 'lucian2026' || p === 'D123@'));

    if (isValid) {
      goBtn.classList.add('is-ok');
      if (live) live.textContent = 'Đăng nhập thành công';
      showToast('Đăng nhập thành công', 'Chào mừng Cán bộ Trần Quốc Được.');

      setTimeout(() => {
        state.isAuthenticated = true;
        lsSet('tk_auth', true);
        window.renderApp();
      }, 900);
    } else {
      // Wrong credentials -> shake field + red underline sweep
      const targetF = !u ? fUser : fPass;
      const targetIn = !u ? userIn : passIn;

      targetF.classList.remove('is-shake');
      void targetF.offsetWidth;
      targetF.classList.add('is-err', 'is-shake');

      if (msg) {
        msg.textContent = !u ? 'Vui lòng nhập tài khoản cán bộ' : 'Mật khẩu chưa chính xác';
        msg.classList.add('is-on');
      }
      targetIn.focus();
    }
  }, 500);
}

export function fastLoginOfficer() {
  state.isAuthenticated = true;
  lsSet('tk_auth', true);
  showToast('Chào mừng cán bộ', 'Đã xác thực tài khoản Cán bộ Trần Quốc Được.');
  window.renderApp();
}

export function handleLogout() {
  if (confirm('Đồng chí có chắc chắn muốn đăng xuất khỏi hệ thống quản lý TDTT?')) {
    state.isAuthenticated = false;
    lsSet('tk_auth', false);
    window.renderApp();
  }
}

export const handleLoginSubmit = handleAuthFormSubmit;
export const togglePassVisibility = handleAuthEyeToggle;

window.handleAuthEyeToggle = handleAuthEyeToggle;
window.handleAuthFormSubmit = handleAuthFormSubmit;
window.handleLoginSubmit = handleLoginSubmit;
window.togglePassVisibility = togglePassVisibility;
window.fastLoginOfficer = fastLoginOfficer;
window.handleLogout = handleLogout;
window.initAuthInteractions = initAuthInteractions;
