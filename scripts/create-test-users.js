// Script để tạo test users và student_assignments
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUsers() {
  try {
    // 1. Tạo test students
    const testStudents = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'student1@test.com',
        name: 'Học sinh Test 1',
        role: 'parent',
        grade: 'Lớp 3'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002', 
        email: 'student2@test.com',
        name: 'Học sinh Test 2',
        role: 'parent',
        grade: 'Lớp 3'
      }
    ]

    const { data: students, error: studentsError } = await supabase
      .from('users')
      .upsert(testStudents, { onConflict: 'id' })
      .select()

    if (studentsError) {
      throw studentsError
    }

    console.log('✅ Test students created:', students.length)

    // 2. Tạo student_assignments cho assignment đã có
    const assignmentId = '96a3e422-af11-40b5-a48c-e1a384f2bea2'
    
    const studentAssignments = [
      {
        assignment_id: assignmentId,
        student_id: '550e8400-e29b-41d4-a716-446655440001',
        status: 'assigned'
      },
      {
        assignment_id: assignmentId,
        student_id: '550e8400-e29b-41d4-a716-446655440002',
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        answers: {
          'question-0': '8',
          'question-1': '19'
        }
      }
    ]

    const { data: studentAssignmentsData, error: studentAssignmentsError } = await supabase
      .from('student_assignments')
      .upsert(studentAssignments, { onConflict: 'assignment_id,student_id' })
      .select()

    if (studentAssignmentsError) {
      throw studentAssignmentsError
    }

    console.log('✅ Student assignments created:', studentAssignmentsData.length)

    console.log('\n🎉 Test data created successfully!')
    console.log('Assignment ID:', assignmentId)
    console.log('Students:', testStudents.map(s => `${s.name} (${s.id})`))

  } catch (error) {
    console.error('❌ Error creating test users:', error.message)
  }
}

createTestUsers()
