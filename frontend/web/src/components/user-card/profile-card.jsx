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
            <AvatarImage src={user?.avatarUrl} alt={user?.name} />
            <AvatarFallback>{getInitials(user?.name || user?.username)}</AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <h3 className="font-semibold">
                {user?.name || user?.username}
              </h3>
              {user?.verified && (
                <BadgeCheck className="h-4 w-4 text-primary" />
              )}
            </div>
            
            {user?.bio && (
              <p className="text-sm text-muted-foreground">
                {user.bio}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            {user?.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            )}
            
            {user?.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{user.location}</span>
              </div>
            )}
            
            {user?.website && (
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
            
            {user?.joinedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined {new Date(user.joinedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {user?.stats && (
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