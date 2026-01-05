# 🚀 NestChat - Realtime Messaging Backend

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

> **Mô tả:** Hệ thống Backend Chat Realtime hiệu năng cao, xây dựng trên kiến trúc Module của NestJS, tối ưu hóa lưu trữ với MongoDB và xử lý thời gian thực bằng Socket.IO.

---

## 📖 Mục lục (Table of Contents)

- [Giới thiệu](#-giới-thiệu-introduction)
- [Tính năng chính](#-tính-năng-chính-key-features)
- [Kiến trúc & Công nghệ](#-kiến-trúc--công-nghệ-tech-stack)
- [Mô hình dữ liệu (ERD)](#-mô-hình-dữ-liệu-erd)
- [Cài đặt & Chạy dự án](#-cài-đặt--chạy-dự-án-installation)
- [API Documentation](#-api-documentation)
- [Bài học & Thách thức](#-bài-học--thách-thức-challenges)
- [Liên hệ](#-tác-giả-author)

---

## 📖 Giới thiệu (Introduction)

**NestChat** là dự án Backend được xây dựng nhằm mục đích nghiên cứu chuyên sâu về kiến trúc hệ thống nhắn tin thời gian thực (Realtime Messaging System). 

Dự án không chỉ dừng lại ở việc gửi tin nhắn, mà tập trung giải quyết các bài toán về:
1. **Scalability:** Kiến trúc dễ dàng mở rộng, clean code theo chuẩn NestJS.
2. **Realtime Reliability:** Đảm bảo tin nhắn đến đúng người, đúng thời điểm, quản lý trạng thái Online/Offline chính xác.
3. **Data Integrity:** Thiết kế Schema MongoDB tối ưu cho dữ liệu lớn (Big Data) trong tương lai.

---

## 🌟 Tính năng chính (Key Features)

### 🔐 Authentication & Security
* Đăng ký / Đăng nhập (Sử dụng JWT Access Token & Refresh Token).
* Mã hóa mật khẩu an toàn (Argon2/Bcrypt).
* **Guards:** Bảo vệ route, phân quyền, xác thực Socket Connection.

### 💬 Realtime Messaging (Core)
* **Chat 1-1:** Gửi nhận tin nhắn tức thì.
* **Group Chat:** Tạo nhóm, thêm/xóa thành viên, rời nhóm.
* **Message Status:** Tracking trạng thái Sent, Delivered, Seen.
* **Typing Indicator:** Hiển thị "User is typing..." theo thời gian thực.
* **Online Status:** Giám sát trạng thái Online/Offline của bạn bè.

### 🗄️ Data Management
* **Message History:** Lưu trữ và truy xuất lịch sử chat.
* **Pagination:** Sử dụng **Cursor-based Pagination** (thay vì Offset) để tối ưu hiệu năng khi load tin nhắn cũ (Infinite Scroll).
* **Soft Delete:** Hỗ trợ xóa tin nhắn (thu hồi) mà không mất dữ liệu gốc.

### 🤝 Social Connection
* Gửi lời mời kết bạn (Friend Request).
* Chấp nhận / Từ chối / Hủy lời mời.
* Quản lý danh sách bạn bè.
* Block/Unblock người dùng.

### 📁 Media Handling
* Upload Avatar, gửi ảnh trong tin nhắn.
* Tích hợp lưu trữ đám mây (Cloudinary / AWS S3).

---

## 🛠 Kiến trúc & Công nghệ (Tech Stack)

| Thành phần | Công nghệ | Lý do lựa chọn |
| :--- | :--- | :--- |
| **Core Framework** | **NestJS** | Cấu trúc Module chặt chẽ, Dependency Injection mạnh mẽ, dễ bảo trì. |
| **Language** | **TypeScript** | Type-safety, code rõ ràng, giảm thiểu lỗi runtime. |
| **Database** | **MongoDB** | NoSQL linh hoạt, phù hợp lưu trữ Document (Message), Write throughput cao. |
| **ORM** | **Mongoose** | Quản lý Schema, Validation, Middleware tiện lợi. |
| **Realtime Engine** | **Socket.IO** | Thư viện WebSocket chuẩn, hỗ trợ Room, Namespace và Auto-reconnection. |
| **API Docs** | **Swagger** | Tự động sinh tài liệu API chuẩn OpenAPI. |

---

## 🗂 Mô hình dữ liệu (ERD)

Hệ thống sử dụng MongoDB với các Collection chính:

* **Users:** Lưu thông tin Profile, Password (hash), Refresh Token.
* **Conversations:** Lưu thông tin phòng chat (Type: private/group), Last Message (để hiển thị preview).
* **Messages:** Collection lớn nhất. Sử dụng Index Compound (`conversationId` + `createdAt`) để tối ưu query lịch sử.
* **FriendRequests:** Quản lý trạng thái kết bạn (`pending`, `accepted`, `rejected`).

*(Khuyến nghị: Chèn ảnh sơ đồ ERD tại đây để trực quan hơn)*

---

## 🚀 Cài đặt & Chạy dự án (Installation)

### Yêu cầu tiên quyết
* Node.js (v18 trở lên)
* MongoDB (Local hoặc Atlas)
* NPM hoặc Yarn

### Các bước thực hiện

1. **Clone Repository:**
   ```bash
   git clone [https://github.com/](https://github.com/)[YOUR_USERNAME]/nest-chat-backend.git
   cd nest-chat-backend
2. **Cài đặt dependencies:**
   ```bash
   npm install
3.**Cấu hình biến môi trường (.env):**
```bash
cp .env.example .env

Cập nhật thông tin trong file .env:
