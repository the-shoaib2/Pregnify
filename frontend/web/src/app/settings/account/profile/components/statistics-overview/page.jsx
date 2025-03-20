import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { 
  FileText,
  Users,
  UserPlus,
  Star
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export default function StatsOverviewCard({ user, isLoading }) {
  const [selectedStat, setSelectedStat] = useState(null)

  const stats = [
    {
      label: "Posts",
      value: user?.stats?.posts || 0,
      icon: FileText,
      color: "bg-blue-500/10 text-blue-500",
      description: "Total number of posts you've created"
    },
    {
      label: "Following",
      value: user?.social?.followingCount || 0,
      icon: Users,
      color: "bg-green-500/10 text-green-500",
      description: "People you are following"
    },
    {
      label: "Followers",
      value: user?.social?.followersCount || 0,
      icon: UserPlus,
      color: "bg-purple-500/10 text-purple-500",
      description: "People following you"
    },
    {
      label: "Reputation",
      value: user?.stats?.reputation || 0,
      icon: Star,
      color: "bg-amber-500/10 text-amber-500",
      description: "Your reputation score based on community interaction"
    }
  ]

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4 sm:gap-4">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="flex items-center gap-2 sm:gap-3 rounded-lg p-2 sm:p-4 bg-muted/10">
                <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded-full" />
                <div className="space-y-1 sm:space-y-2">
                  <Skeleton className="h-5 w-10 sm:h-6 sm:w-12" />
                  <Skeleton className="h-3 w-14 sm:h-4 sm:w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-4 sm:p-4">
        <CardHeader className="p-0">
          <CardTitle className="pb-2 text-sm font-medium">Statistics Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4 sm:gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              const formattedValue = formatNumber(stat.value)
              return (
                <HoverCard key={index}>
                  <HoverCardTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full p-0 h-auto hover:bg-transparent"
                      onClick={() => setSelectedStat(stat)}
                    >
                      <div
                        className={cn(
                          "flex w-full items-center rounded-lg p-1 px-2 sm:px-3 transition-colors hover:bg-opacity-80",
                          "group relative overflow-hidden",
                          stat.color
                        )}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                        <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1 ml-1 sm:ml-2">
                          <p className="text-base sm:text-lg font-semibold leading-none tracking-tight truncate" title={stat.value.toString()}>
                            {formattedValue}
                          </p>
                          <p className="text-xs font-medium opacity-70 truncate" title={stat.label}>
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent 
                    className="w-64 shadow-lg"
                    align="center"
                    sideOffset={8}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-5 w-5", stat.color.split(" ")[1])} />
                        <h4 className="text-sm font-semibold">{stat.label}</h4>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{stat.description}</p>
                        <p className="text-sm font-medium">
                          Total: <span className="font-semibold">{stat.value.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedStat} onOpenChange={() => setSelectedStat(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {selectedStat && (
                <selectedStat.icon 
                  className={cn(
                    "h-5 w-5",
                    selectedStat.color.split(" ")[1]
                  )} 
                />
              )}
              <DialogTitle>{selectedStat?.label} Details</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{selectedStat?.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current value:</span>
                <span className="text-lg font-semibold">
                  {selectedStat?.value.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}