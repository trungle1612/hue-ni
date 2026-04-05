import { createContext, useContext, type ReactNode } from 'react'
import { useMyTrip } from '../hooks/useMyTrip'

type MyTripContextValue = ReturnType<typeof useMyTrip>

const MyTripContext = createContext<MyTripContextValue | null>(null)

export function MyTripProvider({ children }: { children: ReactNode }) {
  const value = useMyTrip()
  return <MyTripContext.Provider value={value}>{children}</MyTripContext.Provider>
}

export function useMyTripContext(): MyTripContextValue {
  const ctx = useContext(MyTripContext)
  if (!ctx) throw new Error('useMyTripContext must be used inside MyTripProvider')
  return ctx
}
