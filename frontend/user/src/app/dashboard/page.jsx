import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Phone, 
  User, 
  Calendar,
  MapPin,
  Briefcase,
  Info,
  Clock,
  HeartPulse,
  Baby,
  Bell,
  MessageSquare,
  Stethoscope,
  DollarSign,
  Shield,
  CheckCircle2
} from "lucide-react"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const InfoItem = ({ icon: Icon, label, value, className }) => {
  // Handle different types of values
  const renderValue = () => {
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).join(', ');
    }
    return '';
  };

  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Icon className="h-4 w-4" />
      <span className="font-medium">{label}:</span>
      <span>{renderValue()}</span>
    </div>
  );
};

const InfoItemSkeleton = () => (
  <div className="flex items-center gap-2 text-sm">
    <Skeleton className="h-3.5 w-3.5" />
    <Skeleton className="h-4 w-16" />
    <Skeleton className="h-4 w-24" />
  </div>
)

const DoctorCard = ({ doctor, loading }) => {
  if (loading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
              <div className="h-3 w-full bg-muted rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            {doctor.isOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{doctor.name}</h3>
                  {doctor.isVerified && (
                    <Shield className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{doctor.rating}</span>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <InfoItem icon={Stethoscope} label="Experience" value={`${doctor.experience} years`} />
              <InfoItem icon={Clock} label="Availability" value={doctor.availability} />
              <InfoItem icon={MapPin} label="Location" value={doctor.location} />
              <InfoItem icon={DollarSign} label="Consultation" value={`$${doctor.consultationFee}`} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {doctor.languages.map((lang, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </Button>
              <Button size="sm" className="flex-1">
                <Calendar className="mr-2 h-4 w-4" />
                Book
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <RoleBasedLayout showHeader={true} headerTitle="Dashboard">
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InfoItemSkeleton key={i} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout showHeader={true} headerTitle="Dashboard">
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card className="border-green-500/20">
          <CardContent className="p-3">
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-xl font-bold">{user?.basicInfo?.name?.fullName || "Guest User"}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className="border-green-500/20 text-green-500"
                  >
                    {user?.basicInfo?.role || "Unknown Role"}
                  </Badge>
                  <Badge 
                    variant={user?.accountStatus?.status === 'ACTIVE' ? 'default' : 'destructive'}
                    className={user?.accountStatus?.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                  >
                    {user?.accountStatus?.status || "Unknown Status"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem 
                  icon={Mail} 
                  label="Email" 
                  value={user?.basicInfo?.email}
                />
                <InfoItem 
                  icon={Phone} 
                  label="Phone" 
                  value={user?.basicInfo?.phoneNumber}
                />
                <InfoItem 
                  icon={User} 
                  label="User ID" 
                  value={user?.basicInfo?.userID}
                />
                <InfoItem 
                  icon={Calendar} 
                  label="Date of Birth" 
                  value={user?.personalInfo?.dateOfBirth ? format(new Date(user.personalInfo.dateOfBirth), 'MMM d, yyyy') : undefined}
                />
                <InfoItem 
                  icon={MapPin} 
                  label="Location" 
                  value={user?.basicInfo?.location}
                />
                <InfoItem 
                  icon={Briefcase} 
                  label="Occupation" 
                  value={user?.personalInfo?.occupation}
                />
              </div>

              {!user?.basicInfo?.bio && (
                <div className="flex items-center gap-2 rounded-lg bg-green-500/5 p-2 text-sm text-green-500">
                  <Info className="h-3.5 w-3.5" />
                  <span>Add a bio to tell others about yourself</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </RoleBasedLayout>
  )
}
