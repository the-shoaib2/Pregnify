import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  return new Intl.DateTimeFormat('en-US', mergedOptions).format(new Date(date));
}
