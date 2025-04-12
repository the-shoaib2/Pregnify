import { Card, CardContent } from "@/components/ui/card"
import { Baby, Heart, Activity, Bell } from "lucide-react"

export function QuickStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="transition-all duration-300 hover:shadow-md">
            <CardContent className="p-4 h-32 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">
                  {stat.label === "Current Week" && "of 40 weeks pregnancy"}
                  {stat.label === "Heart Rate" && "beats per minute"}
                  {stat.label === "Activity Level" && "recommended daily activity"}
                  {stat.label === "Next Checkup" && "until your next appointment"}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 