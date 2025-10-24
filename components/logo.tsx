import Image from "next/image"
import { useTheme } from "next-themes"

export function ChronosTimeLogo() {
  const { theme } = useTheme()
  
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="w-10 h-10 relative group-hover:scale-110 transition-transform duration-300">
        <Image
          src="/chronostime_logo-removebg-preview.png"
          alt="ChronosTime Logo"
          fill
          className="object-contain"
        />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-lg gradient-text leading-tight">ChronosTime</span>
        <span className="text-xs text-cyan-400/60 font-medium">Investment Platform</span>
      </div>
    </div>
  )
}
