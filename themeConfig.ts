import { ThemeConfig, ThemeId } from "./types";

export const APP_THEMES: Record<ThemeId, ThemeConfig> = {
  green: {
    id: 'green',
    name: 'Kissan Green',
    gradient: 'bg-gradient-to-br from-lime-400 via-emerald-500 to-teal-600',
    primaryText: 'text-green-600 dark:text-green-500',
    secondaryText: 'text-green-700 dark:text-green-400',
    accentBg: 'bg-green-600',
    accentBgHover: 'hover:bg-green-500',
    lightBg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-500',
    ring: 'focus:ring-green-500',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconText: 'text-green-600 dark:text-green-500',
    welcomeGradient: 'from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-600'
  },
  blue: {
    id: 'blue',
    name: 'Ocean Blue',
    gradient: 'bg-gradient-to-br from-blue-400 via-indigo-500 to-violet-600',
    primaryText: 'text-blue-600 dark:text-blue-500',
    secondaryText: 'text-blue-700 dark:text-blue-400',
    accentBg: 'bg-blue-600',
    accentBgHover: 'hover:bg-blue-500',
    lightBg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-500',
    ring: 'focus:ring-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconText: 'text-blue-600 dark:text-blue-500',
    welcomeGradient: 'from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-600'
  },
  purple: {
    id: 'purple',
    name: 'Royal Purple',
    gradient: 'bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600',
    primaryText: 'text-purple-600 dark:text-purple-500',
    secondaryText: 'text-purple-700 dark:text-purple-400',
    accentBg: 'bg-purple-600',
    accentBgHover: 'hover:bg-purple-500',
    lightBg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-500',
    ring: 'focus:ring-purple-500',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconText: 'text-purple-600 dark:text-purple-500',
    welcomeGradient: 'from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-600'
  },
  orange: {
    id: 'orange',
    name: 'Sunset Orange',
    gradient: 'bg-gradient-to-br from-orange-400 via-pink-500 to-rose-600',
    primaryText: 'text-orange-600 dark:text-orange-500',
    secondaryText: 'text-orange-700 dark:text-orange-400',
    accentBg: 'bg-orange-600',
    accentBgHover: 'hover:bg-orange-500',
    lightBg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-500',
    ring: 'focus:ring-orange-500',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconText: 'text-orange-600 dark:text-orange-500',
    welcomeGradient: 'from-orange-600 to-rose-600 dark:from-orange-400 dark:to-rose-600'
  }
};