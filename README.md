# HỆ THỐNG QUẢN LÝ THỂ DỤC THỂ THAO
### TRUNG TÂM DỊCH VỤ TỔNG HỢP - UBND PHƯỜNG TÂN KHAI (TP ĐỒNG NAI)

---

## 📌 1. Giới thiệu hệ thống
Hệ thống Quản lý & Điều hành Thể dục Thể thao Phường Tân Khai phiên bản **v4.1**:
* **Đơn vị chủ quản:** Trung tâm Dịch vụ tổng hợp - UBND Phường Tân Khai.
* **Logo chính thức:** Biểu trưng Tượng đài Chiến thắng Tàu Ô - Tân Khai (`logo.png`), tích hợp mã hóa chống vỡ ảnh trên mọi thiết bị.
* **Giao diện chuẩn Mobbin:** Bento Grid hiện đại, thanh điều hướng chân trang (Bottom Nav) trên điện thoại, hỗ trợ phím tắt tìm kiếm toàn hệ thống (`Ctrl + K`).
* **Đồng bộ Google Drive:** Tự động lưu trữ và sao lưu 2 chiều vào Google Sheet (`1UFPIHG-TzG5h0imx6o5-Irf3klK1fhQ226sTe34HPx8`).

---

## 🚀 2. Các tính năng nâng cấp nổi bật

1. **Bảo mật màn hình Đăng nhập:**
   * Tuyệt đối không hiển thị lộ tài khoản và mật khẩu trên giao diện bên ngoài.
   * Ô mật khẩu có nút ẩn/hiện mắt (`visibility`), ô nhập sạch sẽ và hỗ trợ ghi nhớ đăng nhập.
   * *Tài khoản nội bộ:* `admin` | *Mật khẩu:* ``.

2. **Tự động chuẩn hóa khuôn mẫu (Data Normalization):**
   * Tự động viết hoa chữ cái đầu và danh từ riêng (Tân Khai, TDTT, UBND, VĐV, HCV...).
   * Tự động nhận diện và gán bộ môn thể thao (Bóng đá, Cầu lông, Pickleball, Võ thuật...).
   * Tự động chuẩn hóa mã giải (`T-01`, `T-02`...), định dạng ngày tháng `DD/MM/YYYY`.
   * Tự động tính toán tổng số huy chương và tổng kinh phí giải ngân trong thời gian thực.

3. **Kiến trúc dữ liệu Đa năm (Multi-Year Support):**
   * Bộ lọc năm toàn hệ thống (`Tất cả năm`, `2026`, `2025`, `2027`...): Tự động mở rộng theo thời gian.
   * Chỉ số KPI, biểu đồ phân bố giải đấu và biểu đồ huy chương tự động thích ứng chính xác theo năm được chọn.

4. **Sổ Quản Lý Báo Cáo Đã Xuất (Reports Registry):**
   * Đơn vị phát hành chuẩn: **TRUNG TÂM DỊCH VỤ TỔNG HỢP**.
   * Số báo cáo được sinh tự động căn cứ vào lịch sử xuất thực tế (`Số: 01/BC-TTDVTH`, `02/BC-TTDVTH`...).
   * Quản lý Sổ lưu trữ: Xem lại bản in, chỉnh sửa số/tiêu đề hoặc xóa báo cáo sai sót.
   * Thể thức chữ ký: **Chỉ có 1 chữ ký của Người lập báo cáo (Cán bộ Trung tâm)**, không để phần chữ ký lãnh đạo theo đúng yêu cầu.

---

## 📋 3. Hướng dẫn triển khai GitHub Pages (2 phút)

1. Tải toàn bộ thư mục (gồm `index.html`, `logo.png`, `Code.gs`, `README.md`) lên kho lưu trữ (Repository) trên GitHub.
2. Vào **Settings** của repository trên GitHub ➔ Chọn mục **Pages** (cột trái).
3. Tại **Build and deployment** ➔ **Branch**: Chọn `main` ➔ Bấm **Save**.
4. Sau 1 phút, trang web sẽ hoạt động trực tiếp tại link: `https://<ten-tai-khoan>.github.io/<ten-repo>/`.

---

## 🔄 4. Kích hoạt đồng bộ Google Sheet
* Mở Google Apps Script liên kết với Spreadsheet `1UFPIHG-TzG5h0imx6o5-Irf3klK1fhQ226sTe34HPx8`.
* Dán nội dung file `Code.gs` ➔ Triển khai Web App (Chọn quyền **Anyone / Bất kỳ ai**).
* Dán URL Web App vào nút **Google Drive Cloud** trên thanh trên cùng của trang web là dữ liệu sẽ tự động lưu vĩnh viễn về Drive!
