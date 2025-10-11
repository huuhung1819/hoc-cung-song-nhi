import { NextRequest, NextResponse } from 'next/server'
import { conversationManager } from '@/lib/conversationManager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!userId) {
      return NextResponse.json(
        { error: 'Thiếu userId' },
        { status: 400 }
      )
    }

    // Get recent conversations for the user
    let conversations = []
    try {
      conversations = await conversationManager.getUserConversations(userId, limit)
    } catch (error) {
      console.log('No conversations found, returning empty list')
    }
    
    // Get recent messages from each conversation
    const recentQuestions = []
    
    for (const conv of conversations) {
      try {
        const messages = await conversationManager.getConversationHistory(conv.conversation_id, userId)
        
        // Find the first user message in each conversation
        const firstUserMessage = messages.find(msg => msg.role === 'user')
        if (firstUserMessage) {
          recentQuestions.push({
            id: conv.conversation_id,
            title: firstUserMessage.content.length > 50 
              ? firstUserMessage.content.substring(0, 50) + '...' 
              : firstUserMessage.content,
            subject: 'AI Hỗ trợ',
            grade: 'Tất cả',
            progress: 100,
            completed: true,
            timestamp: firstUserMessage.created_at,
            conversationId: conv.conversation_id
          })
        }
      } catch (error) {
        console.log('Error getting messages for conversation:', conv.conversation_id)
      }
    }

    return NextResponse.json({
      success: true,
      questions: recentQuestions
    })

  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy lịch sử chat' },
      { status: 500 }
    )
  }
}
