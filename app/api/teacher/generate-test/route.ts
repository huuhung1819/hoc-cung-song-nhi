import { NextRequest, NextResponse } from 'next/server'
import { requireTeacherOrAdmin } from '@/lib/apiAuth'

export async function POST(req: NextRequest) {
  // Guard: only teacher/admin
  const authError = await requireTeacherOrAdmin(req)
  if (authError) return authError
  try {
    const { 
      subject, 
      grade, 
      testType, // '15min', '45min', '90min', 'semester'
      topic,
      difficulty,
      count 
    } = await req.json()
    
    if (!subject || !grade || !testType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Sanitize API key
    const apiKey = (process.env.OPENAI_API_KEY || '').replace(/\r?\n|\r|\s/g, '')

    if (!apiKey || apiKey.length < 10) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 500 }
      )
    }

    const testCount = count || getDefaultCount(testType)
    const prompt = createTestPrompt(subject, grade, topic || '', testType, difficulty, testCount)

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Bạn là một giáo viên giàu kinh nghiệm chuyên biên soạn đề thi theo chương trình Bộ GD&ĐT Việt Nam. Bạn tạo ra các đề thi chất lượng cao, phù hợp với thời gian và yêu cầu kiểm tra.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI API error:', errorData)
      throw new Error('Failed to generate test')
    }

    const completion = await openaiResponse.json()
    const testContent = completion.choices[0]?.message?.content || ''

    const testData = parseTest(testContent, testType, testCount)

    return NextResponse.json({
      success: true,
      test: testData,
      metadata: {
        subject,
        grade,
        testType,
        topic,
        difficulty,
        count: testData.questions.length,
        duration: getDuration(testType),
        totalPoints: testData.totalPoints,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Error generating test:', error.message)
    return NextResponse.json(
      { error: 'Failed to generate test' },
      { status: 500 }
    )
  }
}

function getDefaultCount(testType: string): number {
  const counts = {
    '15min': 10,
    '45min': 20,
    '90min': 30,
    'semester': 40
  }
  return counts[testType as keyof typeof counts] || 20
}

function getDuration(testType: string): string {
  const durations = {
    '15min': '15 phút',
    '45min': '1 tiết (45 phút)',
    '90min': '2 tiết (90 phút)',
    'semester': '3 tiết (135 phút)'
  }
  return durations[testType as keyof typeof durations] || '45 phút'
}

function createTestPrompt(
  subject: string,
  grade: string,
  topic: string,
  testType: string,
  difficulty: string,
  count: number
): string {
  const duration = getDuration(testType)
  const difficultyText = {
    'easy': 'dễ (cơ bản)',
    'medium': 'trung bình',
    'hard': 'khó (nâng cao)'
  }[difficulty] || 'trung bình'

  let typeInstruction = ''
  
  if (testType === '15min') {
    typeInstruction = `
Tạo đề kiểm tra 15 phút gồm ${count} câu hỏi.

Format:
---
**ĐỀ KIỂM TRA 15 PHÚT**
**Môn:** ${subject} - **Lớp:** ${grade}
**Thời gian:** 15 phút
**Điểm tối đa:** 10 điểm

**Câu hỏi:**
[${count} câu hỏi trắc nghiệm 4 đáp án A, B, C, D]

**ĐÁP ÁN:**
[Danh sách đáp án đúng theo thứ tự câu hỏi]
---`
  } else if (testType === '45min') {
    typeInstruction = `
Tạo đề kiểm tra 1 tiết (45 phút) gồm ${count} câu hỏi.

Format:
---
**ĐỀ KIỂM TRA 1 TIẾT**
**Môn:** ${subject} - **Lớp:** ${grade}
**Thời gian:** 45 phút
**Điểm tối đa:** 10 điểm

**I. TRẮC NGHIỆM (4 điểm)**
[8 câu hỏi trắc nghiệm 4 đáp án A, B, C, D]

**II. TỰ LUẬN (6 điểm)**
[${count - 8} câu hỏi tự luận với điểm số chi tiết]

**ĐÁP ÁN:**
[Đáp án chi tiết cho tất cả câu hỏi]
---`
  } else if (testType === '90min') {
    typeInstruction = `
Tạo đề kiểm tra 2 tiết (90 phút) gồm ${count} câu hỏi.

Format:
---
**ĐỀ KIỂM TRA 2 TIẾT**
**Môn:** ${subject} - **Lớp:** ${grade}
**Thời gian:** 90 phút
**Điểm tối đa:** 10 điểm

**I. TRẮC NGHIỆM (3 điểm)**
[12 câu hỏi trắc nghiệm 4 đáp án A, B, C, D]

**II. TỰ LUẬN (7 điểm)**
[${count - 12} câu hỏi tự luận với điểm số chi tiết]

**ĐÁP ÁN:**
[Đáp án chi tiết cho tất cả câu hỏi]
---`
  } else if (testType === 'semester') {
    typeInstruction = `
Tạo đề thi học kỳ gồm ${count} câu hỏi.

Format:
---
**ĐỀ THI HỌC KỲ**
**Môn:** ${subject} - **Lớp:** ${grade}
**Thời gian:** 135 phút
**Điểm tối đa:** 10 điểm

**I. TRẮC NGHIỆM (3 điểm)**
[15 câu hỏi trắc nghiệm 4 đáp án A, B, C, D]

**II. TỰ LUẬN (7 điểm)**
[${count - 15} câu hỏi tự luận với điểm số chi tiết]

**ĐÁP ÁN:**
[Đáp án chi tiết cho tất cả câu hỏi]
---`
  }

  return `Tạo đề kiểm tra môn ${subject} cho học sinh ${grade} về chủ đề "${topic}".
Loại kiểm tra: ${testType} (${duration})
Độ khó: ${difficultyText}
Số câu hỏi: ${count} câu

${typeInstruction}

Yêu cầu:
- Nội dung chính xác, phù hợp với chương trình ${grade}
- Câu hỏi rõ ràng, không gây nhầm lẫn
- Phân bố điểm hợp lý theo yêu cầu từng loại kiểm tra
- Đáp án chính xác và có giải thích chi tiết
- Ngôn ngữ phù hợp với lứa tuổi
- Có giá trị đánh giá học tập cao
- Phù hợp với thời gian làm bài`
}

function parseTest(content: string, testType: string, count: number): any {
  try {
    console.log('📝 Parsing test content, length:', content.length)
    
    const sections = content.split('---')
    const testSection = sections[0] || content
    
    const questions: any[] = []
    let answers: string[] = []
    let totalPoints = 10

  // Extract questions
  const questionMatches = testSection.match(/\*\*Câu \d+:\*\*\s*(.+?)(?=\n\*\*Câu \d+:|$)/)
  
  if (questionMatches) {
    questionMatches.forEach((match, index) => {
      const questionText = match.replace(/\*\*Câu \d+:\*\*\s*/, '').trim()
      
      if (testType === '15min') {
        // Multiple choice questions
        const options = match.match(/[A-D]\.\s*(.+?)(?=\n[A-D]\.|$)/g)
        if (options) {
          questions.push({
            id: index + 1,
            type: 'multiple_choice',
            question: questionText,
            options: options.map(opt => opt.replace(/^[A-D]\.\s*/, '').trim()),
            points: 1
          })
        }
      } else {
        // Mixed questions
        if (match.includes('A.') && match.includes('B.') && match.includes('C.') && match.includes('D.')) {
          // Multiple choice
          const options = match.match(/[A-D]\.\s*(.+?)(?=\n[A-D]\.|$)/g)
          if (options) {
            questions.push({
              id: index + 1,
              type: 'multiple_choice',
              question: questionText,
              options: options.map(opt => opt.replace(/^[A-D]\.\s*/, '').trim()),
              points: index < 8 ? 0.5 : 0.25 // Different point distribution
            })
          }
        } else {
          // Essay question
          questions.push({
            id: index + 1,
            type: 'essay',
            question: questionText,
            points: index < 8 ? 2 : 1.5
          })
        }
      }
    })
  }

  // Extract answers
  const answerMatch = testSection.match(/\*\*ĐÁP ÁN:\*\*\s*(.+?)(?=\*\*|$)/s)
  if (answerMatch) {
    answers = answerMatch[1].trim().split('\n').filter(line => line.trim())
  }

  return {
    title: `Đề kiểm tra - ${testType}`,
    testType,
    duration: getDuration(testType),
    questions,
    answers,
    totalPoints,
    instructions: getInstructions(testType)
  }
  } catch (error) {
    console.error('📝 Error in parseTest:', error)
    return {
      title: `Đề kiểm tra - ${testType}`,
      testType,
      duration: getDuration(testType),
      questions: [],
      answers: [],
      totalPoints: 10,
      instructions: getInstructions(testType)
    }
  }
}

function getInstructions(testType: string): string {
  const instructions = {
    '15min': 'Làm bài trong 15 phút. Chọn đáp án đúng nhất cho mỗi câu hỏi.',
    '45min': 'Làm bài trong 45 phút. Phần trắc nghiệm: chọn đáp án đúng. Phần tự luận: trình bày rõ ràng, đầy đủ.',
    '90min': 'Làm bài trong 90 phút. Phần trắc nghiệm: chọn đáp án đúng. Phần tự luận: trình bày chi tiết, có giải thích.',
    'semester': 'Làm bài trong 135 phút. Đây là đề thi học kỳ, cần làm cẩn thận và kiểm tra kỹ trước khi nộp bài.'
  }
  return instructions[testType as keyof typeof instructions] || ''
}

