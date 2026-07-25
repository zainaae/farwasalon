'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const HomeBelowFold = dynamic(() => import('./home-below-fold'), {
  ssr: false,
  loading: () => <div className="min-h-[80vh]" aria-hidden />,
})

export default function HomeClient() {
  const [showBelow, setShowBelow] = useState(false)

  useEffect(() => {
    const enable = () => setShowBelow(true)
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(enable, { timeout: 1200 })
      return () => cancelIdleCallback(id)
    }
    const t = setTimeout(enable, 200)
    return () => clearTimeout(t)
  }, [])

  return showBelow ? <HomeBelowFold /> : <div className="min-h-[80vh]" aria-hidden />
}
