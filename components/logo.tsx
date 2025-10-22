export function ChronosTimeLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 40 40" className="w-full h-full">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d9ff" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Outer circle with glow */}
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            opacity="0.6"
            filter="url(#glow)"
          />
          {/* Inner circle */}
          <circle cx="20" cy="20" r="14" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5" opacity="0.4" />
          {/* Hourglass shape */}
          <path
            d="M 12 10 L 28 10 L 24 20 L 28 30 L 12 30 L 16 20 Z"
            fill="none"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Center dot with glow */}
          <circle cx="20" cy="20" r="2.5" fill="url(#logoGradient)" filter="url(#glow)" />
          {/* Sand particles */}
          <circle cx="18" cy="18" r="0.8" fill="url(#logoGradient)" opacity="0.6" />
          <circle cx="22" cy="22" r="0.8" fill="url(#logoGradient)" opacity="0.6" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-lg gradient-text leading-tight">ChronosTime</span>
        <span className="text-xs text-cyan-400/60 font-medium">Investment Platform</span>
      </div>
    </div>
  )
}
