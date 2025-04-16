import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PregnancyService } from "@/services/pregnify"
import { useParams } from "react-router-dom"
import { 
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Shield,
  Stethoscope,
  Pill,
  Droplet,
  Thermometer,
  Scale,
  Brain
} from "lucide-react"
import { RiskLevelBadge } from "./risk-level-badge"
import { Link } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const RiskAssessmentHistory = () => {
  const { pregnancyId } = useParams()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const response = await PregnancyService.getRiskAssessmentHistory(pregnancyId)
        setAssessments(response.data || [])
      } catch (err) {
        console.error("Error fetching risk assessment history:", err)
        setError(err.message || "Failed to load risk assessment history")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [pregnancyId])

  const getRiskLevel = (score) => {
    if (score <= 20) return 'LOW'
    if (score <= 40) return 'MEDIUM'
    return 'HIGH'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const parseJSON = (str) => {
    try {
      return JSON.parse(str)
    } catch (e) {
      return []
    }
  }

  const getRiskTrend = (currentScore, previousScore) => {
    if (!previousScore) return null
    const difference = currentScore - previousScore
    if (difference > 0) return { icon: TrendingUp, color: "text-red-500", text: "Increased" }
    if (difference < 0) return { icon: TrendingDown, color: "text-green-500", text: "Decreased" }
    return { icon: CheckCircle2, color: "text-blue-500", text: "Stable" }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="transition-all duration-300 hover:shadow-md">
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
        ))}
      </div>
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
        </CardContent>
      </Card>
    )
  }

  if (assessments.length === 0) {
    return (
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">No Risk Assessment History</h3>
            <p className="text-sm text-muted-foreground">
              Complete a risk assessment to start tracking your pregnancy health
            </p>
          </div>
          <Button asChild>
            <Link to={`/health/${pregnancyId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Health Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Risk Assessment History</h2>
        <Button asChild variant="outline">
          <Link to={`/health/${pregnancyId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {assessments.map((assessment, index) => {
          const previousAssessment = assessments[index + 1]
          const trend = getRiskTrend(assessment.riskScore, previousAssessment?.riskScore)
          const chronicConditions = parseJSON(assessment.chronicConditions)
          const allergies = parseJSON(assessment.allergies)
          const pregnancyComplications = parseJSON(assessment.pregnancyComplications)
          const recommendations = parseJSON(assessment.recommendations)
          const currentMedications = parseJSON(assessment.currentMedications)

          return (
            <Card key={assessment.id} className="transition-all duration-300 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Assessment #{assessments.length - index}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(assessment.updatedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {trend && (
                    <div className="flex items-center gap-1 text-sm">
                      <trend.icon className={`h-4 w-4 ${trend.color}`} />
                      <span className={trend.color}>{trend.text}</span>
                    </div>
                  )}
                  <RiskLevelBadge level={getRiskLevel(assessment.riskScore)} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Risk Score</span>
                    <span className="font-medium">{assessment.riskScore}%</span>
                  </div>
                  <Progress value={assessment.riskScore} className="h-2" />
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="health">Health Status</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Health Summary
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-muted-foreground" />
                            <span><span className="text-muted-foreground">Nutrition Status:</span> {assessment.nutritionStatus}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <span><span className="text-muted-foreground">Exercise Habits:</span> {assessment.exerciseHabits}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-muted-foreground" />
                            <span><span className="text-muted-foreground">Mental Health:</span> {assessment.mentalHealthStatus}</span>
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Lifestyle Factors
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            <span><span className="text-muted-foreground">Smoking:</span> {assessment.isSmoker ? 'Yes' : 'No'}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            <span><span className="text-muted-foreground">Alcohol:</span> {assessment.alcoholConsumption ? 'Yes' : 'No'}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-muted-foreground" />
                            <span><span className="text-muted-foreground">Diet Quality:</span> {assessment.dietQuality}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="health" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />
                          Health Conditions
                        </h4>
                        <div className="space-y-2">
                          {chronicConditions.conditions?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Pill className="h-4 w-4" />
                                Chronic Conditions
                              </p>
                              <ul className="list-disc list-inside text-sm ml-6">
                                {chronicConditions.conditions.map((condition, index) => (
                                  <li key={index}>{condition}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {allergies?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Allergies
                              </p>
                              <ul className="list-disc list-inside text-sm ml-6">
                                {allergies.map((allergy, index) => (
                                  <li key={index}>{allergy}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {currentMedications?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Pill className="h-4 w-4" />
                                Current Medications
                              </p>
                              <ul className="list-disc list-inside text-sm ml-6">
                                {currentMedications.map((medication, index) => (
                                  <li key={index}>{medication}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Vital Signs
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2">
                            <Droplet className="h-4 w-4 text-muted-foreground" />
                            <span><span className="text-muted-foreground">Blood Pressure:</span> {assessment.bloodPressureStatus}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-muted-foreground" />
                            <span><span className="text-muted-foreground">Blood Sugar:</span> {assessment.bloodSugarStatus}</span>
                          </p>
                        </div>
                        {pregnancyComplications?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mt-4 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Pregnancy Complications
                            </h4>
                            <ul className="list-disc list-inside text-sm ml-6">
                              {pregnancyComplications.map((complication, index) => (
                                <li key={index}>{complication}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {recommendations?.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 