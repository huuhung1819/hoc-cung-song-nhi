import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { 
      subject, 
      grade, 
      testType, // '15min', '45min', '90min', 'semester'
      topic,
      difficulty,
      count 
    } = await req.json()
    
    if (!subject || !grade || !testType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create sample test data
    const questionCount = Math.min(count || 10, 10)
    const questions = []
    
    for (let i = 1; i <= questionCount; i++) {
      const questionData = generateQuestion(subject, grade, i, testType)
      questions.push({
        id: i,
        type: testType === '15min' ? 'multiple_choice' : 'essay',
        question: questionData.question,
        options: questionData.options,
        points: 1
      })
    }
    
    const answers = []
    for (let i = 1; i <= questionCount; i++) {
      answers.push(`${i}. ${testType === '15min' ? 'A' : 'Đáp án mẫu cho câu ' + i}`)
    }

    const testData = {
      title: `Đề kiểm tra - ${testType}`,
      testType,
      duration: getDuration(testType),
      questions,
      answers,
      totalPoints: questionCount,
      instructions: getInstructions(testType)
    }

    return NextResponse.json({
      success: true,
      test: testData,
      metadata: {
        subject,
        grade,
        testType,
        topic,
        difficulty,
        count: questions.length,
        duration: getDuration(testType),
        totalPoints: testData.totalPoints,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Error generating test:', error.message)
    return NextResponse.json(
      { error: 'Failed to generate test: ' + error.message },
      { status: 500 }
    )
  }
}

function getDuration(testType: string): string {
  const durations = {
    '15min': '15 phút',
    '45min': '1 tiết (45 phút)',
    '90min': '2 tiết (90 phút)',
    'semester': '3 tiết (135 phút)'
  }
  return durations[testType as keyof typeof durations] || '45 phút'
}

function getInstructions(testType: string): string {
  const instructions = {
    '15min': 'Làm bài trong 15 phút. Chọn đáp án đúng nhất cho mỗi câu hỏi.',
    '45min': 'Làm bài trong 45 phút. Phần trắc nghiệm: chọn đáp án đúng. Phần tự luận: trình bày rõ ràng, đầy đủ.',
    '90min': 'Làm bài trong 90 phút. Phần trắc nghiệm: chọn đáp án đúng. Phần tự luận: trình bày rõ ràng, đầy đủ.',
    'semester': 'Làm bài trong 135 phút. Phần trắc nghiệm: chọn đáp án đúng. Phần tự luận: trình bày rõ ràng, đầy đủ.'
  }
  return instructions[testType as keyof typeof instructions] || 'Làm bài cẩn thận, chọn đáp án đúng nhất.'
}

function generateQuestion(subject: string, grade: string, questionNumber: number, testType: string) {
  const gradeNum = parseInt(grade.replace('Lớp ', ''))
  
  if (subject === 'Toán') {
    if (gradeNum <= 3) {
      // Toán cơ bản cho lớp 1-3
      const a = Math.floor(Math.random() * 10) + 1
      const b = Math.floor(Math.random() * 10) + 1
      const operation = Math.random() > 0.5 ? '+' : '-'
      
      if (operation === '+') {
        return {
          question: `Tính: ${a} + ${b} = ?`,
          options: [
            `${a + b}`,
            `${a + b + 1}`,
            `${a + b - 1}`,
            `${a + b + 2}`
          ]
        }
      } else {
        const result = Math.max(a, b) - Math.min(a, b)
        return {
          question: `Tính: ${Math.max(a, b)} - ${Math.min(a, b)} = ?`,
          options: [
            `${result}`,
            `${result + 1}`,
            `${result - 1}`,
            `${result + 2}`
          ]
        }
      }
    } else {
      // Toán nâng cao cho lớp 4+
      const a = Math.floor(Math.random() * 100) + 1
      const b = Math.floor(Math.random() * 10) + 1
      return {
        question: `Tính: ${a} × ${b} = ?`,
        options: [
          `${a * b}`,
          `${a * b + 10}`,
          `${a * b - 10}`,
          `${a * b + 20}`
        ]
      }
    }
  } else if (subject === 'Văn') {
    const topics = [
      'Tả con mèo',
      'Tả cây bàng',
      'Kể về gia đình em',
      'Tả ngôi nhà của em',
      'Viết về người bạn thân'
    ]
    const topic = topics[Math.floor(Math.random() * topics.length)]
    
    if (testType === '15min') {
      return {
        question: `Từ nào sau đây là từ láy?`,
        options: [
          'xinh xắn',
          'bàn ghế',
          'sách vở',
          'đi đứng'
        ]
      }
    } else {
      return {
        question: `Viết một đoạn văn ngắn (5-7 câu) ${topic}.`,
        options: undefined
      }
    }
  } else if (subject === 'Tiếng Anh') {
    const words = [
      { en: 'cat', vi: 'con mèo' },
      { en: 'dog', vi: 'con chó' },
      { en: 'book', vi: 'quyển sách' },
      { en: 'house', vi: 'ngôi nhà' },
      { en: 'tree', vi: 'cây' }
    ]
    const word = words[Math.floor(Math.random() * words.length)]
    
    if (testType === '15min') {
      return {
        question: `Từ "${word.en}" có nghĩa là gì?`,
        options: [
          word.vi,
          'con mèo',
          'quyển sách',
          'ngôi nhà'
        ]
      }
    } else {
      return {
        question: `Dịch câu sau sang tiếng Anh: "${word.vi} của tôi rất đẹp."`,
        options: undefined
      }
    }
  }
  
  // Default fallback
  return {
    question: `Câu hỏi mẫu ${questionNumber}`,
    options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D']
  }
}
