'use client'
import { createContext, useContext, useState } from 'react'
import dynamic from 'next/dynamic'
import { track } from './site-config.js'

const BookingSheet = dynamic(() => import('./booking-sheet').then((m) => m.BookingSheet), {
  ssr: false,
})

const BookingCtx = createContext({ open: () => {}, addService: () => {} })

export function BookingProvider({ children }) {
  const [state, setState] = useState({ open: false, category: null, initialPicked: null })
  const value = {
    open: (category = null, source = 'unknown') => {
      track('BookingStarted', { source, category: category || 'none' })
      setState({ open: true, category, initialPicked: null })
    },
    addService: (service, source = 'modal') => {
      track('BookingStarted', { source, category: service.category || 'none' })
      setState({
        open: true,
        category: service.category,
        initialPicked: [{ id: service.id, name: service.name }],
      })
    },
    close: () => setState((s) => ({ ...s, open: false })),
  }
  return (
    <BookingCtx.Provider value={value}>
      {children}
      {state.open && (
        <BookingSheet
          open={state.open}
          initialCategory={state.category}
          initialPicked={state.initialPicked}
          onClose={value.close}
        />
      )}
    </BookingCtx.Provider>
  )
}

export function useBooking() {
  return useContext(BookingCtx)
}
