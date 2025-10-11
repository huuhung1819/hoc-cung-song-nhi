import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json()

    if (!imageData) {
      return NextResponse.json(
        { error: 'Thiếu dữ liệu ảnh' },
        { status: 400 }
      )
    }

    // Simulate OCR processing
    // In real implementation, you would use services like:
    // - Google Cloud Vision API
    // - Azure Computer Vision
    // - AWS Textract
    // - Tesseract.js
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate processing time

    // Mock OCR result with different examples
    const mockExamples = [
      "Bài tập: Tính 2 + 3 = ?\n\nHướng dẫn: Cộng hai số tự nhiên",
      "Toán lớp 1: 5 - 2 = ?\n\nTìm kết quả của phép trừ",
      "Bài tập: 3 × 4 = ?\n\nTính kết quả phép nhân",
      "Toán: 8 ÷ 2 = ?\n\nChia hai số tự nhiên",
      "Bài tập: So sánh 7 và 5\n\nĐiền dấu >, <, hoặc ="
    ]
    
    const randomExample = mockExamples[Math.floor(Math.random() * mockExamples.length)]
    
    const mockOcrResult = {
      text: randomExample,
      confidence: 0.95,
      language: "vi",
      blocks: [
        {
          text: randomExample.split('\n')[0],
          confidence: 0.98,
          boundingBox: { x: 10, y: 20, width: 200, height: 30 }
        },
        {
          text: randomExample.split('\n')[2] || "Hướng dẫn: Làm bài tập",
          confidence: 0.92,
          boundingBox: { x: 10, y: 60, width: 250, height: 25 }
        }
      ]
    }

    return NextResponse.json({
      success: true,
      ocrResult: mockOcrResult,
      processingTime: 1000
    })

  } catch (error) {
    console.error('OCR API error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
