import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  try {
    const { 
      submissionId, 
      grade, 
      feedback 
    } = await req.json()

    if (!submissionId || grade === undefined || grade === null) {
      return NextResponse.json(
        { error: 'Submission ID and grade are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Update student assignment with grade and feedback
    const { data: updatedSubmission, error: updateError } = await supabase
      .from('student_assignments')
      .update({
        status: 'graded',
        grade: parseFloat(grade),
        feedback: feedback || null
      })
      .eq('id', submissionId)
      .select(`
        *,
        student:student_id (id, name, email),
        assignment:assignment_id (id, title, teacher_id)
      `)
      .single()

    if (updateError) {
      console.error('Error grading assignment:', updateError)
      return NextResponse.json(
        { error: 'Failed to grade assignment' },
        { status: 500 }
      )
    }

    // Create notification for student
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: updatedSubmission.student.id,
        type: 'info',
        title: '📊 Kết quả chấm bài',
        message: `Bài tập "${updatedSubmission.assignment.title}" đã được chấm điểm. Điểm số: ${grade}/10`,
        data: { 
          submission_id: submissionId,
          assignment_id: updatedSubmission.assignment.id,
          grade: parseFloat(grade),
          graded_at: new Date().toISOString()
        },
        is_read: false
      })

    if (notificationError) {
      console.error('Error creating notification for student:', notificationError)
      // Don't fail the grading if notification fails
    }

    return NextResponse.json({
      success: true,
      submission: updatedSubmission
    })

  } catch (error: any) {
    console.error('Error in grade assignment API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

