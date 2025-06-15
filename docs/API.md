# StudyQuest Backend - API Documentation

## Tổng quan
Backend xây dựng bằng NestJS, PostgreSQL, Redis, JWT, phân quyền bảo mật chuẩn, kiểm thử tự động e2e.

## Hướng dẫn khởi động
1. Cài Node.js >= 18, PostgreSQL, Redis.
2. Tạo file `.env` từ `.env.example` và điền thông tin kết nối.
3. Khởi tạo database, chạy migration nếu cần.
4. Cài dependencies: `npm install`
5. Khởi động server: `npm run start:dev`
6. Chạy test e2e: `npm run test:e2e`

## Cấu trúc thư mục chính
- `src/modules/` - Các module chức năng (auth, quests, guilds, leaderboard, aichat...)
- `src/entities/` - Entity TypeORM mapping DB
- `test/` - Test e2e tự động
- `docs/` - Tài liệu dự án

## API chính
### Auth
- `POST /auth/register` - Đăng ký tài khoản
- `POST /auth/login` - Đăng nhập, trả về accessToken, refreshToken

### Quests
- `GET /quests` - Lấy danh sách quest (public)
- `POST /quests` - Tạo quest (cần JWT)
- `PATCH /quests/:id` - Sửa quest (chỉ creator)
- `DELETE /quests/:id` - Xóa quest (chỉ creator)

### Guilds
- `GET /guilds` - Lấy danh sách guild
- `POST /guilds` - Tạo guild (cần JWT)
- `PATCH /guilds/:id` - Sửa guild (chỉ owner)
- `DELETE /guilds/:id` - Xóa guild (chỉ owner)
- `GET /guilds/:guildId/members` - Lấy danh sách thành viên (chỉ member)
- `POST /guilds/:guildId/members` - Thêm thành viên (owner/admin)
- `PATCH /guilds/:guildId/members/:userId/role` - Đổi vai trò (owner)
- `DELETE /guilds/:guildId/members/:userId` - Xóa thành viên (owner/admin)

### Leaderboard
- `GET /leaderboard/global` - Xem bảng xếp hạng tổng
- `GET /leaderboard/personal` - Xem bảng cá nhân hóa (cần JWT)

### AI Chat (Gemini)
- `POST /aichat/chat` - Gửi prompt tới Gemini, trả về nội dung assistant
  - Headers: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`
  - Body: `{ "prompt": "Explain AI" }`
  - Response: `{ "role": "assistant", "content": "..." }`
  - Yêu cầu cấu hình biến môi trường `GEMINI_API_KEY`.
  - Có thể test thực bằng curl/Postman hoặc e2e.

### Notification
- Đang phát triển

## Phân quyền & bảo mật
- Tất cả route thay đổi dữ liệu đều cần JWT.
- Chỉ creator/owner/admin được phép thao tác nâng cao.
- Test e2e kiểm tra đầy đủ các rule bảo mật.

## Kiểm thử tự động
- Chạy toàn bộ test: `npm run test:e2e`
- Test từng module: `npm run test:e2e -- test/tenfile.e2e-spec.ts`

## Hướng dẫn sử dụng nhanh API AI Chat (Gemini)
1. Đăng nhập lấy accessToken:
   ```
   POST /auth/login
   { "email": "guildtestuser@example.com", "password": "test1234" }
   => { "accessToken": "..." }
   ```
2. Gửi prompt:
   ```
   POST /aichat/chat
   Headers: Authorization: Bearer <accessToken>
   Body: { "prompt": "Explain AI" }
   => { "role": "assistant", "content": "..." }
   ```
3. Test nhanh bằng curl:
   ```
   curl -X POST http://localhost:3000/aichat/chat \
     -H "Authorization: Bearer <accessToken>" \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Explain AI"}'
   ```

## Liên hệ & đóng góp
- Đọc thêm trong từng file docs/ hoặc liên hệ nhóm phát triển.
