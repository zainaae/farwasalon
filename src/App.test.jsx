import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App.jsx'

describe('App', () => {
  it('renders shell after the home route chunk loads', async () => {
    render(<App />)
    expect(
      await screen.findByRole('link', { name: /^Home$/i }, { timeout: 20_000 }),
    ).toBeInTheDocument()
  })
})
