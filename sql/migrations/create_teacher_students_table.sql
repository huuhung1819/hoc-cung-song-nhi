-- Create teacher_students table for managing teacher-student relationships
CREATE TABLE IF NOT EXISTS teacher_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id), -- Admin who assigned (optional)
  notes TEXT,
  
  -- Prevent duplicate relationships
  UNIQUE(teacher_id, student_id),
  
  -- Indexes for faster queries
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_teacher_students_teacher_id ON teacher_students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_students_student_id ON teacher_students(student_id);

-- Add RLS policies
ALTER TABLE teacher_students ENABLE ROW LEVEL SECURITY;

-- Teachers can view their own students
CREATE POLICY "Teachers can view their students"
  ON teacher_students FOR SELECT
  USING (
    teacher_id = auth.uid() 
    OR 
    student_id = auth.uid()
  );

-- Only admins can insert/update/delete
CREATE POLICY "Only admins can manage relationships"
  ON teacher_students FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

COMMENT ON TABLE teacher_students IS 'Manages relationships between teachers and students';


