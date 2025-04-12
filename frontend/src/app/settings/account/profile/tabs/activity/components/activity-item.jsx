import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Info, 
  Mail, 
  Shield 
} from "lucide-react";
import { ACTIVITY_ICONS, ACTIVITY_COLORS } from "../constants";

export function ActivityItem({ activity }) {
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
            className={`h-10 w-10 rounded-full p-0 flex items-center justify-center ${colorClass}`}
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