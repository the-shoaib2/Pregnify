import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { AppointmentModal } from "@/app/pregnify/doctors/appointments/appointment-modal"
import {
  Phone,
  MessageSquare,
  Calendar,
  MapPin,
  Star,
  Clock,
  Stethoscope,
  Shield
} from "lucide-react"

export function DoctorCard({ doctor, loading }) {
  const isMobile = useIsMobile()
  const isSmallScreen = useIsMobile()

  if (loading) {
    return (
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-4">
          <div className="flex gap-3 sm:gap-4">
            <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 sm:h-5 w-3/4" />
              <Skeleton className="h-3 sm:h-4 w-1/2" />
              <Skeleton className="h-3 sm:h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-5 sm:h-6 w-12 sm:w-14" />
                <Skeleton className="h-5 sm:h-6 w-12 sm:w-14" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          <div className="relative">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarImage src={doctor.image} />
              <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            {/* Top Section - Basic Info */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-medium truncate">{doctor.name}</h3>
                  {doctor.isVerified && (
                    <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{doctor.specialty}</p>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5",
                      doctor.isOnline ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200"
                    )}
                  >
                    <div className={cn(
                      "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full mr-1 sm:mr-1.5",
                      doctor.isOnline ? "bg-green-500" : "bg-gray-400"
                    )} />
                    {doctor.isOnline ? "Online" : "Offline"}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5",
                      doctor.gender === "Female" && "bg-pink-50 text-pink-700 border-pink-200",
                      doctor.gender === "Male" && "bg-blue-50 text-blue-700 border-blue-200"
                    )}
                  >
                    {doctor.gender}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
                <span className="text-xs sm:text-sm font-medium">{doctor.rating}</span>
              </div>
            </div>

            <Separator className="my-2 sm:my-3" />

            {/* Middle Section - Key Details */}
            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Stethoscope className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{doctor.experience} years of experience</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className={cn(
                  "font-medium truncate",
                  doctor.availability === "Available Today" && "text-green-500",
                  doctor.availability === "Available Tomorrow" && "text-yellow-500",
                  doctor.availability === "Available Next Week" && "text-orange-500"
                )}>{doctor.availability}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{doctor.location}</span>
              </div>
            </div>

            <Separator className="my-2 sm:my-3" />

            {/* Bottom Section - Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "flex-1 text-xs sm:text-sm h-7 sm:h-8",
                  isSmallScreen && "w-full px-2"
                )}
                disabled={!doctor.isOnline}
              >
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {!isSmallScreen && <span className="ml-2">Call</span>}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "flex-1 text-xs sm:text-sm h-7 sm:h-8",
                  isSmallScreen && "w-full px-2"
                )}
                disabled={!doctor.isOnline}
              >
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {!isSmallScreen && <span className="ml-2">Message</span>}
              </Button>
              <AppointmentModal
                doctor={doctor}
                trigger={
                  <Button 
                    size="sm" 
                    className={cn(
                      "flex-1 text-xs sm:text-sm h-7 sm:h-8",
                      isSmallScreen && "w-full px-2"
                    )}
                    disabled={!doctor.isOnline}
                  >
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {!isSmallScreen && <span className="ml-2">Book</span>}
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 