"use client"

import { useState, useEffect, useCallback } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react"
import { UserManagementService } from "@/services/admin"
import { toast } from "react-hot-toast"

const ITEMS_PER_PAGE = 8

export default function UserActivityPage() {
  const navigate = useNavigate()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterAction, setFilterAction] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("timestamp")
  const [sortOrder, setSortOrder] = useState("desc")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [uniqueActions, setUniqueActions] = useState([])
  const [uniqueStatuses, setUniqueStatuses] = useState([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActivities(1, true)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch activities with pagination
  const fetchActivities = useCallback(async (pageNum = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(1)
      } else {
        setIsLoadingMore(true)
      }
      
      const response = await UserManagementService.getAllActivities({
        page: pageNum,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        action: filterAction !== "all" ? filterAction : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        sortBy,
        sortOrder
      })

      if (response?.data?.activities) {
        const newActivities = response.data.activities
        setActivities(prev => reset ? newActivities : [...prev, ...newActivities])
        setHasMore(newActivities.length === ITEMS_PER_PAGE)

        // Extract unique actions and statuses
        const actions = [...new Set(newActivities.map(a => a.action))]
        const statuses = [...new Set(newActivities.map(a => a.status))]
        setUniqueActions(actions)
        setUniqueStatuses(statuses)
      } else {
        setActivities([])
        setError("Invalid response format")
      }
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }, [searchQuery, filterAction, filterStatus, sortBy, sortOrder])

  // Initial fetch
  useEffect(() => {
    fetchActivities(1, true)
  }, [fetchActivities])

  // Handle scroll for lazy loading
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && !isLoadingMore && hasMore) {
      setPage(prev => prev + 1)
      fetchActivities(page + 1)
    }
  }, [loading, isLoadingMore, hasMore, page, fetchActivities])

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success"
      case "failed":
        return "destructive"
      case "pending":
        return "warning"
      default:
        return "outline"
    }
  }

  const getActionBadgeVariant = (action) => {
    switch (action.toLowerCase()) {
      case "api_access":
        return "default"
      case "login":
        return "secondary"
      case "logout":
        return "outline"
      case "update_profile":
        return "info"
      default:
        return "outline"
    }
  }

  // Loading skeleton rows
  const renderSkeletonRows = () => {
    return Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton className="h-4 w-[120px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[100px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[200px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[100px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[80px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[150px]" />
        </TableCell>
      </TableRow>
    ))
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold">Activity Log</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Filter by Action */}
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filter by Status */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    Sort by
                    {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onClick={() => { setSortBy("timestamp"); setSortOrder("desc"); }}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy("timestamp"); setSortOrder("asc"); }}>
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy("user.name"); setSortOrder("asc"); }}>
                    User (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy("action"); setSortOrder("asc"); }}>
                    Action
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy("status"); setSortOrder("asc"); }}>
                    Status
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-md border">
            <ScrollArea className="h-[500px]" onScroll={handleScroll}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    renderSkeletonRows()
                  ) : (
                    <>
                      {activities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{activity.user?.name || activity.user?.username}</span>
                              <span className="text-xs text-muted-foreground">{activity.user?.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getActionBadgeVariant(activity.action)}>
                              {activity.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate" title={activity.details}>
                            {activity.details}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{activity.ipAddress}</span>
                              <span className="text-xs text-muted-foreground">{activity.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(activity.status)}>
                              {activity.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(activity.timestamp).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {isLoadingMore && renderSkeletonRows()}
                    </>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}