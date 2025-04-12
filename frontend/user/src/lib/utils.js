import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getavatar(user) {
  return user?.avatar || user?.avatar 
}

export function getUserInitials(user) {
  if (!user) return 'U'
  
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }
  
  if (user.name) {
    return user.name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  
  if (user.email) {
    return user.email.slice(0, 2).toUpperCase()
  }
  
  return 'U'
}

export function getInitials(name) {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatData(data) {
  if (!data) return ''
  return data
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
} 