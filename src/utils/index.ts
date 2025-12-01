import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// Tailwind CSS class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export function formatDate(date: Date): string {
  if (isToday(date)) {
    return `今天 ${format(date, 'HH:mm')}`;
  } else if (isYesterday(date)) {
    return `昨天 ${format(date, 'HH:mm')}`;
  } else if (isThisWeek(date)) {
    return format(date, 'EEEE HH:mm', { locale: zhCN });
  } else {
    return format(date, 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
  }
}

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { 
    addSuffix: true, 
    locale: zhCN 
  });
}

// Mood utilities
export const MOOD_CONFIG = {
  happy: { emoji: '😊', label: '开心', color: '#FCD34D' },
  sad: { emoji: '😢', label: '难过', color: '#60A5FA' },
  angry: { emoji: '😠', label: '生气', color: '#F87171' },
  calm: { emoji: '😌', label: '平静', color: '#34D399' },
  excited: { emoji: '🤗', label: '兴奋', color: '#F59E0B' },
  tired: { emoji: '😴', label: '疲惫', color: '#9CA3AF' },
  anxious: { emoji: '😰', label: '焦虑', color: '#A78BFA' },
  grateful: { emoji: '🥰', label: '感恩', color: '#F472B6' },
};

export type MoodConfig = typeof MOOD_CONFIG;

// Weather utilities
export const WEATHER_CONFIG = {
  sunny: { icon: '☀️', label: '晴天', color: '#FCD34D' },
  cloudy: { icon: '☁️', label: '多云', color: '#9CA3AF' },
  rainy: { icon: '🌧️', label: '雨天', color: '#60A5FA' },
  snowy: { icon: '❄️', label: '雪天', color: '#E5E7EB' },
  windy: { icon: '💨', label: '大风', color: '#A78BFA' },
  foggy: { icon: '🌫️', label: '雾天', color: '#9CA3AF' },
};

// Device detection
export function isMobile(): boolean {
  return window.innerWidth < 768;
}

export function isTablet(): boolean {
  const width = window.innerWidth;
  return width >= 768 && width < 1024;
}

export function isDesktop(): boolean {
  return window.innerWidth >= 1024;
}

// Text truncation
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Generate excerpt from content
export function generateExcerpt(content: string, maxLength: number = 100): string {
  // Remove HTML tags if any
  const plainText = content.replace(/<[^>]*>/g, '');
  return truncateText(plainText, maxLength);
}

// File utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Color utilities
export function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Local storage utilities
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout;
  return ((...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  }) as T;
}

// Throttle utility
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  return ((...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}