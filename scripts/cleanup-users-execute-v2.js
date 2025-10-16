/**
 * Execute script v2: XÓA users KHÔNG phải admin/teacher
 * Xử lý đầy đủ FK constraints
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

    const userIds = usersToDelete.map(u => u.id)

    // Step 2: Delete related data in correct order
    console.log('🗑️  Đang xóa dữ liệu liên quan...\n')

    // 2.1: Delete student_assignments first (child of assignments)
    console.log('   Xóa student_assignments...')
    const { error: studentAssignError } = await supabase
      .from('student_assignments')
      .delete()
      .in('student_id', userIds)
    
    if (studentAssignError) {
      console.warn('   ⚠️  Lỗi:', studentAssignError.message)
    } else {
      console.log('   ✅ Đã xóa student_assignments')
    }

    // 2.2: Delete assignments where teacher is being deleted
    console.log('   Xóa assignments (teacher_id)...')
    const { error: assignError } = await supabase
      .from('assignments')
      .delete()
      .in('teacher_id', userIds)
    
    if (assignError) {
      console.warn('   ⚠️  Lỗi:', assignError.message)
    } else {
      console.log('   ✅ Đã xóa assignments')
    }

    // 2.3: Delete conversations
    console.log('   Xóa conversations...')
    const { error: convError } = await supabase
      .from('conversations')
      .delete()
      .in('user_id', userIds)
    
    if (convError) {
      console.warn('   ⚠️  Lỗi:', convError.message)
    } else {
      console.log('   ✅ Đã xóa conversations')
    }

    // 2.4: Delete notifications
    console.log('   Xóa notifications...')
    const { error: notifError } = await supabase
      .from('notifications')
      .delete()
      .in('user_id', userIds)
    
    if (notifError) {
      console.warn('   ⚠️  Lỗi:', notifError.message)
    } else {
      console.log('   ✅ Đã xóa notifications')
    }

    // 2.5: Delete payment_requests
    console.log('   Xóa payment_requests...')
    const { error: paymentError } = await supabase
      .from('payment_requests')
      .delete()
      .in('user_id', userIds)
    
    if (paymentError) {
      console.warn('   ⚠️  Lỗi:', paymentError.message)
    } else {
      console.log('   ✅ Đã xóa payment_requests')
    }

    // 2.6: Delete teacher_students relationships
    console.log('   Xóa teacher_students (student_id)...')
    const { error: tsError } = await supabase
      .from('teacher_students')
      .delete()
      .in('student_id', userIds)
    
    if (tsError) {
      console.warn('   ⚠️  Lỗi:', tsError.message)
    } else {
      console.log('   ✅ Đã xóa teacher_students')
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

    console.log(`✅ ĐÃ XÓA THÀNH CÔNG ${usersToDelete.length} USERS!\n`)

    // Step 4: Verify
    const { data: remainingUsers, error: verifyError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .order('role', { ascending: true })

    if (!verifyError && remainingUsers) {
      console.log('📊 USERS CÒN LẠI:')
      console.log(`   Tổng: ${remainingUsers.length}\n`)
      
      const admins = remainingUsers.filter(u => u.role === 'admin')
      const teachers = remainingUsers.filter(u => u.role === 'teacher')
      
      console.log(`   ✅ Admin: ${admins.length}`)
      admins.forEach(u => console.log(`      - ${u.name} (${u.email})`))
      
      console.log(`\n   ✅ Teacher: ${teachers.length}`)
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

