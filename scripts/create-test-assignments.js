/**
 * Create test assignments for students
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
})

async function createTestAssignments() {
  console.log('🧪 Creating test assignments...\n')

  try {
    // 1. Get teacher and student users
    const { data: teacherData, error: teacherError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', 'teacher@test.com')
      .single()

    const { data: studentData, error: studentError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', 'parent@test.com')
      .single()

    if (teacherError || !teacherData) {
      console.error('❌ Teacher not found:', teacherError?.message)
      return
    }

    if (studentError || !studentData) {
      console.error('❌ Student not found:', studentError?.message)
      return
    }

    console.log(`✅ Found teacher: ${teacherData.name || teacherData.email}`)
    console.log(`✅ Found student: ${studentData.name || studentData.email}`)

    // 2. Create test assignments
    const assignments = [
      {
        title: 'Bài tập Toán - Phép cộng cơ bản',
        subject: 'Toán học',
        grade: 'Lớp 1',
        topic: 'Phép cộng từ 1-10',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        questions: [
          {
            type: 'multiple_choice',
            question: '2 + 3 = ?',
            options: ['4', '5', '6', '7'],
            correct_answer: '5'
          },
          {
            type: 'multiple_choice', 
            question: '1 + 4 = ?',
            options: ['3', '4', '5', '6'],
            correct_answer: '5'
          }
        ],
        teacher_id: teacherData.id
      },
      {
        title: 'Bài tập Tiếng Việt - Đọc hiểu',
        subject: 'Tiếng Việt',
        grade: 'Lớp 1', 
        topic: 'Đọc hiểu câu chuyện ngắn',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        questions: [
          {
            type: 'multiple_choice',
            question: 'Trong câu chuyện, nhân vật chính là ai?',
            options: ['Bé An', 'Bé Bình', 'Bé Cường', 'Bé Dũng'],
            correct_answer: 'Bé An'
          }
        ],
        teacher_id: teacherData.id
      },
      {
        title: 'Bài tập Toán - Phép trừ',
        subject: 'Toán học',
        grade: 'Lớp 1',
        topic: 'Phép trừ từ 1-10', 
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago (overdue)
        questions: [
          {
            type: 'multiple_choice',
            question: '5 - 2 = ?',
            options: ['2', '3', '4', '5'],
            correct_answer: '3'
          }
        ],
        teacher_id: teacherData.id
      }
    ]

    console.log('\n📝 Creating assignments...')
    
    for (const assignmentData of assignments) {
      // Create assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .insert(assignmentData)
        .select()
        .single()

      if (assignmentError) {
        console.error(`❌ Error creating assignment "${assignmentData.title}":`, assignmentError.message)
        continue
      }

      console.log(`✅ Created assignment: ${assignment.title}`)

      // Create student assignment
      const { error: studentAssignmentError } = await supabase
        .from('student_assignments')
        .insert({
          student_id: studentData.id,
          assignment_id: assignment.id,
          status: assignmentData.deadline < new Date().toISOString() ? 'assigned' : 'assigned' // Overdue will show as assigned
        })

      if (studentAssignmentError) {
        console.error(`❌ Error creating student assignment:`, studentAssignmentError.message)
        continue
      }

      console.log(`✅ Assigned to student: ${studentData.email}`)
    }

    // 3. Create one completed assignment
    const completedAssignmentData = {
      title: 'Bài tập Khoa học - Thực vật',
      subject: 'Khoa học',
      grade: 'Lớp 1',
      topic: 'Nhận biết các loại cây',
      deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      questions: [
        {
          type: 'multiple_choice',
          question: 'Cây nào có hoa màu đỏ?',
          options: ['Cây chuối', 'Cây hoa hồng', 'Cây tre', 'Cây dừa'],
          correct_answer: 'Cây hoa hồng'
        }
      ],
      teacher_id: teacherData.id
    }

    const { data: completedAssignment, error: completedError } = await supabase
      .from('assignments')
      .insert(completedAssignmentData)
      .select()
      .single()

    if (!completedError && completedAssignment) {
      // Create completed student assignment
      await supabase
        .from('student_assignments')
        .insert({
          student_id: studentData.id,
          assignment_id: completedAssignment.id,
          status: 'graded',
          submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          grade: 85,
          feedback: 'Làm bài tốt! Cần chú ý hơn về chi tiết.'
        })

      console.log(`✅ Created completed assignment: ${completedAssignment.title}`)
    }

    // 4. Create notifications for new assignments
    const { data: newAssignments } = await supabase
      .from('assignments')
      .select('id, title')
      .eq('teacher_id', teacherData.id)
      .order('created_at', { ascending: false })
      .limit(3)

    if (newAssignments && newAssignments.length > 0) {
      for (const assignment of newAssignments) {
        await supabase
          .from('notifications')
          .insert({
            user_id: studentData.id,
            title: '📚 Bài tập mới từ giáo viên',
            message: `Giáo viên đã giao bài tập: ${assignment.title}`,
            type: 'assignment',
            is_read: false,
            data: {
              assignment_id: assignment.id
            }
          })
      }
      console.log(`✅ Created ${newAssignments.length} notifications`)
    }

    console.log('\n🎉 Test assignments created successfully!')
    console.log('\n📱 To test:')
    console.log('1. Login as parent@test.com')
    console.log('2. Go to "Bài tập cô giao"')
    console.log('3. You should see:')
    console.log('   - 3 Bài tập chờ làm (2 normal + 1 overdue)')
    console.log('   - 1 Bài tập đã hoàn thành')
    console.log('   - 1 Bài tập quá hạn')

  } catch (error) {
    console.error('❌ Error creating test assignments:', error)
  }
}

createTestAssignments()
