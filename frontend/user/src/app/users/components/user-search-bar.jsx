"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function UserSearchBar({ value, onChange, disabled }) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search users..."
        value={value}
        onChange={onChange}
        className="pl-8"
        disabled={disabled}
      />
    </div>
  )
}
