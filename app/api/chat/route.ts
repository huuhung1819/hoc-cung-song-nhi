import { NextRequest, NextResponse } from 'next/server'
import { agentBuilderClient } from '@/lib/agentBuilderClient'
import { conversationManager } from '@/lib/conversationManager'
import { tokenManager } from '@/lib/tokenManager'
import { getToolsForRole } from '@/lib/agentTools'

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      message, 
      lessonContent, 
      conversationId, 
      responseId, 
      userRole,
      mode = 'coach',
      imageData,
      unlockCode
    } = await request.json()

    if (!userId || (!message && !imageData)) {
      return NextResponse.json(
        { error: 'Thiếu thông tin userId hoặc message/image' },
        { status: 400 }
      )
    }

    // Check if message is meaningful (not just "ok", "hi", etc.)
    const meaningfulWords = ['ok', 'hi', 'hello', 'chào', 'xin chào', 'cảm ơn', 'thanks', 'bye', 'tạm biệt']
    const isMeaningfulMessage = message && 
      message.trim().length > 3 && 
      !meaningfulWords.includes(message.toLowerCase().trim()) &&
      !/^[^a-zA-ZÀ-ỹ0-9]*$/.test(message) // Not just punctuation/symbols

    // Validate unlock code for solve mode
    if (mode === 'solve' && !unlockCode) {
      return NextResponse.json(
        { error: 'Cần mã mở khóa để sử dụng chế độ Solve' },
        { status: 403 }
      )
    }

    // Convert demo user ID to proper UUID format
    const actualUserId = userId.includes('demo') ? 
      `550e8400-e29b-41d4-a716-446655440000` : 
      userId

    // Check token quota only for meaningful messages
    if (isMeaningfulMessage || imageData) {
      const tokenCheck = await tokenManager.checkTokenQuota(actualUserId)
      if (!tokenCheck.hasQuota) {
        return NextResponse.json(
          { 
            error: 'Bạn đã hết lượt hôm nay. Vui lòng quay lại vào ngày mai.',
            quotaExceeded: true 
          },
          { status: 429 }
        )
      }
    }

    // Create or get conversation
    let currentConversationId = conversationId
    if (!currentConversationId) {
      currentConversationId = await conversationManager.createConversation(actualUserId)
    }

    // Process image if provided
    let processedMessage = message
    let imageForAI = null
    
    if (imageData) {
      // Send image directly to AI instead of using OCR
      imageForAI = {
        type: "image_url",
        image_url: {
          url: imageData
        }
      }
      processedMessage = message || "Phân tích bài tập trong ảnh này"
    }

    // Create mode-specific prompt
    const systemPrompt = mode === 'coach' 
      ? `Bạn là AI gia sư hỗ trợ phụ huynh dạy con. Nhiệm vụ:
        - KHÔNG đưa ra đáp án trực tiếp
        - Chỉ hướng dẫn từng bước, gợi ý cách làm
        - Đặt câu hỏi để con tự tư duy
        - Giúp phụ huynh biết cách giải thích cho con
        - Khuyến khích con tự tìm ra đáp án
        - Với bài toán đơn giản (1+1, 2+2, 3+3): chỉ gợi ý ngắn gọn, không giải thích dài
        - Với bài toán phức tạp: hướng dẫn chi tiết từng bước
        - KHÔNG sử dụng gạch đầu dòng (-) vì dễ nhầm với dấu trừ
        - Nếu có ảnh: Phân tích nội dung ảnh và chỉ hướng dẫn dựa trên nội dung thực tế trong ảnh
        - QUAN TRỌNG: Đọc kỹ lịch sử cuộc trò chuyện trước đó để hiểu context và tiếp tục từ nơi đã dừng`
      : `Bạn là AI gia sư hỗ trợ phụ huynh dạy con. Nhiệm vụ:
        - Đưa ra lời giải chi tiết từng bước
        - Giải thích rõ ràng cách làm
        - Đưa ra đáp án cuối cùng
        - Hướng dẫn phụ huynh cách dạy con hiểu bài
        - Với bài toán đơn giản (1+1, 2+2, 3+3): chỉ đưa đáp án ngắn gọn
        - Với bài toán phức tạp: giải thích chi tiết từng bước
        - KHÔNG sử dụng gạch đầu dòng (-) vì dễ nhầm với dấu trừ
        - Nếu có ảnh: Phân tích nội dung ảnh và đưa ra lời giải dựa trên nội dung thực tế trong ảnh
        - QUAN TRỌNG: Đọc kỹ lịch sử cuộc trò chuyện trước đó để hiểu context và tiếp tục từ nơi đã dừng`

    // Get workflow ID for Agent Builder
    const workflowId = agentBuilderClient.getWorkflowId()
    
    // Define tools based on user role
    const tools = getToolsForRole(userRole || 'parent')

    // Get conversation history for context
    const conversationHistory = await conversationManager.getConversationHistory(currentConversationId, actualUserId)
    
    // Prepare messages for AI with context
    // Optimize system prompt to reduce tokens
    const optimizedSystemPrompt = systemPrompt.length > 500 
      ? systemPrompt.substring(0, 500) + '...' 
      : systemPrompt
    
    const messages = [
      {
        role: 'system',
        content: optimizedSystemPrompt
      }
    ]
    
    // Add conversation history (last 3 messages to reduce token usage)
    const recentHistory = conversationHistory.slice(-3)
    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      }
    }
    
    // Add current user message with or without image
    if (imageForAI) {
      messages.push({
        role: 'user',
        content: [
          {
            type: "text",
            text: processedMessage
          },
          imageForAI
        ] as any
      })
    } else {
      messages.push({
        role: 'user',
        content: processedMessage
      })
    }

    // Log token usage for monitoring
    const totalMessagesLength = messages.reduce((total, msg) => {
      const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      return total + content.length
    }, 0)
    console.log(`📊 Token usage estimation: ${Math.ceil(totalMessagesLength / 4)} tokens (${totalMessagesLength} characters)`)
    console.log(`📋 Messages count: ${messages.length} (system + ${recentHistory.length} history + 1 current)`)

    // Get Agent response using Agent Builder with mode-specific prompt
    let response
    if (isMeaningfulMessage || imageData) {
      try {
        response = await agentBuilderClient.createRun(workflowId, messages as any)
      } catch (err: unknown) {
        console.error('Agent Builder error:', err)
        const msg = err instanceof Error ? err.message : String(err)
        throw new Error(`Agent Builder API error: ${msg}`)
      }

      // Update token usage with REAL OpenAI usage data
      if (response.usage && response.usage.total_tokens > 0) {
        try {
          const tokenUpdate = await tokenManager.updateTokenUsage(actualUserId, response.usage.total_tokens)
          console.log(`✅ Updated token usage: ${response.usage.total_tokens} tokens for user ${actualUserId}`)
          console.log(`📊 New token status: ${tokenUpdate.used}/${tokenUpdate.quota} (${((tokenUpdate.used/tokenUpdate.quota)*100).toFixed(1)}%)`)
        } catch (error) {
          console.error('Error updating token usage:', error)
          // Continue execution even if token update fails
        }
      }
    } else {
      // For non-meaningful messages, return a simple response without calling AI
      response = {
        output_text: "Tôi hiểu! Bạn có câu hỏi gì khác không?",
        usage: { total_tokens: 0 }
      }
    }

    // Save messages to database
    await conversationManager.saveMessage(currentConversationId, 'user', message)
    await conversationManager.saveMessage(currentConversationId, 'assistant', response.output_text || response.content)

    // Log token usage for meaningful messages
    let tokensUsed = 0
    if (isMeaningfulMessage || imageData) {
      tokensUsed = response.usage?.total_tokens || 0
      await tokenManager.logTokenUsage(actualUserId, tokensUsed, response.usage, mode, !!imageData)
    }

    // Get current token info for response
    const currentTokenInfo = await tokenManager.getTokenInfo(actualUserId)

    return NextResponse.json({
      reply: response.output_text || response.content,
      conversationId: currentConversationId,
      responseId: response.id,
      workflowId: workflowId,
      toolsUsed: response.tools_used || [],
      usage: response.usage,
      tokensUsed: tokensUsed,
      tokensRemaining: currentTokenInfo.remaining,
      mode: mode,
      hasImage: !!imageData
    })

  } catch (err: unknown) {
    console.error('Chat API error:', err)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xử lý tin nhắn. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const userId = searchParams.get('userId')

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: 'Thiếu conversationId hoặc userId' },
        { status: 400 }
      )
    }

    // Get conversation history
    const messages = await conversationManager.getConversationHistory(conversationId, userId)

    return NextResponse.json({ messages })

  } catch (error) {
    console.error('Get conversation error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy lịch sử chat' },
      { status: 500 }
    )
  }
}
