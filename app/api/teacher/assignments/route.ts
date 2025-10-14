import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'

/**
 * API để lấy danh sách assignments của teacher
 * GET /api/teacher/assignments?teacherId={teacherId}
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const teacherId = searchParams.get('teacherId')

    console.log('Teacher assignments API called with teacherId:', teacherId)

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    console.log('Supabase client created')

    // Query assignments của teacher
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select(`
        id,
        title,
        subject,
        grade,
        topic,
        deadline,
        created_at
      `)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching teacher assignments:', error)
      return NextResponse.json(
        { error: `Failed to fetch assignments: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('Assignments fetched:', assignments?.length || 0)

    // Query student_assignments để tính stats
    const assignmentIds = assignments?.map(a => a.id) || []
    let studentAssignments: any[] = []
    
    if (assignmentIds.length > 0) {
      const { data: studentAssignmentsData, error: studentError } = await supabase
        .from('student_assignments')
        .select(`
          assignment_id,
          status,
          submitted_at,
          grade
        `)
        .in('assignment_id', assignmentIds)

      if (studentError) {
        console.error('Error fetching student assignments:', studentError)
      } else {
        studentAssignments = studentAssignmentsData || []
      }
    }

    // Process assignments với stats
    const formattedAssignments = assignments?.map(assignment => {
      const assignmentStudentAssignments = studentAssignments.filter(
        sa => sa.assignment_id === assignment.id
      )
      
      const assignedTo = assignmentStudentAssignments.length
      const completed = assignmentStudentAssignments.filter(
        sa => sa.status === 'submitted' || sa.status === 'graded'
      ).length
      
      // Check if overdue
      let status = 'active'
      if (assignment.deadline && new Date(assignment.deadline) < new Date()) {
        const hasUnsubmitted = assignmentStudentAssignments.some(
          sa => sa.status === 'assigned'
        )
        if (hasUnsubmitted) {
          status = 'overdue'
        } else {
          status = 'completed'
        }
      }

      return {
        id: assignment.id,
        title: assignment.title,
        subject: assignment.subject,
        gradeLevel: assignment.grade,
        topic: assignment.topic,
        deadline: assignment.deadline,
        assignedTo,
        completed,
        status,
        created_at: assignment.created_at
      }
    }) || []

    return NextResponse.json({
      success: true,
      assignments: formattedAssignments,
      total: formattedAssignments.length
    })

  } catch (error: any) {
    console.error('Error in teacher assignments API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
