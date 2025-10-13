import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServiceClient } from '@/lib/supabaseServer'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { subject, subSubject, userId, count = 5 } = await req.json()

    if (!subject || !subSubject) {
      return NextResponse.json(
        { error: 'Subject and subSubject are required' },
        { status: 400 }
      )
    }

    // Get user's grade from database
    let grade = 'Lớp 1' // Default fallback
    if (userId) {
      try {
        const supabase = createServiceClient()
        const { data: user, error } = await supabase
          .from('users')
          .select('grade')
          .eq('id', userId)
          .single()
        
        if (!error && user?.grade) {
          grade = user.grade
        }
      } catch (error) {
        console.error('Error fetching user grade:', error)
        // Continue with default grade
      }
    }

    // Tạo prompt cho AI dựa trên môn học và loại bài tập
    const prompt = createPrompt(subject, subSubject, grade || 'Lớp 5', count)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Bạn là một giáo viên giàu kinh nghiệm. Nhiệm vụ của bạn là tạo ra ${count} bài tập ${subject} - ${subSubject} cho học sinh ${grade || 'Lớp 5'} theo chương trình Bộ Giáo dục và Đào tạo Việt Nam. 

QUAN TRỌNG: 
- Đối với lớp 1-2: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình", "quan sát hình" vì không có hình ảnh minh họa
- Chỉ tạo bài tập text thuần túy, phù hợp độ tuổi và có giá trị giáo dục
- Đề bài và đáp án phải nhất quán, không gây hiểu nhầm`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    })

    const exercisesText = completion.choices[0]?.message?.content || ''
    
    // Parse exercises từ response
    const exercises = parseExercises(exercisesText, count)

    return NextResponse.json({
      exercises,
      subject,
      subSubject,
      grade: grade,
      count: exercises.length
    })

  } catch (error: any) {
    console.error('Error generating exercises:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate exercises' },
      { status: 500 }
    )
  }
}

function createPrompt(subject: string, subSubject: string, grade: string, count: number): string {
  // Special handling for grades 1-2 to avoid mentioning images
  const isLowGrade = grade === 'Lớp 1' || grade === 'Lớp 2'
  
  const prompts: Record<string, Record<string, string>> = {
    'math': {
      'Trắc nghiệm': isLowGrade 
        ? `Tạo ${count} câu hỏi trắc nghiệm Toán cho ${grade}. Mỗi câu có 4 đáp án A, B, C, D. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng mỗi câu như sau:
Câu [số]: [Đề bài text thuần túy]
A) [Đáp án A]
B) [Đáp án B] 
C) [Đáp án C]
D) [Đáp án D]

Yêu cầu: Bài tập phù hợp ${grade}, độ khó vừa phải, chỉ dùng text không cần hình ảnh.`
        : `Tạo ${count} câu hỏi trắc nghiệm Toán cho ${grade}. Mỗi câu có 4 đáp án A, B, C, D. Định dạng mỗi câu như sau:

Câu [số]: [Đề bài]
A) [Đáp án A]
B) [Đáp án B]
C) [Đáp án C]
D) [Đáp án D]

Yêu cầu: Bài tập phải phù hợp chương trình ${grade}, độ khó vừa phải, đa dạng các dạng toán.`,

      'Có lời văn': isLowGrade
        ? `Tạo ${count} bài toán có lời văn cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Mỗi bài phải có tình huống thực tế, gần gũi với học sinh. Định dạng:
Bài [số]: [Đề bài toán có lời văn chi tiết, chỉ dùng text]

Yêu cầu: Sử dụng ngôn ngữ dễ hiểu, tình huống thực tế (mua sắm, chia đồ, đo lường...), KHÔNG cần hình ảnh.`
        : `Tạo ${count} bài toán có lời văn cho ${grade}. Mỗi bài phải có tình huống thực tế, gần gũi với học sinh. Định dạng:

Bài [số]: [Đề bài toán có lời văn chi tiết]

Yêu cầu: Sử dụng ngôn ngữ dễ hiểu, tình huống thực tế (mua sắm, chia đồ, đo lường...)`,

      'Cộng trừ nhân chia': isLowGrade
        ? `Tạo ${count} bài tập tính toán (cộng, trừ, nhân, chia) cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Bài [số]: Tính: [Biểu thức tính toán đơn giản]

Yêu cầu: Phép tính đơn giản phù hợp ${grade}, chỉ dùng số và phép tính cơ bản, KHÔNG cần hình ảnh.`
        : `Tạo ${count} bài tập tính toán (cộng, trừ, nhân, chia) cho ${grade}. Định dạng:

Bài [số]: Tính: [Biểu thức tính toán]

Yêu cầu: Có cả phép tính đơn giản và phức tạp, có dấu ngoặc, thứ tự thực hiện.`
    },
    'literature': {
      'Nghị luận': isLowGrade
        ? `Tạo ${count} đề bài viết đơn giản cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Đề [số]: Viết về [chủ đề đơn giản]

Yêu cầu: Chủ đề gần gũi với học sinh lớp nhỏ (gia đình, bạn bè, sở thích...), chỉ dùng text.`
        : `Tạo ${count} đề bài văn nghị luận cho ${grade}. Định dạng:

Đề [số]: [Đề bài nghị luận]

Yêu cầu: Chủ đề gần gũi với học sinh (tình bạn, gia đình, học tập, đạo đức...)`,

      'Phân tích': `Tạo ${count} bài phân tích văn học cho ${grade}. Định dạng:

Bài [số]: [Yêu cầu phân tích đoạn thơ/văn]

Yêu cầu: Phân tích hình ảnh, nghệ thuật, tư tưởng, tình cảm...`,

      'Cảm thụ': `Tạo ${count} bài viết cảm nhận cho ${grade}. Định dạng:

Bài [số]: Cảm nhận của em về [chủ đề]

Yêu cầu: Chủ đề về thiên nhiên, con người, tác phẩm văn học...`,

      'Viết đoạn': `Tạo ${count} đề bài viết đoạn văn cho ${grade}. Định dạng:

Bài [số]: Viết một đoạn văn [yêu cầu cụ thể]

Yêu cầu: Tả cảnh, tả người, kể chuyện... (5-7 câu)`
    },
    'english': {
      'Ngữ pháp': `Tạo ${count} câu hỏi ngữ pháp tiếng Anh cho ${grade}. Định dạng:

Câu [số]: Chọn đáp án đúng: "[Câu có chỗ trống]"
A) [Đáp án A]
B) [Đáp án B]
C) [Đáp án C]
D) [Đáp án D]

Yêu cầu: Thì, giới từ, động từ, mạo từ phù hợp ${grade}`,

      'Từ vựng': `Tạo ${count} câu hỏi từ vựng tiếng Anh cho ${grade}. Định dạng:

Bài [số]: Điền từ thích hợp: "[Câu có chỗ trống]"
A) [Từ A]
B) [Từ B]
C) [Từ C]
D) [Từ D]

Yêu cầu: Từ vựng về học tập, gia đình, thời tiết, sở thích...`,

      'Đọc hiểu': `Tạo ${count} đoạn văn đọc hiểu tiếng Anh cho ${grade}. Định dạng:

Bài [số]: Đọc đoạn văn sau và trả lời câu hỏi:
[Đoạn văn ngắn 3-5 câu]
Câu hỏi: [1-2 câu hỏi về đoạn văn]

Yêu cầu: Đoạn văn đơn giản, từ vựng cơ bản phù hợp ${grade}`,

      'Viết luận': `Tạo ${count} đề bài viết luận tiếng Anh cho ${grade}. Định dạng:

Bài [số]: Write a paragraph (50-60 words) about [chủ đề]

Yêu cầu: Chủ đề về bản thân, gia đình, sở thích, trường học...`
    }
  }

  return prompts[subject]?.[subSubject] || `Tạo ${count} bài tập ${subject} - ${subSubject} cho ${grade}.`
}

function parseExercises(text: string, expectedCount: number): string[] {
  // Tách bài tập bằng các pattern: "Câu 1:", "Bài 1:", "Đề 1:"
  const exercises: string[] = []
  
  // Split by common patterns
  const patterns = [/Câu \d+:/g, /Bài \d+:/g, /Đề \d+:/g]
  
  let parts: string[] = [text]
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      parts = text.split(pattern).filter(p => p.trim())
      break
    }
  }
  
  // If split worked, take the parts
  if (parts.length > 1) {
    for (let i = 0; i < parts.length && i < expectedCount; i++) {
      const exercise = parts[i].trim()
      if (exercise) {
        exercises.push(exercise)
      }
    }
  } else {
    // Fallback: split by double newlines
    const fallbackParts = text.split('\n\n').filter(p => p.trim())
    for (let i = 0; i < fallbackParts.length && i < expectedCount; i++) {
      exercises.push(fallbackParts[i].trim())
    }
  }
  
  return exercises.slice(0, expectedCount)
}

