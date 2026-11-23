/**
 * HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO - PHƯỜNG TÂN KHAI
 * Formatting & Parsing Utilities
 */

export function formatCurrency(amount) {
  const n = parseInt(amount) || 0;
  return n.toLocaleString('vi-VN') + ' đ';
}

export const formatVNCurrency = formatCurrency;

export function formatCurrencyShort(amount) {
  const n = parseInt(amount) || 0;
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + ' tỷ đ';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + ' tr đ';
  return n.toLocaleString('vi-VN') + ' đ';
}

export function normalizeTitle(str) {
  if (!str) return '';
  let s = str.trim().replace(/\s+/g, ' ');
  s = s.charAt(0).toUpperCase() + s.slice(1);
  s = s.replace(/\btan khai\b/gi, 'Tân Khai')
       .replace(/\bdong nai\b/gi, 'Đồng Nai')
       .replace(/\btdtt\b/gi, 'TDTT')
       .replace(/\bubnd\b/gi, 'UBND')
       .replace(/\bvdv\b/gi, 'VĐV')
       .replace(/\bhcv\b/gi, 'HCV')
       .replace(/\bhcb\b/gi, 'HCB')
       .replace(/\bhcd\b/gi, 'HCĐ')
       .replace(/\bclb\b/gi, 'CLB');
  return s;
}

export function normalizeCode(code, count) {
  if (!code) return 'T-' + String((count || 0) + 1).padStart(2, '0');
  let c = code.trim().toUpperCase().replace(/\s+/g, '');
  if (!c.startsWith('T-') && !c.startsWith('T')) {
    c = 'T-' + c;
  } else if (c.startsWith('T') && !c.startsWith('T-')) {
    c = 'T-' + c.slice(1);
  }
  return c;
}

export function normalizeDate(d) {
  if (!d) {
    const today = new Date();
    return String(today.getDate()).padStart(2, '0') + '/' + String(today.getMonth() + 1).padStart(2, '0') + '/' + today.getFullYear();
  }
  let s = d.trim().replace(/[-.]/g, '/');
  const parts = s.split('/');
  if (parts.length === 3) {
    let day = parts[0].padStart(2, '0');
    let month = parts[1].padStart(2, '0');
    let year = parts[2];
    if (year.length === 2) year = '20' + year;
    return `${day}/${month}/${year}`;
  }
  return d;
}

export function parseDateVN(str) {
  if (!str) return new Date(0);
  if (typeof str === 'string') {
    const s = str.trim();
    if (s.includes('/')) {
      const parts = s.split('/');
      if (parts.length === 3) return new Date(+parts[2], +parts[1] - 1, +parts[0]);
    } else if (s.includes('-')) {
      const parts = s.split('-');
      if (parts.length === 3) return new Date(+parts[0], +parts[1] - 1, +parts[2]);
    }
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

export function formatDateVN(d) {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export function extractYearFromDate(dateStr) {
  if (!dateStr) return new Date().getFullYear();
  const match = dateStr.match(/\b(20\d\d)\b/);
  return match ? parseInt(match[1]) : new Date().getFullYear();
}

export function extractQuarterFromDate(dateStr) {
  if (!dateStr) return 'q1';
  const parts = dateStr.split('/');
  if (parts.length >= 2) {
    const m = parseInt(parts[1]);
    if (m >= 1 && m <= 3) return 'q1';
    if (m >= 4 && m <= 6) return 'q2';
    if (m >= 7 && m <= 9) return 'q3';
    return 'q4';
  }
  return 'q1';
}

export function sortActivitiesByLatest(arr) {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => {
    const tA = parseDateVN(a.date).getTime();
    const tB = parseDateVN(b.date).getTime();
    if (tB !== tA) return tB - tA; // Giải mới nhất luôn ở vị trí số 1 (#1)
    return (b.code || '').localeCompare(a.code || '');
  });
}

export function autoDetectSport(title) {
  if (!title) return 'Bóng đá';
  const t = title.toLowerCase();
  if (t.includes('bóng đá')) return 'Bóng đá';
  if (t.includes('cầu lông')) return 'Cầu lông';
  if (t.includes('pickleball')) return 'Pickleball';
  if (t.includes('bóng chuyền')) return 'Bóng chuyền';
  if (t.includes('taekwondo') || t.includes('boxing') || t.includes('kickboxing') || t.includes('wushu') || t.includes('võ')) return 'Võ thuật';
  if (t.includes('dưỡng sinh')) return 'Dưỡng sinh';
  if (t.includes('cờ vua')) return 'Cờ vua';
  if (t.includes('cờ tướng') || t.includes('cờ')) return 'Cờ tướng';
  if (t.includes('điền kinh') || t.includes('chạy') || t.includes('đi bộ')) return 'Điền kinh';
  if (t.includes('kéo co')) return 'Kéo co';
  if (t.includes('đẩy gậy')) return 'Đẩy gậy';
  if (t.includes('bi sắt')) return 'Bi sắt';
  if (t.includes('bơi')) return 'Bơi lội';
  if (t.includes('billiards')) return 'Billiards';
  return 'Thể thao phong trào';
}

export function getAvailableYears(customState) {
  const current = customState || (typeof window !== 'undefined' ? window.state : null);
  const yearsSet = new Set();
  if (current?.activities) {
    current.activities.forEach(a => {
      const y = a.year || extractYearFromDate(a.date);
      if (y) yearsSet.add(y);
    });
  }
  if (current?.budgetItems) {
    current.budgetItems.forEach(b => {
      if (b.year) yearsSet.add(parseInt(b.year));
    });
  }
  yearsSet.add(new Date().getFullYear());
  yearsSet.add(2026);
  yearsSet.add(2025);
  return Array.from(yearsSet).sort((a, b) => b - a);
}
