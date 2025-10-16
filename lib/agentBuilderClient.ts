// OpenAI Agent Builder API client
// Sử dụng Workflow ID để gọi Agent Builder

export const agentBuilderClient = {
  /**
   * Create a new run (conversation) with an agent using Workflow ID
   */
  async createRun(workflowId: string, messages: { role: 'user' | 'assistant' | 'system', content: any }[]) {
    try {
      // Check if we have OpenAI API key
      console.log('DEBUG: Checking OPENAI_API_KEY:', {
        exists: !!process.env.OPENAI_API_KEY,
        length: process.env.OPENAI_API_KEY?.length || 0,
        startsWith: process.env.OPENAI_API_KEY?.substring(0, 10) || 'N/A'
      })
      
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here' || process.env.OPENAI_API_KEY.length < 10) {
        // Return mock response for testing
        console.log('Using mock AI response (no API key configured)')
        
        const userMessage = messages.find(m => m.role === 'user')?.content || ''
        const systemMessage = messages.find(m => m.role === 'system')?.content || ''
        
        // Determine if it's coach or solve mode based on system prompt
        const isCoachMode = systemMessage.includes('KHÔNG đưa ra đáp án trực tiếp')
        
        // Analyze if it's a simple or complex problem
        const isSimpleMath = /^[\d\s\+\-\*\/\=\(\)]+$/.test(userMessage.replace(/[^0-9+\-*/=()\s]/g, ''))
        const hasSimpleNumbers = /\b[1-5]\s*[\+\-\*\/]\s*[1-5]\b/.test(userMessage)
        
        let response = ''
        
        // Extract the actual question from the message
        const questionMatch = userMessage.match(/Câu hỏi: "([^"]+)"/)
        const actualQuestion = questionMatch ? questionMatch[1] : userMessage
        
        if (userMessage.includes('[Ảnh bài tập]')) {
          response = isCoachMode 
            ? `Tôi thấy bạn đã gửi ảnh bài tập! Hãy để tôi hướng dẫn con cách làm:

**Đọc kỹ đề bài**: Con hãy đọc lại đề bài trong ảnh
**Xác định dạng bài**: Đây là bài toán gì? (cộng, trừ, nhân, chia?)
**Tìm hiểu yêu cầu**: Bài hỏi gì? Cần tìm gì?
**Gợi ý cách làm**: Con nghĩ nên làm như thế nào?

Hãy cho tôi biết con đã hiểu đề bài chưa? Con có thể mô tả lại đề bài không?`
            : `Tôi đã phân tích ảnh bài tập của bạn. Đây là lời giải chi tiết:

**Đề bài**: Tính 2 + 3 = ?

**Lời giải**:
Bước 1: Đặt phép tính: 2 + 3
Bước 2: Đếm từ 2 thêm 3 đơn vị: 2 → 3 → 4 → 5
Bước 3: Kết quả: 2 + 3 = 5

**Đáp án**: 5

**Giải thích**: Khi cộng 2 với 3, ta bắt đầu từ số 2 và đếm thêm 3 số nữa để được kết quả là 5.`
        } else {
          // Check if it's a math exercise question
          const isMathQuestion = actualQuestion.includes('=') || actualQuestion.includes('+') || actualQuestion.includes('-') || actualQuestion.includes('×') || actualQuestion.includes('÷')
          
          if (isMathQuestion) {
            response = isCoachMode
              ? `Tôi thấy đây là bài toán! Hãy để tôi hướng dẫn con cách làm:

**Đề bài**: ${actualQuestion}

**Cách tư duy**:
1. **Đọc kỹ đề bài**: Con hãy đọc lại đề bài một cách cẩn thận
2. **Xác định phép tính**: Đây là phép cộng, trừ, nhân hay chia?
3. **Tìm số cần tìm**: Bài hỏi con tìm số nào?
4. **Thử tính**: Con hãy thử tính từng bước một

**Gợi ý**: Con có thể dùng ngón tay để đếm hoặc viết ra giấy nháp.

Con thử làm trước nhé, sau đó cho tôi biết kết quả!`
              : `Đây là lời giải chi tiết cho bài toán:

**Đề bài**: ${actualQuestion}

**Lời giải từng bước**:
1. Phân tích đề bài và xác định phép tính
2. Thực hiện tính toán cẩn thận
3. Kiểm tra lại kết quả

**Đáp án**: [Kết quả sẽ được tính toán]

**Giải thích**: Hãy làm từng bước một cách cẩn thận để đảm bảo kết quả chính xác.`
          } else {
            response = isCoachMode
              ? `Tôi hiểu câu hỏi của bạn! Hãy để tôi hướng dẫn con cách tư duy:

**Đề bài**: ${actualQuestion}

**Cách tiếp cận**:
1. **Hiểu đề bài**: Con có thể đọc lại đề bài không?
2. **Xác định dạng**: Đây là loại bài gì?
3. **Tìm hiểu yêu cầu**: Bài hỏi gì? Cần tìm gì?
4. **Gợi ý cách làm**: Con nghĩ nên làm như thế nào?

Hãy cho tôi biết con đã hiểu đề bài chưa? Con có thể mô tả lại đề bài không?`
              : `Tôi hiểu câu hỏi của bạn! Đây là lời giải chi tiết:

**Đề bài**: ${actualQuestion}

**Lời giải từng bước**:
Bước 1: Phân tích đề bài
Bước 2: Áp dụng phương pháp phù hợp
Bước 3: Tính toán và kiểm tra kết quả

**Đáp án**: [Kết quả cuối cùng]

**Giải thích**: [Giải thích chi tiết cách làm]`
          }
        }

        return {
          id: 'mock-' + Date.now(),
          output_text: response,
          content: response,
          usage: {
            prompt_tokens: 50,
            completion_tokens: 100,
            total_tokens: 150
          },
          tools_used: []
        }
      }

      // Check if we have image data in the messages
      const hasImage = messages.some((m: any) => 
        m.content && 
        (typeof m.content === 'object' && Array.isArray(m.content) && m.content.some((c: any) => c.type === 'image_url'))
      )
      
      // Real OpenAI API call
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ 
          model: hasImage ? 'gpt-4o' : 'gpt-4o-mini', // Use GPT-4o for vision
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      console.log('OpenAI API Response:', JSON.stringify(data, null, 2))
      
      // Transform response to match expected format
      const aiResponse = data.choices[0]?.message?.content || 'Không có phản hồi'
      console.log('Extracted AI Response:', aiResponse)
      
      return {
        id: data.id,
        output_text: aiResponse,
        content: aiResponse,
        usage: data.usage,
        tools_used: []
      }
    } catch (error) {
      console.error('Error creating OpenAI completion:', error)
      throw error
    }
  },

  /**
   * Get workflow ID for the current agent
   */
  getWorkflowId(): string {
    return process.env.OPENAI_WORKFLOW_ID || 'wf_68e9eac9da748190bb7a45e5a20f1d8806b78d39f003adcb'
  }
}
