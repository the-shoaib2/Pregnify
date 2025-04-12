import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatData } from "@/lib/utils"

export const UserInfoCard = ({ user }) => {
  return (
    <Card >
      <CardContent className="p-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <span className="text-green-500 font-medium text-xl">
                {user?.basicInfo?.name?.firstName?.[0] || "G"}
              </span>
            </div>
            <div>
              <h2 className="text-lg sm:text-base font-semibold leading-none">{user?.basicInfo?.name?.fullName || "Guest User"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{user?.basicInfo?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="default" 
              className="bg-green-500/10 text-yellow-500 border-yellow-500/20 text-sm"
            >
              {formatData(user?.basicInfo?.role)}
            </Badge>
            <Badge 
              variant= {user?.accountStatus?.status === 'ACTIVE' ? 'default' : 'destructive'}
              className={user?.accountStatus?.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/20 text-sm' : 'text-sm'}
            >
              {formatData(user?.accountStatus?.status)}
            </Badge>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">User ID</p>
            <p className="font-medium">{user?.basicInfo?.userID || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Username</p>
            <p className="font-medium">{user?.basicInfo?.username || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium">{user?.basicInfo?.phoneNumber || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Gender</p>
            <p className="font-medium">{formatData(user?.personalInfo?.genderIdentity) || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Marital Status</p>
            <p className="font-medium">{formatData(user?.personalInfo?.maritalStatus) || "N/A"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 