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
import { Search, ChevronDown, ChevronUp, ArrowLeft, Plus, Shield, Users } from "lucide-react"
import { RoleManagementService } from "@/services/admin"
import { toast } from "react-hot-toast"

const ITEMS_PER_PAGE = 8

export default function RolesPage() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [sortBy, setSortBy] = useState("level")
  const [sortOrder, setSortOrder] = useState("asc")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [uniqueCategories, setUniqueCategories] = useState([])

  // Fetch roles with pagination
  const fetchRoles = useCallback(async (pageNum = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(1)
      } else {
        setIsLoadingMore(true)
      }
      
      const response = await RoleManagementService.getAllRoles({
        page: pageNum,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        category: filterCategory !== "all" ? filterCategory : undefined,
        sortBy,
        sortOrder
      })

      // Check if response is valid
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid API response')
      }

      // Check for error response
      if (response.error) {
        throw new Error(response.error)
      }

      // Check for success response
      if (response.success && Array.isArray(response.data)) {
        const newRoles = response.data
        setRoles(prev => reset ? newRoles : [...prev, ...newRoles])
        setHasMore(newRoles.length === ITEMS_PER_PAGE)

        // Extract unique categories
        const categories = [...new Set(newRoles.map(role => role.category))]
        setUniqueCategories(categories)
      } else {
        throw new Error('Invalid response format: missing or invalid data')
      }
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
      setRoles([])
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }, [searchQuery, filterCategory, sortBy, sortOrder])

  // Handle category filter change
  const handleCategoryChange = (value) => {
    setFilterCategory(value)
    setPage(1)
    fetchRoles(1, true)
  }

  // Handle sort change
  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setPage(1)
    fetchRoles(1, true)
  }

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchRoles(1, true)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, fetchRoles])

  // Initial fetch
  useEffect(() => {
    fetchRoles(1, true)
  }, [fetchRoles])

  // Handle scroll for lazy loading
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && !isLoadingMore && hasMore) {
      setPage(prev => prev + 1)
      fetchRoles(page + 1)
    }
  }, [loading, isLoadingMore, hasMore, page, fetchRoles])

  const getCategoryBadgeVariant = (category) => {
    switch (category) {
      case "SYSTEM":
        return "default"
      case "MEDICAL":
        return "secondary"
      case "RESEARCH":
        return "info"
      case "FINANCE":
        return "warning"
      case "SUPPORT":
        return "outline"
      case "CLIENT":
        return "success"
      case "PUBLIC":
        return "outline"
      default:
        return "outline"
    }
  }

  const getAccessLevelBadgeVariant = (level) => {
    if (level <= 2) return "destructive"
    if (level <= 4) return "warning"
    if (level <= 6) return "info"
    return "outline"
  }

  // Loading skeleton rows
  const renderSkeletonRows = () => {
    return Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton className="h-4 w-[120px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[200px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[100px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[100px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[80px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[80px]" />
        </TableCell>
      </TableRow>
    ))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/users")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg font-bold">Roles & Permissions</CardTitle>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Filter by Category */}
              <Select value={filterCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
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
                  <DropdownMenuItem onClick={() => handleSortChange("level", "asc")}>
                    Level (Low to High)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("level", "desc")}>
                    Level (High to Low)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("name", "asc")}>
                    Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("name", "desc")}>
                    Name (Z-A)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("createdAt", "desc")}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("createdAt", "asc")}>
                    Oldest First
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-red-500">{error}</div>
            </div>
          ) : (
            <div className="rounded-md border">
              <ScrollArea className="h-[500px]" onScroll={handleScroll}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Access Level</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      renderSkeletonRows()
                    ) : roles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          No roles found
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {roles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{role.name}</span>
                                <span className="text-xs text-muted-foreground">{role.id}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{role.description}</span>
                                <span className="text-xs text-muted-foreground">{role.access}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getCategoryBadgeVariant(role.category)}>
                                {role.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getAccessLevelBadgeVariant(role.level)}>
                                Level {role.level}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {role.permissions.slice(0, 3).map(permission => (
                                  <Badge key={permission} variant="outline" className="text-xs">
                                    {permission}
                                  </Badge>
                                ))}
                                {role.permissions.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{role.permissions.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {new Date(role.createdAt).toLocaleDateString()}
                              </div>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
} 