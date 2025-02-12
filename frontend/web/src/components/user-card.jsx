import { User } from "lucide-react"

export function UserCard({ user }) {
  // Helper to get the correct avatar URL
  const getAvatarUrl = (user) => {
    return user?.avatarUrl || user?.avatar || '/avatars/default.jpg'
  }

  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0">
          <div className="h-20 w-20 rounded-full overflow-hidden">
            {user && (
              <img 
                src={getAvatarUrl(user)} 
                alt={user.name || 'User avatar'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/avatars/default.jpg'
                }}
              />
            )}
          </div>
        </div>

        <div className="flex-grow space-y-1.5 text-left">
          <h3 className="font-semibold text-xl">
            {user?.name || 'Anonymous User'}
          </h3>
          <div className="text-sm text-muted-foreground">
            {user?.username && <p>{user.username}</p>}
            {user?.email && <p>{user.maskedEmail || user.email}</p>}
            {user?.phone && <p>{user.maskedPhone || user.phone}</p>}
          </div>
        </div>
      </div>
    </div>
  )
} 