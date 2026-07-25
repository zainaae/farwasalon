export default function BookLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white pt-[calc(3.375rem+env(safe-area-inset-top,0px))]">
      <div
        className="loader"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading booking"
      />
    </div>
  )
}
