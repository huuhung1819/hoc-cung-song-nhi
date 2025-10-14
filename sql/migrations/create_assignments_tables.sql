-- Migration: Create assignments and student_assignments tables
-- This migration adds support for teacher assignments to students

-- Bảng assignments: Lưu bài tập giáo viên giao
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  grade VARCHAR(50) NOT NULL,
  topic VARCHAR(255),
  deadline TIMESTAMP WITH TIME ZONE,
  questions JSONB NOT NULL, -- Câu hỏi cho học sinh (không có đáp án)
  answers JSONB, -- Đáp án cho giáo viên
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng student_assignments: Học sinh nào nhận bài tập nào
CREATE TABLE IF NOT EXISTS student_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id),
  student_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'assigned', -- assigned, submitted, graded
  submitted_at TIMESTAMP WITH TIME ZONE,
  answers JSONB, -- Câu trả lời của học sinh
  grade DECIMAL(3,1),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- Thêm cột mới vào bảng notifications hiện có
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success', 'assignment', 'grade', 'message')),
ADD COLUMN IF NOT EXISTS data JSONB; -- Extra data (assignment_id, etc.)

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_deadline ON assignments(deadline);
CREATE INDEX IF NOT EXISTS idx_assignments_created_at ON assignments(created_at);

CREATE INDEX IF NOT EXISTS idx_student_assignments_assignment_id ON student_assignments(assignment_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_student_id ON student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_status ON student_assignments(status);

-- Enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignments
CREATE POLICY "Teachers can view their assignments" ON assignments
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create assignments" ON assignments
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their assignments" ON assignments
  FOR UPDATE USING (auth.uid() = teacher_id);

-- RLS Policies for student_assignments
CREATE POLICY "Students can view their assignments" ON student_assignments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view assignments for their students" ON student_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments 
      WHERE assignments.id = student_assignments.assignment_id 
      AND assignments.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create student assignments" ON student_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM assignments 
      WHERE assignments.id = student_assignments.assignment_id 
      AND assignments.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can update their assignment submissions" ON student_assignments
  FOR UPDATE USING (auth.uid() = student_id);

-- Add trigger for updated_at
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE assignments IS 'Bảng lưu bài tập giáo viên giao cho học sinh';
COMMENT ON TABLE student_assignments IS 'Bảng liên kết học sinh với bài tập và lưu kết quả làm bài';
