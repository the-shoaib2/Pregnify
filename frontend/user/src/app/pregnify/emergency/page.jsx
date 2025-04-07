import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Phone, 
  Ambulance, 
  Hospital, 
  Stethoscope, 
  AlertTriangle,
  MapPin,
  Clock
} from "lucide-react"

const EmergencyContact = ({ icon: Icon, title, number, description }) => (
  <div className="flex items-start gap-4">
    <div className="rounded-full bg-primary/10 p-2">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div className="flex-1">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button variant="link" className="h-auto p-0 text-primary">
        <Phone className="mr-2 h-4 w-4" />
        {number}
      </Button>
    </div>
  </div>
)

export default function EmergencyPage() {
  const emergencyContacts = [
    {
      icon: Ambulance,
      title: "Emergency Services",
      number: "911",
      description: "For immediate medical emergencies"
    },
    {
      icon: Hospital,
      title: "Nearest Hospital",
      number: "(555) 123-4567",
      description: "City General Hospital - 2.5 miles away"
    },
    {
      icon: Stethoscope,
      title: "OB/GYN Emergency",
      number: "(555) 987-6543",
      description: "Dr. Smith - Available 24/7"
    }
  ]

  const emergencySymptoms = [
    "Severe abdominal pain",
    "Heavy bleeding",
    "Severe headache",
    "Blurred vision",
    "Sudden swelling",
    "Decreased fetal movement"
  ]

  return (
    <RoleBasedLayout headerTitle="Emergency">
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {emergencyContacts.map((contact, index) => (
              <EmergencyContact key={index} {...contact} />
            ))}
          </CardContent>
        </Card>

        {/* Emergency Symptoms */}
        <Card>
          <CardHeader>
            <CardTitle>When to Call Emergency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Call emergency services immediately if you experience:</span>
              </div>
              <ul className="list-inside list-disc space-y-2 text-sm">
                {emergencySymptoms.map((symptom, index) => (
                  <li key={index} className="text-muted-foreground">
                    {symptom}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="destructive" className="flex-1">
              <Phone className="mr-2 h-4 w-4" />
              Call 911
            </Button>
            <Button variant="outline" className="flex-1">
              <MapPin className="mr-2 h-4 w-4" />
              Share Location
            </Button>
            <Button variant="outline" className="flex-1">
              <Clock className="mr-2 h-4 w-4" />
              Track Symptoms
            </Button>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
} 