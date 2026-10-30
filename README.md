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
   * *Tài khoản nội bộ:* `admin` | *Mật khẩu:* `***`.

2. **Quản lý giải đấu thông minh & Ưu tiên giải mới nhất:**
   * Tự động sắp xếp: **Giải nào tổ chức mới nhất luôn hiển thị ở vị trí số 1 (#1)**, các giải cũ hơn lùi dần về sau để tiện theo dõi tiến độ công việc gần nhất.
   * Cột số thứ tự STT rõ ràng, huy hiệu `#1 Mới nhất` nổi bật trên giao diện thẻ và bảng.
   * Tự động viết hoa chữ cái đầu và danh từ riêng (Tân Khai, TDTT, UBND, VĐV, HCV...).
   * Tự động nhận diện và gán bộ môn thể thao (Bóng đá, Cầu lông, Pickleball, Võ thuật...).
   * Tự động chuẩn hóa mã giải (`T-01`, `T-02`...), định dạng ngày tháng `DD/MM/YYYY`.
   * Tự động tính toán tổng số huy chương và tổng kinh phí giải ngân trong thời gian thực.

3. **Kiến trúc dữ liệu Đa năm (Multi-Year Support):**
   * Bộ lọc năm toàn hệ thống (`Tất cả năm`, `2026`, `2025`, `2027`...): Tự động mở rộng theo thời gian.
   * Chỉ số KPI, biểu đồ phân bố giải đấu và biểu đồ huy chương tự động thích ứng chính xác theo năm được chọn.

4. **Bộ Tổng Hợp & Xây Dựng Báo Cáo Chuyên Nghiệp (Tháng / Quý / 6 Tháng / 9 Tháng / Cả Năm):**
   * **Hai thể thức chuẩn:**
     * **Mẫu Nhà nước:** Đơn vị lập là *Bộ phận Thể dục thể thao - Trung tâm Dịch vụ tổng hợp*, nơi nhận gửi đến *Văn phòng Trung tâm Dịch vụ Tổng hợp* (để tổng hợp vào báo cáo chung) hoặc *Phòng Văn hóa và Thông tin* (không gửi thẳng UBND phường).
     * **Mẫu Chi bộ:** Báo cáo kết quả thực hiện nhiệm vụ Đảng viên gửi *Chi bộ Trung tâm Dịch vụ Tổng hợp*.
   * **Lọc thời gian tự động:** Chọn Tháng (T1 - T12), Quý (I - IV), 6 tháng (đầu/cuối năm), 9 tháng, hoặc Cả năm. Hệ thống tự động trích xuất các giải đấu, số VĐV, huy chương và kinh phí trong kỳ.
   * **Định dạng xuất đa dạng:**
     * **Xuất file Word (`.doc`):** Chuẩn font Times New Roman 14pt, căn lề A4 (20-20-20-30mm), sẵn sàng mở và chỉnh sửa trên Microsoft Word.
     * **In văn bản / Lưu PDF:** Chuẩn khổ giấy A4, ẩn toàn bộ nút công cụ.
     * **Lưu vào Sổ lưu trữ:** Lưu trữ lịch sử báo cáo để quản lý số công văn phát hành.
   * **Người lập báo cáo chính thức:** **Trần Quốc Được** (Cán bộ phụ trách TDTT / Đảng viên).

5. **Tự Động Gửi Báo Cáo Định Kỳ Đến Telegram:**
   * Tích hợp Telegram Bot API gửi trực tiếp thông báo báo cáo về tài khoản cá nhân của anh Trần Quốc Được.
   * Thiết lập lịch gửi: Ngày 25 hàng tháng (chốt báo cáo), ngày cuối tháng, cuối quý, hoặc sáng thứ Hai hàng tuần.
   * Hỗ trợ nút gửi thử nghiệm ngay trên giao diện Web và tự động hóa ngầm 24/7 trên Google Apps Script.

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
