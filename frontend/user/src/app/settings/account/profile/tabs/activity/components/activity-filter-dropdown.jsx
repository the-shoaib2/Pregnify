import React from "react";
import { Activity, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { ACTIVITY_ICONS } from "../constants";

export function ActivityFilterDropdown({ filter, setFilter }) {
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