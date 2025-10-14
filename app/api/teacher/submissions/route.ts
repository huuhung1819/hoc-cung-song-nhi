import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const teacherId = searchParams.get('teacherId')
    const status = searchParams.get('status') // submitted, graded

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    let query = supabase
      .from('student_assignments')
      .select(`
        id,
        status,
        submitted_at,
        grade,
        feedback,
        answers,
        created_at,
        assignment:assignment_id (
          id,
          title,
          subject,
          grade,
          topic,
          deadline,
          questions,
          answers,
          created_at
        ),
        student:student_id (
          id,
          name,
          email,
          grade
        )
      `)
      .eq('assignment.teacher_id', teacherId)
      .order('submitted_at', { ascending: false, nullsLast: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: submissions, error } = await query

    if (error) {
      console.error('Error fetching submissions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      )
    }

    // Format response
    const formattedSubmissions = submissions?.map(item => ({
      id: item.id,
      assignmentId: item.assignment.id,
      assignmentTitle: item.assignment.title,
      subject: item.assignment.subject,
      grade: item.assignment.grade,
      topic: item.assignment.topic,
      deadline: item.assignment.deadline,
      questions: item.assignment.questions,
      correctAnswers: item.assignment.answers,
      studentId: item.student.id,
      studentName: item.student.name || item.student.email || 'Unknown',
      studentEmail: item.student.email,
      studentGrade: item.student.grade,
      status: item.status,
      submittedAt: item.submitted_at,
      grade: item.grade,
      feedback: item.feedback,
      studentAnswers: item.answers,
      assignedAt: item.created_at
    })) || []

    return NextResponse.json({
      success: true,
      submissions: formattedSubmissions
    })

  } catch (error: any) {
    console.error('Error in teacher submissions API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
