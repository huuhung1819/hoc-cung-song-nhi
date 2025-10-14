import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  try {
    const { 
      title, 
      subject, 
      grade, 
      topic, 
      deadline, 
      studentIds, 
      questionsForStudents, 
      questionsWithAnswers 
    } = await req.json()

    if (!title || !subject || !grade || !studentIds || !questionsForStudents || !questionsWithAnswers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // 1. Tạo assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .insert({
        teacher_id: req.headers.get('x-user-id') || '', // Will be set by middleware
        title,
        subject,
        grade,
        topic,
        deadline: deadline || null,
        questions: questionsForStudents, // Câu hỏi cho học sinh (không có đáp án)
        answers: questionsWithAnswers    // Câu hỏi + đáp án cho giáo viên
      })
      .select()
      .single()

    if (assignmentError) {
      console.error('Error creating assignment:', assignmentError)
      return NextResponse.json(
        { error: 'Failed to create assignment' },
        { status: 500 }
      )
    }

    // 2. Tạo student_assignments cho từng học sinh
    const studentAssignments = studentIds.map((studentId: string) => ({
      assignment_id: assignment.id,
      student_id: studentId,
      status: 'assigned'
    }))

    const { error: studentAssignmentsError } = await supabase
      .from('student_assignments')
      .insert(studentAssignments)

    if (studentAssignmentsError) {
      console.error('Error creating student assignments:', studentAssignmentsError)
      return NextResponse.json(
        { error: 'Failed to assign to students' },
        { status: 500 }
      )
    }

    // 3. Tạo notifications cho học sinh
    const notifications = studentIds.map((studentId: string) => ({
      user_id: studentId,
      type: 'info', // Sử dụng 'info' thay vì 'assignment' để tránh constraint error
      title: `📚 Bài tập mới: ${title}`,
      message: `Giáo viên đã giao bài tập ${subject} - ${topic}. Hạn nộp: ${deadline ? new Date(deadline).toLocaleDateString('vi-VN') : 'Không giới hạn'}`,
      data: { assignment_id: assignment.id },
      is_read: false
    }))

    const { error: notificationsError } = await supabase
      .from('notifications')
      .insert(notifications)

    if (notificationsError) {
      console.error('Error creating notifications:', notificationsError)
      // Không return error vì assignment đã tạo thành công
    }

    return NextResponse.json({
      success: true,
      assignment,
      assignedCount: studentIds.length
    })

  } catch (error: any) {
    console.error('Error in create assignment API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
