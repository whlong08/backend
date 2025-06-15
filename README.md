# StudyQuest Backend - API Specification (v1)

## Tổng quan
- Backend NestJS, PostgreSQL, Redis, JWT, WebSocket (socket.io)
- Tài liệu này dành cho FE team tích hợp toàn bộ API: Auth, Quests, Guilds, GuildMembers, Leaderboard, AI Chat, Notification, Chat realtime.

---

## 1. Xác thực & Headers
- Đăng ký/đăng nhập trả về accessToken, refreshToken.
- Các route cần bảo mật: thêm header `Authorization: Bearer <accessToken>`
- Content-Type: `application/json`

---

## 2. Auth
### Đăng ký
- `POST /auth/register`
  - Body: `{ "email": string, "username": string, "password": string }`
  - Response: `{ id, email, username }`

### Đăng nhập
- `POST /auth/login`
  - Body: `{ "email": string, "password": string }`
  - Response: `{ accessToken, refreshToken, user: { id, email, username } }`

---

## 3. Quests
### Lấy danh sách quest
- `GET /quests`
  - Public
  - Response: `Quest[]`

### Tạo quest
- `POST /quests` (JWT)
  - Body: `{ title, description, ... }`
  - Response: `Quest`

### Sửa quest
- `PATCH /quests/:id` (JWT, chỉ creator)
  - Body: `{ ...fields }`
  - Response: `Quest`

### Xóa quest
- `DELETE /quests/:id` (JWT, chỉ creator)
  - Response: `{ success: true }`

---

## 4. Guilds
### Lấy danh sách guild
- `GET /guilds`
  - Response: `Guild[]`

### Tạo guild
- `POST /guilds` (JWT)
  - Body: `{ name, ... }`
  - Response: `Guild`

### Sửa guild
- `PATCH /guilds/:id` (JWT, chỉ owner)
  - Body: `{ ...fields }`
  - Response: `Guild`

### Xóa guild
- `DELETE /guilds/:id` (JWT, chỉ owner)
  - Response: `{ success: true }`

### Lấy thành viên
- `GET /guilds/:guildId/members` (JWT, chỉ member)
  - Response: `GuildMember[]`

### Thêm thành viên
- `POST /guilds/:guildId/members` (JWT, owner/admin)
  - Body: `{ userId, role? }`
  - Response: `GuildMember`

### Đổi vai trò
- `PATCH /guilds/:guildId/members/:userId/role` (JWT, owner)
  - Body: `{ role }`
  - Response: `GuildMember`

### Xóa thành viên
- `DELETE /guilds/:guildId/members/:userId` (JWT, owner/admin)
  - Response: `{ success: true }`

---

## 5. Leaderboard
### Xem bảng xếp hạng tổng
- `GET /leaderboard/global`
  - Response: `UserRank[]`

### Xem bảng cá nhân hóa
- `GET /leaderboard/personal` (JWT)
  - Response: `{ username, points, ... }`

---

## 6. AI Chat (Gemini)
### Gửi prompt tới Gemini
- `POST /aichat/chat` (JWT)
  - Headers: `Authorization: Bearer <accessToken>`
  - Body: `{ "prompt": string }`
  - Response: `{ role: "assistant", content: string }`

---

## 7. Notification
### Lấy danh sách notification
- `GET /notifications` (JWT)
  - Response: `Notification[]`

### Tạo notification (nội bộ)
- `POST /notifications` (JWT)
  - Body: `{ type, title, message, data? }`
  - Response: `Notification`

### Đánh dấu đã đọc
- `PATCH /notifications/:id/read` (JWT)
  - Response: `Notification`

### Xóa notification
- `DELETE /notifications/:id` (JWT)
  - Response: `{ success: true }`

---

## 8. Chat Realtime (Guild/Friend)
### REST API
- `POST /chat/send` (JWT)
  - Body: `{ type: 'GUILD'|'FRIEND', guildId?, friendId?, senderId, content }`
  - Response: `ChatMessage`
- `GET /chat/guild?guildId=...&limit=...` (JWT)
  - Response: `ChatMessage[]`
- `GET /chat/friend?friendId=...&limit=...` (JWT)
  - Response: `ChatMessage[]`

### WebSocket (socket.io)
- Kết nối: `ws://<host>:<port>`
- Tham gia phòng: `joinGuild` (guildId), `joinFriend` (friendId)
- Gửi tin nhắn: `sendMessage` (payload như REST)
- Nhận tin nhắn mới: `newMessage` (payload: ChatMessage)

#### Định nghĩa ChatMessage
```json
{
  "id": string,
  "type": "GUILD"|"FRIEND",
  "guildId"?: string,
  "friendId"?: string,
  "senderId": string,
  "content": string,
  "createdAt": string
}
```

---

## 9. Quy tắc bảo mật & phân quyền
- Tất cả route thay đổi dữ liệu đều cần JWT.
- Chỉ creator/owner/admin được phép thao tác nâng cao.
- WebSocket: truyền token qua query/header khi connect.

---

## 10. Lưu ý tích hợp
- FE cần join đúng phòng (guild/friend) để nhận realtime.
- Có thể mở rộng: gửi file, emoji, trạng thái đọc...
- Đọc thêm ví dụ test e2e trong thư mục `/test/` để hiểu rõ request/response thực tế.

---

## 11. Liên hệ backend nếu cần custom logic hoặc hỗ trợ thêm.
