import Image from "next/image"

export function ChronosTimeLogo() {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="w-10 h-10 relative group-hover:scale-110 transition-transform duration-300">
        <Image
          src="/chronostime-logo.png"
          alt="ChronosTime Logo"
          fill
          className="object-contain"
        />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-lg gradient-text leading-tight">ChronosTime</span>
        <span className="text-xs text-[#3CE7FF]/80 font-medium">Investment Platform</span>
      </div>
    </div>
  )
}
