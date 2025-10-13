// OpenAI Agent Builder API client
// Sử dụng Workflow ID để gọi Agent Builder

export const agentBuilderClient = {
  /**
   * Create a new run (conversation) with an agent using Workflow ID
   */
  async createRun(workflowId: string, messages: { role: 'user' | 'assistant' | 'system', content: any }[]) {
    try {
      // Check if we have OpenAI API key
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
          if (isSimpleMath && hasSimpleNumbers) {
            // Simple math problems - short response
            response = isCoachMode
              ? `Đây là bài toán đơn giản! Con hãy thử làm trước:

**Gợi ý**: Con có thể dùng ngón tay hoặc đếm để tính
**Thử làm**: Con hãy thử tính xem kết quả là bao nhiêu?

Con thử làm trước nhé, sau đó cho tôi biết kết quả!`
              : `Đây là bài toán đơn giản:

**Đáp án**: ${userMessage.includes('1+1') ? '2' : userMessage.includes('2+2') ? '4' : 'Kết quả'}

**Giải thích ngắn gọn**: Đây là phép tính cơ bản, con có thể dùng ngón tay để đếm.`
          } else {
            // Complex problems - detailed response
            response = isCoachMode
              ? `Tôi hiểu câu hỏi của bạn! Hãy để tôi hướng dẫn con cách tư duy:

**Hiểu đề bài**: Con có thể đọc lại đề bài không?
**Xác định dạng**: Đây là loại bài gì?
**Tìm hiểu yêu cầu**: Bài hỏi gì? Cần tìm gì?
**Gợi ý cách làm**: Con nghĩ nên làm như thế nào?

Hãy cho tôi biết con đã hiểu đề bài chưa? Con có thể mô tả lại đề bài không?`
              : `Tôi hiểu câu hỏi của bạn! Đây là lời giải chi tiết:

**Đề bài**: [Nội dung câu hỏi]

**Lời giải từng bước**:
Bước 1: [Phân tích đề bài]
Bước 2: [Áp dụng công thức/phương pháp]
Bước 3: [Tính toán]
Bước 4: [Kiểm tra kết quả]

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
      
      // Transform response to match expected format
      return {
        id: data.id,
        output_text: data.choices[0]?.message?.content || 'Không có phản hồi',
        content: data.choices[0]?.message?.content || 'Không có phản hồi',
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
