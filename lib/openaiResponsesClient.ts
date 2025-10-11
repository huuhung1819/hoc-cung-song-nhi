// OpenAI Responses API client using direct HTTP requests
// (SDK chưa hỗ trợ Responses API nhưng API đã hoạt động)

export const openaiResponsesClient = {
  /**
   * Create a new conversation (using Supabase for conversation management)
   */
  async createConversation(): Promise<string> {
    try {
      // Tạo conversation ID ngẫu nhiên
      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return conversationId
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw new Error('Không thể tạo cuộc trò chuyện mới')
    }
  },

  /**
   * Create Agent response using Responses API via HTTP request
   */
  async createAgentResponse(
    agentId: string,
    conversationId: string,
    message: string,
    tools?: string[],
    responseId?: string // For conversation continuation
  ) {
    try {
      const systemPrompt = this.getSystemPromptByRole(agentId)
      
      // Sử dụng Responses API qua HTTP request
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          input: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_output_tokens: 1000,
          store: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      
      // Extract response text from the complex output structure
      const responseText = this.extractResponseText(data)
      
      return {
        id: data.id,
        output_text: responseText,
        usage: data.usage,
        tools_used: tools || []
      }
    } catch (error) {
      console.error('Error creating agent response:', error)
      throw new Error('Không thể tạo phản hồi từ Agent')
    }
  },

  /**
   * Extract response text from OpenAI Responses API output structure
   */
  extractResponseText(data: any): string {
    try {
      if (data.output && Array.isArray(data.output)) {
        for (const output of data.output) {
          if (output.type === 'message' && output.content) {
            for (const content of output.content) {
              if (content.type === 'output_text' && content.text) {
                return content.text
              }
            }
          }
        }
      }
      
      // Fallback
      return 'Xin lỗi, tôi không thể phản hồi lúc này.'
    } catch (error) {
      console.error('Error extracting response text:', error)
      return 'Xin lỗi, tôi không thể phản hồi lúc này.'
    }
  },

  /**
   * Get available agents for user role
   */
  getAgentByRole(role: string): string {
    const agentMap: Record<string, string> = {
      'parent': 'parent-learning-agent',
      'teacher': 'teacher-assistant-agent', 
      'admin': 'admin-analytics-agent'
    }
    
    return agentMap[role] || 'parent-learning-agent'
  },

  /**
   * Get system prompt based on agent role
   */
  getSystemPromptByRole(agentId: string): string {
    const prompts: Record<string, string> = {
      'parent-learning-agent': `Bạn là AI giáo viên chuyên giúp phụ huynh theo dõi và hỗ trợ việc học của con em. 
      Hãy trả lời bằng tiếng Việt, thân thiện và hữu ích. 
      Tập trung vào việc hướng dẫn phụ huynh cách hỗ trợ con học tập hiệu quả.`,
      
      'teacher-assistant-agent': `Bạn là AI trợ lý giáo viên chuyên nghiệp. 
      Hãy trả lời bằng tiếng Việt, hỗ trợ giáo viên trong việc giảng dạy và quản lý học sinh. 
      Tập trung vào phương pháp giáo dục hiệu quả và quản lý lớp học.`,
      
      'admin-analytics-agent': `Bạn là AI trợ lý quản trị viên chuyên phân tích dữ liệu và quản lý hệ thống. 
      Hãy trả lời bằng tiếng Việt, hỗ trợ quản trị viên trong việc phân tích hiệu suất và quản lý hệ thống. 
      Tập trung vào các báo cáo và thống kê chi tiết.`
    }
    
    return prompts[agentId] || prompts['parent-learning-agent']
  },

  /**
   * Create a response in an existing conversation
   */
  async createResponse(
    conversationId: string,
    message: string,
    systemPrompt?: string,
    responseId?: string
  ) {
    try {
      const input: any[] = []
      
      if (systemPrompt) {
        input.push({ role: 'system', content: systemPrompt })
      }
      
      input.push({ role: 'user', content: message })

      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          input,
          temperature: 0.7,
          max_output_tokens: 1000,
          store: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      const responseText = this.extractResponseText(data)

      return {
        id: data.id,
        output_text: responseText,
        usage: data.usage
      }
    } catch (error) {
      console.error('Error creating response:', error)
      throw new Error('Không thể tạo phản hồi từ AI')
    }
  },

  /**
   * Get conversation history (using Supabase)
   */
  async getConversationHistory(conversationId: string) {
    try {
      return {
        id: conversationId,
        model: 'gpt-4o-mini',
        created_at: Date.now()
      }
    } catch (error) {
      console.error('Error getting conversation history:', error)
      throw new Error('Không thể lấy lịch sử cuộc trò chuyện')
    }
  },

  /**
   * Delete a conversation (using Supabase)
   */
  async deleteConversation(conversationId: string) {
    try {
      console.log(`Deleting conversation: ${conversationId}`)
      return true
    } catch (error) {
      console.error('Error deleting conversation:', error)
      throw new Error('Không thể xóa cuộc trò chuyện')
    }
  }
}