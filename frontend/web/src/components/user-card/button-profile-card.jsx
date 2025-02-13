import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

export function ButtonProfileCard({ user, href }) {
  if (!user) return null

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      <Link to={href} className="block">
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-16 w-16 border-2 border-muted">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>
              {user.name?.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{user.name}</h3>
              {user.verified && (
                <Shield className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {user.email}
            </p>
            {user.bio && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {user.bio}
              </p>
            )}
          </div>

          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Link>
    </Card>
  )
} 