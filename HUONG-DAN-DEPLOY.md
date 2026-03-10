# Hướng dẫn Deploy — Văn Hóa Kinh Doanh Quiz

## Tổng thời gian: ~15 phút | Hoàn toàn miễn phí

---

## BƯỚC 1 — Tạo database Supabase (5 phút)

1. Truy cập https://supabase.com → bấm "Start your project"
2. Đăng ký bằng GitHub hoặc email
3. Bấm "New project" → đặt tên (vd: vhkd-game) → chọn mật khẩu → chọn region "Southeast Asia"
4. Chờ ~2 phút để project khởi tạo

5. Vào **SQL Editor** (menu bên trái) → bấm "New query"
6. Copy toàn bộ nội dung file `supabase-setup.sql` và dán vào → bấm "Run"
   ✅ Kết quả: "Success. No rows returned"

7. Vào **Settings > API** (menu bên trái):
   - Copy **Project URL** → dán vào VITE_SUPABASE_URL
   - Copy **anon / public key** → dán vào VITE_SUPABASE_ANON_KEY

---

## BƯỚC 2 — Deploy lên Vercel (5 phút)

### Cách A: Kéo thả (không cần GitHub)
1. Truy cập https://vercel.com → đăng ký miễn phí
2. Vào dashboard → bấm "Add New > Project"
3. Kéo thả **toàn bộ thư mục** `vhkd-game` vào trang upload
4. Vercel sẽ tự nhận dạng Vite + React

5. Trước khi deploy, bấm **"Environment Variables"** và thêm:
   - Name: `VITE_SUPABASE_URL`     | Value: (URL từ bước 1)
   - Name: `VITE_SUPABASE_ANON_KEY` | Value: (Key từ bước 1)

6. Bấm **Deploy** → chờ ~1 phút

7. Vercel tặng link dạng: `https://vhkd-game-abc123.vercel.app`
   👉 Bạn có thể đổi thành tên dễ nhớ hơn trong Settings > Domains

### Cách B: Qua GitHub (nếu muốn tự cập nhật sau này)
1. Tạo repo trên GitHub, upload thư mục này lên
2. Kết nối repo với Vercel → tự động deploy mỗi khi bạn push code

---

## BƯỚC 3 — Đổi tên miền (tùy chọn, 2 phút)

Trong Vercel project → **Settings > Domains**:
- Đổi subdomain miễn phí: `vhkd-bai2.vercel.app`
- Hoặc kết nối domain riêng nếu bạn có

---

## Chia sẻ cho sinh viên

Sau khi deploy xong, chỉ cần gửi link cho sinh viên qua:
- Zalo / Messenger
- Google Classroom
- Chiếu QR code trên màn hình lớp

Leaderboard tự động cập nhật — tất cả sinh viên cùng thấy bảng xếp hạng chung.

---

## Cấu trúc file

```
vhkd-game/
├── index.html              ← Entry point
├── package.json            ← Dependencies
├── vite.config.js          ← Build config
├── .env.example            ← Mẫu biến môi trường
├── supabase-setup.sql      ← SQL tạo database
└── src/
    ├── main.jsx            ← React entry
    ├── App.jsx             ← Toàn bộ game
    └── supabase.js         ← Kết nối database
```
