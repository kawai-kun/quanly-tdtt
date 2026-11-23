/**
 * HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO - PHƯỜNG TÂN KHAI
 * Module hoạt ảnh cao cấp sử dụng Anime.js (animejs.com)
 * Hỗ trợ hiệu ứng số nhảy KPI, lướt dòng danh sách, mở hộp thoại bung lò xo, và micro-interactions
 */

import anime from '../libs/anime.es.js';

export { anime };

/**
 * Hiệu ứng nhảy số thống kê (Animated Number Counter)
 * @param {string|HTMLElement} target - Selector hoặc Element cần nhảy số
 * @param {number} endValue - Giá trị đích
 * @param {object} options - Cấu hình duration, formatter, startValue
 */
export function animateCounter(target, endValue, options = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  const startValue = options.startValue !== undefined ? options.startValue : 0;
  const duration = options.duration || 1000;
  const formatter = options.formatter || ((val) => Math.round(val).toLocaleString('vi-VN'));
  const obj = { value: startValue };

  anime({
    targets: obj,
    value: endValue,
    duration: duration,
    easing: 'easeOutExpo',
    round: 1,
    update: () => {
      el.textContent = formatter(obj.value);
    }
  });
}

/**
 * Hiệu ứng thanh tiến độ (Progress Bar Fill)
 * @param {string|HTMLElement} target
 * @param {number} endPercent
 * @param {object} options
 */
export function animateProgressBar(target, endPercent, options = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  const duration = options.duration || 900;
  const delay = options.delay || 0;

  anime({
    targets: el,
    width: ['0%', Math.min(100, Math.max(0, endPercent)) + '%'],
    duration: duration,
    delay: delay,
    easing: 'easeOutCubic'
  });
}

/**
 * Hiệu ứng xuất hiện so le (Staggered Entrance Animation)
 * Cho các hàng trong bảng (table rows) hoặc thẻ (cards)
 * @param {string} targetSelector
 * @param {object} options
 */
export function animateStagger(targetSelector, options = {}) {
  const elements = document.querySelectorAll(targetSelector);
  if (!elements || elements.length === 0) return;

  const delayStep = options.delayStep || 25;
  const duration = options.duration || 350;
  const translateY = options.translateY !== undefined ? options.translateY : 12;

  anime({
    targets: elements,
    opacity: [0, 1],
    translateY: [translateY, 0],
    delay: anime.stagger(delayStep, { start: options.startDelay || 40 }),
    duration: duration,
    easing: 'easeOutQuad'
  });
}

/**
 * Hiệu ứng mở Modal bung mượt mà (Spring Popup)
 * @param {string} dialogSelector
 */
export function animateModalOpen(dialogSelector = '#modalContainer > div') {
  const backdrop = document.getElementById('modalContainer');
  if (!backdrop) return;
  const isAnimated = backdrop.getAttribute && backdrop.getAttribute('data-animated') === 'true';
  if (isAnimated) return;
  if (backdrop.setAttribute) backdrop.setAttribute('data-animated', 'true');

  const dialog = (backdrop.querySelector && backdrop.querySelector(':scope > div')) || document.querySelector(dialogSelector);
  if (!dialog) return;

  anime({
    targets: backdrop,
    opacity: [0, 1],
    duration: 250,
    easing: 'easeOutQuad'
  });

  anime({
    targets: dialog,
    scale: [0.93, 1],
    opacity: [0, 1],
    translateY: [15, 0],
    duration: 350,
    easing: 'easeOutBack(1.2)'
  });
}

// Tự động kích hoạt hiệu ứng bung mở mỗi khi có bất kỳ Modal nào được thêm vào DOM
if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
  const initModalObserver = () => {
    if (!document.body) return;
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1 && node.id === 'modalContainer') {
            animateModalOpen();
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModalObserver);
  } else {
    initModalObserver();
  }
}

/**
 * Hiệu ứng đóng Modal êm dịu (Fade Out & Scale Down)
 * @param {function} onComplete
 */
export function animateModalClose(onComplete) {
  const backdrop = document.getElementById('modalContainer');
  if (!backdrop) {
    if (onComplete) onComplete();
    return;
  }
  const isClosing = backdrop.getAttribute && backdrop.getAttribute('data-closing') === 'true';
  if (isClosing) {
    if (onComplete) onComplete();
    return;
  }
  if (backdrop.setAttribute) backdrop.setAttribute('data-closing', 'true');
  const dialog = backdrop.querySelector ? backdrop.querySelector(':scope > div') : null;

  if (dialog) {
    anime({
      targets: dialog,
      scale: [1, 0.94],
      opacity: [1, 0],
      translateY: [0, 10],
      duration: 180,
      easing: 'easeInQuad'
    });
  }

  anime({
    targets: backdrop,
    opacity: [1, 0],
    duration: 200,
    easing: 'easeInQuad',
    complete: () => {
      backdrop.remove();
      if (onComplete) onComplete();
    }
  });
}

/**
 * Hiệu ứng thông báo Toast trượt vào
 * @param {HTMLElement} toastEl
 */
export function animateToastIn(toastEl) {
  if (!toastEl) return;
  anime({
    targets: toastEl,
    translateY: [-20, 0],
    opacity: [0, 1],
    scale: [0.95, 1],
    duration: 350,
    easing: 'easeOutBack(1.2)'
  });
}

/**
 * Hiệu ứng thông báo Toast biến mất
 * @param {HTMLElement} toastEl
 * @param {function} onComplete
 */
export function animateToastOut(toastEl, onComplete) {
  if (!toastEl) return;
  anime({
    targets: toastEl,
    translateY: [0, -15],
    opacity: [1, 0],
    scale: [1, 0.95],
    duration: 220,
    easing: 'easeInQuad',
    complete: () => {
      toastEl.remove();
      if (onComplete) onComplete();
    }
  });
}

/**
 * Hiệu ứng xoay tròn icon nút bấm (VD: Đồng bộ Telegram)
 * @param {string|HTMLElement} iconSelectorOrEl
 * @param {number} loops
 */
export function animateSpin(iconSelectorOrEl, loops = 1) {
  const el = typeof iconSelectorOrEl === 'string' ? document.querySelector(iconSelectorOrEl) : iconSelectorOrEl;
  if (!el) return;
  anime({
    targets: el,
    rotate: `${loops * 360}deg`,
    duration: 700 * loops,
    easing: 'easeInOutCubic',
    complete: () => {
      el.style.transform = '';
    }
  });
}
