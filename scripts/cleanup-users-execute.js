/**
 * Execute script: XÓA users KHÔNG phải admin/teacher
 * ⚠️ KHÔNG THỂ HOÀN TÁC
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deleteNonAdminTeacherUsers() {
  console.log('🚀 BẮT ĐẦU XÓA USERS...\n')

  try {
    // Step 1: Get list of users to delete
    const { data: usersToDelete, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .not('role', 'in', '("admin","teacher")')

    if (fetchError) {
      console.error('❌ Lỗi khi lấy danh sách users:', fetchError)
      return
    }

    console.log(`📋 Tìm thấy ${usersToDelete.length} users cần xóa\n`)

    if (usersToDelete.length === 0) {
      console.log('✅ Không có users nào cần xóa')
      return
    }

    // Step 2: Delete related data first (to avoid FK constraints)
    const userIds = usersToDelete.map(u => u.id)

    console.log('🗑️  Đang xóa dữ liệu liên quan...')

    // Delete notifications
    const { error: notifError } = await supabase
      .from('notifications')
      .delete()
      .in('user_id', userIds)
    
    if (notifError) {
      console.warn('⚠️  Lỗi khi xóa notifications:', notifError.message)
    } else {
      console.log('   ✅ Đã xóa notifications')
    }

    // Delete student_assignments (if they are students)
    const { error: assignError } = await supabase
      .from('student_assignments')
      .delete()
      .in('student_id', userIds)
    
    if (assignError) {
      console.warn('⚠️  Lỗi khi xóa student_assignments:', assignError.message)
    } else {
      console.log('   ✅ Đã xóa student_assignments')
    }

    // Delete conversations
    const { error: convError } = await supabase
      .from('conversations')
      .delete()
      .in('user_id', userIds)
    
    if (convError) {
      console.warn('⚠️  Lỗi khi xóa conversations:', convError.message)
    } else {
      console.log('   ✅ Đã xóa conversations')
    }

    // Delete payment_requests
    const { error: paymentError } = await supabase
      .from('payment_requests')
      .delete()
      .in('user_id', userIds)
    
    if (paymentError) {
      console.warn('⚠️  Lỗi khi xóa payment_requests:', paymentError.message)
    } else {
      console.log('   ✅ Đã xóa payment_requests')
    }

    // Step 3: Delete users
    console.log('\n🗑️  Đang xóa users từ bảng users...')
    
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .not('role', 'in', '("admin","teacher")')

    if (deleteError) {
      console.error('❌ Lỗi khi xóa users:', deleteError)
      return
    }

    console.log(`\n✅ ĐÃ XÓA THÀNH CÔNG ${usersToDelete.length} USERS!\n`)

    // Step 4: Verify
    const { data: remainingUsers, error: verifyError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .order('role', { ascending: true })

    if (!verifyError && remainingUsers) {
      console.log('📊 USERS CÒN LẠI:')
      console.log(`   Tổng: ${remainingUsers.length}`)
      
      const admins = remainingUsers.filter(u => u.role === 'admin')
      const teachers = remainingUsers.filter(u => u.role === 'teacher')
      
      console.log(`   Admin: ${admins.length}`)
      admins.forEach(u => console.log(`      - ${u.name} (${u.email})`))
      
      console.log(`   Teacher: ${teachers.length}`)
      teachers.forEach(u => console.log(`      - ${u.name} (${u.email})`))
    }

  } catch (error) {
    console.error('❌ Lỗi không mong muốn:', error)
  }
}

deleteNonAdminTeacherUsers()
  .then(() => {
    console.log('\n✅ Hoàn tất!')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Lỗi:', error)
    process.exit(1)
  })

