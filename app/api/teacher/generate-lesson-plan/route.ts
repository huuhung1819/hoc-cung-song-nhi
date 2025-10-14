import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { subject, grade, topic, duration } = await req.json()

    if (!subject || !grade || !topic) {
      return NextResponse.json(
        { error: 'Subject, grade, and topic are required' },
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

    const prompt = `Bạn là một chuyên gia giáo dục có kinh nghiệm soạn giáo án theo chương trình Bộ Giáo dục và Đào tạo Việt Nam.

Hãy soạn một giáo án chi tiết cho:
- Môn học: ${subject}
- Lớp: ${grade}
- Chủ đề: ${topic}
- Thời lượng: ${duration || '1 tiết (45 phút)'}

Giáo án cần có cấu trúc đầy đủ gồm:

1. **Thông tin chung**
   - Môn học, lớp, chủ đề
   - Thời lượng
   - Giáo viên

2. **Mục tiêu bài học**
   - Kiến thức (Knowledge)
   - Kỹ năng (Skills)
   - Thái độ (Attitudes)

3. **Chuẩn bị**
   - Giáo viên chuẩn bị gì
   - Học sinh chuẩn bị gì

4. **Tiến trình dạy học**
   - **Hoạt động khởi động** (5-7 phút): Làm nóng, tạo hứng thú
   - **Hoạt động hình thành kiến thức** (25-30 phút): Dạy kiến thức mới, ví dụ minh họa
   - **Hoạt động luyện tập** (10-15 phút): Bài tập thực hành
   - **Hoạt động vận dụng** (5 phút): Câu hỏi tư duy, áp dụng vào thực tế
   - **Tổng kết và dặn dò** (3-5 phút): Nhắc lại kiến thức, bài tập về nhà

5. **Đánh giá**
   - Tiêu chí đánh giá
   - Phương pháp đánh giá

6. **Rút kinh nghiệm**
   - Ưu điểm
   - Hạn chế
   - Cải tiến

Lưu ý:
- Nội dung phải chính xác, phù hợp với lứa tuổi
- Ngôn ngữ dễ hiểu, mạch lạc
- Hoạt động phong phú, tương tác học sinh
- Kết hợp lý thuyết và thực hành

Trả về giáo án dưới dạng Markdown.`

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
            content: 'Bạn là một chuyên gia giáo dục giàu kinh nghiệm trong việc soạn giáo án theo chương trình Bộ GD&ĐT Việt Nam. Bạn tạo ra giáo án chi tiết, khoa học, và phù hợp với từng lứa tuổi.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI API error:', errorData)
      throw new Error('Failed to generate lesson plan')
    }

    const completion = await openaiResponse.json()
    const lessonPlan = completion.choices[0]?.message?.content || ''

    return NextResponse.json({
      success: true,
      lessonPlan,
      metadata: {
        subject,
        grade,
        topic,
        duration,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Error generating lesson plan:', error.message)
    return NextResponse.json(
      { error: 'Failed to generate lesson plan' },
      { status: 500 }
    )
  }
}


