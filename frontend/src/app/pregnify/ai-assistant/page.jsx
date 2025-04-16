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

  // Start AI prediction stream
  const startAiStream = async () => {
    if (streaming) return;
  
    try {
      const pregnancyIdToUse = pregnancyId || (pregnancyDetails && pregnancyDetails.id);
      
      if (!pregnancyIdToUse) {
        setError("Pregnancy ID is required for AI analysis");
        return;
      }
  
      setStreaming(true);
      setStreamData([]);
      setError(null);
      setAccessDenied(false);
      setAiPrediction(null);
  
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
  
      let localStreamData = [];
  
      await PregnancyService.getAIPredictions(
        pregnancyIdToUse,
        (data) => {
          if (!data || typeof data !== 'object') {
            console.warn('Invalid data received:', data);
            return;
          }
  
          try {
            localStreamData.push(data);
            setStreamData(prev => [...prev, data]);
  
            if (data.content?.trim()) {
              setAiPrediction(prev => ({
                content: prev ? `${prev.content}\n${data.content.trim()}` : data.content.trim()
              }));
            }
          } catch (err) {
            console.error('Error processing stream data:', err);
          }
        },
        (err) => {
          console.error('Stream error:', err);
          if (err?.message?.includes('Access denied')) {
            setAccessDenied(true);
          } else if (err?.message?.includes('Network Error')) {
            setError("Network connection lost. Please check your internet connection and try again.");
          } else {
            setError(err?.message || "Error in AI prediction stream. Please try again.");
          }
          setStreaming(false);
        },
        () => {
          if (localStreamData.length === 0) {
            setError("No prediction data received. Please try again.");
          }
          setStreaming(false);
        }
      );
    } catch (err) {
      console.error('Error starting AI stream:', err);
      if (err?.message?.includes('Access denied')) {
        setAccessDenied(true);
      } else if (err?.message?.includes('Network Error')) {
        setError("Network connection lost. Please check your internet connection and try again.");
      } else {
        setError(err?.message || "Failed to start AI prediction. Please check your connection and try again.");
      }
      setStreaming(false);
    }
  };

  // Fetch pregnancy details
  const fetchPregnancyDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      setAccessDenied(false)

      // Get all pregnancy records first
      const response = await PregnancyService.getPregnancyDetails()
      
      // If we have a specific pregnancyId, find that record
      if (pregnancyId && response.data) {
        const specificPregnancy = response.data.find(p => p.id === pregnancyId)
        if (specificPregnancy) {
          setPregnancyDetails(specificPregnancy)
        } else {
          setError(`Pregnancy record with ID ${pregnancyId} not found`)
        }
      } else if (response.data && response.data.length > 0) {
        // If no specific ID but we have records, use the first one
        setPregnancyDetails(response.data[0])
        
        // If we're not already navigating to a specific ID, navigate directly here
        // This helps avoid the race condition with the useEffect
        if (!pregnancyId) {
          console.log('Navigating directly to:', response.data[0].id)
          navigate(`/ai-assistant/${response.data[0].id}`, { replace: true })
        }
      } else {
        // No pregnancy records found
        console.log('No pregnancy records found')
        setPregnancyDetails(null)
      }
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
  const fetchRiskAssessment = async (id = null) => {
    try {
      setLoading(true)
      setError(null)
      setAccessDenied(false)

      // Use provided id, or pregnancyId from params, or try to get from pregnancyDetails
      const pregnancyIdToUse = id || pregnancyId || (pregnancyDetails && pregnancyDetails.id)
      
      if (!pregnancyIdToUse) {
        setError("Pregnancy ID is required for risk assessment")
        setLoading(false)
        return
      }

      const data = await PregnancyService.getRiskAssessment(pregnancyIdToUse)
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
    console.log('Component mounted, pregnancyId:', pregnancyId)
    fetchPregnancyDetails()
    
    // Only fetch risk assessment if we have a pregnancyId
    if (pregnancyId) {
      console.log('Fetching risk assessment for ID:', pregnancyId)
      fetchRiskAssessment()
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [pregnancyId])

  // We're now handling navigation directly in the fetchPregnancyDetails function
  // This avoids race conditions with state updates and ensures navigation happens
  // immediately after we have the data, rather than waiting for a state update

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

    if (!riskAssessment?.data) {
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

    const assessment = riskAssessment.data
    const recommendations = parseJSON(assessment.recommendations)
    const referenceRanges = parseJSON(assessment.referenceRanges)
    const chronicConditions = parseJSON(assessment.chronicConditions)
    const currentMedications = parseJSON(assessment.currentMedications)
    const allergies = parseJSON(assessment.allergies)
    const geneticDisorders = parseJSON(assessment.geneticDisorders)
    const pregnancyComplications = parseJSON(assessment.pregnancyComplications)

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
                Risk Score: {assessment.riskScore}%
              </Badge>
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                {assessment.bloodPressureStatus}
              </Badge>
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                {assessment.bloodSugarStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Age</div>
              <div className="font-medium">{assessment.age} years</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">BMI</div>
              <div className="font-medium">{assessment.bmi}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Weight</div>
              <div className="font-medium">{assessment.weight} kg</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Height</div>
              <div className="font-medium">{assessment.height} cm</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Previous Pregnancies</div>
              <div className="font-medium">{assessment.previousPregnancies}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Medical Checkups</div>
              <div className="font-medium">{assessment.medicalCheckups}</div>
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
                  <Badge variant="outline" className={assessment.isSmoker ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}>
                    Smoking: {assessment.isSmoker ? "Yes" : "No"}
                  </Badge>
                  <Badge variant="outline" className={assessment.alcoholConsumption ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}>
                    Alcohol: {assessment.alcoholConsumption ? "Yes" : "No"}
                  </Badge>
                  <Badge variant="outline" className={assessment.substanceUse ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}>
                    Substance Use: {assessment.substanceUse ? "Yes" : "No"}
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500">
                    Exercise: {assessment.exerciseHabits}
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
  const renderAIPrediction = () => {
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
      <div className="space-y-4">
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Analysis
              </CardTitle>
              <CardDescription>
                {streaming ? 'Analyzing your health data...' : 'Based on your latest risk assessment data'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {streaming ? (
                <Button variant="outline" onClick={stopAiStream}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={startAiStream}
                  disabled={!pregnancyDetails}
                >
                  {!aiPrediction ? (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Start Analysis
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {streaming ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Processing...</span>
                </div>
                <div className="prose prose-sm max-w-none">
                  {streamData.map((data, index) => (
                    <div key={index} className="space-y-2">
                      {data.content && <p>{data.content}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ) : aiPrediction ? (
              <div className="prose prose-sm max-w-none space-y-4">
                {typeof aiPrediction === 'string' ? (
                  <p>{aiPrediction}</p>
                ) : (
                  <>
                    {aiPrediction.content && <p>{aiPrediction.content}</p>}
                    {aiPrediction.recommendations && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Recommendations</h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {aiPrediction.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Click "Start Analysis" to begin AI assessment of your pregnancy health data
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show empty state if no pregnancy details and not loading
  if (!pregnancyDetails && !loading) {
    return (
      <RoleBasedLayout headerTitle="AI Health Assistant">
        <div className="flex flex-1 flex-col gap-4 p-4 max-w-7xl mx-auto w-full">
          {renderEmptyState()}
        </div>
      </RoleBasedLayout>
    )
  }
  
  // Navigation to the specific pregnancy ID URL is handled by the useEffect hook above

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
            {renderAIPrediction()}
          </TabsContent>
        </Tabs>
      </div>
    </RoleBasedLayout>
  )
}