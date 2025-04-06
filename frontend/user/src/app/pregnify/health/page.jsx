import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  HeartPulse, 
  Thermometer, 
  Scale, 
  Droplets,
  TrendingUp,
  TrendingDown,
  Clock
} from "lucide-react"

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
  return (
    <RoleBasedLayout headerTitle="Health Dashboard">
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Pregnancy Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Pregnancy Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Week 24 of 40</span>
                  <span className="font-medium">60% Complete</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Estimated due date: June 15, 2024</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Vitals */}
        <Card>
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
        <Card>
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
              icon={Droplets}
              label="Water Intake"
              value={healthMetrics.waterIntake.value}
              unit={healthMetrics.waterIntake.unit}
              trend={healthMetrics.waterIntake.trend}
              trendValue={healthMetrics.waterIntake.trendValue}
            />
          </CardContent>
        </Card>

        {/* Health Timeline */}
        <Card>
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
