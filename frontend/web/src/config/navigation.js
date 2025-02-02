import { LayoutDashboard } from 'lucide-react'

export const MAIN_NAVIGATION = [
  {
    path: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    group: 'main'
  }
]

export const MANAGEMENT_NAVIGATION = []
export const ADDITIONAL_NAVIGATION = []
export const ALL_NAVIGATION = [...MAIN_NAVIGATION]
