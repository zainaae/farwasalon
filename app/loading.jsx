export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div
        className="loader"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading page"
      />
    </div>
  )
}
