-- AI Learning Dashboard Database Schema
-- Supabase SQL Schema for AI Learning Platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'teacher', 'parent')),
  plan VARCHAR(50) DEFAULT 'basic' CHECK (plan IN ('basic', 'premium', 'pro', 'enterprise')),
  grade VARCHAR(10) DEFAULT 'Lớp 1' CHECK (grade IN ('Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12')),
  token_quota INTEGER DEFAULT 500,
  token_used_today INTEGER DEFAULT 0,
  last_reset DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. LESSONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  grade VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  description TEXT,
  content_md TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. STUDENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  grade VARCHAR(50),
  date_of_birth DATE,
  avatar_url TEXT,
  progress JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. CONVERSATIONS TABLE (for OpenAI Responses API)
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  conversation_id TEXT UNIQUE NOT NULL, -- OpenAI conversation ID
  title VARCHAR(255) DEFAULT 'Cuộc trò chuyện mới',
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. MESSAGES TABLE (chat history)
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  response_id TEXT, -- OpenAI Response ID for conversation continuation
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. TOKEN LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS token_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  total_tokens INTEGER NOT NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  model VARCHAR(100) DEFAULT 'gpt-4o-mini',
  cost DECIMAL(10,6) DEFAULT 0.00,
  mode VARCHAR(20) DEFAULT 'coach',
  has_image BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. LESSON PROGRESS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed BOOLEAN DEFAULT false,
  score INTEGER CHECK (score >= 0 AND score <= 10),
  time_spent_minutes INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

-- =============================================
-- 8. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 9. SYSTEM SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 10. AGENTS TABLE (for OpenAI Agent Builder)
-- =============================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('parent', 'teacher', 'admin')),
  workflow_config JSONB NOT NULL,
  tools JSONB DEFAULT '[]',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 11. AGENT CONVERSATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  workflow_state JSONB DEFAULT '{}',
  tools_used JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Lessons indexes
CREATE INDEX IF NOT EXISTS idx_lessons_grade ON lessons(grade);
CREATE INDEX IF NOT EXISTS idx_lessons_subject ON lessons(subject);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON lessons(created_at);

-- Students indexes
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON students(teacher_id);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_conversation_id ON conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Token logs indexes
CREATE INDEX IF NOT EXISTS idx_token_logs_user_id ON token_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_token_logs_timestamp ON token_logs(timestamp);

-- Lesson progress indexes
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student_id ON lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed ON lesson_progress(completed);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Agents indexes
CREATE INDEX IF NOT EXISTS idx_agents_agent_id ON agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);

-- Agent conversations indexes
CREATE INDEX IF NOT EXISTS idx_agent_conversations_conversation_id ON agent_conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_agent_id ON agent_conversations(agent_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages from their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- Students policies
CREATE POLICY "Parents can view their students" ON students
  FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Teachers can view their students" ON students
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Parents can create students" ON students
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their students" ON students
  FOR UPDATE USING (auth.uid() = parent_id);

-- Token logs policies
CREATE POLICY "Users can view their own token logs" ON token_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Lesson progress policies
CREATE POLICY "Users can view progress of their students" ON lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE students.id = lesson_progress.student_id 
      AND (students.parent_id = auth.uid() OR students.teacher_id = auth.uid())
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to reset daily tokens
CREATE OR REPLACE FUNCTION reset_daily_tokens()
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET token_used_today = 0, 
      last_reset = CURRENT_DATE 
  WHERE last_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sample system settings
INSERT INTO system_settings (key, value, description) VALUES
('openai_model', '"gpt-4o-mini"', 'Default OpenAI model to use'),
('token_reset_time', '"00:00:00"', 'Time to reset daily tokens (HH:MM:SS)'),
('max_tokens_per_request', '2000', 'Maximum tokens per API request'),
('daily_token_quota_basic', '500', 'Daily token quota for basic plan'),
('daily_token_quota_premium', '1000', 'Daily token quota for premium plan'),
('daily_token_quota_pro', '2000', 'Daily token quota for pro plan'),
('daily_token_quota_enterprise', '5000', 'Daily token quota for enterprise plan')
ON CONFLICT (key) DO NOTHING;

-- Insert sample agents
INSERT INTO agents (agent_id, name, role, workflow_config, tools, description) VALUES
('parent-learning-agent', 'AI Learning Assistant cho Phụ huynh', 'parent', 
 '{"workflow": "parent_learning", "steps": ["analyze_request", "get_student_progress", "provide_guidance", "create_learning_plan"]}',
 '["token_manager", "database_access", "student_progress", "lesson_content", "learning_plan"]',
 'AI Assistant chuyên giúp phụ huynh theo dõi và hỗ trợ việc học của con em'),

('teacher-assistant-agent', 'AI Teaching Assistant', 'teacher',
 '{"workflow": "teacher_assistant", "steps": ["analyze_request", "access_student_data", "create_content", "provide_feedback"]}',
 '["token_manager", "database_access", "student_management", "lesson_creation", "progress_analysis", "assignment_review"]',
 'AI Assistant hỗ trợ giáo viên trong việc giảng dạy và quản lý học sinh'),

('admin-analytics-agent', 'AI Analytics Assistant', 'admin',
 '{"workflow": "admin_analytics", "steps": ["analyze_request", "gather_data", "generate_insights", "create_reports"]}',
 '["token_manager", "database_access", "user_analytics", "system_monitoring", "token_analytics", "performance_metrics"]',
 'AI Assistant hỗ trợ quản trị viên phân tích dữ liệu và quản lý hệ thống')
ON CONFLICT (agent_id) DO NOTHING;

-- Insert sample lessons
INSERT INTO lessons (title, grade, subject, description, content_md) VALUES
('Toán lớp 1: Cộng trừ cơ bản', 'Lớp 1', 'Toán học', 'Học cách cộng trừ các số từ 1-20', 
'# Toán lớp 1: Cộng trừ cơ bản\n\n## Mục tiêu học tập\n- Biết cách cộng hai số từ 1-20\n- Biết cách trừ hai số từ 1-20\n- Làm được các bài tập cơ bản\n\n## Nội dung bài học\n\n### 1. Phép cộng\nPhép cộng là phép tính cộng hai số lại với nhau.\n\nVí dụ: 3 + 2 = 5\n\n### 2. Phép trừ\nPhép trừ là phép tính lấy một số trừ đi số khác.\n\nVí dụ: 5 - 2 = 3\n\n## Bài tập\n1. Tính: 4 + 3 = ?\n2. Tính: 7 - 2 = ?\n3. Tính: 6 + 4 = ?'),

('Tiếng Việt: Đọc và viết chữ cái', 'Lớp 1', 'Tiếng Việt', 'Làm quen với bảng chữ cái tiếng Việt',
'# Tiếng Việt: Đọc và viết chữ cái\n\n## Mục tiêu học tập\n- Nhận biết các chữ cái trong bảng chữ cái\n- Đọc được các chữ cái\n- Viết được các chữ cái\n\n## Bảng chữ cái tiếng Việt\n\nA Ă Â B C D Đ E Ê G H I K L M N O Ô Ơ P Q R S T U Ư V X Y\n\na ă â b c d đ e ê g h i k l m n o ô ơ p q r s t u ư v x y\n\n## Cách đọc\n- A: a\n- Ă: ă\n- Â: â\n- B: bê\n- C: xê\n\n## Bài tập\n1. Đọc các chữ cái: A, B, C, D, E\n2. Viết các chữ cái: a, b, c, d, e'),

('Khoa học: Thực vật xung quanh', 'Lớp 1', 'Khoa học', 'Tìm hiểu về các loại cây và hoa',
'# Khoa học: Thực vật xung quanh\n\n## Mục tiêu học tập\n- Nhận biết các loại cây xung quanh\n- Hiểu về tầm quan trọng của cây xanh\n- Biết cách chăm sóc cây\n\n## Các loại cây xung quanh\n\n### 1. Cây ăn quả\n- Cây xoài\n- Cây cam\n- Cây chuối\n\n### 2. Cây hoa\n- Hoa hồng\n- Hoa cúc\n- Hoa mai\n\n### 3. Cây bóng mát\n- Cây phượng\n- Cây bàng\n- Cây đa\n\n## Tầm quan trọng của cây xanh\n- Cung cấp oxy cho chúng ta thở\n- Làm mát không khí\n- Tạo bóng mát\n- Làm đẹp môi trường\n\n## Cách chăm sóc cây\n- Tưới nước đều đặn\n- Bón phân\n- Cắt tỉa cành\n- Bảo vệ khỏi sâu bệnh')
ON CONFLICT DO NOTHING;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE users IS 'Bảng lưu thông tin người dùng (admin, teacher, parent)';
COMMENT ON TABLE lessons IS 'Bảng lưu thông tin bài học';
COMMENT ON TABLE students IS 'Bảng lưu thông tin học sinh';
COMMENT ON TABLE conversations IS 'Bảng lưu thông tin cuộc trò chuyện với AI';
COMMENT ON TABLE messages IS 'Bảng lưu lịch sử tin nhắn chat';
COMMENT ON TABLE token_logs IS 'Bảng log sử dụng token OpenAI';
COMMENT ON TABLE lesson_progress IS 'Bảng theo dõi tiến độ học tập';
COMMENT ON TABLE notifications IS 'Bảng thông báo cho người dùng';
COMMENT ON TABLE system_settings IS 'Bảng cài đặt hệ thống';

-- =============================================
-- GRANTS (if needed)
-- =============================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
