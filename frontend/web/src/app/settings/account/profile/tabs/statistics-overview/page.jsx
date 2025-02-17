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

export default function StatsOverviewCard({ user }) {
  const stats = [
    {
      label: "Posts",
      value: user?.stats?.posts || 0,
      icon: FileText,
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      label: "Following",
      value: user?.social?.followingCount || 0,
      icon: Users,
      color: "bg-green-500/10 text-green-500"
    },
    {
      label: "Followers",
      value: user?.social?.followersCount || 0,
      icon: UserPlus,
      color: "bg-purple-500/10 text-purple-500"
    },
    {
      label: "Reputation",
      value: user?.stats?.reputation || 0,
      icon: Star,
      color: "bg-amber-500/10 text-amber-500"
    }
  ]

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Statistics Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 rounded-lg p-4",
                  stat.color
                )}
              >
                <Icon className="h-5 w-5" />
                <div>
                  <p className="text-lg font-semibold leading-none">{stat.value}</p>
                  <p className="text-xs font-medium opacity-70">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 