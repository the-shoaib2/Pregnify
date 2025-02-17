import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  CheckCircle2, 
  AlertCircle,
  UserCircle,
  GraduationCap,
  Shield,
  Info,
  ArrowRight,
  Star
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

// Skeleton loader component
function ProfileCompletionSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-16" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Sections Grid Skeleton */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-1.5 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border p-2">
                <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProfileCompletionCard({ user, isLoading }) {
  if (isLoading) {
    return <ProfileCompletionSkeleton />
  }

  const completionDetails = user?.completionDetails || user?.stats?.completion?.details || {}
  const score = completionDetails?.score || 0
  const sections = completionDetails?.sections || []
  const suggestions = user?.stats?.completion?.suggestions || completionDetails?.suggestions || []

  // color: "text-emerald-500", bg: "bg-emerald-50"
  // Section icons with colors
  const sectionIcons = {
    basicInfo: { icon: UserCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
    personalInfo: { icon: Info, color: "text-emerald-500", bg: "bg-emerald-50" },
    education: { icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-50" },
    verification: { icon: Shield, color: "text-emerald-500", bg: "bg-emerald-50" },
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Profile Completion</CardTitle>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2"
        >
          <div className="text-right">
            <p className="text-xl font-bold text-foreground">{score}%</p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <Progress 
            value={score} 
            className="h-2 bg-emerald-50" 
            indicatorClassName="bg-emerald-500"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{score}% Completed</span>
          </div>
        </div>

        {/* Section Progress - Responsive Grid */}
        {sections?.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sections.map((section, index) => {
                const { icon: Icon } = sectionIcons[section.section] || { icon: Info }
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={section.section}
                    className="relative rounded-lg border bg-card p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-emerald-500" />
                      <p className="text-sm font-medium capitalize">
                        {section.section.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Progress 
                        value={section.percentage} 
                        className="h-1.5 bg-foreground/20" 
                        indicatorClassName="bg-foreground"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{section.completed}/{section.total}</span>
                        <span>{Math.round(section.percentage)}%</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Suggestions - Responsive List */}
        {suggestions?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recommended Actions</h4>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={index}
                  className="group flex items-center gap-2 rounded-lg border bg-card p-2 hover:bg-accent/50"
                >
                  {suggestion.priority === 'HIGH' ? (
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  ) : (
                    <Info className="h-4 w-4 text-emerald-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{suggestion.message}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        {completionDetails?.lastUpdated && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground"
          >
            Updated {new Date(completionDetails.lastUpdated).toLocaleDateString()}
          </motion.p>
        )}
      </CardContent>
    </Card>
  )
} 