// Script để test popup notification trực tiếp
console.log('🧪 Testing notification popup system...')

// Simulate a new notification
const testNotification = {
  id: 'test-popup-' + Date.now(),
  title: '🧪 Test Notification Popup',
  message: 'Đây là thông báo test để kiểm tra popup hoạt động',
  type: 'info',
  is_read: false,
  created_at: new Date().toISOString(),
  data: {}
}

console.log('📢 Dispatching test notification event:', testNotification)

// Dispatch the custom event
window.dispatchEvent(new CustomEvent('newNotification', { 
  detail: testNotification 
}))

console.log('✅ Test notification event dispatched!')
console.log('👀 Check if popup appears in top-right corner of the screen')
