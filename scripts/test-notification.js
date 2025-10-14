// Script để test hệ thống thông báo
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
})

async function testNotificationSystem() {
  try {
    console.log('🧪 Testing notification system...')

    // 1. Tìm một student user để gửi thông báo
    const { data: students, error: studentError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('role', 'parent')
      .limit(1)

    if (studentError || !students || students.length === 0) {
      console.error('❌ No students found:', studentError)
      return
    }

    const student = students[0]
    console.log('✅ Found student:', student.name, student.email)

    // 2. Tạo thông báo test
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: student.id,
        type: 'info', // Sử dụng 'info' để tránh constraint error
        title: '📚 Bài tập mới từ giáo viên',
        message: 'Giáo viên đã giao bài tập Toán - Phép nhân. Hạn nộp: 24/01/2024',
        data: { assignment_id: 'test-assignment-123' },
        is_read: false
      })
      .select()
      .single()

    if (notificationError) {
      console.error('❌ Error creating notification:', notificationError)
      return
    }

    console.log('✅ Test notification created:', notification.id)

    // 3. Kiểm tra thông báo có được tạo không
    const { data: checkNotification, error: checkError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notification.id)
      .single()

    if (checkError || !checkNotification) {
      console.error('❌ Error checking notification:', checkError)
      return
    }

    console.log('✅ Notification verified:', {
      id: checkNotification.id,
      title: checkNotification.title,
      message: checkNotification.message,
      type: checkNotification.type,
      is_read: checkNotification.is_read
    })

    console.log('\n🎉 Notification system test completed successfully!')
    console.log('\n📱 To test the popup:')
    console.log(`1. Login as student: ${student.email}`)
    console.log('2. Go to dashboard')
    console.log('3. Wait for notification popup to appear (max 3 seconds)')
    console.log('4. Check if popup shows with title:', checkNotification.title)

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    process.exit(0)
  }
}

testNotificationSystem()
