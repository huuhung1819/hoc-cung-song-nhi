'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface UnlockContextType {
  isUnlockMode: boolean
  setIsUnlockMode: (mode: boolean) => void
  unlock: () => void
  lock: () => void
}

const UnlockContext = createContext<UnlockContextType | undefined>(undefined)

export function UnlockProvider({ children }: { children: ReactNode }) {
  const [isUnlockMode, setIsUnlockMode] = useState(false)

  // Load unlock state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('unlockMode')
    if (savedState === 'true') {
      setIsUnlockMode(true)
    }
    
    // Set default unlock code if not exists
    if (!localStorage.getItem('unlockCode')) {
      localStorage.setItem('unlockCode', '1234')
    }
  }, [])

  // Save unlock state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('unlockMode', isUnlockMode.toString())
  }, [isUnlockMode])

  const unlock = () => {
    setIsUnlockMode(true)
  }

  const lock = () => {
    setIsUnlockMode(false)
  }

  return (
    <UnlockContext.Provider value={{
      isUnlockMode,
      setIsUnlockMode,
      unlock,
      lock
    }}>
      {children}
    </UnlockContext.Provider>
  )
}

export function useUnlock() {
  const context = useContext(UnlockContext)
  if (context === undefined) {
    throw new Error('useUnlock must be used within an UnlockProvider')
  }
  return context
}
