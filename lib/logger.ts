/**
 * Development-only logger
 * Logs are stripped in production for performance and security
 */

const isDevelopment = process.env.NODE_ENV !== 'production'

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors
    console.error(...args)
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  }
}

