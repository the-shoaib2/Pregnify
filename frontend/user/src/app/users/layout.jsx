"use client"

import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocation, useNavigate } from "react-router-dom"
import { Users, UserPlus, Shield, History } from "lucide-react"

export default function UsersLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    {
      value: "list",
      label: "Users List",
      icon: Users,
      path: "/users/list"
    },
    {
      value: "add",
      label: "Add User",
      icon: UserPlus,
      path: "/users/add"
    },
    {
      value: "roles",
      label: "Roles",
      icon: Shield,
      path: "/users/roles"
    },
    {
      value: "activity",
      label: "Activity",
      icon: History,
      path: "/users/activity"
    }
  ]

  const currentTab = tabs.find(tab => location.pathname.startsWith(tab.path))?.value || "list"

  return (
    <RoleBasedLayout showHeader={true} headerTitle="User Management">
      <div className="flex flex-col gap-4 p-4">
        <Tabs 
          value={currentTab} 
          onValueChange={(value) => {
            const tab = tabs.find(t => t.value === value)
            if (tab) navigate(tab.path)
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="flex items-center gap-2"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {children}
      </div>
    </RoleBasedLayout>
  )
} 