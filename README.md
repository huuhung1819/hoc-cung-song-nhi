# 🧠 AI Learning Dashboard

Nền tảng học tập thông minh với AI, kết nối học sinh, giáo viên và phụ huynh.

## 🎯 Mục tiêu

Xây dựng hệ thống EdTech AI với 3 vai trò chính:

- 👑 **Admin** – Quản lý hệ thống, người dùng, token, bài học
- 🧑‍🏫 **Teacher** – Quản lý học sinh, theo dõi tiến độ, phân tích kết quả  
- 👨‍👩‍👧 **Parent** – Học cùng AI với UX đơn giản, thân thiện

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + TailwindCSS + shadcn/ui + Lucide React
- **Backend**: Next.js API Routes (Node.js)
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: OpenAI Responses API với Conversations feature
- **Deployment**: Vercel (Frontend) + Supabase (Database)

## ✨ Tính năng chính

### 🤖 AI Chat với Responses API
- Sử dụng OpenAI Responses API mới nhất
- Quản lý conversation state với Supabase
- Token management thông minh
- Chat history lưu trữ đầy đủ

### 📊 Dashboard đa vai trò
- **Parent Dashboard**: Trang chủ, Bài học, Tiến độ, Tài khoản, Hỗ trợ
- **Teacher Dashboard**: Quản lý học sinh, theo dõi tiến độ
- **Admin Dashboard**: Thống kê hệ thống, quản lý người dùng

### 🪙 Token Management
- Quota token hàng ngày theo gói
- Reset tự động mỗi ngày
- Tracking usage chi tiết
- Cảnh báo khi gần hết token

### 📚 Quản lý bài học
- Tạo và quản lý nội dung học
- Theo dõi tiến độ học tập
- Phân loại theo lớp và môn học
- Hệ thống đánh giá và điểm số

## 🚀 Cài đặt và Chạy

### 1. Clone repository

\`\`\`bash
git clone <repository-url>
cd ai-learning-platform
\`\`\`

### 2. Cài đặt dependencies

\`\`\`bash
npm install
# hoặc
pnpm install
\`\`\`

### 3. Cấu hình Environment Variables

\`\`\`bash
# Copy file example
cp env.example .env.local

# Chỉnh sửa .env.local với thông tin thực tế
\`\`\`

**Các biến môi trường cần thiết:**

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
\`\`\`

### 4. Setup Supabase Database

1. Tạo project mới trên [Supabase](https://supabase.com)
2. Vào SQL Editor trong dashboard
3. Copy và chạy nội dung file \`sql/schema.sql\`
4. Lấy URL và Anon Key từ Settings > API

### 5. Chạy ứng dụng

\`\`\`bash
npm run dev
# hoặc
pnpm dev
\`\`\`

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📁 Cấu trúc Project

\`\`\`
ai-learning-platform/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Parent dashboard
│   ├── teacher/           # Teacher dashboard  
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Sidebar.tsx       # Navigation sidebar
│   ├── Navbar.tsx        # Top navigation
│   ├── TokenProgress.tsx # Token usage display
│   ├── LessonCard.tsx    # Lesson display card
│   └── ChatInterface.tsx # AI chat interface
├── lib/                   # Utility libraries
│   ├── supabaseClient.ts # Supabase client
│   ├── supabaseServer.ts # Supabase server client
│   ├── openaiResponsesClient.ts # OpenAI Responses API
│   ├── conversationManager.ts   # Chat conversation logic
│   ├── tokenManager.ts   # Token management
│   ├── auth.ts          # Authentication helpers
│   └── utils.ts         # Common utilities
├── sql/                   # Database schema
│   └── schema.sql        # Complete database setup
└── public/               # Static assets
\`\`\`

## 🗄️ Database Schema

### Bảng chính:

- **users**: Thông tin người dùng (admin, teacher, parent)
- **lessons**: Nội dung bài học
- **students**: Thông tin học sinh
- **conversations**: Cuộc trò chuyện với AI
- **messages**: Lịch sử tin nhắn chat
- **token_logs**: Log sử dụng token
- **lesson_progress**: Tiến độ học tập
- **notifications**: Thông báo hệ thống

### Row Level Security (RLS):
- Bảo mật dữ liệu theo user
- Chỉ admin mới truy cập được tất cả
- Teacher chỉ xem được học sinh của mình
- Parent chỉ xem được con mình

## 🔧 API Endpoints

### Chat API
\`\`\`
POST /api/chat              # Gửi tin nhắn đến AI
GET  /api/chat?conversationId=xxx  # Lấy lịch sử chat
\`\`\`

### Users API
\`\`\`
GET    /api/users           # Lấy danh sách users
POST   /api/users           # Tạo user mới
PUT    /api/users           # Cập nhật user
DELETE /api/users?id=xxx    # Xóa user
\`\`\`

### Token API
\`\`\`
GET  /api/token?userId=xxx  # Lấy thông tin token
POST /api/token             # Thao tác token (reset, add, set_quota)
POST /api/token/reset       # Reset token hàng ngày
\`\`\`

### Lessons API
\`\`\`
GET    /api/lessons         # Lấy danh sách bài học
POST   /api/lessons         # Tạo bài học mới
PUT    /api/lessons         # Cập nhật bài học
DELETE /api/lessons?id=xxx  # Xóa bài học
\`\`\`

## 🤖 OpenAI Integration

### Responses API với Conversations
\`\`\`typescript
// Tạo conversation mới
const conversationId = await openaiResponsesClient.createConversation()

// Gửi tin nhắn
const response = await openaiResponsesClient.createResponse(
  conversationId,
  message,
  systemPrompt
)
\`\`\`

### Token Management
- Tracking usage real-time
- Quota management theo gói
- Auto-reset hàng ngày
- Cost calculation

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- TailwindCSS cho styling
- shadcn/ui components
- Dark mode support (sẵn sàng)

### User Experience
- Sidebar navigation
- Progress indicators
- Real-time chat interface
- Token usage visualization
- Notification system

## 🔒 Bảo mật

- Row Level Security (RLS) trong Supabase
- API authentication
- Input validation
- Rate limiting
- CORS protection
- Environment variables protection

## 📊 Monitoring & Analytics

- Token usage tracking
- User activity logs
- Performance metrics
- Error logging
- Database query optimization

## 🚀 Deployment

### Vercel (Recommended)
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
\`\`\`

### Environment Variables cho Production:
- Cấu hình trong Vercel Dashboard
- Supabase production keys
- OpenAI production API key

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to branch (\`git push origin feature/AmazingFeature\`)
5. Mở Pull Request

## 📝 License

Distributed under the MIT License. See \`LICENSE\` for more information.

## 📞 Support

- 📧 Email: support@ailearning.com
- 💬 Discord: [AI Learning Community](https://discord.gg/ailearning)
- 📖 Documentation: [docs.ailearning.com](https://docs.ailearning.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/ai-learning-platform/issues)

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) cho Responses API
- [Supabase](https://supabase.com) cho database và auth
- [Next.js](https://nextjs.org) cho framework
- [TailwindCSS](https://tailwindcss.com) cho styling
- [shadcn/ui](https://ui.shadcn.com) cho components

---

**Made with ❤️ by AI Learning Team**
