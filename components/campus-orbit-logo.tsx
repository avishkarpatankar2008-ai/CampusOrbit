"use client"

import { cn } from "@/lib/utils"

interface CampusOrbitLogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeMap = {
  sm: { icon: 32, text: "text-lg" },
  md: { icon: 40, text: "text-xl" },
  lg: { icon: 48, text: "text-2xl" },
  xl: { icon: 64, text: "text-3xl" },
}

/**
 * CampusOrbit Logo - Orbit-style C with motion dot
 * Brand colors: Primary #E85002, Secondary #2B2118
 * Light mode: dark logo with orange accent
 * Dark mode: orange/white logo on dark background
 */
export function CampusOrbitLogo({ 
  className, 
  showText = true, 
  size = "md" 
}: CampusOrbitLogoProps) {
  const { text } = sizeMap[size]
  
  return (
    <div className={cn(
      "flex items-center gap-2 transition-transform duration-200 hover:scale-105",
      className
    )}>
      <CampusOrbitIcon size={size} />
      {showText && (
        <span className={cn("font-semibold tracking-tight leading-none", text)}>
          <span className="text-foreground">Campus</span>
          <span className="text-primary">Orbit</span>
        </span>
      )}
    </div>
  )
}

export function CampusOrbitLogoWithTagline({ 
  className, 
  size = "lg" 
}: Omit<CampusOrbitLogoProps, "showText">) {
  const { text } = sizeMap[size]
  
  return (
    <div className={cn(
      "flex items-center gap-3 transition-transform duration-200 hover:scale-105",
      className
    )}>
      <CampusOrbitIcon size={size} />
      <div className="flex flex-col">
        <span className={cn("font-semibold tracking-tight leading-none", text)}>
          <span className="text-foreground">Campus</span>
          <span className="text-primary">Orbit</span>
        </span>
        <span className="mt-1 text-[0.55em] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Share <span className="text-primary">•</span> Connect <span className="text-primary">•</span> Thrive
        </span>
      </div>
    </div>
  )
}

interface CampusOrbitIconProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

/**
 * Icon-only SVG version of the CampusOrbit logo
 * Design: Circular orbit C-shape + curved swoosh + center dot
 * Adapts to light/dark themes automatically
 */
export function CampusOrbitIcon({ size = "md", className }: CampusOrbitIconProps) {
  const { icon } = sizeMap[size]
  
  return (
    <svg
      width={icon}
      height={icon}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="CampusOrbit Logo"
    >
      {/* Outer C-shaped orbit arc - adapts to theme */}
      <path
        d="M52 32C52 43.0457 43.0457 52 32 52C20.9543 52 12 43.0457 12 32C12 20.9543 20.9543 12 32 12"
        className="stroke-foreground dark:stroke-white"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Orange curved swoosh - motion path */}
      <path
        d="M32 12C38 12 44 14 48 18C52 22 54 28 52 34"
        className="stroke-primary"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Center dot - represents items/users */}
      <circle
        cx="32"
        cy="32"
        r="8"
        className="fill-primary"
      />
      
      {/* Small orbiting dot - top right */}
      <circle
        cx="48"
        cy="14"
        r="5"
        className="fill-foreground dark:fill-white"
      />
    </svg>
  )
}

/**
 * App icon version - square format, simplified
 */
export function CampusOrbitAppIcon({ className }: { className?: string }) {
  return (
    <div className={cn(
      "flex items-center justify-center rounded-xl bg-primary p-2",
      className
    )}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="CampusOrbit"
      >
        {/* Simplified white orbit for app icon */}
        <path
          d="M52 32C52 43.0457 43.0457 52 32 52C20.9543 52 12 43.0457 12 32C12 20.9543 20.9543 12 32 12"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M32 12C38 12 44 14 48 18C52 22 54 28 52 34"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="32" cy="32" r="8" fill="white" />
        <circle cx="48" cy="14" r="5" fill="white" />
      </svg>
    </div>
  )
}
