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
    const prompt = createPrompt(subject, subSubject, grade || 'Lớp 1', count)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Bạn là một giáo viên giàu kinh nghiệm. Nhiệm vụ của bạn là tạo ra ${count} bài tập ${subject} - ${subSubject} cho học sinh ${grade || 'Lớp 1'} theo chương trình Bộ Giáo dục và Đào tạo Việt Nam. 

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

      'Phân tích': isLowGrade
        ? `Tạo ${count} bài tập đọc hiểu đơn giản cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Bài [số]: Đọc đoạn văn và trả lời: [Câu hỏi đơn giản]

Yêu cầu: Đoạn văn ngắn, câu hỏi đơn giản, phù hợp ${grade}.`
        : `Tạo ${count} bài phân tích văn học cho ${grade}. Định dạng:

Bài [số]: [Yêu cầu phân tích đoạn thơ/văn]

Yêu cầu: Phân tích hình ảnh, nghệ thuật, tư tưởng, tình cảm...`,

      'Cảm thụ': isLowGrade
        ? `Tạo ${count} bài tập cảm nhận đơn giản cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Bài [số]: Em cảm thấy thế nào về [chủ đề đơn giản]?

Yêu cầu: Chủ đề đơn giản (gia đình, bạn bè, đồ chơi...), chỉ dùng text.`
        : `Tạo ${count} bài viết cảm nhận cho ${grade}. Định dạng:

Bài [số]: Cảm nhận của em về [chủ đề]

Yêu cầu: Chủ đề về thiên nhiên, con người, tác phẩm văn học...`,

      'Viết đoạn': isLowGrade
        ? `Tạo ${count} đề bài viết câu đơn giản cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Bài [số]: Viết một câu về [chủ đề đơn giản]

Yêu cầu: Chủ đề đơn giản (gia đình, bạn bè, đồ chơi...), chỉ 1-2 câu ngắn.`
        : `Tạo ${count} đề bài viết đoạn văn cho ${grade}. Định dạng:

Bài [số]: Viết một đoạn văn [yêu cầu cụ thể]

Yêu cầu: Tả cảnh, tả người, kể chuyện... (5-7 câu)`
    },
    'english': {
      'Ngữ pháp': isLowGrade
        ? `Tạo ${count} câu hỏi tiếng Anh đơn giản cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Câu [số]: Chọn từ đúng: "[Câu đơn giản]"
A) [Đáp án A]
B) [Đáp án B]
C) [Đáp án C]
D) [Đáp án D]

Yêu cầu: Từ vựng đơn giản, câu ngắn, phù hợp ${grade}.`
        : `Tạo ${count} câu hỏi ngữ pháp tiếng Anh cho ${grade}. Định dạng:

Câu [số]: Chọn đáp án đúng: "[Câu có chỗ trống]"
A) [Đáp án A]
B) [Đáp án B]
C) [Đáp án C]
D) [Đáp án D]

Yêu cầu: Thì, giới từ, động từ, mạo từ phù hợp ${grade}.`,

      'Từ vựng': isLowGrade
        ? `Tạo ${count} câu hỏi từ vựng tiếng Anh đơn giản cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Câu [số]: Từ nào có nghĩa là "[nghĩa tiếng Việt]"?
A) [Đáp án A]
B) [Đáp án B]
C) [Đáp án C]
D) [Đáp án D]

Yêu cầu: Từ vựng cơ bản, đơn giản, phù hợp ${grade}.`
        : `Tạo ${count} câu hỏi từ vựng tiếng Anh cho ${grade}. Định dạng:

Bài [số]: Điền từ thích hợp: "[Câu có chỗ trống]"
A) [Từ A]
B) [Từ B]
C) [Từ C]
D) [Từ D]

Yêu cầu: Từ vựng về học tập, gia đình, thời tiết, sở thích...`,

      'Đọc hiểu': isLowGrade
        ? `Tạo ${count} đoạn văn ngắn và câu hỏi đọc hiểu đơn giản cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Đoạn văn [số]: [Đoạn văn ngắn, đơn giản]
Câu hỏi [số]: [Câu hỏi đơn giản]
A) [Đáp án A]
B) [Đáp án B]
C) [Đáp án C]
D) [Đáp án D]

Yêu cầu: Đoạn văn ngắn, từ vựng đơn giản, phù hợp ${grade}.`
        : `Tạo ${count} đoạn văn đọc hiểu tiếng Anh cho ${grade}. Định dạng:

Bài [số]: Đọc đoạn văn sau và trả lời câu hỏi:
[Đoạn văn ngắn 3-5 câu]
Câu hỏi: [1-2 câu hỏi về đoạn văn]

Yêu cầu: Đoạn văn đơn giản, từ vựng cơ bản phù hợp ${grade}`,

      'Viết luận': isLowGrade
        ? `Tạo ${count} đề bài viết câu đơn giản cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Đề [số]: Viết một câu về [chủ đề đơn giản]

Yêu cầu: Chủ đề đơn giản (gia đình, bạn bè, đồ chơi...), chỉ 1-2 câu ngắn.`
        : `Tạo ${count} đề bài viết luận tiếng Anh cho ${grade}. Định dạng:

Bài [số]: Write a paragraph (50-60 words) about [chủ đề]

Yêu cầu: Chủ đề về bản thân, gia đình, sở thích, trường học...`
    }
  }

  const subjectPrompts = prompts[subject as keyof typeof prompts]
  if (!subjectPrompts) {
    throw new Error(`Invalid subject: ${subject}`)
  }

  const prompt = subjectPrompts[subSubject as keyof typeof subjectPrompts]
  if (!prompt) {
    throw new Error(`Invalid subSubject: ${subSubject} for subject: ${subject}`)
  }

  return prompt
}

function parseExercises(text: string, expectedCount: number): string[] {
  // Tách bài tập bằng các pattern: "Câu 1:", "Bài 1:", "Đề 1:"
  const exercises: string[] = []
  
  // Split by exercise patterns
  const patterns = [
    /Câu \d+:/g,
    /Bài \d+:/g, 
    /Đề \d+:/g,
    /Đoạn văn \d+:/g
  ]
  
  let currentExercise = ''
  const lines = text.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Check if this line starts a new exercise
    const isNewExercise = patterns.some(pattern => pattern.test(line))
    
    if (isNewExercise) {
      // Save previous exercise if exists
      if (currentExercise.trim()) {
        exercises.push(currentExercise.trim())
      }
      // Start new exercise
      currentExercise = line
    } else if (currentExercise) {
      // Continue current exercise
      currentExercise += '\n' + line
    }
  }
  
  // Add last exercise
  if (currentExercise.trim()) {
    exercises.push(currentExercise.trim())
  }
  
  // If no exercises found, try alternative parsing
  if (exercises.length === 0) {
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 10)
    exercises.push(...paragraphs.slice(0, expectedCount))
  }
  
  return exercises.slice(0, expectedCount)
}
