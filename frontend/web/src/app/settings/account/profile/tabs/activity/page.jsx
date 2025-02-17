import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { 
  Activity,
  Clock,
  Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistance } from "date-fns"

function ActivityTimeline({ activities }) {
  if (!activities?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent activity
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-4">
          <div className="mt-1">
            <Badge variant="outline" className="h-6 w-6 rounded-full p-0">
              <Activity className="h-3 w-3" />
            </Badge>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{activity.description}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              <time dateTime={activity.createdAt}>
                {formatDistance(new Date(activity.createdAt), new Date(), { 
                  addSuffix: true 
                })}
              </time>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ActivityTab({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your recent actions and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ActivityTimeline activities={user?.activity?.recentActivities} />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <Loader2 className="mr-2 h-4 w-4" />
          Refresh Activity
        </Button>
      </CardFooter>
    </Card>
  )
} 