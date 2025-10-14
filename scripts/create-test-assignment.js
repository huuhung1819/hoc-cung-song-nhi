// Script để tạo test assignment
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Supabase config (sử dụng service role để bypass RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
console.log('Supabase Key:', supabaseKey ? 'Set' : 'Not set')

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestAssignment() {
  try {
    // 1. Tạo assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .insert({
        teacher_id: '550e8400-e29b-41d4-a716-446655440000', // Test teacher ID
        title: 'Bài tập Toán - Phép cộng cơ bản',
        subject: 'Toán học',
        grade: 'Lớp 3',
        topic: 'Phép cộng trong phạm vi 20',
        deadline: '2025-01-20T23:59:59Z',
        questions: [
          {
            question: 'Tính: 5 + 3 = ?',
            type: 'multiple_choice',
            options: ['7', '8', '9', '10'],
            correctAnswer: '8',
            explanation: '5 + 3 = 8'
          },
          {
            question: 'Tính: 12 + 7 = ?',
            type: 'multiple_choice', 
            options: ['18', '19', '20', '21'],
            correctAnswer: '19',
            explanation: '12 + 7 = 19'
          }
        ],
        answers: [
          {
            question: 'Tính: 5 + 3 = ?',
            type: 'multiple_choice',
            options: ['7', '8', '9', '10'],
            correctAnswer: '8',
            explanation: '5 + 3 = 8'
          },
          {
            question: 'Tính: 12 + 7 = ?',
            type: 'multiple_choice',
            options: ['18', '19', '20', '21'],
            correctAnswer: '19',
            explanation: '12 + 7 = 19'
          }
        ]
      })
      .select()
      .single()

    if (assignmentError) {
      throw assignmentError
    }

    console.log('✅ Assignment created:', assignment.id)

    // 2. Tạo student_assignments
    const studentIds = [
      '550e8400-e29b-41d4-a716-446655440001', // Test student 1
      '550e8400-e29b-41d4-a716-446655440002'  // Test student 2
    ]

    const studentAssignments = studentIds.map(studentId => ({
      assignment_id: assignment.id,
      student_id: studentId,
      status: 'assigned'
    }))

    const { data: studentAssignmentsData, error: studentAssignmentsError } = await supabase
      .from('student_assignments')
      .insert(studentAssignments)
      .select()

    if (studentAssignmentsError) {
      throw studentAssignmentsError
    }

    console.log('✅ Student assignments created:', studentAssignmentsData.length)

    // 3. Tạo notifications
    const notifications = studentIds.map(studentId => ({
      user_id: studentId,
      type: 'info',
      title: `📚 Bài tập mới: ${assignment.title}`,
      message: `Giáo viên đã giao bài tập ${assignment.subject} - ${assignment.topic}. Hạn nộp: ${new Date(assignment.deadline).toLocaleDateString('vi-VN')}`,
      data: { assignment_id: assignment.id },
      is_read: false
    }))

    const { error: notificationsError } = await supabase
      .from('notifications')
      .insert(notifications)

    if (notificationsError) {
      console.warn('⚠️ Failed to create notifications:', notificationsError.message)
    } else {
      console.log('✅ Notifications created:', notifications.length)
    }

    console.log('\n🎉 Test assignment created successfully!')
    console.log('Assignment ID:', assignment.id)
    console.log('Teacher ID:', assignment.teacher_id)
    console.log('Students assigned:', studentIds.length)

  } catch (error) {
    console.error('❌ Error creating test assignment:', error.message)
  }
}

createTestAssignment()
