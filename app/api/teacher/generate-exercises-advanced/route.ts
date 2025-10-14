import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { 
      subject, 
      grade, 
      topic,
      exerciseType, // 'multiple_choice', 'fill_blank', 'essay', 'mixed'
      difficulty, // 'easy', 'medium', 'hard'
      count 
    } = await req.json()

    if (!subject || !grade || !topic || !exerciseType) {
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

    const exerciseCount = count || 5
    const prompt = createPrompt(subject, grade, topic, exerciseType, difficulty, exerciseCount)

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
            content: `Bạn là một giáo viên giàu kinh nghiệm chuyên biên soạn đề thi và bài tập theo chương trình Bộ GD&ĐT Việt Nam. Bạn tạo ra các bài tập chất lượng cao, có giá trị giáo dục.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 3000,
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI API error:', errorData)
      throw new Error('Failed to generate exercises')
    }

    const completion = await openaiResponse.json()
    const exercisesText = completion.choices[0]?.message?.content || ''

    const exercises = parseExercises(exercisesText, exerciseType, exerciseCount)

    return NextResponse.json({
      success: true,
      exercises,
      metadata: {
        subject,
        grade,
        topic,
        exerciseType,
        difficulty,
        count: exercises.length,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Error generating exercises:', error.message)
    return NextResponse.json(
      { error: 'Failed to generate exercises' },
      { status: 500 }
    )
  }
}

function createPrompt(
  subject: string,
  grade: string,
  topic: string,
  exerciseType: string,
  difficulty: string,
  count: number
): string {
  const difficultyText = {
    'easy': 'dễ (cơ bản)',
    'medium': 'trung bình',
    'hard': 'khó (nâng cao)'
  }[difficulty] || 'trung bình'

  let typeInstruction = ''
  
  if (exerciseType === 'multiple_choice') {
    typeInstruction = `
Tạo ${count} câu hỏi trắc nghiệm (4 đáp án A, B, C, D).

Format mỗi câu:
---
**Câu [số]:** [Đề bài]

A. [Đáp án A]
B. [Đáp án B]
C. [Đáp án C]
D. [Đáp án D]

**Đáp án:** [Đáp án đúng]
**Giải thích:** [Giải thích chi tiết tại sao đáp án này đúng]
---`
  } else if (exerciseType === 'fill_blank') {
    typeInstruction = `
Tạo ${count} câu hỏi điền vào chỗ trống.

Format mỗi câu:
---
**Câu [số]:** [Đề bài có chỗ trống đánh dấu bằng _______]

**Đáp án:** [Từ/cụm từ cần điền]
**Giải thích:** [Giải thích]
---`
  } else if (exerciseType === 'essay') {
    typeInstruction = `
Tạo ${count} câu hỏi tự luận.

Format mỗi câu:
---
**Câu [số]:** [Đề bài]

**Gợi ý trả lời:**
[Nêu các ý chính cần có trong bài làm]

**Đáp án mẫu:**
[Bài làm mẫu chi tiết]
---`
  } else {
    typeInstruction = `
Tạo ${count} bài tập hỗn hợp gồm trắc nghiệm, điền khuyết, và tự luận.

Sử dụng format tương ứng cho từng loại câu hỏi.
---`
  }

  return `Tạo ${count} bài tập môn ${subject} cho học sinh ${grade} về chủ đề "${topic}".
Độ khó: ${difficultyText}

${typeInstruction}

Yêu cầu:
- Nội dung chính xác, phù hợp với chương trình ${grade}
- Câu hỏi rõ ràng, không gây nhầm lẫn
- Đáp án chính xác và có giải thích chi tiết
- Ngôn ngữ phù hợp với lứa tuổi
- Có giá trị giáo dục cao`
}

function parseExercises(text: string, exerciseType: string, count: number): any[] {
  const exercises: any[] = []
  const sections = text.split('---').filter(s => s.trim())

  for (let i = 0; i < Math.min(sections.length, count); i++) {
    const section = sections[i].trim()
    
    if (exerciseType === 'multiple_choice') {
      const questionMatch = section.match(/\*\*Câu \d+:\*\*\s*(.+?)(?=\n[A-D]\.)/s)
      const optionsMatch = section.match(/[A-D]\.\s*(.+?)(?=\n|$)/g)
      const answerMatch = section.match(/\*\*Đáp án:\*\*\s*([A-D])/i)
      const explanationMatch = section.match(/\*\*Giải thích:\*\*\s*(.+?)(?=---|$)/s)

      if (questionMatch && optionsMatch && answerMatch) {
        exercises.push({
          id: i + 1,
          type: 'multiple_choice',
          question: questionMatch[1].trim(),
          options: optionsMatch.map(opt => opt.replace(/^[A-D]\.\s*/, '').trim()),
          correctAnswer: answerMatch[1],
          explanation: explanationMatch ? explanationMatch[1].trim() : ''
        })
      }
    } else if (exerciseType === 'fill_blank') {
      const questionMatch = section.match(/\*\*Câu \d+:\*\*\s*(.+?)(?=\n\*\*Đáp án)/s)
      const answerMatch = section.match(/\*\*Đáp án:\*\*\s*(.+?)(?=\n|$)/i)
      const explanationMatch = section.match(/\*\*Giải thích:\*\*\s*(.+?)(?=---|$)/s)

      if (questionMatch && answerMatch) {
        exercises.push({
          id: i + 1,
          type: 'fill_blank',
          question: questionMatch[1].trim(),
          correctAnswer: answerMatch[1].trim(),
          explanation: explanationMatch ? explanationMatch[1].trim() : ''
        })
      }
    } else if (exerciseType === 'essay') {
      const questionMatch = section.match(/\*\*Câu \d+:\*\*\s*(.+?)(?=\n\*\*Gợi ý)/s)
      const hintMatch = section.match(/\*\*Gợi ý trả lời:\*\*\s*(.+?)(?=\n\*\*Đáp án mẫu)/s)
      const sampleMatch = section.match(/\*\*Đáp án mẫu:\*\*\s*(.+?)(?=---|$)/s)

      if (questionMatch) {
        exercises.push({
          id: i + 1,
          type: 'essay',
          question: questionMatch[1].trim(),
          hints: hintMatch ? hintMatch[1].trim() : '',
          sampleAnswer: sampleMatch ? sampleMatch[1].trim() : ''
        })
      }
    }
  }

  return exercises
}

