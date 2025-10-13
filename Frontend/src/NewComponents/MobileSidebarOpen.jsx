import React from 'react'

const MobileSidebarOpen = ({ setMobileSidebarOpen }) => {
  return (
    <div className="lg:hidden p-4 flex justify-center">
  <button
    onClick={() => setMobileSidebarOpen(true)}
    className="w-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 hover:from-pink-600 hover:via-red-600 hover:to-yellow-500 text-white font-bold py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-transform transform hover:scale-105 duration-300"
    aria-label="Open sidebar"
  >
    {/* Optional info icon */}
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
      />
    </svg>
    More Info
  </button>
</div>

  )
}

export default MobileSidebarOpen
