'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/lib/authContext'
import { hasPermission, hasAnyPermission, hasAllPermissions, canAccessRoute, Permission, Role } from '@/lib/permissions'

interface PermissionGateProps {
  // Permission requirements
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean // If true, user must have ALL permissions. If false, user needs ANY permission
  
  // Role requirements
  role?: Role
  roles?: Role[]
  requireAllRoles?: boolean
  
  // Route access
  route?: string
  
  // UI behavior
  children: ReactNode
  fallback?: ReactNode
  showError?: boolean
  errorMessage?: string
  
  // Loading state
  loading?: ReactNode
  
  // Additional context
  resourceId?: string
  resourceOwnerId?: string
}

/**
 * PermissionGate Component
 * 
 * Controls access to UI components based on user permissions and roles
 * 
 * @example
 * // Basic permission check
 * <PermissionGate permission="students.manage">
 *   <ManageStudentsButton />
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (user needs ANY of them)
 * <PermissionGate permissions={['students.create', 'students.edit']}>
 *   <StudentForm />
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (user needs ALL of them)
 * <PermissionGate permissions={['students.create', 'assignments.create']} requireAll>
 *   <AdvancedStudentForm />
 * </PermissionGate>
 * 
 * @example
 * // Role-based access
 * <PermissionGate role="teacher">
 *   <TeacherOnlyContent />
 * </PermissionGate>
 * 
 * @example
 * // Route-based access
 * <PermissionGate route="/teacher/students">
 *   <StudentsPage />
 * </PermissionGate>
 * 
 * @example
 * // Custom fallback
 * <PermissionGate 
 *   permission="students.manage" 
 *   fallback={<div>Bạn không có quyền truy cập</div>}
 * >
 *   <ManageStudentsButton />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  requireAllRoles = false,
  route,
  children,
  fallback = null,
  showError = false,
  errorMessage = 'Bạn không có quyền truy cập',
  loading = null,
  resourceId,
  resourceOwnerId
}: PermissionGateProps) {
  const { user: authUser } = useAuth()

  // Get user role from auth context
  const userRole = authUser?.user_metadata?.role as Role || 'parent'

  // Check if user is authenticated
  if (!authUser) {
    return <>{fallback}</>
  }

  // Check role-based access
  if (role && userRole !== role) {
    return <>{fallback}</>
  }

  if (roles && roles.length > 0) {
    const hasRequiredRole = requireAllRoles 
      ? roles.every(r => userRole === r)
      : roles.some(r => userRole === r)
    
    if (!hasRequiredRole) {
      return <>{fallback}</>
    }
  }

  // Check permission-based access
  if (permission) {
    if (!hasPermission(userRole, permission)) {
      return showError ? (
        <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
          {errorMessage}
        </div>
      ) : <>{fallback}</>
    }
  }

  if (permissions && permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(userRole, permissions)
      : hasAnyPermission(userRole, permissions)
    
    if (!hasRequiredPermissions) {
      return showError ? (
        <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
          {errorMessage}
        </div>
      ) : <>{fallback}</>
    }
  }

  // Check route-based access
  if (route) {
    if (!canAccessRoute(userRole, route)) {
      return <>{fallback}</>
    }
  }

  // If we get here, user has required permissions
  return <>{children}</>
}

/**
 * Higher-order component for permission-based rendering
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission,
  fallback?: ReactNode
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGate permission={permission} fallback={fallback}>
        <Component {...props} />
      </PermissionGate>
    )
  }
}

/**
 * Hook for checking permissions in components
 */
export function usePermissions() {
  const { user: authUser } = useAuth()
  const userRole = authUser?.user_metadata?.role as Role || 'parent'

  return {
    hasPermission: (permission: Permission) => hasPermission(userRole, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(userRole, permissions),
    canAccessRoute: (route: string) => canAccessRoute(userRole, route),
    role: userRole,
    isAuthenticated: !!authUser
  }
}

/**
 * Admin-only component wrapper
 */
export function AdminOnly({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGate role="admin" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

/**
 * Teacher-only component wrapper
 */
export function TeacherOnly({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGate roles={['teacher', 'admin']} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

/**
 * Parent/Student-only component wrapper
 */
export function ParentStudentOnly({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGate roles={['parent', 'student']} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}
