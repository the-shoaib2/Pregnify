"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserFilters({
  selectedRole,
  setSelectedRole,
  selectedStatus,
  setSelectedStatus,
  setSortBy,
  setSortOrder,
  disabled
}) {
  return (
    <>
      {/* Filter by Role */}
      <Select value={selectedRole} onValueChange={setSelectedRole} disabled={disabled}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
          <SelectItem value="DOCTOR">Doctor</SelectItem>
          <SelectItem value="PATIENT">Patient</SelectItem>
          <SelectItem value="GUEST">Guest</SelectItem>
        </SelectContent>
      </Select>

      {/* Filter by Status */}
      <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={disabled}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="INACTIVE">Inactive</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="SUSPENDED">Suspended</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-2" disabled={disabled}>
            Sort by
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => { setSortBy("name"); setSortOrder("asc"); }}>
            Name (A-Z)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setSortBy("name"); setSortOrder("desc"); }}>
            Name (Z-A)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setSortBy("date"); setSortOrder("desc"); }}>
            Newest First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setSortBy("date"); setSortOrder("asc"); }}>
            Oldest First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setSortBy("role"); setSortOrder("asc"); }}>
            Role
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setSortBy("status"); setSortOrder("asc"); }}>
            Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
