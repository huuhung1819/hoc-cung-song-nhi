/**
 * Comprehensive Permission System
 * Role-Based Access Control (RBAC) for AI Learning Platform
 */

// =============================================
// 1. PERMISSION DEFINITIONS
// =============================================

export const PERMISSIONS = {
  // User Management
  'users.view': 'Xem danh sách người dùng',
  'users.create': 'Tạo người dùng mới',
  'users.edit': 'Chỉnh sửa thông tin người dùng',
  'users.delete': 'Xóa người dùng',
  'users.manage_roles': 'Quản lý vai trò người dùng',
  'users.edit_own': 'Chỉnh sửa thông tin cá nhân (tài khoản riêng)',

  // Student Management
  'students.view': 'Xem danh sách học sinh',
  'students.create': 'Thêm học sinh mới',
  'students.edit': 'Chỉnh sửa thông tin học sinh',
  'students.delete': 'Xóa học sinh',
  'students.assign_teacher': 'Gán giáo viên cho học sinh',

  // Teacher Management
  'teachers.view': 'Xem danh sách giáo viên',
  'teachers.create': 'Thêm giáo viên mới',
  'teachers.edit': 'Chỉnh sửa thông tin giáo viên',
  'teachers.delete': 'Xóa giáo viên',

  // Assignment Management
  'assignments.view': 'Xem bài tập',
  'assignments.create': 'Tạo bài tập mới',
  'assignments.edit': 'Chỉnh sửa bài tập',
  'assignments.delete': 'Xóa bài tập',
  'assignments.grade': 'Chấm điểm bài tập',
  'assignments.assign': 'Giao bài tập cho học sinh',

  // Lesson Management
  'lessons.view': 'Xem bài học',
  'lessons.create': 'Tạo bài học mới',
  'lessons.edit': 'Chỉnh sửa bài học',
  'lessons.delete': 'Xóa bài học',
  'lessons.publish': 'Xuất bản bài học',

  // Analytics & Reports
  'analytics.view': 'Xem báo cáo thống kê',
  'analytics.class': 'Xem báo cáo lớp học',
  'analytics.student': 'Xem báo cáo học sinh',
  'analytics.system': 'Xem báo cáo hệ thống',

  // System Management
  'system.config': 'Cấu hình hệ thống',
  'system.backup': 'Sao lưu dữ liệu',
  'system.restore': 'Khôi phục dữ liệu',
  'system.logs': 'Xem nhật ký hệ thống',

  // Content Management
  'content.manage': 'Quản lý nội dung',
  'content.moderate': 'Kiểm duyệt nội dung',
  'content.publish': 'Xuất bản nội dung',

  // Notifications
  'notifications.view': 'Xem thông báo',
  'notifications.send': 'Gửi thông báo',
  'notifications.manage': 'Quản lý thông báo',

  // Token Management
  'tokens.view': 'Xem thông tin token',
  'tokens.manage': 'Quản lý token',
  'tokens.reset': 'Reset token quota',

  // AI Features
  'ai.generate_exercises': 'Sinh bài tập bằng AI',
  'ai.generate_lessons': 'Sinh bài học bằng AI',
  'ai.chat': 'Sử dụng AI chat',
  'ai.advanced_features': 'Sử dụng tính năng AI nâng cao'
} as const

export type Permission = keyof typeof PERMISSIONS

// =============================================
// 2. ROLE DEFINITIONS
// =============================================

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher', 
  PARENT: 'parent',
  STUDENT: 'student'
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

// =============================================
// 3. ROLE-PERMISSION MAPPING
// =============================================

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: [
    // Full access to everything
    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage_roles',
    'students.view', 'students.create', 'students.edit', 'students.delete', 'students.assign_teacher',
    'teachers.view', 'teachers.create', 'teachers.edit', 'teachers.delete',
    'assignments.view', 'assignments.create', 'assignments.edit', 'assignments.delete', 'assignments.grade', 'assignments.assign',
    'lessons.view', 'lessons.create', 'lessons.edit', 'lessons.delete', 'lessons.publish',
    'analytics.view', 'analytics.class', 'analytics.student', 'analytics.system',
    'system.config', 'system.backup', 'system.restore', 'system.logs',
    'content.manage', 'content.moderate', 'content.publish',
    'notifications.view', 'notifications.send', 'notifications.manage',
    'tokens.view', 'tokens.manage', 'tokens.reset',
    'ai.generate_exercises', 'ai.generate_lessons', 'ai.chat', 'ai.advanced_features'
  ],

  [ROLES.TEACHER]: [
    // Teacher-specific permissions
    'students.view', 'students.create', 'students.edit', 'students.assign_teacher',
    'assignments.view', 'assignments.create', 'assignments.edit', 'assignments.grade', 'assignments.assign',
    'lessons.view', 'lessons.create', 'lessons.edit', 'lessons.publish',
    'analytics.view', 'analytics.class', 'analytics.student',
    'notifications.view', 'notifications.send',
    'tokens.view',
    'ai.generate_exercises', 'ai.generate_lessons', 'ai.chat'
  ],

  [ROLES.PARENT]: [
    // Parent-specific permissions
    'students.view', 'students.edit', // Only their own children
    'assignments.view',
    'lessons.view',
    'analytics.view', 'analytics.student', // Only their children's analytics
    'notifications.view',
    'tokens.view',
    'ai.chat',
    'users.edit_own' // Có thể sửa thông tin tài khoản của chính mình
  ],

  [ROLES.STUDENT]: [
    // Student-specific permissions
    'assignments.view',
    'lessons.view',
    'analytics.view', 'analytics.student', // Only their own analytics
    'notifications.view',
    'tokens.view',
    'ai.chat',
    'users.edit_own' // Có thể sửa thông tin tài khoản của chính mình
  ]
}

// =============================================
// 4. ROUTE PERMISSION MAPPING
// =============================================

export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  // Admin routes
  '/admin': ['analytics.system'],
  '/admin/users': ['users.view', 'users.manage_roles'],
  '/admin/teachers': ['teachers.view', 'teachers.manage_roles'],
  '/admin/students': ['students.view', 'students.manage_roles'],
  '/admin/analytics': ['analytics.system'],
  '/admin/system': ['system.config'],

  // Teacher routes
  '/teacher': ['analytics.class'],
  '/teacher/students': ['students.view', 'students.create', 'students.edit'],
  '/teacher/assignments': ['assignments.view', 'assignments.create', 'assignments.edit'],
  '/teacher/grading': ['assignments.grade'],
  '/teacher/lessons': ['lessons.view', 'lessons.create', 'lessons.edit'],
  '/teacher/analytics': ['analytics.class'],

  // Student/Parent routes
  '/dashboard': ['analytics.student'],
  '/dashboard/assignments': ['assignments.view'],
  '/dashboard/lessons': ['lessons.view'],
  '/dashboard/progress': ['analytics.student'],
  '/dashboard/account': ['users.edit_own'], // Tất cả user có thể sửa tài khoản của mình

  // API routes
  '/api/admin/*': ['system.config'],
  '/api/teacher/*': ['assignments.create', 'students.view'],
  '/api/student/*': ['assignments.view', 'lessons.view'],
  '/api/users/*': ['users.view', 'users.edit'],
  '/api/notifications/*': ['notifications.view']
}

// =============================================
// 5. PERMISSION UTILITIES
// =============================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role | string | null | undefined, permission: Permission): boolean {
  if (!role || !Object.values(ROLES).includes(role as Role)) {
    return false
  }

  const rolePermissions = ROLE_PERMISSIONS[role as Role] || []
  return rolePermissions.includes(permission)
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role | string | null | undefined, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission))
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role | string | null | undefined, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission))
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: Role | string | null | undefined): Permission[] {
  if (!role || !Object.values(ROLES).includes(role as Role)) {
    return []
  }
  return ROLE_PERMISSIONS[role as Role] || []
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(role: Role | string | null | undefined, route: string): boolean {
  if (!role) return false

  // Find matching route pattern
  const matchingRoute = Object.keys(ROUTE_PERMISSIONS).find(pattern => {
    if (pattern.endsWith('*')) {
      return route.startsWith(pattern.slice(0, -1))
    }
    return route === pattern
  })

  if (!matchingRoute) {
    // Default to requiring basic view permission
    return hasPermission(role, 'analytics.view')
  }

  const requiredPermissions = ROUTE_PERMISSIONS[matchingRoute]
  return hasAnyPermission(role, requiredPermissions)
}

/**
 * Get user's effective permissions based on role and additional factors
 */
export function getEffectivePermissions(
  role: Role | string | null | undefined,
  userId?: string,
  additionalContext?: Record<string, any>
): Permission[] {
  const basePermissions = getPermissionsForRole(role)
  
  // Add context-specific permissions here if needed
  // For example, teachers might have additional permissions for their own students
  
  return basePermissions
}

/**
 * Check if user can perform action on specific resource
 */
export function canPerformAction(
  role: Role | string | null | undefined,
  action: Permission,
  resourceId?: string,
  resourceOwnerId?: string
): boolean {
  // Basic permission check
  if (!hasPermission(role, action)) {
    return false
  }

  // Additional resource ownership checks can be added here
  // For example, parents can only edit their own children's data
  
  return true
}
