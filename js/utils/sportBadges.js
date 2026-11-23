/**
 * HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO - PHƯỜNG TÂN KHAI
 * Sport Badges & Logo Helper
 */

export function getLogoHTML(size = 48, extraClass = '') {
  const isNumeric = typeof size === 'number' || (/^\d+$/).test(size);
  const sizeStyle = isNumeric ? `width:${size}px; height:${size}px;` : '';
  const sizeClass = !isNumeric ? size : '';
  return `<img src="logo.png" onerror="if(typeof EMBEDDED_LOGO_B64!=='undefined') this.src=EMBEDDED_LOGO_B64" class="${sizeClass} ${extraClass} shrink-0 max-w-full max-h-full object-contain rounded-full transition-transform duration-300" style="${sizeStyle}" alt="Huy hiệu UBND Phường Tân Khai" />`;
}

export function getSportBadge(sportType) {
  const s = (sportType || '').toLowerCase();
  if (s.includes('bóng đá')) {
    return { label: 'Bóng đá', icon: 'sports_soccer', bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' };
  }
  if (s.includes('cầu lông')) {
    return { label: 'Cầu lông', icon: 'sports_tennis', bg: 'bg-sky-50 dark:bg-sky-950/70', text: 'text-sky-800 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-700/50' };
  }
  if (s.includes('pickleball')) {
    return { label: 'Pickleball', icon: 'sports_baseball', bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' };
  }
  if (s.includes('bóng chuyền')) {
    return { label: 'Bóng chuyền', icon: 'sports_volleyball', bg: 'bg-indigo-50 dark:bg-indigo-950/70', text: 'text-indigo-800 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-700/50' };
  }
  if (s.includes('võ') || s.includes('taekwondo') || s.includes('boxing') || s.includes('kickboxing') || s.includes('wushu')) {
    return { label: 'Võ thuật', icon: 'sports_kabaddi', bg: 'bg-rose-50 dark:bg-rose-950/70', text: 'text-rose-800 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-700/50' };
  }
  if (s.includes('dưỡng sinh')) {
    return { label: 'Dưỡng sinh', icon: 'self_improvement', bg: 'bg-teal-50 dark:bg-teal-950/70', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-700/50' };
  }
  if (s.includes('điền kinh') || s.includes('chạy') || s.includes('đi bộ')) {
    return { label: 'Điền kinh', icon: 'directions_run', bg: 'bg-teal-50 dark:bg-teal-950/50', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' };
  }
  if (s.includes('cờ vây')) {
    return { label: 'Cờ vây', icon: 'grid_on', bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' };
  }
  if (s.includes('cờ tướng') || s.includes('cờ')) {
    return { label: 'Cờ tướng / Cờ vua', icon: 'casino', bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' };
  }
  if (s.includes('bơi')) {
    return { label: 'Bơi lội', icon: 'pool', bg: 'bg-cyan-50 dark:bg-cyan-950/70', text: 'text-cyan-800 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-700/50' };
  }
  if (s.includes('kéo co') || s.includes('đẩy gậy') || s.includes('bi sắt')) {
    return { label: 'Thể thao TT', icon: 'fitness_center', bg: 'bg-orange-50 dark:bg-orange-950/50', text: 'text-orange-800 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' };
  }
  return { label: 'Hành chính / Sự kiện', icon: 'event_available', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' };
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
  if (t.includes('cờ vây')) return 'Cờ vây';
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
