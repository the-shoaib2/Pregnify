import { User } from "lucide-react"

export function UserCard({ user }) {
  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0">
          <div className="h-20 w-20 rounded-full overflow-hidden">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-grow space-y-1.5 text-left">
          <h3 className="font-semibold text-xl">{user.name}</h3>
          <div className="text-sm text-muted-foreground">
            <p>{user.username}</p>
            <p>{user.maskedEmail}</p>
            {user.maskedPhone && (
              <p>{user.maskedPhone}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 