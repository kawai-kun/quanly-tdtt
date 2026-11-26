// ==============================================================================
// MODULE: ADMIN ELEVATION & PERMISSION GUARD (MÃ PIN 123123)
// Quản lý quyền Quản trị viên tối cao:
// - Yêu cầu xác thực mã PIN trước khi Thêm / Sửa / Xóa dữ liệu lần đầu
// - Duy trì quyền quản trị trong suốt phiên làm việc cho đến khi Khóa màn hình
// - Hỗ trợ khóa màn hình tức thì hoặc tự động sau thời gian chờ
// ==============================================================================

import { state, lsSet } from '../state.js';
import { showToast } from './toast.js';

let autoLockTimer = null;
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 phút không thao tác -> tự động khóa

export function resetInactivityTimer() {
  if (autoLockTimer) clearTimeout(autoLockTimer);
  if (state.isAuthenticated && state.isAdminElevated) {
    autoLockTimer = setTimeout(() => {
      lockAdminScreen(true);
    }, INACTIVITY_TIMEOUT);
  }
}

// Bắt sự kiện người dùng để reset timer
['mousedown', 'keydown', 'touchstart'].forEach(evt => {
  window.addEventListener(evt, resetInactivityTimer, { passive: true });
});

/**
 * Kiểm tra quyền quản trị tối cao trước khi thực hiện thao tác nhạy cảm
 * @param {Function} actionCallback Hàm cần thực hiện nếu đã có quyền
 * @param {string} actionLabel Tên thao tác để thông báo rõ ràng cho cán bộ
 */
export function requireAdminElevation(actionCallback, actionLabel = 'thao tác này') {
  if (state.isAdminElevated) {
    resetInactivityTimer();
    if (typeof actionCallback === 'function') actionCallback();
    return true;
  }

  if (typeof window.openPinVerifyModal === 'function') {
    window.openPinVerifyModal({
      title: 'XÁC THỰC QUYỀN QUẢN TRỊ',
      subtitle: `Vui lòng nhập mã PIN 6 chữ số để mở khóa quyền ${actionLabel}`,
      expectedPin: '123123',
      onSuccess: () => {
        state.isAdminElevated = true;
        lsSet('tk_admin_elevated', true);
        resetInactivityTimer();
        showToast('Xác thực Quản trị thành công', 'Quyền thêm mới & chỉnh sửa đã được kích hoạt cho toàn bộ phiên làm việc.');

        if (typeof window.updateHeaderAdminBadge === 'function') {
          window.updateHeaderAdminBadge();
        }

        if (typeof actionCallback === 'function') {
          setTimeout(actionCallback, 250);
        }
      }
    });
  } else {
    if (typeof actionCallback === 'function') actionCallback();
  }
  return false;
}

/**
 * Khóa màn hình quyền quản trị (Yêu cầu nhập lại mã PIN)
 */
export function lockAdminScreen(isAuto = false) {
  state.isAdminElevated = false;
  lsSet('tk_admin_elevated', false);
  if (autoLockTimer) clearTimeout(autoLockTimer);

  if (typeof window.updateHeaderAdminBadge === 'function') {
    window.updateHeaderAdminBadge();
  }

  showToast(
    isAuto ? 'Tự động khóa màn hình' : 'Đã khóa màn hình làm việc',
    'Phiên làm việc đã được bảo vệ. Vui lòng nhập mã PIN để mở khóa tiếp tục.'
  );

  if (typeof window.openPinVerifyModal === 'function') {
    window.openPinVerifyModal({
      title: 'MÀN HÌNH ĐÃ KHÓA BẢO VỆ',
      subtitle: 'Nhập mã PIN 6 chữ số để tiếp tục làm việc',
      expectedPin: '123123',
      onSuccess: () => {
        state.isAdminElevated = true;
        lsSet('tk_admin_elevated', true);
        resetInactivityTimer();
        showToast('Mở khóa thành công', 'Chào mừng Cán bộ Trần Quốc Được trở lại phiên làm việc.');
        if (typeof window.updateHeaderAdminBadge === 'function') {
          window.updateHeaderAdminBadge();
        }
      }
    });
  }
}

window.requireAdminElevation = requireAdminElevation;
window.lockAdminScreen = lockAdminScreen;
