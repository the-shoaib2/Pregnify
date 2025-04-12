import React from "react";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityItem } from "./activity-item";
import { groupActivitiesByDate } from "./date-utils";

export function ActivityTimeline({ activities }) {
  if (!activities?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm font-medium">No recent activity</p>
        <p className="text-xs">Your activities will appear here</p>
      </div>
    )
  }

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([date, dateActivities]) => (
          <div key={date} className="space-y-3">
            <div className="sticky top-0 z-10 flex items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <h3 className="text-sm font-medium">
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="ml-auto">
                <Badge variant="outline" className="text-xs">
                  {dateActivities.length} activities
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3 pl-4 border-l">
              {dateActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 