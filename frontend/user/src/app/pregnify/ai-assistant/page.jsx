'use client'

import { useState, useEffect, useRef } from "react"
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
import { useParams, Link, useNavigate } from "react-router-dom"
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Activity, 
  Heart, 
  Baby, 
  Thermometer, 
  Droplet, 
  Scale, 
  Clock, 
  MessageSquare, 
  Loader2,
  Shield,
  Lock,
  User,
  Calendar,
  ArrowRight
} from "lucide-react"

// Risk level badge component
const RiskLevelBadge = ({ level }) => {
  const variants = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800'
  }

  return (
    <Badge className={variants[level] || 'bg-gray-100 text-gray-800'}>
      {level}
    </Badge>
  )
}

// Helper function to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helper function to parse JSON strings safely
const parseJSON = (str) => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return []
  }
}

// AI Assistant Page
export default function AIAssistantPage() {
  const { user } = useAuth()
  const { pregnancyId } = useParams()
  const navigate = useNavigate()
  const [pregnancyDetails, setPregnancyDetails] = useState(null)
  const [riskAssessment, setRiskAssessment] = useState(null)
  const [aiPrediction, setAiPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [streaming, setStreaming] = useState(false)
  const [streamData, setStreamData] = useState([])
  const [accessDenied, setAccessDenied] = useState(false)
  const abortControllerRef = useRef(null)

  // Fetch pregnancy details
  const fetchPregnancyDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      setAccessDenied(false)
      
      if (!pregnancyId) {
        setError("Pregnancy ID is required")
        setLoading(false)
        return
      }
      
      const data = await PregnancyService.getPregnancyDetails(pregnancyId)
      setPregnancyDetails(data)
    } catch (err) {
      console.error("Error fetching pregnancy details:", err)
      if (err.message.includes('Access denied')) {
        setAccessDenied(true)
      } else {
        setError(err.message || "Failed to load pregnancy details")
      }
    } finally {
      setLoading(false)
    }
  }

  // Fetch risk assessment data
  const fetchRiskAssessment = async () => {
    try {
      setLoading(true)
      setError(null)
      setAccessDenied(false)
      
      if (!pregnancyId) {
        setError("Pregnancy ID is required")
        setLoading(false)
        return
      }
      
      const data = await PregnancyService.getRiskAssessment(pregnancyId)
      setRiskAssessment(data)
    } catch (err) {
      console.error("Error fetching risk assessment:", err)
      if (err.message.includes('Access denied')) {
        setAccessDenied(true)
      } else {
        setError(err.message || "Failed to load risk assessment")
      }
    } finally {
      setLoading(false)
    }
  }

  // Start AI prediction stream
  const startAiStream = async () => {
    try {
      if (!pregnancyId) {
        setError("Pregnancy ID is required")
        return
      }
      
      setStreaming(true)
      setStreamData([])
      setError(null)
      setAccessDenied(false)
      
      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController()
      
      await PregnancyService.streamAIPredictions(
        pregnancyId,
        (data) => {
          setStreamData(prev => [...prev, data])
        },
        (err) => {
          console.error("Error in AI stream:", err)
          if (err.message.includes('Access denied')) {
            setAccessDenied(true)
          } else {
            setError(err.message || "Error in AI prediction stream")
          }
          setStreaming(false)
        },
        () => {
          setStreaming(false)
        }
      )
    } catch (err) {
      console.error("Error starting AI stream:", err)
      if (err.message.includes('Access denied')) {
        setAccessDenied(true)
      } else {
        setError(err.message || "Failed to start AI prediction")
      }
      setStreaming(false)
    }
  }

  // Stop AI prediction stream
  const stopAiStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setStreaming(false)
  }

  // Load data on component mount
  useEffect(() => {
    fetchPregnancyDetails()
    fetchRiskAssessment()
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [pregnancyId])

  // Render empty state
  const renderEmptyState = () => {
    return (
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-primary" />
            No Pregnancy Data Found
          </CardTitle>
          <CardDescription>
            Please add your pregnancy information to use the AI Assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/health")} className="w-full">
            Add Pregnancy Information
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

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

    if (!riskAssessment) {
      return (
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>No risk assessment data available</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchRiskAssessment}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      )
    }

    const recommendations = parseJSON(riskAssessment.recommendations)
    const referenceRanges = parseJSON(riskAssessment.referenceRanges)
    const chronicConditions = parseJSON(riskAssessment.chronicConditions)
    const currentMedications = parseJSON(riskAssessment.currentMedications)
    const allergies = parseJSON(riskAssessment.allergies)
    const geneticDisorders = parseJSON(riskAssessment.geneticDisorders)
    const pregnancyComplications = parseJSON(riskAssessment.pregnancyComplications)

  return (
      <div className="space-y-4">
        {/* Overview Card */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Risk Assessment Overview</CardTitle>
              <CardDescription>
                Last updated: {formatDate(riskAssessment.updatedAt)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                Risk Score: {riskAssessment.riskScore}%
              </Badge>
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                {riskAssessment.bloodPressureStatus}
              </Badge>
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                {riskAssessment.bloodSugarStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Age</div>
              <div className="font-medium">{riskAssessment.age} years</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">BMI</div>
              <div className="font-medium">{riskAssessment.bmi}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Weight</div>
              <div className="font-medium">{riskAssessment.weight} kg</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Height</div>
              <div className="font-medium">{riskAssessment.height} cm</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Previous Pregnancies</div>
              <div className="font-medium">{riskAssessment.previousPregnancies}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Medical Checkups</div>
              <div className="font-medium">{riskAssessment.medicalCheckups}</div>
            </div>
          </CardContent>
        </Card>

        {/* Health Status Card */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle>Health Status</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Lifestyle Factors</div>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline" className={riskAssessment.isSmoker ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}>
                    Smoking: {riskAssessment.isSmoker ? "Yes" : "No"}
                  </Badge>
                  <Badge variant="outline" className={riskAssessment.alcoholConsumption ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}>
                    Alcohol: {riskAssessment.alcoholConsumption ? "Yes" : "No"}
                  </Badge>
                  <Badge variant="outline" className={riskAssessment.substanceUse ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}>
                    Substance Use: {riskAssessment.substanceUse ? "Yes" : "No"}
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500">
                    Exercise: {riskAssessment.exerciseHabits}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Health Conditions</div>
                <div className="space-y-2">
                  {chronicConditions.conditions?.map((condition, index) => (
                    <Badge key={index} variant="outline" className="bg-yellow-500/10 text-yellow-500">
                      {condition}
                    </Badge>
                  ))}
                  {pregnancyComplications?.map((complication, index) => (
                    <Badge key={index} variant="outline" className="bg-orange-500/10 text-orange-500">
                      {complication}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Current Medications</div>
                <div className="space-y-2">
                  {currentMedications?.map((medication, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-500/10 text-blue-500">
                      {medication}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Allergies</div>
                <div className="space-y-2">
                  {allergies?.map((allergy, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-500/10 text-purple-500">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Card */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations?.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reference Ranges Card */}
        <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
            <CardTitle>Reference Ranges</CardTitle>
            </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referenceRanges?.women && Object.entries(referenceRanges.women).map(([key, value], index) => (
                <div key={index} className="space-y-1">
                  <div className="text-sm font-medium">{key}</div>
                  <div className="text-sm text-muted-foreground">{value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render AI prediction section
  const renderAiPrediction = () => {
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
                You need a patient account to use the AI Assistant
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
              <Button onClick={startAiStream} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader>
          <CardTitle>AI Health Assistant</CardTitle>
          <CardDescription>
            Get personalized health insights and predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {streaming ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div className="space-y-2">
                {streamData.map((data, index) => (
                  <div key={index} className="p-3 rounded-md bg-muted/50">
                    <div className="flex items-start gap-2">
                      <Brain className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{data.title}</p>
                        <p className="text-sm text-muted-foreground">{data.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={stopAiStream} variant="destructive">
                Stop
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-primary/5 flex flex-col items-center justify-center text-center">
                  <Heart className="h-8 w-8 text-primary mb-2" />
                  <h3 className="text-sm font-medium">Health Insights</h3>
                  <p className="text-xs text-muted-foreground">Get personalized health recommendations</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 flex flex-col items-center justify-center text-center">
                  <Baby className="h-8 w-8 text-primary mb-2" />
                  <h3 className="text-sm font-medium">Baby Development</h3>
                  <p className="text-xs text-muted-foreground">Track your baby's growth and development</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 flex flex-col items-center justify-center text-center">
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <h3 className="text-sm font-medium">Pregnancy Timeline</h3>
                  <p className="text-xs text-muted-foreground">See what to expect in your pregnancy journey</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 flex flex-col items-center justify-center text-center">
                  <MessageSquare className="h-8 w-8 text-primary mb-2" />
                  <h3 className="text-sm font-medium">Ask Questions</h3>
                  <p className="text-xs text-muted-foreground">Get answers to your pregnancy questions</p>
                </div>
              </div>
              <Button onClick={startAiStream} className="w-full">
                <Brain className="mr-2 h-4 w-4" />
                Start AI Assistant
              </Button>
            </div>
          )}
            </CardContent>
          </Card>
    )
  }

  if (!pregnancyDetails && !loading) {
    return (
      <RoleBasedLayout headerTitle="AI Health Assistant">
        <div className="flex flex-1 flex-col gap-4 p-4 max-w-7xl mx-auto w-full">
          {renderEmptyState()}
        </div>
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout headerTitle="AI Health Assistant">
      <div className="flex flex-1 flex-col gap-4 mx-auto w-full">
        <Tabs defaultValue="risk" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="ai">AI Assistant</TabsTrigger>
          </TabsList>
          <TabsContent value="risk" className="space-y-4">
            {renderRiskAssessment()}
          </TabsContent>
          <TabsContent value="ai" className="space-y-4">
            {renderAiPrediction()}
          </TabsContent>
        </Tabs>
      </div>
    </RoleBasedLayout>
  )
} 