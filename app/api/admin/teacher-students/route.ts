import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'

// GET - Get all teacher-student relationships or filter by teacher
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const teacherId = searchParams.get('teacherId')

    const supabase = createServiceClient()

    let query = supabase
      .from('teacher_students')
      .select(`
        id,
        teacher_id,
        student_id,
        assigned_at,
        student:users!student_id(id, name, email, grade),
        teacher:users!teacher_id(id, name, email)
      `)
      .order('assigned_at', { ascending: false })

    if (teacherId) {
      query = query.eq('teacher_id', teacherId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching teacher-students:', error)
      return NextResponse.json(
        { error: 'Failed to fetch relationships' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      relationships: data || []
    })

  } catch (error: any) {
    console.error('Error in teacher-students GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new teacher-student relationship
export async function POST(req: NextRequest) {
  try {
    const { teacherId, studentId, assignedBy } = await req.json()

    if (!teacherId || !studentId) {
      return NextResponse.json(
        { error: 'teacherId and studentId are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check if relationship already exists
    const { data: existing } = await supabase
      .from('teacher_students')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('student_id', studentId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Relationship already exists' },
        { status: 409 }
      )
    }

    // Create relationship
    const { data, error } = await supabase
      .from('teacher_students')
      .insert({
        teacher_id: teacherId,
        student_id: studentId,
        assigned_by: assignedBy || null
      })
      .select(`
        id,
        teacher_id,
        student_id,
        assigned_at,
        student:users!student_id(id, name, email, grade)
      `)
      .single()

    if (error) {
      console.error('Error creating relationship:', error)
      return NextResponse.json(
        { error: 'Failed to create relationship' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      relationship: data
    })

  } catch (error: any) {
    console.error('Error in teacher-students POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove teacher-student relationship
export async function DELETE(req: NextRequest) {
  try {
    const { teacherId, studentId } = await req.json()

    if (!teacherId || !studentId) {
      return NextResponse.json(
        { error: 'teacherId and studentId are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('teacher_students')
      .delete()
      .eq('teacher_id', teacherId)
      .eq('student_id', studentId)

    if (error) {
      console.error('Error deleting relationship:', error)
      return NextResponse.json(
        { error: 'Failed to delete relationship' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Relationship deleted successfully'
    })

  } catch (error: any) {
    console.error('Error in teacher-students DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


