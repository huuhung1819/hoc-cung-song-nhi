'use client'

import { useState, useRef, useEffect } from 'react'
import { Key, Lock, Unlock, Eye, EyeOff, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UnlockCodeButton() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [unlockMethod, setUnlockMethod] = useState<'question' | 'code'>('question')
  const [showChangeCodeModal, setShowChangeCodeModal] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [confirmCode, setConfirmCode] = useState('')
  const [changeCodeAnswer, setChangeCodeAnswer] = useState('')
  
  // Load unlock code from localStorage on component mount
  const [currentCode, setCurrentCode] = useState('1234') // Mã 4 số

  useEffect(() => {
    const savedCode = localStorage.getItem('unlockCode')
    if (savedCode) {
      setCurrentCode(savedCode)
    }
    
    // Load unlock state from localStorage
    const savedUnlockState = localStorage.getItem('isUnlocked')
    if (savedUnlockState === 'true') {
      setIsUnlocked(true)
    }
  }, [])

  // Listen for unlock state changes from other components
  useEffect(() => {
    const handleUnlockStateChange = () => {
      const savedUnlockState = localStorage.getItem('isUnlocked')
      setIsUnlocked(savedUnlockState === 'true')
    }

    window.addEventListener('unlockStateChanged', handleUnlockStateChange)
    return () => window.removeEventListener('unlockStateChanged', handleUnlockStateChange)
  }, [])
  
  
  // Form states
  const [codeInput, setCodeInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  const popupRef = useRef<HTMLDivElement>(null)

  // Load unlock state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('isUnlocked')
    if (saved === 'true') {
      setIsUnlocked(true)
    }
    const savedCode = localStorage.getItem('unlockCode')
    if (savedCode) {
      setCurrentCode(savedCode)
    }
  }, [])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false)
      }
    }

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPopup])

  const handleUnlock = () => {
    setErrorMessage('')
    
    // CHỈ CÓ 1 CÁCH: Nhập mã 4 số
    if (codeInput === currentCode) {
      setIsUnlocked(true)
      localStorage.setItem('isUnlocked', 'true')
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('unlockStateChanged'))
      // Dispatch event to switch to solve mode in ChatInterface
      window.dispatchEvent(new CustomEvent('switchToSolveMode'))
      setCodeInput('')
      setShowPopup(false)
    } else {
      setErrorMessage('❌ Mã unlock không đúng!')
    }
  }


  const handleChangeCode = () => {
    setErrorMessage('')
    
    // Kiểm tra mã hiện tại trước
    if (changeCodeAnswer.trim() !== currentCode) {
      setErrorMessage('❌ Mã hiện tại không đúng!')
      return
    }
    
    // Kiểm tra mã mới
    if (newCode.length !== 4 || !/^\d{4}$/.test(newCode)) {
      setErrorMessage('❌ Mã phải có đúng 4 ký tự số!')
      return
    }
    
    if (newCode !== confirmCode) {
      setErrorMessage('❌ Mã xác nhận không khớp!')
      return
    }
    
    // Đổi mã thành công
    setCurrentCode(newCode)
    localStorage.setItem('unlockCode', newCode)
    setShowChangeCodeModal(false)
    setNewCode('')
    setConfirmCode('')
    setChangeCodeAnswer('')
  }

  const handleLock = () => {
    setIsUnlocked(false)
    localStorage.setItem('isUnlocked', 'false')
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('unlockStateChanged'))
    // Dispatch event to switch to coach mode in ChatInterface
    window.dispatchEvent(new CustomEvent('switchToCoachMode'))
  }

  return (
    <div className="relative">
      {/* Unlock Button - TEXT BUTTON */}
      <Button
        variant="outline"
        size="sm"
        data-unlock-button
        onClick={() => {
          if (isUnlocked) {
            // Đóng khóa trực tiếp khi đã unlock
            handleLock()
          } else {
            // Mở popup khi chưa unlock
            setShowPopup(!showPopup)
          }
        }}
        className="relative border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        {isUnlocked ? (
          <>
            <Lock className="w-4 h-4 mr-2 text-red-600" />
            Đóng khóa lời giải
          </>
        ) : (
          <>
            <Unlock className="w-4 h-4 mr-2 text-green-600" />
            Mở khóa lời giải
          </>
        )}
      </Button>

      {/* Popup */}
      {showPopup && (
        <div
          ref={popupRef}
          className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[600px] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Quản lý mã mở khóa xem lời giải
            </h3>
          </div>

          <div className="p-4 space-y-4">
            {/* Current Status */}
            <div className={`p-3 rounded-lg border-2 ${
              isUnlocked 
                ? 'bg-green-50 border-green-300' 
                : 'bg-gray-50 border-gray-300'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {isUnlocked ? (
                  <>
                    <Unlock className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">🔓 Đã mở khóa</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-800">🔒 Đang khóa</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-700">
                {isUnlocked 
                  ? 'AI hiển thị lời giải chi tiết' 
                  : 'AI chỉ hiển thị hướng dẫn'}
              </p>
            </div>

            {isUnlocked ? (
              /* When Unlocked - Show Lock Button */
              <>
                <div className="text-center space-y-4">
                  <div className="text-green-600 text-lg">
                    🔓 Đã mở khóa thành công!
                  </div>
                  <p className="text-sm text-gray-600">
                    AI hiện đang hiển thị lời giải chi tiết cho bài tập.
                  </p>
                  <Button
                    onClick={handleLock}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Đóng khóa ngay
                  </Button>
                </div>
              </>
            ) : (
              /* When Locked - CHỈ CÓ 1 CÁCH: Nhập mã 4 số */
              <>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔢 Nhập mã unlock (4 số):
                    </label>
                    <div className="relative">
                      <input
                        type={showCode ? 'text' : 'password'}
                        value={codeInput}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                          setCodeInput(value)
                          setErrorMessage('')
                        }}
                        placeholder="Nhập 4 số..."
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCode(!showCode)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <p className="text-sm text-red-600">{errorMessage}</p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleUnlock}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      disabled={codeInput.length !== 4}
                    >
                      Mở khóa lời giải
                    </Button>
                    <Button
                      onClick={() => setShowChangeCodeModal(true)}
                      variant="outline"
                      className="px-4"
                    >
                      Đổi mã
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Phụ huynh xem lại email nếu quên mã mở khoá lời giải.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Change Code Modal */}
      {showChangeCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Đổi mã mở khóa
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Mã mở khóa phải có đúng 4 ký tự số (0-9)
              </p>
              
              <div className="space-y-4">
                {/* Mã hiện tại */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔢 Mã hiện tại (4 ký tự số):
                  </label>
                  <input
                    type="text"
                    value={changeCodeAnswer}
                    onChange={(e) => {
                      // CHỈ CHO PHÉP NHẬP SỐ, TỐI ĐA 4 KÝ TỰ
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                      setChangeCodeAnswer(value)
                      setErrorMessage('')
                    }}
                    placeholder="Nhập mã hiện tại..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg tracking-wider"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Mã mặc định: 1234 (gửi qua email khi mua tài khoản)
                  </p>
                </div>

                {/* Mã mới */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔢 Mã mới (4 ký tự số)
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => {
                      // CHỈ CHO PHÉP NHẬP SỐ, TỐI ĐA 4 KÝ TỰ
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                      setNewCode(value)
                      setErrorMessage('')
                    }}
                    placeholder="Nhập 4 ký tự số..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg tracking-wider"
                  />
                </div>

                {/* Xác nhận mã mới */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔢 Xác nhận mã mới
                  </label>
                  <input
                    type="text"
                    value={confirmCode}
                    onChange={(e) => {
                      // CHỈ CHO PHÉP NHẬP SỐ, TỐI ĐA 4 KÝ TỰ
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                      setConfirmCode(value)
                      setErrorMessage('')
                    }}
                    placeholder="Nhập lại 4 ký tự số..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg tracking-wider"
                  />
                </div>

                {errorMessage && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={handleChangeCode}
                    className="flex-1"
                    disabled={!changeCodeAnswer.trim() || newCode.length !== 4 || confirmCode.length !== 4}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Đổi mã
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowChangeCodeModal(false)
                      setNewCode('')
                      setConfirmCode('')
                      setChangeCodeAnswer('')
                      setErrorMessage('')
                    }}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  ⚠️ Chỉ phụ huynh mới biết mã hiện tại • Mã mặc định: 1234 (gửi qua email)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

