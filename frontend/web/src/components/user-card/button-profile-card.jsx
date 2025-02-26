import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { BadgeCheck } from "lucide-react"
import { getInitials } from "@/lib/utils"

export function ButtonProfileCard({ user, href }) {
  return (
    <Button
      variant="outline"
      className="h-auto w-full justify-start p-4"
      asChild
    >
      <a href={href} className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback>{getInitials(user?.name || user?.username)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold">
              {user?.name || user?.username}
            </span>
            {user?.verified && (
              <BadgeCheck className="h-4 w-4 text-primary" />
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {user?.email}
          </span>
          {user?.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>
      </a>
    </Button>
  )
} 