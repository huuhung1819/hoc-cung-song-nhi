/**
 * Preview script: Xem danh sách users sẽ bị xóa
 * Chỉ giữ lại admin và teacher
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

async function previewUsersToDelete() {
  console.log('🔍 ĐANG KIỂM TRA USERS...\n')

  // Count users by role
  const { data: allUsers, error: countError } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false })

  if (countError) {
    console.error('❌ Lỗi khi đếm users:', countError)
    return
  }

  const adminUsers = allUsers.filter(u => u.role === 'admin')
  const teacherUsers = allUsers.filter(u => u.role === 'teacher')
  const otherUsers = allUsers.filter(u => u.role !== 'admin' && u.role !== 'teacher')

  console.log('📊 THỐNG KÊ USERS HIỆN TẠI:')
  console.log(`   Tổng số users: ${allUsers.length}`)
  console.log(`   ✅ Admin: ${adminUsers.length} (GIỮ LẠI)`)
  console.log(`   ✅ Teacher: ${teacherUsers.length} (GIỮ LẠI)`)
  console.log(`   ❌ Khác (parent/student): ${otherUsers.length} (SẼ XÓA)\n`)

  console.log('👥 DANH SÁCH USERS SẼ GIỮ LẠI:\n')
  console.log('Admin:')
  adminUsers.forEach(u => {
    console.log(`   - ${u.name || 'N/A'} (${u.email}) - ID: ${u.id}`)
  })
  
  console.log('\nTeacher:')
  teacherUsers.forEach(u => {
    console.log(`   - ${u.name || 'N/A'} (${u.email}) - ID: ${u.id}`)
  })

  console.log('\n\n🗑️  DANH SÁCH USERS SẼ BỊ XÓA:\n')
  otherUsers.forEach(u => {
    console.log(`   - ${u.name || 'N/A'} (${u.email}) - Role: ${u.role} - ID: ${u.id}`)
  })

  console.log('\n\n⚠️  CẢNH BÁO:')
  console.log(`   - Sẽ xóa ${otherUsers.length} users`)
  console.log(`   - Các dữ liệu liên quan (assignments, notifications, etc.) có thể bị ảnh hưởng`)
  console.log(`   - Thao tác KHÔNG THỂ HOÀN TÁC\n`)
}

previewUsersToDelete()
  .then(() => {
    console.log('✅ Preview hoàn tất')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Lỗi:', error)
    process.exit(1)
  })

