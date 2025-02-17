"use client"

import * as React from "react"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Loader2
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { NavUserSkeleton } from "@/components/nav-user-skeleton"
import { UserAvatar, UserAvatarWithInfo } from "@/components/user/user-avatar"

export function NavUser() {
  const { user, isLoadingUser } = useAuth()
  
  if (isLoadingUser) {
    return <NavUserSkeleton />
  }

  const { isMobile } = useSidebar()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  // Handle feature not implemented clicks
  const handleNotImplemented = (feature) => {
    toast.error(`${feature} not implemented!`, {
      duration: 2000,
    })
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      console.error('Error during logout:', error)
      toast.error('Logout failed, please try again')
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Add null check for user
  if (!user) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <UserAvatarWithInfo user={user} />
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <UserAvatarWithInfo user={user} />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => handleNotImplemented('Pro upgrade')}>
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => navigate('/settings/account/profile')}>
                <BadgeCheck className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/settings/billing/payment')}>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/settings/preferences/notifications')}>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50 focus:text-red-600"
                  onSelect={(e) => e.preventDefault()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? (
                    <>
                      Logging out..
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    'Log out'
                  )}
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be redirected to the login page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                    disabled={isLoggingOut}>
                    {isLoggingOut ? (
                      <>
                        Logging out..
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      'Log out'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
