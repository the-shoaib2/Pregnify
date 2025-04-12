import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, CheckCircle2, Lightbulb } from "lucide-react"

export const DateDisplay = ({ date }) => {
  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return date.toLocaleDateString('en-US', options)
  }

  // Mock data for today's tasks and suggestions
  const todayTasks = [
    { id: 1, task: "Morning walk (30 mins)", completed: false },
    { id: 2, task: "Take prenatal vitamins", completed: true },
    { id: 3, task: "Drink 8 glasses of water", completed: false }
  ]

  const todaySuggestions = [
    { id: 1, suggestion: "Try some gentle yoga exercises" },
    { id: 2, suggestion: "Read about week 12 pregnancy development" },
    { id: 3, suggestion: "Schedule your next doctor's appointment" }
  ]

  return (
    <div className="space-y-3">
      {/* Date Display */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-primary">
            {date.getDate()}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDate(date)}
          </div>
        </div>
        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Today's Tasks and Suggestions */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tasks */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-1.5">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${task.completed ? 'bg-green-500' : 'bg-muted'}`} />
                  <span className={`text-xs ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.task}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-primary" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-1.5">
              {todaySuggestions.map((suggestion) => (
                <div key={suggestion.id} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                  <span className="text-xs">{suggestion.suggestion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 