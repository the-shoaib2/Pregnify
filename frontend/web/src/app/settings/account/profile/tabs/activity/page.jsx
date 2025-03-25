import React, { useState, useCallback, useMemo, useEffect } from "react"
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
  Loader2,
  LogIn,
  UserPlus,
  Settings,
  Mail,
  Phone,
  Shield,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Info,
  Calendar
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistance, format, isAfter, isBefore, isEqual, parseISO } from "date-fns"
import { toast } from "react-hot-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

// Activity type icons mapping
const ACTIVITY_ICONS = {
  LOGIN: LogIn,
  REGISTER: UserPlus,
  SETTINGS_UPDATE: Settings,
  EMAIL_VERIFY: Mail,
  PHONE_VERIFY: Phone,
  SECURITY_UPDATE: Shield,
  DEFAULT: Activity
};

// Activity type colors mapping
const ACTIVITY_COLORS = {
  LOGIN: "text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800",
  LOGOUT: "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800",
  REGISTER: "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800",
  SETTINGS_UPDATE: "text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800",
  EMAIL_VERIFY: "text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800",
  PHONE_VERIFY: "text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800",
  SECURITY_UPDATE: "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800",
  DEFAULT: "text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800"
};

// Add activity grouping by date
const groupActivitiesByDate = (activities) => {
  return activities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});
};

function ActivityItem({ activity }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.DEFAULT;
  const colorClass = ACTIVITY_COLORS[activity.type] || ACTIVITY_COLORS.DEFAULT;
  
  // Format metadata values
  const formatMetadataValue = (key, value) => {
    switch (key) {
      case 'email':
        return value;
      case 'role':
        return value.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      case 'loginTime':
        return format(new Date(value), 'PPpp');
      default:
        return value;
    }
  };

  // Metadata display order and labels
  const metadataOrder = {
    email: { label: 'Email', icon: Mail },
    role: { label: 'Role', icon: Shield },
    loginTime: { label: 'Login Time', icon: Clock }
  };
  
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className="w-full transition-all duration-300 ease-in-out"
    >
      <div className="flex items-start space-x-4 p-2 px-4 rounded-lg border bg-card hover:bg-accent/5 transition-all duration-200">
        <div className="mt-1">
          <Badge 
            // variant="outline" 
            className={`h-10 w-10 rounded-full p-0 flex items-center justify-center  ${colorClass}`}
          >
            <IconComponent className="h-5 w-5" />
          </Badge>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none">
                  {activity.description}
                </p>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-4 hover:bg-accent/50 rounded-md border-muted-foreground/50 hover:border-muted-foreground/70 transition-all duration-200"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3 transition-transform duration-200" />
                    ) : (
                      <ChevronDown className="h-3 w-3 transition-transform duration-200" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <time 
                  dateTime={activity.timestamp} 
                  title={format(new Date(activity.timestamp), 'PPpp')}
                  className="tabular-nums"
                >
                  {format(new Date(activity.timestamp), 'h:mm a')}
                </time>
                {!isExpanded && activity.metadata && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {Object.keys(activity.metadata).length} metadata items
                    </span>
                  </>
                )}
              </div>
            </div>
            <Badge 
              className={`text-xs px-2 py-0.5 w-fit ${colorClass}`}
            >
              {activity.type}
            </Badge>
          </div>
          
          <CollapsibleContent className="transition-all duration-300 ease-in-out">
            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <div className="mt-3 bg-muted/50 rounded-lg overflow-hidden border">
                <div className="grid divide-y">
                  {Object.entries(metadataOrder).map(([key, { label, icon: Icon }]) => {
                    const value = activity.metadata[key];
                    if (!value) return null;
                    
                    return (
                      <div 
                        key={key}
                        className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-muted/70 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div className={`
                          flex items-center gap-2 
                          min-w-[100px] px-2 py-1 
                          rounded-full
                          ${colorClass}
                          transition-colors
                        `}>
                          <Icon className="h-3.5 w-3.5" />
                          <span className="font-medium">{label}:</span>
                        </div>
                        <span className="text-muted-foreground break-all">
                          {formatMetadataValue(key, value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );
}

function ActivityTimeline({ activities }) {
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

function ActivityFilterDropdown({ filter, setFilter }) {
  const filterTypes = {
    ALL: { label: 'All Activities', icon: Activity },
    ...ACTIVITY_ICONS
  };

  const getFilterLabel = () => {
    if (filter === 'all') return 'All Activities';
    return filter.replace(/_/g, ' ');
  };

  const getFilterIcon = () => {
    if (filter === 'all') return Activity;
    return ACTIVITY_ICONS[filter] || Activity;
  };

  const IconComponent = getFilterIcon();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          size="sm"
        >
          <IconComponent className="h-4 w-4" />
          {getFilterLabel()}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Filter Activities</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => setFilter('all')}
          className={`gap-2 ${filter === 'all' ? 'bg-accent' : ''}`}
        >
          <Activity className="h-4 w-4" />
          <span>All Activities</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {Object.entries(ACTIVITY_ICONS).map(([type, Icon]) => (
          <DropdownMenuItem
            key={type}
            onClick={() => setFilter(type)}
            className={`gap-2 ${filter === type ? 'bg-accent' : ''}`}
          >
            <Icon className="h-4 w-4" />
            <span>{type.replace(/_/g, ' ')}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DateRangeSelector({ dateRange, setDateRange }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const handleSelect = (date) => {
    if (!dateRange.from) {
      setDateRange({ from: date, to: undefined });
    } else if (dateRange.from && !dateRange.to) {
      if (isBefore(date, dateRange.from)) {
        setDateRange({ from: date, to: dateRange.from });
      } else {
        setDateRange({ from: dateRange.from, to: date });
      }
      setIsCalendarOpen(false);
    } else {
      setDateRange({ from: date, to: undefined });
    }
  };
  
  const clearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
    setIsCalendarOpen(false);
  };
  
  const formatDateRange = () => {
    if (!dateRange.from && !dateRange.to) return "All Dates";
    if (dateRange.from && !dateRange.to) return format(dateRange.from, "MMM d, yyyy");
    if (dateRange.from && dateRange.to) {
      if (isEqual(dateRange.from, dateRange.to)) return format(dateRange.from, "MMM d, yyyy");
      return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
    }
  };
  
  return (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          size="sm"
        >
          <Calendar className="h-4 w-4" />
          {formatDateRange()}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Select Date Range</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearDateRange}
              className="h-8 px-2 text-xs"
            >
              Clear
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {!dateRange.from && "Select start date"}
            {dateRange.from && !dateRange.to && "Select end date"}
            {dateRange.from && dateRange.to && "Date range selected"}
          </p>
        </div>
        <CalendarComponent
          mode="range"
          selected={{
            from: dateRange.from,
            to: dateRange.to,
          }}
          onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
          initialFocus
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  );
}

export default function ActivityTab({ profile }) {
  const [activities, setActivities] = useState(profile?.activity?.recent || []);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isExpanded, setIsExpanded] = useState(true);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

  useEffect(() => {
    console.log('Activity Tab Data:', {
      activities,
      lastLogin: profile?.activity?.lastLogin,
      filter,
      activityCount: activities.length,
      timestamp: new Date().toISOString()
    });
  }, [activities, filter, profile?.activity]);

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
    
    // Filter by date range
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(activity => {
        const activityDate = parseISO(activity.timestamp);
        
        if (dateRange.from && dateRange.to) {
          return (
            (isAfter(activityDate, dateRange.from) || isEqual(activityDate, dateRange.from)) && 
            (isBefore(activityDate, dateRange.to) || isEqual(activityDate, dateRange.to))
          );
        }
        
        if (dateRange.from && !dateRange.to) {
          const endOfDay = new Date(dateRange.from);
          endOfDay.setHours(23, 59, 59, 999);
          return (
            isAfter(activityDate, dateRange.from) || 
            isEqual(activityDate, dateRange.from)
          ) && (
            isBefore(activityDate, endOfDay) || 
            isEqual(activityDate, endOfDay)
          );
        }
        
        return true;
      });
    }
    
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