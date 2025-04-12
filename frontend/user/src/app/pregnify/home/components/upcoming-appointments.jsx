import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar as CalendarIcon } from "lucide-react"

export const UpcomingAppointments = ({ appointments }) => {
  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Upcoming Appointments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appointments?.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment, index) => (
              <div key={index} className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={appointment.doctorImage} />
                  <AvatarFallback>{appointment.doctorName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{appointment.doctorName}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                  </p>
                </div>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertTitle>No Upcoming Appointments</AlertTitle>
            <AlertDescription>
              You don't have any scheduled appointments. Book one now!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
} 