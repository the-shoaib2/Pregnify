import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { 
  Activity,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDistance, format } from "date-fns";
import { toast } from "react-hot-toast";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Direct imports instead of using index.js
import { ActivityTimeline } from "./components/activity-timeline";
import { ActivityFilterDropdown } from "./components/activity-filter-dropdown";
import { DateRangeSelector } from "./components/date-range-selector";
import { filterActivitiesByDate } from "./components/date-utils";

export default function ActivityTab({ profile }) {
  const [activities, setActivities] = useState(profile?.activity?.recent || []);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isExpanded, setIsExpanded] = useState(true);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

  // Fetch latest activities
  const refreshActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/activities');
      if (!response.ok) throw new Error('Failed to fetch activities');
      
      const data = await response.json();
      setActivities(data.activities);
      toast.success('Activities refreshed');
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to refresh activities');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredActivities = useMemo(() => {
    let filtered = activities;
    
    // Filter by activity type
    if (filter !== 'all') {
      filtered = filtered.filter(activity => activity.type === filter);
    }
    
    // Filter by date range using the extracted function
    filtered = filterActivitiesByDate(filtered, dateRange);
    
    return filtered;
  }, [activities, filter, dateRange]);

  return (
    <Card className="animate-in fade-in duration-300 relative transition-all">
      <Collapsible
        open={isExpanded}
        onOpenChange={setIsExpanded}
        className="space-y-2 transition-all duration-300 ease-in-out"
      >
        <div className="absolute right-4 top-4 flex items-center gap-2 z-10">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CardHeader className="space-y-1 pr-24">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={refreshActivities}
              disabled={isLoading}
              size="sm"
              className="gap-2 ml-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          <CardDescription className="flex items-center gap-2">
            Track your account activity and security events
          </CardDescription>
        </CardHeader>

        <CollapsibleContent className="transition-all duration-300 ease-in-out">
          <CardContent className="space-y-6">
            {/* Activity Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <ActivityFilterDropdown filter={filter} setFilter={setFilter} />
                <DateRangeSelector dateRange={dateRange} setDateRange={setDateRange} />
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredActivities.length} {filter === 'all' ? 'total' : filter.toLowerCase()} activities
              </div>
            </div>

            {/* Activity Timeline with ScrollArea */}
            <div className="relative">
              <ActivityTimeline activities={filteredActivities} />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between pt-6">
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Last active: {profile?.activity?.lastLogin ? format(new Date(profile?.activity?.lastLogin), 'PPpp') : 'Never'}
              </div>
            </div>
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>

      {!isExpanded && (
        <div className="px-6 pb-4 text-sm text-muted-foreground transition-all duration-300 ease-in-out">
          {filteredActivities.length} activities • Last active {profile?.activity?.lastLogin ? formatDistance(new Date(profile?.activity?.lastLogin), new Date(), { addSuffix: true }) : 'Never'}
        </div>
      )}
    </Card>
  )
}