/* app_v2_core.js */

    /* ==============================================================================
       1. EMBLEM & LOGO HELPER (TỰ CO GIÃN THEO KHUNG & SẮC NÉT)
       ============================================================================== */
    function getLogoHTML(size = 48, extraClass = '') {
      return `<img src="logo.png" onerror="if(typeof EMBEDDED_LOGO_B64!=='undefined') this.src=EMBEDDED_LOGO_B64" class="${extraClass} shrink-0 drop-shadow-md transition-transform duration-300" style="height:${size}px; width:auto; max-width:100%; object-fit:contain;" alt="Logo Phường Tân Khai" />`;
    }

    // Biểu tượng nhận diện từng môn thể thao
    function getSportBadge(sportType) {
      const s = (sportType || '').toLowerCase();
      if (s.includes('bóng đá')) {
        return { label: 'Bóng đá', icon: 'sports_soccer', bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' };
      }
      if (s.includes('cầu lông')) {
        return { label: 'Cầu lông', icon: 'sports_tennis', bg: 'bg-sky-50 dark:bg-sky-950/60', text: 'text-sky-700 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800' };
      }
      if (s.includes('pickleball')) {
        return { label: 'Pickleball', icon: 'sports_baseball', bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' };
      }
      if (s.includes('bóng chuyền')) {
        return { label: 'Bóng chuyền', icon: 'sports_volleyball', bg: 'bg-indigo-50 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' };
      }
      if (s.includes('võ') || s.includes('taekwondo') || s.includes('boxing') || s.includes('kickboxing') || s.includes('wushu')) {
        return { label: 'Võ thuật', icon: 'sports_kabaddi', bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' };
      }
      if (s.includes('dưỡng sinh')) {
        return { label: 'Dưỡng sinh', icon: 'self_improvement', bg: 'bg-teal-50 dark:bg-teal-950/60', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800' };
      }
      if (s.includes('điền kinh') || s.includes('chạy') || s.includes('đi bộ')) {
        return { label: 'Điền kinh', icon: 'directions_run', bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' };
      }
      if (s.includes('cờ tướng') || s.includes('cờ')) {
        return { label: 'Cờ tướng', icon: 'casino', bg: 'bg-yellow-50 dark:bg-yellow-950/60', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' };
      }
      if (s.includes('bơi')) {
        return { label: 'Bơi lội', icon: 'pool', bg: 'bg-cyan-50 dark:bg-cyan-950/60', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' };
      }
      if (s.includes('kéo co') || s.includes('đẩy gậy') || s.includes('bi sắt')) {
        return { label: 'Thể thao TT', icon: 'fitness_center', bg: 'bg-orange-50 dark:bg-orange-950/60', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' };
      }
      return { label: 'Hành chính / Sự kiện', icon: 'event_available', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' };
    }

    /* ==============================================================================
       2. NORMALIZATION ENGINE (TỰ ĐỘNG CHUẨN HÓA KHUÔN MẪU DỮ LIỆU)
       ============================================================================== */
    function normalizeTitle(str) {
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

    function normalizeCode(code, count) {
      if (!code) return 'T-' + String(count + 1).padStart(2, '0');
      let c = code.trim().toUpperCase().replace(/\s+/g, '');
      if (!c.startsWith('T-') && !c.startsWith('T')) {
        c = 'T-' + c;
      } else if (c.startsWith('T') && !c.startsWith('T-')) {
        c = 'T-' + c.slice(1);
      }
      return c;
    }

    function normalizeDate(d) {
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

    function extractYearFromDate(dateStr) {
      if (!dateStr) return new Date().getFullYear();
      const match = dateStr.match(/\b(20\d\d)\b/);
      return match ? parseInt(match[1]) : new Date().getFullYear();
    }

    function extractQuarterFromDate(dateStr) {
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

    function autoDetectSport(title) {
      if (!title) return 'Bóng đá';
      const t = title.toLowerCase();
      if (t.includes('bóng đá')) return 'Bóng đá';
      if (t.includes('cầu lông')) return 'Cầu lông';
      if (t.includes('pickleball')) return 'Pickleball';
      if (t.includes('bóng chuyền')) return 'Bóng chuyền';
      if (t.includes('taekwondo') || t.includes('boxing') || t.includes('kickboxing') || t.includes('wushu') || t.includes('võ')) return 'Võ thuật';
      if (t.includes('dưỡng sinh')) return 'Dưỡng sinh';
      if (t.includes('cờ tướng') || t.includes('cờ')) return 'Cờ tướng';
      if (t.includes('điền kinh') || t.includes('chạy') || t.includes('đi bộ')) return 'Điền kinh';
      if (t.includes('kéo co')) return 'Kéo co';
      if (t.includes('đẩy gậy')) return 'Đẩy gậy';
      if (t.includes('bi sắt')) return 'Bi sắt';
      if (t.includes('bơi')) return 'Bơi lội';
      if (t.includes('billiards')) return 'Billiards';
      return 'Thể thao phong trào';
    }

    /* ==============================================================================
       3. CONSTANTS & INITIAL DATA
       ============================================================================== */
    const SPREADSHEET_ID = '1UFPIHG-TzG5h0imx6o5-Irf3klK1fhQ226sTe34HPx8';

    const INITIAL_ACTIVITIES = [
      { id: 'act-1', code: 'T-01', date: '20/12/2025', title: 'Giải thể dục Dưỡng sinh xã Tân Khai năm 2025', sport: 'Dưỡng sinh', location: 'Trung tâm Dịch vụ tổng hợp', category: 'Cấp phường', participants: 120, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 4, silverMedals: 4, bronzeMedals: 4, totalMedals: 12, budgetWard: 15000000, budgetPrize: 8000000, budgetTotal: 23000000, budgetStatus: 'Đã quyết toán', year: 2025, quarter: 'q4', month: 12 },
      { id: 'act-2', code: 'T-02', date: '25/12/2025', title: 'Giải Bóng chuyền nam xã Tân Khai năm 2025', sport: 'Bóng chuyền', location: 'Trung tâm Dịch vụ tổng hợp', category: 'Cấp phường', participants: 55, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 1, silverMedals: 1, bronzeMedals: 1, totalMedals: 3, budgetWard: 12000000, budgetPrize: 6000000, budgetTotal: 18000000, budgetStatus: 'Đã quyết toán', year: 2025, quarter: 'q4', month: 12 },
      { id: 'act-3', code: 'T-03', date: '03/02/2026', title: 'Giải Bóng đá nam truyền thống mừng Đảng - mừng xuân Bính Ngọ năm 2026', sport: 'Bóng đá', location: 'Sân vận động trung tâm', category: 'Cấp phường', participants: 85, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 1, silverMedals: 1, bronzeMedals: 1, totalMedals: 3, budgetWard: 25000000, budgetPrize: 10000000, budgetTotal: 35000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q1', month: 2 },
      { id: 'act-4', code: 'T-05', date: '15/03/2026', title: 'Lễ phát động Tháng HĐ TDTT và Ngày chạy Olympic vì sức khỏe toàn dân', sport: 'Điền kinh', location: 'Trung tâm Dịch vụ tổng hợp', category: 'Hành chính', participants: 200, participantsUnit: 'Người', status: 'Đã hoàn thành', goldMedals: 0, silverMedals: 0, bronzeMedals: 0, totalMedals: 0, budgetWard: 8000000, budgetPrize: 0, budgetTotal: 8000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q1', month: 3 },
      { id: 'act-5', code: 'T-06', date: '21/03/2026', title: 'Giải Cờ tướng Đại hội TDTT xã Tân Khai lần I', sport: 'Cờ tướng', location: 'Nhà thi đấu đa năng', category: 'Cấp phường', participants: 45, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 2, silverMedals: 2, bronzeMedals: 2, totalMedals: 6, budgetWard: 10000000, budgetPrize: 5000000, budgetTotal: 15000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q1', month: 3 },
      { id: 'act-6', code: 'T-07', date: '28/03/2026', title: 'Giải Bóng đá nam Đại hội TDTT xã Tân Khai lần I', sport: 'Bóng đá', location: 'Sân vận động trung tâm', category: 'Cấp phường', participants: 110, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 1, silverMedals: 1, bronzeMedals: 1, totalMedals: 3, budgetWard: 30000000, budgetPrize: 12000000, budgetTotal: 42000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q1', month: 3 },
      { id: 'act-7', code: 'T-08', date: '04/04/2026', title: 'Giải Cầu lông Đại hội TDTT xã Tân Khai lần I', sport: 'Cầu lông', location: 'Nhà thi đấu đa năng', category: 'Cấp phường', participants: 75, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 5, silverMedals: 5, bronzeMedals: 5, totalMedals: 15, budgetWard: 18000000, budgetPrize: 9000000, budgetTotal: 27000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q2', month: 4 },
      { id: 'act-8', code: 'T-09', date: '11/04/2026', title: 'Giải Bóng chuyền Đại hội TDTT xã Tân Khai lần I', sport: 'Bóng chuyền', location: 'Sân thể thao Khu phố 4', category: 'Cấp phường', participants: 80, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 1, silverMedals: 1, bronzeMedals: 1, totalMedals: 3, budgetWard: 14000000, budgetPrize: 7000000, budgetTotal: 21000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q2', month: 4 },
      { id: 'act-9', code: 'T-04', date: '18/04/2026', title: 'Giải Pickleball Đại hội TDTT xã Tân Khai lần I', sport: 'Pickleball', location: 'Cụm sân Pickleball KP 4', category: 'Cấp phường', participants: 65, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 5, silverMedals: 5, bronzeMedals: 5, totalMedals: 15, budgetWard: 16000000, budgetPrize: 8000000, budgetTotal: 24000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q2', month: 4 },
      { id: 'act-10', code: 'T-10', date: '18/04/2026', title: 'Tổ chức giải Taekwondo Đại hội TDTT phường Tân Khai', sport: 'Taekwondo', location: 'Trung tâm Dịch vụ tổng hợp', category: 'Cấp phường', participants: 95, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 10, silverMedals: 10, bronzeMedals: 10, totalMedals: 30, budgetWard: 20000000, budgetPrize: 10000000, budgetTotal: 30000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q2', month: 4 },
      { id: 'act-11', code: 'T-15', date: '21/04/2026', title: 'Tham gia Môn Bi sắt Đại hội TDTT TP Đồng Nai', sport: 'Bi sắt', location: 'TP Đồng Nai', category: 'Cấp thành phố', participants: 10, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 1, silverMedals: 0, bronzeMedals: 3, totalMedals: 4, budgetWard: 12000000, budgetPrize: 4000000, budgetTotal: 16000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q2', month: 4 },
      { id: 'act-12', code: 'T-12', date: '24/04/2026', title: 'Tổ chức giải Điền kinh Đại hội TDTT phường Tân Khai', sport: 'Điền kinh', location: 'Sân vận động trung tâm', category: 'Cấp phường', participants: 120, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 8, silverMedals: 8, bronzeMedals: 8, totalMedals: 24, budgetWard: 22000000, budgetPrize: 9000000, budgetTotal: 31000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q2', month: 4 },
      { id: 'act-13', code: 'T-13', date: '24/04/2026', title: 'Tổ chức giải Kéo co, Đẩy gậy Đại hội TDTT phường', sport: 'Kéo co', location: 'Trung tâm Dịch vụ tổng hợp', category: 'Cấp phường', participants: 150, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 10, silverMedals: 10, bronzeMedals: 10, totalMedals: 30, budgetWard: 18000000, budgetPrize: 8000000, budgetTotal: 26000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q2', month: 4 },
      { id: 'act-14', code: 'T-16', date: '19/05/2026', title: 'Tham gia Giải Boxing Đại hội TDTT TP Đồng Nai', sport: 'Boxing', location: 'TP Đồng Nai', category: 'Cấp thành phố', participants: 10, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 0, silverMedals: 1, bronzeMedals: 2, totalMedals: 3, budgetWard: 9000000, budgetPrize: 3000000, budgetTotal: 12000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q2', month: 5 },
      { id: 'act-15', code: 'T-17', date: '20/05/2026', title: 'Tham gia giải Thể dục Dưỡng sinh Đại hội TDTT TP Đồng Nai', sport: 'Dưỡng sinh', location: 'TP Đồng Nai', category: 'Cấp thành phố', participants: 13, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 0, silverMedals: 0, bronzeMedals: 1, totalMedals: 1, budgetWard: 10000000, budgetPrize: 1000000, budgetTotal: 11000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q2', month: 5 },
      { id: 'act-16', code: 'T-18', date: '25/05/2026', title: 'Tham gia Giải KickBoxing Đại hội TDTT TP Đồng Nai', sport: 'KickBoxing', location: 'TP Đồng Nai', category: 'Cấp thành phố', participants: 10, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 1, silverMedals: 0, bronzeMedals: 0, totalMedals: 1, budgetWard: 9000000, budgetPrize: 3000000, budgetTotal: 12000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q2', month: 5 },
      { id: 'act-17', code: 'T-19', date: '27/05/2026', title: 'Tham gia Giải Wushu Đại hội TDTT TP Đồng Nai', sport: 'Wushu', location: 'TP Đồng Nai', category: 'Cấp thành phố', participants: 10, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 0, silverMedals: 1, bronzeMedals: 0, totalMedals: 1, budgetWard: 9000000, budgetPrize: 2000000, budgetTotal: 11000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q2', month: 5 },
      { id: 'act-18', code: 'T-20', date: '10/06/2026', title: 'Giải bóng đá Tứ hùng phường Tân Khai năm 2026', sport: 'Bóng đá', location: 'Sân vận động trung tâm', category: 'Cấp phường', participants: 60, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 0, silverMedals: 0, bronzeMedals: 0, totalMedals: 0, budgetWard: 15000000, budgetPrize: 5000000, budgetTotal: 20000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q2', month: 6 },
      { id: 'act-19', code: 'T-22', date: '10/06/2026', title: 'Tham gia tập huấn hướng dẫn dạy Bơi và cứu hộ đuối nước', sport: 'Bơi lội', location: 'TP Đồng Nai', category: 'Hành chính', participants: 1, participantsUnit: 'Người', status: 'Đã hoàn thành', goldMedals: 0, silverMedals: 0, bronzeMedals: 0, totalMedals: 0, budgetWard: 3500000, budgetPrize: 0, budgetTotal: 3500000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q2', month: 6 },
      { id: 'act-20', code: 'T-18', date: '27/07/2026', title: 'Tham gia giải Billiards Đại hội TDTT TP Đồng Nai', sport: 'Billiards', location: 'TP Đồng Nai', category: 'Cấp thành phố', participants: 1, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 0, silverMedals: 0, bronzeMedals: 0, totalMedals: 0, budgetWard: 4000000, budgetPrize: 0, budgetTotal: 4000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q3', month: 7 },
      { id: 'act-21', code: 'T-14', date: '18/08/2026', title: 'Giải chạy hưởng ứng Ngày hội toàn dân bảo vệ an ninh Tổ quốc', sport: 'Điền kinh', location: 'Trung tâm Dịch vụ tổng hợp', category: 'Cấp phường', participants: 220, participantsUnit: 'Người', status: 'Đã hoàn thành', goldMedals: 0, silverMedals: 0, bronzeMedals: 0, totalMedals: 0, budgetWard: 12000000, budgetPrize: 4000000, budgetTotal: 16000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q3', month: 8 },
      { id: 'act-22', code: 'T-20', date: '20/08/2026', title: 'Tham gia giải Đẩy gậy Đại hội TDTT TP Đồng Nai', sport: 'Đẩy gậy', location: 'TP Đồng Nai', category: 'Cấp thành phố', participants: 10, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 3, silverMedals: 1, bronzeMedals: 0, totalMedals: 4, budgetWard: 11000000, budgetPrize: 6000000, budgetTotal: 17000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q3', month: 8 },
      { id: 'act-23', code: 'T-13', date: '26/08/2026', title: 'Phối hợp trực tiếp Chung kết bóng đá ASEAN Cup 2026', sport: 'Bóng đá', location: 'Trung tâm Dịch vụ tổng hợp', category: 'Hành chính', participants: 250, participantsUnit: 'Người', status: 'Đã hoàn thành', goldMedals: 0, silverMedals: 0, bronzeMedals: 0, totalMedals: 0, budgetWard: 7000000, budgetPrize: 0, budgetTotal: 7000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q3', month: 8 },
      { id: 'act-24', code: 'T-23', date: '28/08/2026', title: 'Tham gia diễu hành biểu dương lực lượng tại Lễ Khai mạc ĐH TDTT', sport: 'Hành chính', location: 'TP Đồng Nai', category: 'Hành chính', participants: 20, participantsUnit: 'Người', status: 'Đã hoàn thành', goldMedals: 0, silverMedals: 0, bronzeMedals: 0, totalMedals: 0, budgetWard: 9000000, budgetPrize: 0, budgetTotal: 9000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q3', month: 8 },
      { id: 'act-25', code: 'T-19', date: '29/08/2026', title: 'Tham gia giải Kéo co Đại hội TDTT TP Đồng Nai', sport: 'Kéo co', location: 'TP Đồng Nai', category: 'Cấp thành phố', participants: 24, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 1, silverMedals: 0, bronzeMedals: 2, totalMedals: 3, budgetWard: 14000000, budgetPrize: 5000000, budgetTotal: 19000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q3', month: 8 },
      { id: 'act-26', code: 'T-11', date: '30/08/2026', title: 'Chương trình đi bộ Cùng Việt Nam tiến bước', sport: 'Đi bộ', location: 'Trung tâm Dịch vụ tổng hợp', category: 'Cấp phường', participants: 200, participantsUnit: 'Người', status: 'Đã hoàn thành', goldMedals: 0, silverMedals: 0, bronzeMedals: 0, totalMedals: 0, budgetWard: 8500000, budgetPrize: 0, budgetTotal: 8500000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q3', month: 8 },
      { id: 'act-27', code: 'T-21', date: '04/09/2026', title: 'Tham gia giải Điền kinh Đại hội TDTT TP Đồng Nai', sport: 'Điền kinh', location: 'TP Đồng Nai', category: 'Cấp thành phố', participants: 10, participantsUnit: 'VĐV', status: 'Đã hoàn thành', goldMedals: 0, silverMedals: 2, bronzeMedals: 2, totalMedals: 4, budgetWard: 12000000, budgetPrize: 4000000, budgetTotal: 16000000, budgetStatus: 'Đã quyết toán', year: 2026, quarter: 'q3', month: 9 }
    ];

    const INITIAL_CLUBS = [
      { id: 'club-1', code: 'CLB-01', name: 'CLB Dưỡng sinh Người cao tuổi KP 7', leader: 'Nguyễn Thị Lan', phone: '0912 345 678', sport: 'Dưỡng sinh', membersCount: 45, location: 'Nhà văn hóa Khu phố 7', status: 'active', establishedYear: 2024 },
      { id: 'club-2', code: 'CLB-02', name: 'CLB Bóng đá Thanh niên Tân Khai', leader: 'Trần Văn Nam', phone: '0988 123 456', sport: 'Bóng đá', membersCount: 32, location: 'Sân vận động trung tâm', status: 'active', establishedYear: 2023 },
      { id: 'club-3', code: 'CLB-03', name: 'CLB Cầu lông Phường Tân Khai', leader: 'Lê Hoàng Long', phone: '0903 888 999', sport: 'Cầu lông', membersCount: 28, location: 'Nhà thi đấu đa năng', status: 'active', establishedYear: 2022 },
      { id: 'club-4', code: 'CLB-04', name: 'CLB Pickleball Phường Tân Khai', leader: 'Phạm Thanh Hà', phone: '0977 654 321', sport: 'Pickleball', membersCount: 24, location: 'Cụm sân Pickleball KP 4', status: 'active', establishedYear: 2025 },
      { id: 'club-5', code: 'CLB-05', name: 'CLB Cờ tướng Người cao tuổi Tân Khai', leader: 'Võ Văn Ba', phone: '0933 222 111', sport: 'Cờ tướng', membersCount: 20, location: 'Trung tâm Dịch vụ tổng hợp', status: 'active', establishedYear: 2021 }
    ];

    const INITIAL_SCHEDULES = [
      { id: 'sched-1', days: 'Hàng ngày (05:30 - 06:45)', clubName: 'CLB Dưỡng sinh Người cao tuổi KP 7', sport: 'Dưỡng sinh', location: 'Nhà văn hóa Khu phố 7', description: 'Tập thể dục dưỡng sinh 7 động tác và thái cực quyền' },
      { id: 'sched-2', days: 'Thứ 2, 4, 6 (17:30 - 19:30)', clubName: 'CLB Bóng đá Thanh niên Tân Khai', sport: 'Bóng đá', location: 'Sân vận động trung tâm', description: 'Tập luyện kỹ chiến thuật và thi đấu giao hữu' },
      { id: 'sched-3', days: 'Thứ 3, 5, 7 (18:00 - 20:00)', clubName: 'CLB Cầu lông Phường Tân Khai', sport: 'Cầu lông', location: 'Nhà thi đấu đa năng', description: 'Tập kỹ thuật đập cầu, giao cầu và rèn luyện thể lực' },
      { id: 'sched-4', days: 'Thứ 7 & Chủ nhật (06:30 - 09:00)', clubName: 'CLB Pickleball Phường Tân Khai', sport: 'Pickleball', location: 'Cụm sân Pickleball KP 4', description: 'Thi đấu giao lưu phong trào' }
    ];

    const INITIAL_FACILITIES = [
      { id: 'fac-1', name: 'Sân vận động trung tâm phường', type: 'Sân vận động', location: 'Khu phố 1', capacity: 500, status: 'Hoạt động tốt', usageRate: 88, note: 'Sân cỏ nhân tạo, dàn đèn chiếu sáng cao áp', manager: 'Nguyễn Văn Minh' },
      { id: 'fac-2', name: 'Nhà thi đấu đa năng phường', type: 'Nhà thi đấu', location: 'Khu phố 3', capacity: 250, status: 'Hoạt động tốt', usageRate: 75, note: 'Thảm thể thao chuyên dụng thi đấu cầu lông, võ thuật', manager: 'Lê Văn Tuấn' },
      { id: 'fac-3', name: 'Hồ bơi công cộng Tân Khai', type: 'Hồ bơi', location: 'Khu phố 5', capacity: 100, status: 'Bảo trì định kỳ', usageRate: 60, note: 'Phổ cập bơi phòng chống đuối nước', manager: 'Trần Hữu Thắng' },
      { id: 'fac-4', name: 'Cụm sân Pickleball & Bóng chuyền', type: 'Sân ngoài trời', location: 'Khu phố 4', capacity: 80, status: 'Hoạt động tốt', usageRate: 85, note: '2 sân pickleball tiêu chuẩn, 1 sân bóng chuyền', manager: 'Đỗ Quốc Cường' }
    ];

    const INITIAL_REPORTS = [
      {
        id: 'rep-09',
        reportNumber: 9,
        code: '09/BC-TTDVTH',
        title: 'Báo cáo tổng kết công tác phát triển Thể dục Thể thao giai đoạn 2025 - 2026',
        reportDate: '28/10/2026',
        year: '2026',
        quarter: 'all',
        author: 'Trần Quốc Đức',
        position: 'Cán bộ Trung tâm Dịch vụ tổng hợp',
        summaryActs: 27,
        summaryParticipants: 2049,
        summaryMedals: 165,
        summaryBudget: 341000000,
        createdAt: '2026-10-28'
      }
    ];

    /* ==============================================================================
       4. LOCAL STORAGE & APP STATE
       ============================================================================== */
    function lsGet(k, def) {
      try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; }
    }
    function lsSet(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
    }

    const state = {
      isAuthenticated: lsGet('tk_auth', false),
      currentTab: 'bang-dieu-khien',
      darkMode: lsGet('tk_dark', false),
      apiUrl: lsGet('tk_api_url', ''),

      // Multi-Year
      selectedYear: lsGet('tk_selected_year', 'all'),

      // Data
      activities: lsGet('tk_activities', INITIAL_ACTIVITIES),
      clubs: lsGet('tk_clubs', INITIAL_CLUBS),
      schedules: lsGet('tk_schedules', INITIAL_SCHEDULES),
      facilities: lsGet('tk_facilities', INITIAL_FACILITIES),
      savedReports: lsGet('tk_saved_reports', INITIAL_REPORTS),

      // Sync
      syncStatus: 'idle',
      lastSyncTime: lsGet('tk_last_sync', 'Chưa đồng bộ'),
      autoSync: lsGet('tk_auto_sync', true),

      // Reports State
      reportSubTab: 'document',
      activeReportId: 'rep-09',

      // Tournament Filter
      tournamentsFilter: {
        category: 'all',
        sport: 'all',
        search: '',
        viewMode: 'cards'
      },

      mobileDrawerOpen: false
    };

    function getAvailableYears() {
      const yearsSet = new Set();
      state.activities.forEach(a => {
        const y = a.year || extractYearFromDate(a.date);
        if (y) yearsSet.add(y);
      });
      yearsSet.add(new Date().getFullYear());
      yearsSet.add(2026);
      yearsSet.add(2025);
      return Array.from(yearsSet).sort((a, b) => b - a);
    }
