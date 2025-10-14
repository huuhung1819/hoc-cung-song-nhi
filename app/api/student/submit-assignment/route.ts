import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  try {
    const { assignmentId, studentId, answers } = await req.json()
    
    if (!assignmentId || !studentId || !answers) {
      return NextResponse.json(
        { error: 'Assignment ID, Student ID, and answers are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Update student_assignment with submitted answers
    const { data, error } = await supabase
      .from('student_assignments')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        answers: answers
      })
      .eq('assignment_id', assignmentId)
      .eq('student_id', studentId)
      .select()
      .single()

    if (error) {
      console.error('Error submitting assignment:', error)
      return NextResponse.json(
        { error: 'Failed to submit assignment' },
        { status: 500 }
      )
    }

    // Get teacher ID from assignment
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('assignments')
      .select('teacher_id')
      .eq('id', assignmentId)
      .single()

    if (!assignmentError && assignmentData?.teacher_id) {
      // Create notification for teacher
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: assignmentData.teacher_id,
          type: 'info',
          title: '📝 Bài tập đã được nộp',
          message: `Học sinh đã nộp bài tập. Cần chấm điểm.`,
          data: { 
            assignment_id: assignmentId,
            student_id: studentId,
            submitted_at: new Date().toISOString()
          },
          is_read: false
        })

      if (notificationError) {
        console.error('Error creating notification for teacher:', notificationError)
        // Don't fail the submission if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      assignment: data
    })

  } catch (error: any) {
    console.error('Error in submit assignment API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
