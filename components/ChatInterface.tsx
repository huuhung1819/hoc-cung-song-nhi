'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Send, Bot, User, AlertCircle, Upload, Key, Lightbulb, CheckCircle } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  imageUrl?: string
}

interface ChatInterfaceProps {
  conversationId?: string
  userId?: string
  lessonContent?: string
  className?: string
  isUnlockMode?: boolean
  onModeChange?: (mode: 'coach' | 'solve') => void
  onNewMessage?: () => void
}

export function ChatInterface({ 
  conversationId: initialConversationId, 
  userId, 
  lessonContent,
  className,
  isUnlockMode = false,
  onModeChange,
  onNewMessage
}: ChatInterfaceProps) {
  const [conversationId, setConversationId] = useState(initialConversationId)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Xin chào! Tôi là AI gia sư hỗ trợ. Hãy gửi bài tập khó để tôi hướng dẫn con học hiệu quả! 📚',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentMode, setCurrentMode] = useState<'coach' | 'solve'>('coach')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update conversationId when prop changes
  useEffect(() => {
    setConversationId(initialConversationId)
  }, [initialConversationId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleModeChange = (mode: 'coach' | 'solve') => {
    setCurrentMode(mode)
    if (onModeChange) {
      onModeChange(mode)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !selectedImage) || isLoading) return

    // Convert image to base64 if selected
    let imageData = null
    let ocrText = ''
    if (selectedImage) {
      const reader = new FileReader()
      imageData = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(selectedImage)
      })

      // Process OCR
      try {
        const ocrResponse = await fetch('/api/ocr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageData }),
        })

        if (ocrResponse.ok) {
          const ocrData = await ocrResponse.json()
          ocrText = ocrData.ocrResult.text
        }
      } catch (error) {
        console.error('OCR error:', error)
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim() || (selectedImage ? `[Ảnh bài tập] ${ocrText || 'Đã tải ảnh bài tập'}` : ''),
      timestamp: new Date(),
      imageUrl: selectedImage ? URL.createObjectURL(selectedImage) : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          message: inputMessage.trim() || ocrText,
          lessonContent,
          conversationId,
          mode: currentMode,
          imageData,
          unlockCode: currentMode === 'solve' ? (localStorage.getItem('unlockCode') || '123456') : undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Update conversationId if provided
      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId)
      }

      // Notify parent component about new message
      if (onNewMessage) {
        onNewMessage()
      }
      
      // Notify all components about user info update
      window.dispatchEvent(new CustomEvent('userInfoUpdated'))

    } catch (error) {
      console.error('Chat error:', error)
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi tin nhắn')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {/* Mode Toggle */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Chế độ hỗ trợ</h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {currentMode === 'coach' ? 'Chỉ hướng dẫn' : 'Có lời giải'}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={currentMode === 'coach' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeChange('coach')}
              className="flex-1"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Chỉ hướng dẫn
            </Button>
            <Button
              variant={currentMode === 'solve' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeChange('solve')}
              disabled={!isUnlockMode}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Có lời giải
            </Button>
          </div>
          {!isUnlockMode && currentMode === 'solve' && (
            <p className="text-xs text-amber-600 mt-2">
              🔒 Đã đóng khóa - Chỉ có thể sử dụng chế độ hướng dẫn
            </p>
          )}
          {isUnlockMode && currentMode === 'solve' && (
            <p className="text-xs text-green-600 mt-2">
              🔓 Đã mở khóa - Có thể xem lời giải chi tiết
            </p>
          )}
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white ml-2'
                      : 'bg-gray-200 text-gray-600 mr-2'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`px-3 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        currentMode === 'coach' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {currentMode === 'coach' ? '💡 Chỉ hướng dẫn' : '✅ Có lời giải'}
                      </span>
                    </div>
                  )}
                  {message.imageUrl && (
                    <div className="mb-2">
                      <img 
                        src={message.imageUrl} 
                        alt="Bài tập" 
                        className="max-w-xs rounded-lg border"
                      />
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex flex-row">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 mr-2 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 px-3 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 pb-2">
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          {/* Image Upload */}
          {selectedImage && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img 
                    src={URL.createObjectURL(selectedImage)} 
                    alt="Preview" 
                    className="w-12 h-12 object-cover rounded"
                  />
                  <span className="text-sm text-gray-600">{selectedImage.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeImage}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </Button>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập bài tập hoặc mô tả câu hỏi..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            📷 Tải ảnh bài tập hoặc nhập text • Nhấn Enter để gửi
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
