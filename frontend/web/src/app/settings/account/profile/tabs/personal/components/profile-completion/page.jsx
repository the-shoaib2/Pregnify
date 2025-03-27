import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  UserCircle,
  GraduationCap,
  Shield,
  Info,
  ArrowRight,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Skeleton loader component
export function ProfileCompletionSkeleton() {
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

export default function ProfileCompletionCard({ profile, isLoading }) {
  const [activeSection, setActiveSection] = useState(null)
  const [isCollapsed, setIsCollapsed] = useState(true)

  if (isLoading) {
    return <ProfileCompletionSkeleton />
  }

  // Extract completion stats from profile data
  const stats = profile?.stats?.completion || {}
  const score = stats.score || 0
  const sections = stats.details?.sections || []
  const suggestions = stats.suggestions || []
  const lastUpdated = stats.details?.lastUpdated

  // Update getScoreColor to include text colors
  const getScoreColor = (score) => {
    if (score >= 80) return {
      bg: "bg-emerald-500",
      text: "text-emerald-500"
    }
    if (score >= 50) return {
      bg: "bg-amber-500",
      text: "text-amber-500"
    }
    return {
      bg: "bg-red-500",
      text: "text-red-500"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800'
      case 'LOW':
        return 'bg-emerald-100 text-emerald-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  // Modify the progress bar variants to include opacity
  const progressVariants = {
    initial: { width: 0, opacity: 0 },
    animate: (value) => ({
      width: `${value}%`,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    })
  }

  // Enhanced icon animations
  const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3, ease: "backOut" }
    }
  }

  // Section hover animation
  const sectionVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    hover: {
      scale: 1.01,
      transition: { duration: 0.2 }
    }
  }

  // Update section icons mapping to match API data
  const sectionIcons = {
    basicInfo: {
      icon: UserCircle,
      color: "text-blue-500",
      progressColor: "bg-blue-500",
      bg: "bg-blue-50/80",
      label: "Basic Info"
    },
    personalInfo: {
      icon: Info,
      color: "text-purple-500",
      progressColor: "bg-purple-500",
      bg: "bg-purple-50/80",
      label: "Personal Info"
    },
    education: {
      icon: GraduationCap,
      color: "text-emerald-500",
      progressColor: "bg-emerald-500",
      bg: "bg-emerald-50/80",
      label: "Education"
    },
    verification: {
      icon: Shield,
      color: "text-amber-500",
      progressColor: "bg-amber-500",
      bg: "bg-amber-50/80",
      label: "Verification"
    },
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardTitle className="text-lg font-semibold">Profile Completion</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Complete your profile to unlock features
          </p>
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative flex items-center justify-center"
        >
          <div className="relative h-16 w-16 flex items-center justify-center">
            {/* Background circle with border */}
            <div className="absolute inset-0 rounded-full border border-border shadow-sm bg-background"></div>

            {/* Track circle */}
            <svg className="absolute inset-0" width="64" height="64" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                strokeWidth="3"
                className="stroke-secondary/40"
              />
            </svg>

            {/* Colored progress circle */}
            <svg className="absolute inset-0" width="64" height="64" viewBox="0 0 64 64">
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                strokeWidth="4"
                stroke="currentColor"
                initial={{ strokeDasharray: "0 176" }}
                animate={{
                  strokeDasharray: `${(score / 100) * 176} 176`,
                  pathLength: score / 100
                }}
                transition={{
                  duration: 2,
                  ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
                }}
                strokeLinecap="round"
                className="stroke-emerald-500"
                transform="rotate(-90 32 32)"
              />
            </svg>

            {/* Score text */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.8,
                duration: 0.5,
                type: "spring",
                stiffness: 400,
                damping: 10
              }}
              className="relative z-10 flex items-center justify-center"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.3 }}
                className="text-lg font-extrabold text-yellow-500"
              >
                {score}%
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      </CardHeader>

      <Collapsible
        open={!isCollapsed}
        onOpenChange={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="px-6 pb-2">
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-between py-1.5 h-auto px-4 font-medium border-dashed border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all group mb-2"
            >
              <span className="text-xs font-medium flex items-center gap-1.5">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`p-1 rounded-full ${isCollapsed ? 'bg-blue-50/80' : 'bg-amber-50/80'}`}
                >
                  {isCollapsed ? (
                    <Info className="h-3 w-3 text-blue-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                  )}
                </motion.span>
                {isCollapsed ? "View Profile Details" : "Hide Profile Details"}
              </span>
              <motion.div
                whileHover={{ rotate: isCollapsed ? 45 : -45 }}
                className="group-hover:text-primary transition-colors"
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </motion.div>
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Fix Overall Progress */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-1.5"
            >
              <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial="initial"
                  animate="animate"
                  variants={progressVariants}
                  custom={score}
                  className={`absolute left-0 top-0 h-full ${getScoreColor(score).bg}`}
                />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-between text-xs text-muted-foreground"
              >
                <span>Progress</span>
                <span className={score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500'}>
                  {score}% Done
                </span>
              </motion.div>
            </motion.div>

            {/* Fix Section Progress Grid */}
            {sections?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sections.map((section, index) => {
                  const sectionConfig = sectionIcons[section.section]
                  const { icon: Icon, color, progressColor, bg, label } = sectionConfig

                  return (
                    <motion.div
                      variants={sectionVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      transition={{ delay: index * 0.1 }}
                      key={section.section}
                      className={`relative rounded-lg border bg-card p-3 cursor-pointer
                        ${activeSection === section.section ? 'ring-1 ring-primary' : ''}`}
                      onClick={() => setActiveSection(section.section)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <motion.div
                          variants={iconVariants}
                          className={`p-1.5 rounded-full ${bg}`}
                        >
                          <Icon className={`h-4 w-4 ${color}`} />
                        </motion.div>
                        <p className="text-sm font-medium">{label}</p>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="ml-auto"
                        >
                          <Badge variant="secondary" className={`text-xs ${color}`}>
                            {Math.round(section.percentage)}%
                          </Badge>
                        </motion.div>
                      </div>
                      <div className="space-y-1">
                        <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial="initial"
                            animate="animate"
                            variants={progressVariants}
                            custom={section.percentage}
                            className={`absolute left-0 top-0 h-full ${progressColor}`}
                          />
                        </div>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-xs text-muted-foreground"
                        >
                          {section.completedFields}/{section.totalFields} Items
                        </motion.p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Enhanced Suggestions List */}
            {suggestions?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <motion.h4
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-medium flex items-center gap-1.5"
                >
                  <motion.span
                    variants={iconVariants}
                    initial="initial"
                    animate="animate"
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  </motion.span>
                  Recommended Actions
                </motion.h4>
                <div className="space-y-1.5">
                  <AnimatePresence>
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        whileHover={{ x: 2 }}
                        transition={{ delay: index * 0.1 }}
                        key={`${suggestion.section}-${suggestion.field}`}
                        className="group flex items-center gap-2 rounded-lg border bg-card p-2 hover:bg-accent/50 transition-colors"
                      >
                        <motion.div variants={iconVariants}>
                          {suggestion.priority === 'HIGH' ? (
                            <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          ) : (
                            <Info className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          )}
                        </motion.div>
                        <p className="text-xs flex-1">{suggestion.message}</p>
                        <Badge className={`${getPriorityColor(suggestion.priority)} text-xs`}>
                          {suggestion.priority}
                        </Badge>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Enhanced Last Updated */}
            {lastUpdated && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <motion.span variants={iconVariants}>
                  <Clock className="h-3 w-3" />
                </motion.span>
                Updated {format(new Date(lastUpdated), 'PP')}
              </motion.div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Complete Profile Button */}
      <CardFooter className="pt-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >

          <p className="text-xs text-muted-foreground text-center">
            Complete your profile to unlock features
          </p>

        </motion.div>
      </CardFooter>
    </Card>
  )
}
