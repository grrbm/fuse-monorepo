import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const COLOR_PALETTES: Record<string, { primary: string; secondary: string }> = {
  emerald: { primary: "#10B981", secondary: "#ECFDF5" },
  sky: { primary: "#0EA5E9", secondary: "#E0F2FE" },
  violet: { primary: "#8B5CF6", secondary: "#EDE9FE" },
  amber: { primary: "#F59E0B", secondary: "#FEF3C7" },
  rose: { primary: "#F43F5E", secondary: "#FEE2E2" },
  slate: { primary: "#64748B", secondary: "#E2E8F0" },
}

export function getThemePalette(themeId?: string | null) {
  if (!themeId) return COLOR_PALETTES.emerald
  return COLOR_PALETTES[themeId] ?? COLOR_PALETTES.emerald
}

export function listAvailablePalettes() {
  return Object.entries(COLOR_PALETTES).map(([id, palette]) => ({ id, ...palette }))
}