import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Phone, 
  User, 
  Calendar,
  MapPin,
  Briefcase,
  Info
} from "lucide-react"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

const InfoItem = ({ icon: Icon, label, value, fallback = "Not provided" }) => (
  <div className="flex items-center gap-2 text-sm">
    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-medium">{value || fallback}</span>
  </div>
)

const InfoItemSkeleton = () => (
  <div className="flex items-center gap-2 text-sm">
    <Skeleton className="h-3.5 w-3.5" />
    <Skeleton className="h-4 w-16" />
    <Skeleton className="h-4 w-24" />
  </div>
)

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
