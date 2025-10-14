import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'
import { withAuth, requireParentOrStudent } from '@/lib/apiAuth'

/**
 * API để lấy danh sách bài tập của học sinh
 * GET /api/student/assignments?studentId={userId}
 */
export const GET = withAuth(async (req: NextRequest, auth) => {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')

    // Validate studentId
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Security check: Only allow access to own data or if user is admin/teacher
    if (auth.role === 'parent' && studentId !== auth.user.id) {
      return NextResponse.json(
        { error: 'Access denied: Can only view own assignments' },
        { status: 403 }
      )
    }

    const supabase = createServiceClient()

    // Query student_assignments với JOIN để lấy thông tin đầy đủ
    const { data: studentAssignments, error } = await supabase
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
          created_at,
          teacher:teacher_id (
            id,
            name,
            email
          )
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching student assignments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch assignments' },
        { status: 500 }
      )
    }

    // Format response theo interface của Dashboard UI
    const now = new Date()
    const formattedAssignments = studentAssignments?.map(item => {
      const assignment = item.assignment as any
      const teacher = assignment?.teacher as any
      const deadline = assignment?.deadline ? new Date(assignment.deadline) : null
      
      // Tính toán isOverdue: quá hạn nếu deadline < now và chưa nộp bài
      const isOverdue = deadline && deadline < now && item.status === 'assigned'

      return {
        id: item.id,
        assignmentId: assignment?.id || '',
        title: assignment?.title || 'Untitled',
        subject: assignment?.subject || '',
        gradeLevel: assignment?.grade || '',
        topic: assignment?.topic || '',
        deadline: assignment?.deadline || null,
        questions: assignment?.questions || [],
        teacherName: teacher?.name || teacher?.email || 'Unknown Teacher',
        status: item.status,
        submittedAt: item.submitted_at,
        score: item.grade,
        feedback: item.feedback,
        assignedAt: item.created_at,
        isOverdue: !!isOverdue
      }
    }) || []

    // Sắp xếp: Quá hạn lên đầu, sau đó theo deadline gần nhất
    const sortedAssignments = formattedAssignments.sort((a, b) => {
      // Quá hạn lên đầu
      if (a.isOverdue && !b.isOverdue) return -1
      if (!a.isOverdue && b.isOverdue) return 1
      
      // Chưa làm ưu tiên hơn đã làm
      if (a.status === 'assigned' && b.status !== 'assigned') return -1
      if (a.status !== 'assigned' && b.status === 'assigned') return 1
      
      // Deadline gần nhất lên đầu
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      
      // Mới nhất lên đầu
      return new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
    })

    return NextResponse.json({
      success: true,
      assignments: sortedAssignments,
      total: sortedAssignments.length
    })

  } catch (error: any) {
    console.error('Error in student assignments API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}, requireParentOrStudent)
