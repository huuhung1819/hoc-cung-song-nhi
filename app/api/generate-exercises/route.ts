import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  try {
    const { subject, subSubject, userId, grade, count = 5 } = await req.json()

    if (!subject || !subSubject) {
      return NextResponse.json(
        { error: 'Subject and subSubject are required' },
        { status: 400 }
      )
    }

    // Map frontend subject names to API subject names
    const subjectMapping: Record<string, string> = {
      'Toán': 'math',
      'Tiếng Việt': 'literature', 
      'Tiếng Anh': 'english'
    }

    // Map frontend topic names to API topic names
    const topicMapping: Record<string, string> = {
      // Toán - Lớp 1
      'Số đếm 1-20': 'Số đếm',
      'Phép cộng trừ cơ bản': 'Phép cộng',
      'Hình học căn bản': 'Hình học',
      'Đo lường cơ bản': 'Đo lường',
      
      // Toán - Lớp 2
      'Phép cộng trừ có nhớ': 'Phép cộng',
      'Bảng cửu chương': 'Phép nhân',
      'Hình học': 'Hình học',
      'Giải toán có lời văn': 'Có lời văn',
      
      // Toán - Lớp 3
      'Phép nhân chia': 'Phép nhân',
      'Phân số cơ bản': 'Phân số',
      'Đo diện tích': 'Đo lường',
      'Chu vi hình vuông': 'Hình học',
      'Bài tập chia 3': 'Chia 3',
      'Bài tập chia 4': 'Chia 4',
      'Bài tập chia 5': 'Chia 5',
      'Bài tập chia 6': 'Chia 6',
      'Chia 7': 'Chia 7',
      'Chia 8': 'Chia 8',
      'Chia 9': 'Chia 9',
      'Toán có lời văn dạng chia': 'Có lời văn chia',
      
      // Toán - Lớp 4
      'Phép tính nâng cao': 'Trắc nghiệm',
      'Phân số': 'Phân số',
      'Hình học nâng cao': 'Hình học',
      'Đo lường': 'Đo lường',
      
      // Toán - Lớp 5
      'Đo lường nâng cao': 'Đo lường',
      'Đại số cơ bản': 'Trắc nghiệm',
      'Hình học không gian': 'Hình học',
      'Thống kê': 'Trắc nghiệm',
      
      // Tiếng Việt
      'Tập đọc': 'Đọc hiểu',
      'Chính tả': 'Chính tả',
      'Ngữ pháp': 'Ngữ pháp',
      'Tập làm văn': 'Nghị luận',
      
      // Tiếng Anh
      'Từ vựng': 'Từ vựng',
      'Nghe hiểu': 'Nghe hiểu',
      'Nói': 'Nói'
    }

    const mappedSubject = subjectMapping[subject] || subject
    const mappedSubSubject = topicMapping[subSubject] || subSubject

    // Use grade from request body, fallback to database if not provided
    let userGrade = grade || 'Lớp 1' // Default fallback
    if (!grade && userId) {
      try {
        const supabase = createServiceClient()
        const { data: user, error } = await supabase
          .from('users')
          .select('grade')
          .eq('id', userId)
          .single()
        
        if (!error && user?.grade) {
          userGrade = user.grade
        }
      } catch (error: any) {
        console.error('Error fetching user grade:', error.message)
        // Continue with default grade
      }
    }

    // Tạo prompt cho AI dựa trên môn học và loại bài tập
    const prompt = createPrompt(mappedSubject, mappedSubSubject, userGrade, count)

    // Sanitize API key to avoid illegal header characters (remove ALL control chars)
    const apiKey = (process.env.OPENAI_API_KEY || '')
      .trim()
      .replace(/[\x00-\x1F\x7F]/g, '')

    if (!apiKey || apiKey.length < 40) {
      // Key missing or malformed; avoid leaking any details
      return NextResponse.json(
        { error: 'Failed to generate exercises' },
        { status: 500 }
      )
    }

    // Prepare headers safely; catch any header construction issues to avoid leaking key in logs
    let headers: Headers
    try {
      headers = new Headers({ 'Content-Type': 'application/json' })
      headers.set('Authorization', `Bearer ${apiKey}`)
    } catch {
      return NextResponse.json(
        { error: 'Failed to generate exercises' },
        { status: 500 }
      )
    }

    // Call OpenAI Chat Completions API directly
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
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
      }),
    })

    if (!response.ok) {
      // Don't surface provider error details to clients
      return NextResponse.json(
        { error: 'Failed to generate exercises' },
        { status: 500 }
      )
    }
    const data = await response.json()
    const exercisesText = data.choices?.[0]?.message?.content || ''
    
    // Parse exercises từ response
    const exercises = parseExercises(exercisesText, count)

    return NextResponse.json({
      exercises,
      subject,
      subSubject,
      grade: userGrade,
      count: exercises.length
    })

  } catch (error: any) {
    console.error('Error generating exercises:', error.message)
    return NextResponse.json(
      { error: 'Failed to generate exercises' },
      { status: 500 }
    )
  }
}

function createPrompt(subject: string, subSubject: string, grade: string, count: number): string {
  // Special handling for grades 1-2 to avoid mentioning images
  const isLowGrade = grade === 'Lớp 1' || grade === 'Lớp 2'
  
  const prompts: Record<string, Record<string, string>> = {
    'math': {
      'Số đếm': isLowGrade
        ? `Tạo ${count} bài tập về số đếm cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Bài [số]: Đếm từ [số] đến [số]
Bài [số]: Số nào lớn hơn: [số] hay [số]?
Bài [số]: Điền số thích hợp: [số], [số], ___, [số]

Yêu cầu: Bài tập về số đếm, so sánh số, điền số còn thiếu phù hợp ${grade}.`
        : `Tạo ${count} bài tập về số đếm cho ${grade}. Định dạng:

Bài [số]: Đếm từ [số] đến [số]
Bài [số]: Số nào lớn hơn: [số] hay [số]?
Bài [số]: Điền số thích hợp: [số], [số], ___, [số]
Bài [số]: Sắp xếp các số theo thứ tự tăng dần: [các số]

Yêu cầu: Bài tập về số đếm, so sánh số, điền số còn thiếu, sắp xếp số phù hợp ${grade}.`,

      'Toán trắc nghiệm': isLowGrade 
        ? `Tạo ${count} câu hỏi trắc nghiệm Toán cho ${grade}.

• Mỗi câu hỏi có 1 phép tính đơn giản (cộng hoặc trừ trong phạm vi 20).
• Mỗi câu có 4 đáp án A B C D, chỉ có 1 đáp án đúng.
• Không lặp lại phép tính.
• Câu hỏi ngắn gọn, dễ hiểu cho học sinh lớp 1.

QUAN TRỌNG: 
1. Đáp án phải hiển thị NGANG (horizontal), không dọc
2. PHẢI TÍNH ĐÚNG: Đáp án đúng phải là kết quả chính xác của phép tính
3. Đáp án sai phải là số gần đúng để tạo thử thách

Định dạng:
Câu [số]: [Phép tính] = ?
A) [Đáp án A]    B) [Đáp án B]    C) [Đáp án C]    D) [Đáp án D]

Ví dụ:
Câu 1: 3 + 5 = ?
A) 6    B) 8    C) 7    D) 9
(Đáp án đúng: B) 8)

Yêu cầu: Chỉ tạo phép cộng và trừ đơn giản trong phạm vi 20, TÍNH TOÁN CHÍNH XÁC, không cần hình ảnh.`
        : `Tạo ${count} câu hỏi trắc nghiệm Toán cho ${grade}. Mỗi câu có 4 đáp án A, B, C, D. 

QUAN TRỌNG: 
1. Đáp án phải hiển thị NGANG (horizontal), không dọc
2. PHẢI TÍNH ĐÚNG: Đáp án đúng phải là kết quả chính xác của phép tính
3. Đáp án sai phải là số gần đúng để tạo thử thách

Định dạng:
Câu [số]: [Đề bài]
A) [Đáp án A]    B) [Đáp án B]    C) [Đáp án C]    D) [Đáp án D]

Yêu cầu: Bài tập phải phù hợp chương trình ${grade}, độ khó vừa phải, đa dạng các dạng toán, TÍNH TOÁN CHÍNH XÁC 100%.`,

      'Toán có lời văn': isLowGrade
        ? `Tạo ${count} bài toán có lời văn cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Mỗi bài phải có tình huống thực tế, gần gũi với học sinh. Định dạng:
Bài [số]: [Đề bài toán có lời văn chi tiết, chỉ dùng text]

Yêu cầu: Sử dụng ngôn ngữ dễ hiểu, tình huống thực tế (mua sắm, chia đồ, đo lường...), KHÔNG cần hình ảnh.`
        : `Tạo ${count} bài toán có lời văn cho ${grade}. Mỗi bài phải có tình huống thực tế, gần gũi với học sinh. Định dạng:

Bài [số]: [Đề bài toán có lời văn chi tiết]

Yêu cầu: Sử dụng ngôn ngữ dễ hiểu, tình huống thực tế (mua sắm, chia đồ, đo lường...)`,

      'Toán lớn hơn nhỏ hơn': isLowGrade
        ? `Tạo ${count} bài tập so sánh số lớn hơn/nhỏ hơn cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Bài [số]: Số nào lớn hơn: [số A] hay [số B]?
Bài [số]: [số A] > [số B] - Đúng hay Sai?
Bài [số]: Điền dấu: [số A] ___ [số B]
Bài [số]: Sắp xếp từ bé đến lớn: [các số]

Yêu cầu: So sánh số đơn giản (1-20), dấu > < =, sắp xếp thứ tự, phù hợp ${grade}.`
        : `Tạo ${count} bài tập so sánh số lớn hơn/nhỏ hơn cho ${grade}. Định dạng:

Bài [số]: Số nào lớn hơn: [số A] hay [số B]?
Bài [số]: [số A] > [số B] - Đúng hay Sai?
Bài [số]: Điền dấu: [số A] ___ [số B]
Bài [số]: Sắp xếp từ bé đến lớn: [các số]
Bài [số]: Tìm số lớn nhất/nhỏ nhất trong: [dãy số]

Yêu cầu: So sánh số đa dạng, dấu > < =, sắp xếp thứ tự, tìm số lớn nhất/nhỏ nhất.`,

      'Toán điền vào chỗ trống': isLowGrade
        ? `Tạo ${count} bài tập điền vào chỗ trống cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Bài [số]: Điền số thích hợp: [Phép tính có chỗ trống]

Yêu cầu: Phép tính đơn giản, chỗ trống rõ ràng, phù hợp ${grade}, chỉ dùng text.`
        : `Tạo ${count} bài tập điền vào chỗ trống cho ${grade}. Định dạng:

Bài [số]: Điền số thích hợp: [Phép tính có chỗ trống]

Yêu cầu: Phép tính đa dạng, có dấu ngoặc, thứ tự thực hiện, phù hợp ${grade}.`,

      'Toán chọn đúng sai': isLowGrade
        ? `Tạo ${count} câu hỏi đúng/sai cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Câu [số]: [Phát biểu toán học] - Đúng hay Sai?

Yêu cầu: Phát biểu đơn giản về số, phép tính, phù hợp ${grade}, chỉ dùng text.`
        : `Tạo ${count} câu hỏi đúng/sai cho ${grade}. Định dạng:

Câu [số]: [Phát biểu toán học] - Đúng hay Sai?

Yêu cầu: Phát biểu về số, phép tính, hình học, phù hợp ${grade}.`,

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

      'Có lời văn chia': `Tạo ${count} câu hỏi trắc nghiệm về toán có lời văn dạng chia cho ${grade}.

QUAN TRỌNG: 
1. Đáp án phải hiển thị NGANG (horizontal), không dọc
2. PHẢI TÍNH ĐÚNG: Đáp án đúng phải là kết quả chính xác của phép tính
3. Đáp án sai phải là số gần đúng để tạo thử thách
4. KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa
5. CẤU TRÚC BẮT BUỘC: [Số] [vật], chia [động từ] [số] [người/vật]. [Câu hỏi]?

Định dạng:
Bài [số]: [Tên] có [số] [vật], chia đều cho [số] [người/vật]. [Câu hỏi]?
A) [Đáp án A]    B) [Đáp án B]    C) [Đáp án C]    D) [Đáp án D]

Ví dụ:
Bài 1: Lan có 24 cái kẹo, chia đều cho 6 bạn. Mỗi bạn được bao nhiêu cái kẹo?
A) 3    B) 4    C) 5    D) 6
(Đáp án đúng: B) 4)

Bài 2: Cô giáo có 30 quyển vở, chia đều cho 5 học sinh. Mỗi học sinh được bao nhiêu quyển vở?
A) 5    B) 6    C) 7    D) 8
(Đáp án đúng: B) 6)

Yêu cầu: 
- Tạo bài toán có lời văn về phép chia với cấu trúc: "[Số] [vật], chia đều cho [số] [người/vật]"
- Tình huống thực tế (chia kẹo, chia vở, chia bút, chia táo...)
- TÍNH TOÁN CHÍNH XÁC 100%, không cần hình ảnh
- Chỉ dùng phép chia hết (không có dư)`,

      'Phép nhân': isLowGrade
        ? `Tạo ${count} bài tập phép nhân cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Bài [số]: Tính: [Phép nhân đơn giản]

Yêu cầu: Phép nhân đơn giản (1-2 chữ số), phù hợp ${grade}, TÍNH TOÁN CHÍNH XÁC, chỉ dùng text.`
        : `Tạo ${count} bài tập phép nhân cho ${grade}. Định dạng:

Bài [số]: Tính: [Phép nhân]

Yêu cầu: Có cả phép nhân đơn giản và phức tạp, có dấu ngoặc, thứ tự thực hiện, TÍNH TOÁN CHÍNH XÁC 100%.`,

      'Phép chia': isLowGrade
        ? `Tạo ${count} bài tập phép chia cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Bài [số]: Tính: [Phép chia đơn giản]

Yêu cầu: Phép chia đơn giản (chia hết), phù hợp ${grade}, TÍNH TOÁN CHÍNH XÁC, chỉ dùng text.`
        : `Tạo ${count} bài tập phép chia cho ${grade}. Định dạng:

Bài [số]: Tính: [Phép chia]

Yêu cầu: Có cả phép chia đơn giản và phức tạp, có dư, thứ tự thực hiện, TÍNH TOÁN CHÍNH XÁC 100%.`,

      'Chia 3': `Tạo ${count} câu hỏi trắc nghiệm về phép chia cho 3 - ${grade}.

QUAN TRỌNG: 
1. Đáp án phải hiển thị NGANG (horizontal), không dọc
2. PHẢI TÍNH ĐÚNG: Đáp án đúng phải là kết quả chính xác của phép tính
3. Đáp án sai phải là số gần đúng để tạo thử thách

Định dạng:
Bài [số]: [Số] ÷ 3 = ?
A) [Đáp án A]    B) [Đáp án B]    C) [Đáp án C]    D) [Đáp án D]

Ví dụ:
Bài 1: 12 ÷ 3 = ?
A) 3    B) 4    C) 5    D) 6
(Đáp án đúng: B) 4)

Yêu cầu: Chỉ tạo phép chia cho 3, TÍNH TOÁN CHÍNH XÁC 100%, không cần hình ảnh.`,

      'Chia 4': `Tạo ${count} câu hỏi trắc nghiệm về phép chia cho 4 - ${grade}.

QUAN TRỌNG: 
1. Đáp án phải hiển thị NGANG (horizontal), không dọc
2. PHẢI TÍNH ĐÚNG: Đáp án đúng phải là kết quả chính xác của phép tính
3. Đáp án sai phải là số gần đúng để tạo thử thách

Định dạng:
Bài [số]: [Số] ÷ 4 = ?
A) [Đáp án A]    B) [Đáp án B]    C) [Đáp án C]    D) [Đáp án D]

Ví dụ:
Bài 1: 16 ÷ 4 = ?
A) 3    B) 4    C) 5    D) 6
(Đáp án đúng: B) 4)

Yêu cầu: Chỉ tạo phép chia cho 4, TÍNH TOÁN CHÍNH XÁC 100%, không cần hình ảnh.`,

      'Chia 5': `Tạo ${count} câu hỏi trắc nghiệm về phép chia cho 5 - ${grade}.

QUAN TRỌNG: 
1. Đáp án phải hiển thị NGANG (horizontal), không dọc
2. PHẢI TÍNH ĐÚNG: Đáp án đúng phải là kết quả chính xác của phép tính
3. Đáp án sai phải là số gần đúng để tạo thử thách

Định dạng:
Bài [số]: [Số] ÷ 5 = ?
A) [Đáp án A]    B) [Đáp án B]    C) [Đáp án C]    D) [Đáp án D]

Ví dụ:
Bài 1: 20 ÷ 5 = ?
A) 3    B) 4    C) 5    D) 6
(Đáp án đúng: B) 4)

Yêu cầu: Chỉ tạo phép chia cho 5, TÍNH TOÁN CHÍNH XÁC 100%, không cần hình ảnh.`,

      'Chia 6': `Tạo ${count} câu hỏi trắc nghiệm về phép chia cho 6 - ${grade}.

QUAN TRỌNG: 
1. Đáp án phải hiển thị NGANG (horizontal), không dọc
2. PHẢI TÍNH ĐÚNG: Đáp án đúng phải là kết quả chính xác của phép tính
3. Đáp án sai phải là số gần đúng để tạo thử thách

Định dạng:
Bài [số]: [Số] ÷ 6 = ?
A) [Đáp án A]    B) [Đáp án B]    C) [Đáp án C]    D) [Đáp án D]

Ví dụ:
Bài 1: 24 ÷ 6 = ?
A) 3    B) 4    C) 5    D) 6
(Đáp án đúng: B) 4)

Yêu cầu: Chỉ tạo phép chia cho 6, TÍNH TOÁN CHÍNH XÁC 100%, không cần hình ảnh.`,

      'Chia 7': `Tạo ${count} câu hỏi trắc nghiệm về phép chia cho 7 - ${grade}.

QUAN TRỌNG: 
1. Đáp án phải hiển thị NGANG (horizontal), không dọc
2. PHẢI TÍNH ĐÚNG: Đáp án đúng phải là kết quả chính xác của phép tính
3. Đáp án sai phải là số gần đúng để tạo thử thách

Định dạng:
Bài [số]: [Số] ÷ 7 = ?
A) [Đáp án A]    B) [Đáp án B]    C) [Đáp án C]    D) [Đáp án D]

Ví dụ:
Bài 1: 28 ÷ 7 = ?
A) 3    B) 4    C) 5    D) 6
(Đáp án đúng: B) 4)

Yêu cầu: Chỉ tạo phép chia cho 7, TÍNH TOÁN CHÍNH XÁC 100%, không cần hình ảnh.`,

      'Chia 8': `Tạo ${count} câu hỏi trắc nghiệm về phép chia cho 8 - ${grade}.

QUAN TRỌNG: 
1. Đáp án phải hiển thị NGANG (horizontal), không dọc
2. PHẢI TÍNH ĐÚNG: Đáp án đúng phải là kết quả chính xác của phép tính
3. Đáp án sai phải là số gần đúng để tạo thử thách

Định dạng:
Bài [số]: [Số] ÷ 8 = ?
A) [Đáp án A]    B) [Đáp án B]    C) [Đáp án C]    D) [Đáp án D]

Ví dụ:
Bài 1: 32 ÷ 8 = ?
A) 3    B) 4    C) 5    D) 6
(Đáp án đúng: B) 4)

Yêu cầu: Chỉ tạo phép chia cho 8, TÍNH TOÁN CHÍNH XÁC 100%, không cần hình ảnh.`,

      'Chia 9': `Tạo ${count} câu hỏi trắc nghiệm về phép chia cho 9 - ${grade}.

QUAN TRỌNG: 
1. Đáp án phải hiển thị NGANG (horizontal), không dọc
2. PHẢI TÍNH ĐÚNG: Đáp án đúng phải là kết quả chính xác của phép tính
3. Đáp án sai phải là số gần đúng để tạo thử thách

Định dạng:
Bài [số]: [Số] ÷ 9 = ?
A) [Đáp án A]    B) [Đáp án B]    C) [Đáp án C]    D) [Đáp án D]

Ví dụ:
Bài 1: 36 ÷ 9 = ?
A) 3    B) 4    C) 5    D) 6
(Đáp án đúng: B) 4)

Yêu cầu: Chỉ tạo phép chia cho 9, TÍNH TOÁN CHÍNH XÁC 100%, không cần hình ảnh.`,

      'Phép trừ': isLowGrade
        ? `Tạo ${count} bài tập phép trừ cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Bài [số]: Tính: [Phép trừ đơn giản]

Yêu cầu: Phép trừ đơn giản (1-2 chữ số), phù hợp ${grade}, TÍNH TOÁN CHÍNH XÁC, chỉ dùng text.`
        : `Tạo ${count} bài tập phép trừ cho ${grade}. Định dạng:

Bài [số]: Tính: [Phép trừ]

Yêu cầu: Có cả phép trừ đơn giản và phức tạp, có dấu ngoặc, thứ tự thực hiện, TÍNH TOÁN CHÍNH XÁC 100%.`,

      'Phép cộng': isLowGrade
        ? `Tạo ${count} bài tập phép cộng cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Bài [số]: Tính: [Phép cộng đơn giản]

Yêu cầu: Phép cộng đơn giản (1-2 chữ số), phù hợp ${grade}, TÍNH TOÁN CHÍNH XÁC, chỉ dùng text.`
        : `Tạo ${count} bài tập phép cộng cho ${grade}. Định dạng:

Bài [số]: Tính: [Phép cộng]

Yêu cầu: Có cả phép cộng đơn giản và phức tạp, có dấu ngoặc, thứ tự thực hiện, TÍNH TOÁN CHÍNH XÁC 100%.`,

      'Đo lường': isLowGrade
        ? `Tạo ${count} bài tập đo lường cho ${grade}. 

QUAN TRỌNG: KHÔNG BAO GIỜ mention "hình", "trong hình", "nhìn hình" vì không có hình ảnh minh họa.

Định dạng:
Bài [số]: Đo chiều dài: [Vật dụng] dài bao nhiêu cm?
Bài [số]: So sánh: [Vật A] và [Vật B], cái nào dài hơn?
Bài [số]: Điền số: [Vật] dài ___ cm.

Yêu cầu: Đo lường cơ bản (cm, m), so sánh kích thước, phù hợp ${grade}.`
        : `Tạo ${count} bài tập đo lường cho ${grade}. Định dạng:

Bài [số]: Đo chiều dài: [Vật dụng] dài bao nhiêu cm/m?
Bài [số]: So sánh: [Vật A] và [Vật B], cái nào dài hơn?
Bài [số]: Chuyển đổi: [số] m = ___ cm
Bài [số]: Tính chu vi hình [hình học] có kích thước...

Yêu cầu: Đo lường đa dạng (cm, m, km), so sánh, chuyển đổi đơn vị, tính chu vi.`,

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

// Function to calculate the correct answer for math problems
function calculateCorrectAnswer(question: string, options: string[]): string {
  try {
    // 1. TRƯỜNG HỢP 1: Phép tính trực tiếp (3 + 5 = ?, 12 ÷ 3 = ?)
    const mathMatch = question.match(/(\d+)\s*([+\-×÷*/])\s*(\d+)\s*=\s*\?/)
    
    if (mathMatch) {
      const [, num1, operator, num2] = mathMatch
      const a = parseInt(num1)
      const b = parseInt(num2)
      
      let correctResult: number
      
      switch (operator) {
        case '+':
        case 'cộng':
          correctResult = a + b
          break
        case '-':
        case 'trừ':
          correctResult = a - b
          break
        case '×':
        case '*':
        case 'nhân':
          correctResult = a * b
          break
        case '÷':
        case '/':
        case 'chia':
          correctResult = Math.floor(a / b)
          break
        default:
          return options[0] || 'Đáp án A'
      }
      
      // Find the option that contains the correct result
      const correctOption = options.find(option => 
        option.includes(correctResult.toString())
      )
      
      return correctOption || options[0] || 'Đáp án A'
    }
    
    // 2. TRƯỜNG HỢP 2: Toán có lời văn về phép chia
    // Ví dụ: "Lan có 24 cái kẹo, chia đều cho 6 bạn. Mỗi bạn được bao nhiêu cái kẹo?"
    const divisionWordMatch = question.match(/(\d+)\s*[^,]*,\s*chia\s*[^,]*\s*(\d+)\s*[^?]*\?/)
    if (divisionWordMatch) {
      const [, total, groups] = divisionWordMatch
      const correctResult = Math.floor(parseInt(total) / parseInt(groups))
      
      const correctOption = options.find(option => 
        option.includes(correctResult.toString())
      )
      
      return correctOption || options[0] || 'Đáp án A'
    }
    
    // 3. TRƯỜNG HỢP 3: Toán có lời văn khác (cộng, trừ, nhân)
    // Ví dụ: "Mẹ có 15 quả cam, mua thêm 8 quả. Hỏi mẹ có tất cả bao nhiêu quả?"
    const wordProblemMatch = question.match(/(\d+)\s*[^,]*,\s*(?:mua\s*thêm|cho|bán\s*đi|ăn\s*hết)\s*(\d+)\s*[^?]*\?/)
    if (wordProblemMatch) {
      const [, num1, num2] = wordProblemMatch
      let correctResult: number
      
      if (question.includes('mua thêm') || question.includes('cho')) {
        correctResult = parseInt(num1) + parseInt(num2) // Cộng
      } else if (question.includes('bán đi') || question.includes('ăn hết')) {
        correctResult = parseInt(num1) - parseInt(num2) // Trừ
      } else {
        correctResult = parseInt(num1) + parseInt(num2) // Default cộng
      }
      
      const correctOption = options.find(option => 
        option.includes(correctResult.toString())
      )
      
      return correctOption || options[0] || 'Đáp án A'
    }
    
    // 4. TRƯỜNG HỢP 4: Tìm số trong câu hỏi
    // Ví dụ: "Số nào chia cho 3 được 4?"
    const findNumberMatch = question.match(/số\s*nào\s*([+\-×÷*/])\s*(\d+)\s*được\s*(\d+)/i)
    if (findNumberMatch) {
      const [, operator, num2, result] = findNumberMatch
      const b = parseInt(num2)
      const target = parseInt(result)
      let correctResult: number
      
      switch (operator) {
        case '+':
          correctResult = target - b // x + b = target => x = target - b
          break
        case '-':
          correctResult = target + b // x - b = target => x = target + b
          break
        case '×':
        case '*':
          correctResult = Math.floor(target / b) // x * b = target => x = target / b
          break
        case '÷':
        case '/':
          correctResult = target * b // x ÷ b = target => x = target * b
          break
        default:
          return options[0] || 'Đáp án A'
      }
      
      const correctOption = options.find(option => 
        option.includes(correctResult.toString())
      )
      
      return correctOption || options[0] || 'Đáp án A'
    }
    
    // 5. FALLBACK: Nếu không tìm thấy pattern nào, return option đầu tiên
    console.warn('Could not calculate correct answer for:', question)
    return options[0] || 'Đáp án A'
  } catch (error) {
    console.error('Error calculating correct answer:', error)
    return options[0] || 'Đáp án A'
  }
}

function parseExercises(text: string, expectedCount: number): any[] {
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
  
  // Convert string exercises to structured objects
  const structuredExercises = exercises.slice(0, expectedCount).map((exerciseText, index) => {
    const lines = exerciseText.split('\n').filter(line => line.trim())
    
    // Extract question (first line) and replace "Câu" with "Bài"
    const rawQuestion = lines[0] || `Câu ${index + 1}`
    const question = rawQuestion.replace(/Câu (\d+)/, `Bài $1`)
    
    // Extract options - handle both vertical and horizontal formats
    let options: string[] = []
    
    // First try to find horizontal format (all options on one line)
    const horizontalLine = lines.find(line => /A\)[^B]*B\)[^C]*C\)[^D]*D\)/.test(line))
    if (horizontalLine) {
      // Split horizontal line into individual options
      const matches = horizontalLine.match(/[ABCD]\)[^ABCD]*/g)
      if (matches) {
        options = matches.map(match => match.trim())
      }
    } else {
      // Fallback to vertical format (each option on separate line)
      options = lines
        .filter(line => /^[ABCD]\)/.test(line.trim()))
        .map(line => line.trim())
    }
    
    // Calculate the correct answer based on the math problem
    const correctAnswer = calculateCorrectAnswer(question, options)
    
    return {
      question,
      options: options.length > 0 ? options : ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
      correctAnswer,
      type: 'multiple_choice',
      difficulty: index <= 1 ? 'easy' : index <= 3 ? 'medium' : 'hard',
      estimatedTime: 5,
      points: 10
    }
  })
  
  return structuredExercises
}
