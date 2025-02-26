import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { BadgeCheck, Mail, MapPin, Link as LinkIcon, Calendar } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export function ProfileCard({ user, className }) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Avatar className="h-20 w-20">
            <AvatarImage 
              src={user?.basicInfo?.avatar} 
              alt={user?.basicInfo?.name?.fullName || user?.basicInfo?.username}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = '/avatars/default.jpg'
              }}
            />
            <AvatarFallback>
              {getInitials(user?.basicInfo?.name?.fullName || user?.basicInfo?.username)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <h3 className="font-semibold">
                {user?.basicInfo?.name?.fullName || user?.basicInfo?.username}
              </h3>
              {user?.basicInfo?.isVerified && (
                <BadgeCheck className="h-4 w-4 text-primary" />
              )}
            </div>
            
            {user?.basicInfo?.bio && (
              <p className="text-sm text-muted-foreground">
                {user?.basicInfo?.bio}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            {user?.basicInfo?.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{user?.basicInfo?.email}</span>
              </div>
            )}
            
            {user?.basicInfo?.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{user?.basicInfo?.location}</span>
              </div>
            )}
            
            {user?.basicInfo?.website && (
              <div className="flex items-center gap-1">
                <LinkIcon className="h-4 w-4" />
                <a 
                  href={user.website}
                  className="hover:text-foreground hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            
            {user?.basicInfo?.joinedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined {new Date(user.joinedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {user?.basicInfo?.stats && (
            <div className="flex gap-4 text-center">
              <div>
                <div className="font-semibold">{user.stats.following}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
              <div>
                <div className="font-semibold">{user.stats.followers}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div>
                <div className="font-semibold">{user.stats.posts}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 