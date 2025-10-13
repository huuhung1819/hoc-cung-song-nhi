# 🗄️ DATABASE STATUS - SUPABASE CONNECTION & TABLES

**Ngày kiểm tra**: 2025-10-12  
**Status**: ✅ **CONNECTED & READY**

---

## ✅ KẾT NỐI SUPABASE

### **Connection Details:**
```
URL: https://hlcjknovgvodxharpqbo.supabase.co
Status: ✅ Connected
Client: @supabase/supabase-js v2.39.0
```

### **Environment Variables:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Configured
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Configured
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Configured (for admin operations)

---

## 📊 DATABASE TABLES

### **All Tables Created:** ✅ 9/9

| # | Table Name | Status | Rows | Purpose |
|---|------------|--------|------|---------|
| 1 | `users` | ✅ | 0 | Quản lý người dùng (admin, teacher, parent) |
| 2 | `lessons` | ✅ | 0 | Bài học và nội dung học tập |
| 3 | `students` | ✅ | 0 | Thông tin học sinh |
| 4 | `conversations` | ✅ | 0 | Cuộc trò chuyện AI với user |
| 5 | `messages` | ✅ | 0 | Tin nhắn trong conversation |
| 6 | `token_logs` | ✅ | 0 | Log sử dụng token (characters) |
| 7 | `lesson_progress` | ✅ | 0 | Tiến độ học tập của học sinh |
| 8 | `notifications` | ✅ | 0 | Thông báo cho users |
| 9 | `system_settings` | ✅ | 7 | Cài đặt hệ thống (đã có data mẫu) |

**Total Rows**: 7 (system_settings only)

---

## 🔍 CHI TIẾT CÁC BẢNG

### **1. users** (Người dùng)
```sql
Columns:
- id: UUID (PK)
- email: VARCHAR(255) UNIQUE
- name: VARCHAR(255)
- phone: VARCHAR(20)
- role: VARCHAR(50) (admin, teacher, parent)
- plan: VARCHAR(50) (basic, premium, pro, enterprise)
- token_quota: INTEGER (default: 500)
- token_used_today: INTEGER
- unlock_code: TEXT (migration added)
- is_active: BOOLEAN
- created_at, updated_at: TIMESTAMP

Foreign Keys: None
Indexes: email, role, created_at
```

**Status**: ✅ Empty - Users sẽ được tạo qua registration

---

### **2. lessons** (Bài học)
```sql
Columns:
- id: UUID (PK)
- title: VARCHAR(500)
- grade: VARCHAR(50)
- subject: VARCHAR(100)
- description: TEXT
- content_md: TEXT
- duration_minutes: INTEGER
- difficulty_level: VARCHAR(20)
- is_published: BOOLEAN
- created_by: UUID → users(id)
- created_at, updated_at: TIMESTAMP

Foreign Keys: created_by → users(id)
Indexes: grade, subject, is_published, created_by
```

**Status**: ✅ Empty - Sẵn sàng cho admin tạo bài học

---

### **3. students** (Học sinh)
```sql
Columns:
- id: UUID (PK)
- name: VARCHAR(255)
- parent_id: UUID → users(id)
- teacher_id: UUID → users(id)
- grade: VARCHAR(50)
- date_of_birth: DATE
- avatar_url: TEXT
- progress: JSONB
- created_at, updated_at: TIMESTAMP

Foreign Keys:
- parent_id → users(id) ON DELETE CASCADE
- teacher_id → users(id) ON DELETE SET NULL

Indexes: parent_id, teacher_id, grade
```

**Status**: ✅ Empty - Parent sẽ thêm học sinh qua UI

---

### **4. conversations** (Cuộc trò chuyện AI)
```sql
Columns:
- id: UUID (PK)
- user_id: UUID → users(id)
- conversation_id: TEXT UNIQUE (OpenAI conversation ID)
- title: VARCHAR(255)
- lesson_id: UUID → lessons(id)
- is_active: BOOLEAN
- created_at, updated_at: TIMESTAMP

Foreign Keys:
- user_id → users(id) ON DELETE CASCADE
- lesson_id → lessons(id) ON DELETE SET NULL

Indexes: user_id, conversation_id, is_active
```

**Status**: ✅ Empty - Sẽ được tạo khi user chat với AI

---

### **5. messages** (Tin nhắn)
```sql
Columns:
- id: UUID (PK)
- conversation_id: UUID → conversations(id)
- role: VARCHAR(20) (user, assistant, system)
- content: TEXT
- response_id: TEXT (OpenAI Response ID)
- tokens_used: INTEGER
- created_at: TIMESTAMP

Foreign Keys:
- conversation_id → conversations(id) ON DELETE CASCADE

Indexes: conversation_id, role, created_at
```

**Status**: ✅ Empty - Messages sẽ được tạo trong chat

---

### **6. token_logs** (Log sử dụng token)
```sql
Columns:
- id: UUID (PK)
- user_id: UUID → users(id)
- conversation_id: UUID → conversations(id)
- total_tokens: INTEGER
- prompt_tokens: INTEGER
- completion_tokens: INTEGER
- model: VARCHAR(100)
- cost: DECIMAL(10,6)
- mode: VARCHAR(20)
- has_image: BOOLEAN
- timestamp: TIMESTAMP

Foreign Keys:
- user_id → users(id) ON DELETE CASCADE
- conversation_id → conversations(id) ON DELETE SET NULL

Indexes: user_id, conversation_id, timestamp
```

**Status**: ✅ Empty - Logs sẽ được tạo khi sử dụng AI

---

### **7. lesson_progress** (Tiến độ học tập)
```sql
Columns:
- id: UUID (PK)
- student_id: UUID → students(id)
- lesson_id: UUID → lessons(id)
- progress_percentage: INTEGER (0-100)
- completed: BOOLEAN
- score: INTEGER (0-10)
- time_spent_minutes: INTEGER
- started_at, completed_at: TIMESTAMP
- created_at, updated_at: TIMESTAMP

Foreign Keys:
- student_id → students(id) ON DELETE CASCADE
- lesson_id → lessons(id) ON DELETE CASCADE

Unique: (student_id, lesson_id)
Indexes: student_id, lesson_id, completed
```

**Status**: ✅ Empty - Progress sẽ được track khi học sinh học

---

### **8. notifications** (Thông báo)
```sql
Columns:
- id: UUID (PK)
- user_id: UUID → users(id)
- title: VARCHAR(255)
- message: TEXT
- type: VARCHAR(50) (info, warning, error, success)
- is_read: BOOLEAN
- action_url: TEXT
- created_at: TIMESTAMP

Foreign Keys:
- user_id → users(id) ON DELETE CASCADE

Indexes: user_id, is_read, created_at
```

**Status**: ✅ Empty - Notifications sẽ được tạo khi có event

---

### **9. system_settings** (Cài đặt hệ thống)
```sql
Columns:
- id: UUID (PK)
- key: VARCHAR(255) UNIQUE
- value: JSONB
- description: TEXT
- created_at, updated_at: TIMESTAMP

Indexes: key
```

**Status**: ✅ **7 rows** - Đã có cài đặt mặc định:
```json
{
  "token_plans": {
    "basic": 500,
    "premium": 2000,
    "pro": 5000,
    "enterprise": -1
  },
  "ai_coach_enabled": true,
  "ai_solve_enabled": true,
  "default_mode": "coach",
  "max_daily_tokens": 10000,
  "token_reset_hour": 0,
  "maintenance_mode": false
}
```

---

## 🔗 FOREIGN KEY RELATIONSHIPS

```
users ─┬─ lessons (created_by)
       ├─ students (parent_id, teacher_id)
       ├─ conversations (user_id)
       ├─ token_logs (user_id)
       └─ notifications (user_id)

lessons ─┬─ conversations (lesson_id)
         └─ lesson_progress (lesson_id)

students ─── lesson_progress (student_id)

conversations ─┬─ messages (conversation_id)
               └─ token_logs (conversation_id)
```

---

## 🧪 TESTING & VERIFICATION

### **Test Script:**
```bash
pnpm test-db
# hoặc
node scripts/test-db.mjs
```

### **Test Results:**
```
✅ Connection: SUCCESS
✅ Tables Found: 9/9
✅ Sample Query: SUCCESS
✅ Foreign Keys: VALID
✅ Indexes: CREATED
```

---

## 📝 SAMPLE DATA NEEDED

### **Để bắt đầu sử dụng, cần:**

1. **Users** (0 rows)
   - Tạo qua registration: `/auth/register`
   - Hoặc insert manual qua SQL

2. **Lessons** (0 rows)
   - Admin cần tạo bài học qua Admin Panel
   - Hoặc import từ file SQL

3. **Students** (0 rows)
   - Parent thêm học sinh qua Parent Dashboard
   - Mỗi parent có thể thêm nhiều con

---

## 🔧 MIGRATIONS ĐÃ CHẠY

1. ✅ **001_add_phone_column.sql**
   - Thêm column `phone` vào `users` table
   
2. ✅ **002_add_unlock_code_to_users.sql**
   - Thêm column `unlock_code` vào `users` table
   - Dùng cho "solve mode" unlock feature

3. ✅ **002_add_has_image_column.sql**
   - Thêm column `has_image` vào `token_logs` table
   - Track việc sử dụng image trong chat

---

## 🚀 NEXT STEPS

### **Để bắt đầu sử dụng:**

1. **Đăng ký user đầu tiên:**
   ```
   http://localhost:3000/auth/register
   ```

2. **Tạo bài học mẫu:**
   ```
   - Login as admin
   - Go to Admin Panel
   - Create lessons
   ```

3. **Test chat AI:**
   ```
   - Login as parent
   - Go to Dashboard
   - Start chatting with AI
   ```

---

## 📊 DATABASE HEALTH

| Metric | Status | Value |
|--------|--------|-------|
| Connection | ✅ | Healthy |
| Tables | ✅ | 9/9 Created |
| Indexes | ✅ | All Created |
| Foreign Keys | ✅ | All Valid |
| Migrations | ✅ | 3/3 Applied |
| Sample Data | ⚠️ | system_settings only |

---

## 🔒 SECURITY & RLS

### **Row Level Security (RLS):**
- Status: ✅ Enabled trên tất cả tables
- Policies: Configured cho từng role
- Auth Integration: Connected với Supabase Auth

### **Access Control:**
```sql
admin: Full access to all tables
teacher: Access to students, lessons, progress
parent: Access to own students and progress
```

---

## 💡 TIPS

1. **Backup Regular**: Dùng Supabase Dashboard → Database → Backups
2. **Monitor Usage**: Check Dashboard → Database → Statistics
3. **Check Logs**: Dashboard → Logs Explorer
4. **Performance**: Monitor slow queries trong Dashboard

---

## 📚 DOCUMENTATION

- **Schema**: `sql/schema.sql`
- **Migrations**: `sql/migrations/`
- **Setup Guide**: `SUPABASE_SETUP.md`
- **Test Script**: `scripts/test-db.mjs`

---

**Database is READY for production use!** 🎉

**Last Updated**: 2025-10-12  
**Verified By**: Database Connection Test Script
