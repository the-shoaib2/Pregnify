import { useState, useEffect } from "react"
import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PregnancyService, SYSTEM_ENUMS } from "@/services/pregnify"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { useParams, Link } from "react-router-dom"
import { 
  HeartPulse, 
  Thermometer, 
  Scale, 
  Droplet,
  TrendingUp,
  TrendingDown,
  Clock,
  Brain,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Shield,
  Lock,
  History
} from "lucide-react"
import { PregnancyDataForm } from "@/app/pregnify/health/components/pregnancy/PregnancyDataForm"
import { RiskAssessmentForm } from "@/app/pregnify/health/components/risk-assessment-form"
import toast from "react-hot-toast"
import { RiskAssessmentCard } from "./components/risk-assessment-card"

// Risk level badge component
const RiskLevelBadge = ({ level }) => {
  const getBadgeVariant = (level) => {
    switch (level) {
      case SYSTEM_ENUMS.RISK_LEVEL.LOW:
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case SYSTEM_ENUMS.RISK_LEVEL.MEDIUM:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case SYSTEM_ENUMS.RISK_LEVEL.HIGH:
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case SYSTEM_ENUMS.RISK_LEVEL.CRITICAL:
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  return (
    <Badge variant="outline" className={`${getBadgeVariant(level)} text-xs`}>
      {level}
    </Badge>
  )
}

const HealthMetric = ({ icon: Icon, label, value, unit, trend, trendValue }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="font-medium">{value}{unit}</span>
      {trend && (
        <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  </div>
)

const HealthMetricSkeleton = () => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-20" />
    </div>
    <Skeleton className="h-4 w-16" />
  </div>
)

// Mock data for health metrics
const healthMetrics = {
  heartRate: { value: 75, unit: 'bpm', trend: 'down', trendValue: '2%' },
  bloodPressure: { value: '120/80', unit: 'mmHg', trend: 'stable' },
  temperature: { value: 36.8, unit: '°C', trend: 'up', trendValue: '0.2°' },
  weight: { value: 65, unit: 'kg', trend: 'down', trendValue: '0.5kg' },
  waterIntake: { value: 1.8, unit: 'L', trend: 'up', trendValue: '0.2L' }
}

export default function HealthPage() {
  const { user } = useAuth()
  const [riskAssessment, setRiskAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [accessDenied, setAccessDenied] = useState(false)
  const [pregnancyData, setPregnancyData] = useState(null)

  // Fetch pregnancy data first
  const fetchPregnancyData = async () => {
    try {
      setLoading(true)
      const response = await PregnancyService.getPregnancyDetails()
      if (response?.data?.[0]) {
        const data = response.data[0]
        setPregnancyData(data)
        return data.id // Return the pregnancy ID
      }
      return null
    } catch (err) {
      console.error("Error fetching pregnancy data:", err)
      return null
    }
  }

  // Fetch risk assessment data
  const fetchRiskAssessment = async () => {
    try {
      setLoading(true)
      setError(null)
      setAccessDenied(false)

      // First get pregnancy data to get the ID
      const pregnancyId = await fetchPregnancyData()
      if (!pregnancyId) {
        setError("No pregnancy data found. Please add your pregnancy information first.")
        setLoading(false)
        return
      }

      console.log("Fetching risk assessment for pregnancyId:", pregnancyId)
      const data = await PregnancyService.getRiskAssessment(pregnancyId)
      console.log("Risk assessment data received:", data)
      setRiskAssessment(data)
    } catch (err) {
      console.error("Error fetching risk assessment:", err)
      if (err.message.includes('Access denied')) {
        setAccessDenied(true)
        toast.error("You need a patient account to view risk assessment data.")
      } else {
        setError(err.message || "Failed to load risk assessment")
        toast.error(err.message || "Failed to load risk assessment")
      }
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchRiskAssessment()
  }, [])

  // Render risk assessment section
  const renderRiskAssessment = () => {
    if (loading) {
      return (
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      )
    }

    if (accessDenied) {
      return (
        <Card className="transition-all duration-300 hover:shadow-md border-amber-200 bg-amber-50/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-500" />
                Access Restricted
              </CardTitle>
              <CardDescription>
                You need a patient account to view risk assessment data
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
              {user?.role || 'GUEST'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="default" className="bg-amber-100/50 border-amber-200">
              <Shield className="h-4 w-4 text-amber-500" />
              <AlertTitle>Role-Based Access</AlertTitle>
              <AlertDescription>
                This feature is only available to users with a PATIENT role. Please contact support if you believe this is an error.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/login">
                  <Lock className="mr-2 h-4 w-4" />
                  Login as Patient
                </Link>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/register">
                  <Shield className="mr-2 h-4 w-4" />
                  Register as Patient
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (error) {
      return (
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button onClick={fetchRiskAssessment} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (!riskAssessment?.data) {
      return (
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">No Risk Assessment Available</h3>
              <p className="text-sm text-muted-foreground">
                Complete a risk assessment to monitor your pregnancy health
              </p>
            </div>
            {pregnancyData?.id && (
              <RiskAssessmentForm pregnancyId={pregnancyData.id} />
            )}
          </CardContent>
        </Card>
      )
    }

    return (
      <RiskAssessmentCard 
        assessment={riskAssessment.data} 
        onRefresh={fetchRiskAssessment} 
        pregnancyData={pregnancyData} 
      />
    )
  }

  return (
    <RoleBasedLayout headerTitle="Health Dashboard">
      <div className="flex flex-1 flex-col gap-4 mx-auto w-full">
        {/* Pregnancy Data Form - Moved to top */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PregnancyDataForm />
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Pregnancy Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Week {pregnancyData?.pregnancyWeek || 0} of 40</span>
                    <span className="font-medium">{Math.round((pregnancyData?.pregnancyWeek || 0) / 40 * 100)}% Complete</span>
                  </div>
                  <Progress value={(pregnancyData?.pregnancyWeek || 0) / 40 * 100} className="h-2" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Estimated due date: {pregnancyData?.dueDate ? new Date(pregnancyData.dueDate).toLocaleDateString() : 'Not set'}</span>
                </div>
                {/* AI Assistant Button */}
                {pregnancyData?.id && (
                  <Button asChild className="w-full mt-4">
                    <Link to={`/ai-assistant/${pregnancyData.id}`}>
                      <Brain className="mr-2 h-4 w-4" />
                      AI Assistant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Assessment */}
        {renderRiskAssessment()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Vitals */}
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Daily Vitals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <HealthMetric 
                icon={HeartPulse}
                label="Heart Rate"
                value={healthMetrics.heartRate.value}
                unit={healthMetrics.heartRate.unit}
                trend={healthMetrics.heartRate.trend}
                trendValue={healthMetrics.heartRate.trendValue}
              />
              <HealthMetric 
                icon={Thermometer}
                label="Temperature"
                value={healthMetrics.temperature.value}
                unit={healthMetrics.temperature.unit}
                trend={healthMetrics.temperature.trend}
                trendValue={healthMetrics.temperature.trendValue}
              />
            </CardContent>
          </Card>

          {/* Weight and Hydration */}
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Weight & Hydration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <HealthMetric 
                icon={Scale}
                label="Weight"
                value={healthMetrics.weight.value}
                unit={healthMetrics.weight.unit}
                trend={healthMetrics.weight.trend}
                trendValue={healthMetrics.weight.trendValue}
              />
              <HealthMetric 
                icon={Droplet}
                label="Water Intake"
                value={healthMetrics.waterIntake.value}
                unit={healthMetrics.waterIntake.unit}
                trend={healthMetrics.waterIntake.trend}
                trendValue={healthMetrics.waterIntake.trendValue}
              />
            </CardContent>
          </Card>
        </div>

        {/* Health Timeline */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle>Health Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>No recent health events to display</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}
