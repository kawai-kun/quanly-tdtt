# HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO
### TRUNG TÂM DỊCH VỤ TỔNG HỢP - UBND PHƯỜNG TÂN KHAI (TP ĐỒNG NAI)

---

## 📌 1. Giới thiệu hệ thống
Hệ thống Quản lý & Điều hành Thể dục Thể thao Phường Tân Khai phiên bản **v5.0 (Kiến trúc Native ES Modules)**:
* **Đơn vị chủ quản:** Trung tâm Dịch vụ tổng hợp - UBND Phường Tân Khai.
* **Cán bộ phụ trách:** **Trần Quốc Được** (Cán bộ phụ trách TDTT / Đảng viên Chi bộ Trung tâm DVTH).
* **Logo chính thức:** Biểu trưng Tượng đài Chiến thắng Tàu Ô - Tân Khai (`logo.png`), tích hợp mã hóa base64 chống vỡ ảnh trên mọi thiết bị.
* **Kiến trúc Modular hóa hiện đại (Phương án A):** Tách bạch hoàn toàn `css/`, `js/data/`, `js/utils/`, `js/services/`, `js/components/`, `js/app.js` và `index.html`. Mỗi chức năng là một module độc lập, dễ dàng nâng cấp, chỉnh sửa mà không ảnh hưởng tới toàn bộ ứng dụng. Tương thích 100% với GitHub Pages mà không cần bước build phức tạp.
* **Đồng bộ Google Drive & Telegram Bot 2 chiều:** Tự động đồng bộ và quét ngầm định kỳ 10 giây, chuyển tab/quay lại cửa sổ web là cập nhật tức thì.

---

## 📂 2. Cấu trúc mã nguồn Modular (Native ES6 Modules)

```text
├── index.html                 # Trang đích tinh gọn (~90 dòng), nạp CSS và js/app.js
├── logo.png                   # Biểu trưng chính thức Phường Tân Khai
├── logo_b64.js                # Dữ liệu ảnh dự phòng Base64
├── Code.gs                    # Google Apps Script xử lý Webhook Telegram & Google Sheets
├── css/
│   └── custom.css             # Toàn bộ Design Tokens, Dark Mode, Animations & In ấn
└── js/
    ├── app.js                 # Điều phối khởi chạy (Bootstrap, Lifecycle & Global Bindings)
    ├── state.js               # Quản lý State trung tâm, LocalStorage, AutoSync Timer
    ├── data/
    │   ├── constants.js       # Hằng số hệ thống, Cấu hình Spreadsheet & Đơn vị
    │   └── initialData.js     # 30 giải đấu thực tế, 5 CLB, 4 Lịch, 4 CSVC, Báo cáo
    ├── utils/
    │   ├── formatters.js      # Định dạng tiền tệ VN, ngày tháng, viết hoa chuẩn danh từ
    │   ├── sportBadges.js     # Nhận diện huy hiệu và màu sắc từng bộ môn thể thao
    │   └── toast.js           # Hệ thống thông báo Toast và chuyển đổi Dark/Light mode
    ├── services/
    │   ├── googleSync.js      # Ghi/Đọc 2 chiều với Google Sheets & Xuất file Excel
    │   ├── docExport.js       # Xuất văn bản Word (.doc) thể thức Nhà nước & Đảng
    │   └── telegramService.js # Quản lý Bot Telegram, Webhook, Lịch gửi báo cáo tự động
    └── components/
        ├── auth.js            # Màn hình đăng nhập & bảo mật cán bộ
        ├── header.js          # Tiêu đề cơ quan, nút đồng bộ, avatar cán bộ
        ├── sidebar.js         # Menu thanh bên & Navigation bar mobile
        ├── dashboard.js       # Bảng điều khiển, biểu đồ thống kê KPI
        ├── tournaments.js     # Quản lý 30 giải đấu (Bảng cố định 11 cột, ghim cột Thao tác, tìm kiếm realtime)
        ├── clubs.js           # Quản lý các Câu lạc bộ thể thao (Full CRUD)
        ├── schedules.js       # Quản lý Lịch sinh hoạt & tập luyện (Full CRUD)
        ├── facilities.js      # Quản lý Cơ sở vật chất & sân bãi (Full CRUD)
        ├── budget.js          # Quản lý Kinh phí & quyết toán giải ngân (Full CRUD)
        ├── reports.js         # Tổng hợp báo cáo Tháng/Quý/Năm & Sổ lưu trữ công văn
        └── modals.js          # Hộp thoại popup Thêm/Sửa giải đấu, Cloud Sync
```

---

## 🚀 3. Các cải tiến và tính năng nổi bật

1. **Bảng Giải Đấu 11 Cột Cố Định & Ghim Cột Thao Tác (Sticky Right-0):**
   * Quy định kích thước cố định rõ ràng từng cột (STT: 52px, Mã: 72px, Tên giải: co giãn min 250px, Trạng thái BC: 125px, Bộ môn: 110px, Cấp độ: 100px, Ngày: 105px, VĐV: 75px, Huy chương: 125px, Kinh phí: 140px, Thao tác: 88px).
   * Cột **Thao tác** luôn được ghim cố định ở cạnh phải bảng (`sticky right-0 z-10`), không bao giờ bị che khuất trên màn hình nhỏ.
   * Tìm kiếm giải đấu **Realtime mượt mà**, gõ đến đâu hiển thị kết quả đến đó mà không bị mất dấu nháy chuột (focus).

2. **Dữ Liệu Chuẩn Xác - Loại Bỏ Triệt Để Dữ Liệu Rác/Test:**
   * Hệ thống duy trì chính xác **30 giải đấu thực tế** của cán bộ Trần Quốc Được.
   * Loại bỏ triệt để giải đấu test (Cờ Vây) ra khỏi hệ thống.

3. **Cơ Chế Đồng Bộ Đa Kênh Tức Thì (Google Sheet + Telegram):**
   * Nút bấm trực quan `[ ↻ Đồng bộ Telegram ]` và nút `[ Ghi lên Google Sheet ]` / `[ Nạp lại từ Sheet ]`.
   * Tự động quét dữ liệu nền định kỳ mỗi 10 giây và mỗi khi người dùng chuyển tab hoặc quay lại cửa sổ web (`focus` / `visibilitychange`). Thêm giải đấu qua Telegram Bot là hiển thị ngay trên web!

4. **Báo Cáo Chuẩn Thể Thức Nhà Nước (NĐ 30/2020/NĐ-CP) & Thể Thức Đảng:**
   * Mẫu Nhà nước: Chu kỳ ngày 10 tháng trước đến ngày 10 tháng này gửi Văn phòng Trung tâm DVTH.
   * Mẫu Chi bộ: Chu kỳ theo tháng dương lịch gửi Chi bộ Trung tâm DVTH.
   * Xuất file Word (`.doc`) chuẩn lề A4, font Times New Roman, đầy đủ bảng số liệu và ô ký tên cán bộ **Trần Quốc Được**.

---

## 📋 4. Hướng dẫn sử dụng & Triển khai

1. **Chạy trực tiếp trên trình duyệt hoặc GitHub Pages:**
   * Web đã triển khai tại: `https://kawai-kun.github.io/quanly-tdtt/`
2. **Cập nhật tính năng sau này:**
   * Muốn sửa bảng giải đấu: Chỉ cần mở file `js/components/tournaments.js`.
   * Muốn sửa biểu đồ hoặc chỉ tiêu KPI: Chỉ cần mở `js/components/dashboard.js`.
   * Muốn sửa mẫu báo cáo Word: Chỉ cần mở `js/services/docExport.js`.
   * Muốn chỉnh sửa màu sắc, giao diện: Mở `css/custom.css`.
