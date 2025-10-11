import { createServiceClient } from './supabaseServer'

export const conversationManager = {
  /**
   * Create a new conversation for a user
   */
  async createConversation(userId: string): Promise<string> {
    const supabase = createServiceClient() // Use service client to bypass RLS

    try {
      // Generate a unique conversation ID
      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          conversation_id: conversationId,
          title: 'Cuộc trò chuyện mới'
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return conversationId
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw new Error('Không thể tạo cuộc trò chuyện mới')
    }
  },

  /**
   * Save a message to conversation
   */
  async saveMessage(conversationId: string, role: 'user' | 'assistant' | 'system', content: string, responseId?: string) {
    const supabase = createServiceClient()

    try {
      // Get conversation record
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('conversation_id', conversationId)
        .single()

      if (convError || !conversation) {
        throw new Error('Không tìm thấy cuộc trò chuyện')
      }

      // Save message
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          role,
          content
        })

      if (error) {
        throw error
      }

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id)

    } catch (error) {
      console.error('Error saving message:', error)
      throw new Error('Không thể lưu tin nhắn')
    }
  },

  /**
   * Get conversation history
   */
  async getConversationHistory(conversationId: string, userId: string) {
    const supabase = createServiceClient()

    try {
      // Verify conversation belongs to user
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .single()

      if (convError || !conversation) {
        throw new Error('Không tìm thấy cuộc trò chuyện')
      }

      // Get messages
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }

      return messages || []
    } catch (error) {
      console.error('Error getting conversation history:', error)
      throw new Error('Không thể lấy lịch sử cuộc trò chuyện')
    }
  },


  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string, userId: string) {
    const supabase = createServiceClient()

    try {
      // Verify conversation belongs to user
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .single()

      if (convError || !conversation) {
        throw new Error('Không tìm thấy cuộc trò chuyện')
      }

      // Delete messages first
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversation.id)

      // Delete conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversation.id)

      if (error) {
        throw error
      }

    } catch (error) {
      console.error('Error deleting conversation:', error)
      throw new Error('Không thể xóa cuộc trò chuyện')
    }
  },

  /**
   * Get user's recent conversations
   */
  async getUserConversations(userId: string, limit: number = 5) {
    const supabase = createServiceClient()

    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('conversation_id, title, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      return conversations || []

    } catch (error) {
      console.error('Error getting user conversations:', error)
      throw new Error('Không thể lấy danh sách cuộc trò chuyện')
    }
  }
}
