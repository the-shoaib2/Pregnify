import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar,
  MoreVertical,
  Shield,
  UserPlus,
  MessageSquare,
  Flag,
  Ban,
  Star,
  Award,
  Briefcase,
  GraduationCap
} from "lucide-react"

export function ProfileCard({ user, onAction, showActions = true }) {
  if (!user) return null

  const profileCompleteness = calculateProfileCompleteness(user)

  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10" />
      <CardHeader className="relative mt-[-48px] space-y-4 text-center">
        {showActions && (
          <div className="flex justify-end absolute right-4 top-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onAction('message')}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('follow')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Follow User
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onAction('report')} className="text-red-600">
                  <Flag className="mr-2 h-4 w-4" />
                  Report User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('block')} className="text-red-600">
                  <Ban className="mr-2 h-4 w-4" />
                  Block User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <Avatar className="h-24 w-24 mx-auto ring-4 ring-background">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>
            {user.name?.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <h3 className="text-xl font-semibold">{user.name}</h3>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            {user.username}
            {user.verified && (
              <Badge variant="secondary" className="ml-2">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          {user.role && (
            <Badge variant="outline" className="mt-2">
              <Star className="h-3 w-3 mr-1" />
              {user.role}
            </Badge>
          )}
        </div>

        {showActions && (
          <div className="flex justify-center gap-4">
            <Button onClick={() => onAction('follow')}>
              <UserPlus className="mr-2 h-4 w-4" />
              Follow
            </Button>
            <Button variant="outline" onClick={() => onAction('message')}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {user.bio && (
          <p className="text-sm text-center text-muted-foreground">
            {user.bio}
          </p>
        )}

        <div className="flex flex-col gap-2 text-sm">
          {user.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              {user.email}
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {user.location}
            </div>
          )}
          {user.occupation && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              {user.occupation}
            </div>
          )}
          {user.education && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              {user.education}
            </div>
          )}
          {user.joinedDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Joined {new Date(user.joinedDate).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-6 pt-4">
          <div className="text-center">
            <div className="text-lg font-semibold">{user.followers}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{user.following}</div>
            <div className="text-sm text-muted-foreground">Following</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{user.posts}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Profile Completeness</span>
            <span>{profileCompleteness}%</span>
          </div>
          <Progress value={profileCompleteness} className="h-2" />
        </div>

        {/* Achievements/Badges */}
        {user.achievements?.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Achievements
            </h4>
            <div className="flex flex-wrap gap-2">
              {user.achievements.map((achievement, i) => (
                <Badge key={i} variant="secondary">
                  {achievement}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function calculateProfileCompleteness(user) {
  const fields = [
    'name',
    'username',
    'email',
    'bio',
    'location',
    'occupation',
    'education',
    'avatarUrl'
  ]
  
  const completedFields = fields.filter(field => Boolean(user[field]))
  return Math.round((completedFields.length / fields.length) * 100)
} 