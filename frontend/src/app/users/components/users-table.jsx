"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MoreVertical, Edit, Trash2, Shield } from "lucide-react"

export function UsersTable({ users, isDialogOpen, onActionClick }) {
  return (
    <div className="rounded-md border">
      <ScrollArea className="h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-bold">
                  <span className="font-bold text-primary">
                    {user.firstName} {user.lastName}
                  </span>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.accountStatus === "ACTIVE" ? "success" : "destructive"}
                    className={user.accountStatus === "ACTIVE" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                  >
                    {user.accountStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.lastLoginAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                        disabled={isDialogOpen}
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      {/* Edit User */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onActionClick('edit', user)
                            }}
                            disabled={isDialogOpen}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                        </DialogTrigger>
                      </Dialog>

                      {/* Change Status */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onActionClick('status', user)
                            }}
                            disabled={isDialogOpen}
                            className="flex items-center gap-2"
                          >
                            <Shield className="h-4 w-4" />
                            <span>Change Status</span>
                          </DropdownMenuItem>
                        </DialogTrigger>
                      </Dialog>

                      {/* Delete User */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-red-600 focus:bg-red-50 focus:text-red-600"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
