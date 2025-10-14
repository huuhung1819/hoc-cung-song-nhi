#!/usr/bin/env node

/**
 * Test script for Account Page API endpoints
 * Tests: GET /api/user/profile, PUT /api/user/profile, POST /api/user/profile
 */

const API_BASE = 'http://localhost:3000'

async function testProfileAPI() {
  console.log('🧪 Testing Account Page API Endpoints...\n')
  
  // Test data
  const testUserId = 'test-user-id' // Replace with actual user ID
  const testData = {
    userId: testUserId,
    name: 'Test User Updated',
    phone: '0123456789',
    grade: 'Lớp 5',
    notifications: {
      emailUpdates: true,
      lessonReminders: false,
      progressReports: true,
      promotions: false
    }
  }
  
  try {
    // Test 1: GET Profile
    console.log('1️⃣ Testing GET /api/user/profile...')
    const getResponse = await fetch(`${API_BASE}/api/user/profile?userId=${testUserId}`)
    const getData = await getResponse.json()
    
    if (getResponse.ok) {
      console.log('✅ GET Profile Success')
      console.log('   User:', getData.user?.name || 'N/A')
      console.log('   Email:', getData.user?.email || 'N/A')
      console.log('   Grade:', getData.user?.grade || 'N/A')
      console.log('   Stats:', getData.stats || 'N/A')
    } else {
      console.log('❌ GET Profile Failed:', getData.error)
    }
    
    console.log('')
    
    // Test 2: PUT Profile Update
    console.log('2️⃣ Testing PUT /api/user/profile...')
    const putResponse = await fetch(`${API_BASE}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    const putData = await putResponse.json()
    
    if (putResponse.ok) {
      console.log('✅ PUT Profile Update Success')
      console.log('   Message:', putData.message)
      console.log('   Updated User:', putData.user?.name || 'N/A')
    } else {
      console.log('❌ PUT Profile Update Failed:', putData.error)
    }
    
    console.log('')
    
    // Test 3: POST Password Change
    console.log('3️⃣ Testing POST /api/user/profile (Password Change)...')
    const postResponse = await fetch(`${API_BASE}/api/user/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId,
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123'
      })
    })
    const postData = await postResponse.json()
    
    if (postResponse.ok) {
      console.log('✅ POST Password Change Success')
      console.log('   Message:', postData.message)
    } else {
      console.log('❌ POST Password Change Failed:', postData.error)
    }
    
    console.log('')
    console.log('🎉 API Testing Complete!')
    
  } catch (error) {
    console.error('💥 Test Error:', error.message)
  }
}

// Run tests
testProfileAPI()


