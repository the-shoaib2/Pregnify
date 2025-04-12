"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Users, Activity, Server, AlertCircle } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { DashboardService } from "@/services/admin"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts'
import { UserInfoCard } from "@/components/user-info-card"

// Chart colors configuration
const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  muted: 'hsl(var(--muted))',
  success: 'hsl(142.1 76.2% 36.3%)',
  warning: 'hsl(38.4 92% 50%)',
  error: 'hsl(0 84.2% 60.2%)',
  info: 'hsl(221.2 83.2% 53.3%)',
  
  // Vibrant colors
  purple: 'hsl(270 91% 65%)',
  pink: 'hsl(330 81% 60%)',
  teal: 'hsl(173 80% 40%)',
  indigo: 'hsl(226 70% 55%)',
  orange: 'hsl(24 95% 53%)',
  cyan: 'hsl(187 100% 42%)',
  lime: 'hsl(83 81% 44%)',
  violet: 'hsl(258 90% 66%)',
  
  // Chart-specific colors
  pieBase: 'hsl(270 91% 65%)',
  activeUsers: 'hsl(226 70% 55%)',
  userGrowth: 'hsl(173 80% 40%)',
  healthRisk: 'hsl(330 81% 60%)',
  
  // Grid and axis colors
  grid: 'hsl(var(--border))',
  axis: 'hsl(var(--muted-foreground))',
  background: 'hsl(var(--background))'
}

// Color palettes for different chart types
const CHART_PALETTES = {
  pie: [
    CHART_COLORS.purple,
    CHART_COLORS.pink,
    CHART_COLORS.teal,
    CHART_COLORS.indigo,
    CHART_COLORS.orange
  ],
  bar: [
    CHART_COLORS.purple,
    CHART_COLORS.pink,
    CHART_COLORS.teal,
    CHART_COLORS.indigo,
    CHART_COLORS.orange
  ],
  line: {
    activeUsers: CHART_COLORS.activeUsers,
    userGrowth: CHART_COLORS.userGrowth,
    healthRisk: CHART_COLORS.healthRisk
  }
}

// Chart styling constants
const CHART_STYLES = {
  grid: {
    strokeDasharray: "3 3",
    stroke: CHART_COLORS.grid,
    opacity: 0.3
  },
  axis: {
    stroke: CHART_COLORS.axis,
    tick: { fontSize: 12 }
  },
  dot: {
    r: 4,
    stroke: CHART_COLORS.background,
    strokeWidth: 2
  },
  activeDot: {
    r: 8,
    stroke: CHART_COLORS.background,
    strokeWidth: 2
  }
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border/50 bg-background p-3 shadow-sm">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { user } = useAuth()

  const formatData = (data) => {
    return data
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const fetchDashboardData = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true)
      const response = await DashboardService.getDashboardData({
        page: pageNumber,
        limit: 10
      })
      
      if (pageNumber === 1) {
        setDashboardData(response.data)
      } else {
        setDashboardData(prevData => ({
          ...prevData,
          ...response.data,
          // Merge arrays if they exist
          overview: {
            ...prevData.overview,
            ...response.data.overview,
            // Merge specific arrays if they exist
            userDistribution: {
              ...prevData.overview?.userDistribution,
              ...response.data.overview?.userDistribution,
              data: [...(prevData.overview?.userDistribution?.data || []), ...(response.data.overview?.userDistribution?.data || [])]
            }
          }
        }))
      }
      
      setHasMore(response.data.hasMore)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData(page)
  }, [page, fetchDashboardData])

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }

  if (loading && !dashboardData) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[120px]" />
                <Skeleton className="h-4 w-[80px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <h3 className="text-lg font-semibold">No Dashboard Data Available</h3>
            <p className="text-sm text-muted-foreground">
              There was an error loading the dashboard data. Please try refreshing the page.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for charts with actual API response structure
  const userDistributionData = dashboardData?.overview?.userDistribution?.labels.map((label, index) => ({
    name: formatData(label),
    value: dashboardData?.overview?.userDistribution?.data[index] || 0
  })) || []

  const activeUsersData = dashboardData?.overview?.activeUsersToday?.labels.map((label, index) => ({
    time: label,
    users: dashboardData?.overview?.activeUsersToday?.data[index] || 0
  })) || []

  const aiRiskAlertsData = dashboardData?.overview?.aiRiskAlertsCount?.labels.map((label, index) => ({
    date: new Date(label).toLocaleDateString(),
    alerts: dashboardData?.overview?.aiRiskAlertsCount?.data[index] || 0
  })) || []

  const userGrowthData = dashboardData?.analytics?.userGrowth?.labels.map((label, index) => ({
    date: new Date(label).toLocaleDateString(),
    users: dashboardData?.analytics?.userGrowth?.data[index] || 0
  })) || []

  const healthRiskTrendData = dashboardData?.analytics?.healthRiskTrend?.labels.map((label, index) => ({
    date: new Date(label).toLocaleDateString(),
    risk: dashboardData?.analytics?.healthRiskTrend?.data[index] || 0
  })) || []

  const deviceUsageData = dashboardData?.analytics?.deviceUsage?.labels.map((label, index) => ({
    name: label,
    value: dashboardData?.analytics?.deviceUsage?.data[index] || 0
  })) || []

  return (
    <div className="space-y-4">
      {/* User Information Card */}
      <UserInfoCard user={user} />

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData?.overview?.userCount?.total || 0}
            </div>
            <p className="text-xs text-purple-500/70">
              {Object.entries(dashboardData?.overview?.userCount?.byRole || {}).map(([role, count]) => 
                `${formatData(role)}: ${count}`
              ).join(', ')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users Today</CardTitle>
            <Activity className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {activeUsersData.reduce((acc, curr) => acc + curr.users, 0)}
            </div>
            <p className="text-xs text-indigo-500/70">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Risk Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">
              {aiRiskAlertsData.reduce((acc, curr) => acc + curr.alerts, 0)}
            </div>
            <p className="text-xs text-pink-500/70">
              Today's alerts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Device Usage</CardTitle>
            <Server className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              {deviceUsageData.reduce((acc, curr) => acc + curr.value, 0)}
            </div>
            <p className="text-xs text-teal-500/70">
              Total activities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* User Distribution Pie Chart */}
        <Card className="rounded-lg border-border/50 hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">User Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill={CHART_COLORS.pieBase}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_PALETTES.pie[index % CHART_PALETTES.pie.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Active Users Line Chart */}
        <Card className="rounded-lg border-border/50 hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={activeUsersData}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid {...CHART_STYLES.grid} />
                  <XAxis dataKey="time" {...CHART_STYLES.axis} interval={3} />
                  <YAxis {...CHART_STYLES.axis} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    name="Active Users"
                    stroke={CHART_PALETTES.line.activeUsers}
                    strokeWidth={2}
                    dot={{ 
                      ...CHART_STYLES.dot,
                      fill: CHART_PALETTES.line.activeUsers
                    }}
                    activeDot={{ 
                      ...CHART_STYLES.activeDot,
                      fill: CHART_PALETTES.line.activeUsers
                    }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Growth Line Chart */}
        <Card className="rounded-lg border-border/50 hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">User Growth</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={userGrowthData}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid {...CHART_STYLES.grid} />
                  <XAxis dataKey="date" {...CHART_STYLES.axis} />
                  <YAxis {...CHART_STYLES.axis} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke={CHART_PALETTES.line.userGrowth}
                    strokeWidth={2}
                    dot={{ 
                      ...CHART_STYLES.dot,
                      fill: CHART_PALETTES.line.userGrowth
                    }}
                    activeDot={{ 
                      ...CHART_STYLES.activeDot,
                      fill: CHART_PALETTES.line.userGrowth
                    }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Health Risk Trend Line Chart */}
        <Card className="rounded-lg border-border/50 hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Health Risk Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={healthRiskTrendData}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid {...CHART_STYLES.grid} />
                  <XAxis dataKey="date" {...CHART_STYLES.axis} />
                  <YAxis {...CHART_STYLES.axis} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="risk" 
                    stroke={CHART_PALETTES.line.healthRisk}
                    strokeWidth={2}
                    dot={{ 
                      ...CHART_STYLES.dot,
                      fill: CHART_PALETTES.line.healthRisk
                    }}
                    activeDot={{ 
                      ...CHART_STYLES.activeDot,
                      fill: CHART_PALETTES.line.healthRisk
                    }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Device Usage Bar Chart */}
        <Card className="md:col-span-2 rounded-lg border-border/50 hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Device Usage Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={deviceUsageData}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid {...CHART_STYLES.grid} />
                  <XAxis dataKey="name" {...CHART_STYLES.axis} />
                  <YAxis {...CHART_STYLES.axis} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {deviceUsageData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_PALETTES.bar[index % CHART_PALETTES.bar.length]}
                      />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}

// Keep default export for backward compatibility
export default AdminDashboard