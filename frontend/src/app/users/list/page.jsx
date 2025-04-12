"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Edit,Loader, Trash2, Shield, ArrowRightToLine, ScanEye } from "lucide-react"
import { UserManagementService } from "@/services/admin"
import { toast } from "react-hot-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import EditUserDialog from "../components/edit-user-dialog"
import StatusDialog from "../components/status-dialog"
import UserDetailsDialog from "../components/user-details-dialog"

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Something went wrong: {this.state.error?.message}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default function UsersListPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [selectedUserDetails, setSelectedUserDetails] = useState(null)
  const [loadingUserDetails, setLoadingUserDetails] = useState(false)

  // Update isDialogOpen whenever any dialog state changes
  useEffect(() => {
    setIsDialogOpen(showDeleteDialog || showStatusDialog || showEditDialog || showUserDetails)
  }, [showDeleteDialog, showStatusDialog, showEditDialog, showUserDetails])

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = [...users]

    // Filter by search query
    if (searchQuery) {
      result = result.filter(user => 
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by role
    if (selectedRole !== "all") {
      result = result.filter(user => user.role === selectedRole)
    }

    // Filter by status
    if (selectedStatus !== "all") {
      result = result.filter(user => user.accountStatus === selectedStatus)
    }

    // Sort users
    result.sort((a, b) => {
      let compareA, compareB

      switch (sortBy) {
        case "name":
          compareA = `${a.firstName} ${a.lastName}`.toLowerCase()
          compareB = `${b.firstName} ${b.lastName}`.toLowerCase()
          break
        case "date":
          compareA = new Date(a.createdAt)
          compareB = new Date(b.createdAt)
          break
        case "role":
          compareA = a.role
          compareB = b.role
          break
        case "status":
          compareA = a.accountStatus
          compareB = b.accountStatus
          break
        default:
          compareA = a[sortBy]
          compareB = b[sortBy]
      }

      return sortOrder === "asc" 
        ? compareA > compareB ? 1 : -1
        : compareA < compareB ? 1 : -1
    })

    return result
  }, [users, searchQuery, selectedRole, selectedStatus, sortBy, sortOrder])

  // Memoized handlers
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleActionClick = useCallback((action, user) => {
    setSelectedUser(user)
    switch (action) {
      case 'edit':
        setShowEditDialog(true)
        break
      case 'status':
        setShowStatusDialog(true)
        break
      case 'delete':
        setShowDeleteDialog(true)
        break
      default:
        break
    }
  }, [])

  const handleStatusChange = useCallback(async () => {
    try {
      if (!selectedUser?.id) return

      // Get the new status from the state
      const newStatus = selectedUser.newStatus || "ACTIVE"

      const updatedUser = {
        ...selectedUser,
        accountStatus: newStatus
      }

      await UserManagementService.updateUser(selectedUser.id, updatedUser)
      setUsers(prevUsers => prevUsers.map(user =>
        user.id === selectedUser.id ? updatedUser : user
      ))
      setShowStatusDialog(false)
      setSelectedUser(null)
      toast.success("User status updated successfully")
    } catch (err) {
      toast.error(err.message)
      setShowStatusDialog(false)
      setSelectedUser(null)
    }
  }, [selectedUser])

  // Handle status selection change
  const handleStatusSelectionChange = useCallback((status) => {
    if (selectedUser) {
      setSelectedUser({
        ...selectedUser,
        newStatus: status
      })
    }
  }, [selectedUser])

  const handleDelete = useCallback(async (user) => {
    try {
      if (!user?.id) return
      setIsDeleting(true)
      await UserManagementService.deleteUser(user.id)
      setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id))
      setShowDeleteDialog(false)
      setSelectedUser(null)
      toast.success("User deleted successfully")
    } catch (err) {
      toast.error(err.message)
      setShowDeleteDialog(false)
      setSelectedUser(null)
    } finally {
      setIsDeleting(false)
    }
  }, [])

  // Dialog handlers
  const handleDeleteDialogOpenChange = useCallback((open) => {
    setShowDeleteDialog(open)
    if (!open) setSelectedUser(null)
  }, [])

  const handleStatusDialogOpenChange = useCallback((open) => {
    setShowStatusDialog(open)
    if (!open) setSelectedUser(null)
  }, [])

  // Handle edit dialog open change
  const handleEditDialogOpenChange = useCallback((open) => {
    setShowEditDialog(open)
    if (!open) setSelectedUser(null)
  }, [])

  const handleViewUserDetails = async (userId) => {
    try {
      setLoadingUserDetails(true)
      const response = await UserManagementService.getUserById(userId)
      if (response.success) {
        setSelectedUserDetails(response.data)
        setShowUserDetails(true)
      } else {
        toast.error("Failed to fetch user details")
      }
    } catch (error) {
      toast.error("Error fetching user details")
      console.error(error)
    } finally {
      setLoadingUserDetails(false)
    }
  }

  // Fetch users with proper cleanup
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await UserManagementService.getAllUsers()

      if (response?.data?.users) {
        setUsers(response.data.users)
      } else {
        setUsers([])
        setError("Invalid response format")
      }
    } catch (err) {
      setError(err.message)
      setUsers([])
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
    return () => {
      // Cleanup function
      setUsers([])
      setLoading(false)
      setError(null)
    }
  }, [fetchUsers])

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">Users</CardTitle>
            <Skeleton className="h-9 w-[100px]" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 pb-4">
              <div className="relative flex-1">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name ChevronsUpDown</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead >Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[140px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[140px]" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">Users</CardTitle>
            <Button
              onClick={() => navigate("/users/add")}
              size="sm"
              className="z-10"
              disabled={isDialogOpen}
            >
              <ArrowRightToLine className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 pb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-8"
                  disabled={isDialogOpen}
                />
              </div>

              {/* Filter by Role */}
              <Select value={selectedRole} onValueChange={setSelectedRole}>
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
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
                  <Button variant="outline" size="sm" className="ml-2">
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
            </div>

            <div className="rounded-md border">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name </TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
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


                              {/* View User Details */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem onClick={() => handleViewUserDetails(user.id)}>
                                    <ScanEye className="h-4 w-4" />
                                    <span>View Details</span>
                                  </DropdownMenuItem>
                                </DialogTrigger>
                              </Dialog>

                              {/* Edit User */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                  e.stopPropagation()
                                  handleActionClick('edit', user)
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
                                  handleActionClick('status', user)
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
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle >Are you sure you want to delete <span className="text-red-600 font-bold">{user?.firstName} {user?.lastName}</span>? </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete <span className="font-bold">{user?.firstName}</span>'s account and all associated data.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(user)}
                                      className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                                    >
                                      {isDeleting ? (
                                        <>
                                          Deleting...
                                          <Loader className="ml-2 h-4 w-4 animate-spin" />
                                        </>
                                      ) : (
                                        'Delete'
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
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
          </CardContent>
        </Card>

        <StatusDialog 
          open={showStatusDialog}
          onOpenChange={handleStatusDialogOpenChange}
          selectedUser={selectedUser}
          onStatusChange={handleStatusChange}
          onStatusSelectionChange={handleStatusSelectionChange}
        />

        <EditUserDialog 
          open={showEditDialog}
          onOpenChange={handleEditDialogOpenChange}
          selectedUser={selectedUser}
          onSuccess={() => {
            setShowEditDialog(false)
            fetchUsers() // Refresh the users list
          }}
        />
      

        <UserDetailsDialog
          isOpen={showUserDetails}
          onClose={() => setShowUserDetails(false)}
          user={selectedUserDetails}
          loading={loadingUserDetails}
        />
      </div>
    </ErrorBoundary>
  )
} 