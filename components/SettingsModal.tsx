'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Bell, Shield, Palette, Globe, Volume2, VolumeX } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      lessons: true,
      achievements: true,
      reminders: false
    },
    privacy: {
      profileVisibility: 'private',
      showProgress: true,
      allowMessages: false
    },
    appearance: {
      theme: 'light',
      language: 'vi',
      fontSize: 'medium'
    },
    audio: {
      soundEffects: true,
      voiceGuidance: true,
      volume: 70
    }
  })

  const [activeTab, setActiveTab] = useState('notifications')

  if (!isOpen) return null

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }))
  }

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('userSettings', JSON.stringify(settings))
    onClose()
  }

  const tabs = [
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'privacy', label: 'Quyền riêng tư', icon: Shield },
    { id: 'appearance', label: 'Giao diện', icon: Palette },
    { id: 'audio', label: 'Âm thanh', icon: Volume2 }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Cài đặt</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông báo</h3>
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Email</CardTitle>
                        <CardDescription>Nhận thông báo qua email</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.notifications.email}
                            onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">Bật thông báo email</span>
                        </label>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Thông báo đẩy</CardTitle>
                        <CardDescription>Nhận thông báo trên trình duyệt</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.notifications.push}
                            onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">Bật thông báo đẩy</span>
                        </label>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Loại thông báo</CardTitle>
                        <CardDescription>Chọn loại thông báo bạn muốn nhận</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.notifications.lessons}
                            onChange={(e) => handleSettingChange('notifications', 'lessons', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">Bài học mới</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.notifications.achievements}
                            onChange={(e) => handleSettingChange('notifications', 'achievements', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">Thành tích</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.notifications.reminders}
                            onChange={(e) => handleSettingChange('notifications', 'reminders', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">Nhắc nhở học tập</span>
                        </label>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quyền riêng tư</h3>
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Hiển thị hồ sơ</CardTitle>
                        <CardDescription>Ai có thể xem hồ sơ của bạn</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <select
                          value={settings.privacy.profileVisibility}
                          onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="private">Riêng tư</option>
                          <option value="friends">Bạn bè</option>
                          <option value="public">Công khai</option>
                        </select>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Tiến độ học tập</CardTitle>
                        <CardDescription>Hiển thị tiến độ học tập</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.privacy.showProgress}
                            onChange={(e) => handleSettingChange('privacy', 'showProgress', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">Hiển thị tiến độ học tập</span>
                        </label>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Tin nhắn</CardTitle>
                        <CardDescription>Cho phép người khác gửi tin nhắn</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.privacy.allowMessages}
                            onChange={(e) => handleSettingChange('privacy', 'allowMessages', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">Cho phép nhận tin nhắn</span>
                        </label>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Giao diện</h3>
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Chủ đề</CardTitle>
                        <CardDescription>Chọn chủ đề giao diện</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <select
                          value={settings.appearance.theme}
                          onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="light">Sáng</option>
                          <option value="dark">Tối</option>
                          <option value="auto">Tự động</option>
                        </select>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Ngôn ngữ</CardTitle>
                        <CardDescription>Chọn ngôn ngữ hiển thị</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <select
                          value={settings.appearance.language}
                          onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="vi">Tiếng Việt</option>
                          <option value="en">English</option>
                        </select>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Cỡ chữ</CardTitle>
                        <CardDescription>Chọn cỡ chữ phù hợp</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <select
                          value={settings.appearance.fontSize}
                          onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="small">Nhỏ</option>
                          <option value="medium">Vừa</option>
                          <option value="large">Lớn</option>
                        </select>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Âm thanh</h3>
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Hiệu ứng âm thanh</CardTitle>
                        <CardDescription>Bật/tắt hiệu ứng âm thanh</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.audio.soundEffects}
                            onChange={(e) => handleSettingChange('audio', 'soundEffects', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">Bật hiệu ứng âm thanh</span>
                        </label>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Hướng dẫn bằng giọng nói</CardTitle>
                        <CardDescription>Bật/tắt hướng dẫn bằng giọng nói</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.audio.voiceGuidance}
                            onChange={(e) => handleSettingChange('audio', 'voiceGuidance', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">Bật hướng dẫn bằng giọng nói</span>
                        </label>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Âm lượng</CardTitle>
                        <CardDescription>Điều chỉnh âm lượng</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.audio.volume}
                            onChange={(e) => handleSettingChange('audio', 'volume', parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>0%</span>
                            <span>{settings.audio.volume}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave}>
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  )
}
