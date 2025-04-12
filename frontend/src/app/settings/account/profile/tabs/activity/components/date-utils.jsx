import { parseISO, isAfter, isBefore, isEqual } from "date-fns";

// Function to filter activities by date range
export function filterActivitiesByDate(activities, dateRange) {
  if (!dateRange.from && !dateRange.to) {
    return activities;
  }
  
  return activities.filter(activity => {
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

// Function to group activities by date
export function groupActivitiesByDate(activities) {
  return activities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});
} 