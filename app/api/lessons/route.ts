import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const grade = searchParams.get('grade')
    const subject = searchParams.get('subject')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const supabase = createClient()

    let query = supabase
      .from('lessons')
      .select('*')
      .order('created_at', { ascending: false })

    if (grade) {
      query = query.eq('grade', grade)
    }

    if (subject) {
      query = query.eq('subject', subject)
    }

    const { data: lessons, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      lessons,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Get lessons error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy danh sách bài học' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, grade, subject, content_md, description } = await request.json()

    if (!title || !grade || !subject || !content_md) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from('lessons')
      .insert({
        title,
        grade,
        subject,
        content_md,
        description: description || ''
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      lesson: data,
      message: 'Tạo bài học thành công'
    })

  } catch (error) {
    console.error('Create lesson error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo bài học' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, grade, subject, content_md, description } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Thiếu ID bài học' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const updateData: any = {}
    if (title) updateData.title = title
    if (grade) updateData.grade = grade
    if (subject) updateData.subject = subject
    if (content_md) updateData.content_md = content_md
    if (description) updateData.description = description

    const { data, error } = await supabase
      .from('lessons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      lesson: data,
      message: 'Cập nhật bài học thành công'
    })

  } catch (error) {
    console.error('Update lesson error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật bài học' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Thiếu ID bài học' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Xóa bài học thành công'
    })

  } catch (error) {
    console.error('Delete lesson error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xóa bài học' },
      { status: 500 }
    )
  }
}
