import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours} giờ ${mins} phút`
  }
  return `${mins} phút`
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function getGradeColor(grade: string): string {
  const gradeColors: Record<string, string> = {
    'Lớp 1': 'bg-blue-100 text-blue-800',
    'Lớp 2': 'bg-green-100 text-green-800',
    'Lớp 3': 'bg-yellow-100 text-yellow-800',
    'Lớp 4': 'bg-purple-100 text-purple-800',
    'Lớp 5': 'bg-pink-100 text-pink-800',
  }
  
  return gradeColors[grade] || 'bg-gray-100 text-gray-800'
}

export function getSubjectColor(subject: string): string {
  const subjectColors: Record<string, string> = {
    'Toán học': 'bg-blue-100 text-blue-800',
    'Tiếng Việt': 'bg-green-100 text-green-800',
    'Khoa học': 'bg-purple-100 text-purple-800',
    'Lịch sử': 'bg-orange-100 text-orange-800',
    'Địa lý': 'bg-teal-100 text-teal-800',
    'Tiếng Anh': 'bg-red-100 text-red-800',
  }
  
  return subjectColors[subject] || 'bg-gray-100 text-gray-800'
}

export function getRoleColor(role: string): string {
  const roleColors: Record<string, string> = {
    'admin': 'bg-red-100 text-red-800',
    'teacher': 'bg-blue-100 text-blue-800',
    'parent': 'bg-green-100 text-green-800',
  }
  
  return roleColors[role] || 'bg-gray-100 text-gray-800'
}

export function getPlanColor(plan: string): string {
  const planColors: Record<string, string> = {
    'basic': 'bg-gray-100 text-gray-800',
    'premium': 'bg-blue-100 text-blue-800',
    'pro': 'bg-purple-100 text-purple-800',
    'enterprise': 'bg-yellow-100 text-yellow-800',
  }
  
  return planColors[plan] || 'bg-gray-100 text-gray-800'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{10,11}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
