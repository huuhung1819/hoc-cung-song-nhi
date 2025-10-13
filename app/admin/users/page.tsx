'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Shield, 
  GraduationCap, 
  UserCheck,
  Search,
  RefreshCw,
  MoreVertical,
  Ban,
  UserCog,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'teacher' | 'parent'
  plan: string
  status: string
  lastActive: string
  createdAt: string
  tokensUsed: number
}

interface Stats {
  total: number
  active: number
  admins: number
  teachers: number
  parents: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, admins: 0, teachers: 0, parents: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Modal states
  const [changeRoleModal, setChangeRoleModal] = useState<{ open: boolean; user: User | null; newRole: string }>({
    open: false,
    user: null,
    newRole: ''
  })
  const [banModal, setBanModal] = useState<{ open: boolean; user: User | null; action: 'ban' | 'unban' }>({
    open: false,
    user: null,
    action: 'ban'
  })
  const [processing, setProcessing] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        throw new Error('Không thể tải danh sách users')
      }
      
      const data = await response.json()
      setUsers(data)
      
      // Calculate stats
      const statsData = {
        total: data.length,
        active: data.filter((u: User) => u.status === 'active').length,
        admins: data.filter((u: User) => u.role === 'admin').length,
        teachers: data.filter((u: User) => u.role === 'teacher').length,
        parents: data.filter((u: User) => u.role === 'parent').length
      }
      setStats(statsData)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...users]
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }
    
    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  const handleChangeRole = async () => {
    if (!changeRoleModal.user || !changeRoleModal.newRole) return
    
    setProcessing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: changeRoleModal.user.id,
          action: 'change_role',
          newRole: changeRoleModal.newRole
        })
      })
      
      if (!response.ok) {
        throw new Error('Không thể thay đổi role')
      }
      
      setSuccess(`Đã thay đổi role của ${changeRoleModal.user.name} thành ${changeRoleModal.newRole}`)
      setChangeRoleModal({ open: false, user: null, newRole: '' })
      await fetchUsers()
      
      // Clear success message after 3s
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setProcessing(false)
    }
  }

  const handleBanUnban = async () => {
    if (!banModal.user) return
    
    setProcessing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: banModal.user.id,
          action: banModal.action
        })
      })
      
      if (!response.ok) {
        throw new Error(`Không thể ${banModal.action === 'ban' ? 'khóa' : 'mở khóa'} tài khoản`)
      }
      
      setSuccess(`Đã ${banModal.action === 'ban' ? 'khóa' : 'mở khóa'} tài khoản ${banModal.user.name}`)
      setBanModal({ open: false, user: null, action: 'ban' })
      await fetchUsers()
      
      // Clear success message after 3s
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setProcessing(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      teacher: 'bg-green-100 text-green-800 border-green-200',
      parent: 'bg-blue-100 text-blue-800 border-blue-200'
    }
    
    const icons = {
      admin: <Shield className="h-3 w-3 mr-1" />,
      teacher: <GraduationCap className="h-3 w-3 mr-1" />,
      parent: <Users className="h-3 w-3 mr-1" />
    }
    
    return (
      <Badge className={`${colors[role as keyof typeof colors] || colors.parent} flex items-center gap-1`}>
        {icons[role as keyof typeof icons]}
        {role}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      )
    }
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
        <Ban className="h-3 w-3" />
        Banned
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quản lý người dùng
              </h1>
              <p className="text-gray-600">
                Quản lý tài khoản, phân quyền và trạng thái người dùng
              </p>
            </div>
            <Button
              onClick={fetchUsers}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Teachers</p>
                  <p className="text-2xl font-bold text-green-600">{stats.teachers}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Parents</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.parents}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo email hoặc tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả role</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách người dùng ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Quản lý thông tin và quyền truy cập của người dùng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 px-4 font-medium text-gray-600">User</th>
                    <th className="pb-3 px-4 font-medium text-gray-600">Role</th>
                    <th className="pb-3 px-4 font-medium text-gray-600">Plan</th>
                    <th className="pb-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="pb-3 px-4 font-medium text-gray-600">Tokens</th>
                    <th className="pb-3 px-4 font-medium text-gray-600">Tạo lúc</th>
                    <th className="pb-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600 capitalize">{user.plan}</span>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{user.tokensUsed}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{user.createdAt}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          {user.role !== 'admin' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setChangeRoleModal({ open: true, user, newRole: user.role })}
                              >
                                <UserCog className="h-4 w-4 mr-1" />
                                Đổi role
                              </Button>
                              
                              {user.status === 'active' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setBanModal({ open: true, user, action: 'ban' })}
                                >
                                  <Ban className="h-4 w-4 mr-1" />
                                  Ban
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => setBanModal({ open: true, user, action: 'unban' })}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Unban
                                </Button>
                              )}
                            </>
                          )}
                          {user.role === 'admin' && (
                            <span className="text-sm text-gray-400 italic">Protected</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Không tìm thấy user nào
                  </h3>
                  <p className="text-gray-600">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Change Role Modal */}
        <Dialog open={changeRoleModal.open} onOpenChange={(open) => setChangeRoleModal({ ...changeRoleModal, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thay đổi role</DialogTitle>
              <DialogDescription>
                Thay đổi role của user <strong>{changeRoleModal.user?.name}</strong>
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Label htmlFor="newRole" className="mb-2 block">Chọn role mới</Label>
              <Select 
                value={changeRoleModal.newRole} 
                onValueChange={(value) => setChangeRoleModal({ ...changeRoleModal, newRole: value })}
              >
                <SelectTrigger id="newRole">
                  <SelectValue placeholder="Chọn role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              
              <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  <strong>Lưu ý:</strong> Thay đổi role sẽ ảnh hưởng đến quyền truy cập của user.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setChangeRoleModal({ open: false, user: null, newRole: '' })}
                disabled={processing}
              >
                Hủy
              </Button>
              <Button 
                onClick={handleChangeRole}
                disabled={processing || !changeRoleModal.newRole || changeRoleModal.newRole === changeRoleModal.user?.role}
              >
                {processing ? 'Đang xử lý...' : 'Xác nhận'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ban/Unban Modal */}
        <Dialog open={banModal.open} onOpenChange={(open) => setBanModal({ ...banModal, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {banModal.action === 'ban' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
              </DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn {banModal.action === 'ban' ? 'khóa' : 'mở khóa'} tài khoản <strong>{banModal.user?.name}</strong>?
              </DialogDescription>
            </DialogHeader>
            
            <Alert className={`mt-4 ${banModal.action === 'ban' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
              <AlertTriangle className={`h-4 w-4 ${banModal.action === 'ban' ? 'text-red-600' : 'text-green-600'}`} />
              <AlertDescription className={banModal.action === 'ban' ? 'text-red-700' : 'text-green-700'}>
                {banModal.action === 'ban' 
                  ? 'User sẽ không thể đăng nhập vào hệ thống sau khi bị khóa.'
                  : 'User sẽ có thể đăng nhập trở lại sau khi mở khóa.'}
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setBanModal({ open: false, user: null, action: 'ban' })}
                disabled={processing}
              >
                Hủy
              </Button>
              <Button 
                onClick={handleBanUnban}
                disabled={processing}
                className={banModal.action === 'ban' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {processing ? 'Đang xử lý...' : 'Xác nhận'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

