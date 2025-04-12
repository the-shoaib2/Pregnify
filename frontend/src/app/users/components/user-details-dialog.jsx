"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  User, Mail, Phone, MapPin, Calendar, Shield, 
  Activity, Lock, Eye, EyeOff, KeyRound, Loader, Copy, Check 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { UserManagementService } from "@/services/admin"
import { toast } from "react-hot-toast"

const UserDetailsDialog = ({ isOpen, onClose, user, loading, isSuperAdmin = false }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [passwordHash, setPasswordHash] = useState(null)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleFetchPassword = async () => {
    try {
      setLoadingPassword(true)
      const response = await UserManagementService.getUserById(user.id, true)
      if (response.success && response.data?.password) {
        setPasswordHash(response.data.password)
        setShowPassword(true)
      } else {
        toast.error("Failed to fetch password hash")
      }
    } catch (error) {
      toast.error("Error fetching password hash")
      console.error(error)
    } finally {
      setLoadingPassword(false)
    }
  }

  const handleCopyPassword = async () => {
    if (passwordHash) {
      try {
        await navigator.clipboard.writeText(passwordHash)
        setCopied(true)
        toast.success("Password hash copied")
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error("Failed to copy password hash")
      }
    }
  }

  if (!user && !loading) return null

  const InfoRow = ({ icon: Icon, label, value, badge, isPassword }) => (
    <div className="flex items-center py-1 border-b border-gray-100 last:border-0">
      <div className="flex items-center w-1/3">
        <Icon className="w-3 h-3 mr-1 text-gray-500" />
        <span className="text-xs font-medium text-gray-700">{label}</span>
      </div>
      <div className={cn("w-2/3", isPassword && "flex items-center gap-1")}>
        {badge ? (
          <Badge variant={
            value?.toLowerCase() === 'active' ? 'success' :
            value?.toLowerCase() === 'pending' ? 'warning' :
            value?.toLowerCase() === 'suspended' ? 'destructive' : 'secondary'
          } className="text-[10px] px-1.5 py-0">
            {value || "N/A"}
          </Badge>
        ) : isPassword ? (
          passwordHash ? (
            <div className="flex items-center gap-1 flex-1">
              <span className={cn(
                "text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded flex-1 overflow-x-auto",
                !showPassword && "filter blur-sm select-none"
              )}>
                {passwordHash}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={handleCopyPassword}
                disabled={!showPassword}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-5 text-[10px]"
              onClick={handleFetchPassword}
              disabled={loadingPassword}
            >
              {loadingPassword ? (
                <>
                  <Loader className="h-2.5 w-2.5 mr-1 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <KeyRound className="h-2.5 w-2.5 mr-1" />
                  View Password Hash
                </>
              )}
            </Button>
          )
        ) : (
          <span className="text-xs text-gray-600">{value || "N/A"}</span>
        )}
      </div>
    </div>
  )

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-[120px]" />
            <Skeleton className="h-2.5 w-[80px]" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton className="h-2.5 w-2.5" />
            <Skeleton className="h-2.5 w-[20%]" />
            <Skeleton className="h-2.5 w-[40%]" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] p-4 w-full">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="text-xl font-semibold tracking-tight">User Profile</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Detailed information about the user account and activity
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div >
            {/* User Header */}
            <div className="flex items-center space-x-4 p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight">{`${user.firstName} ${user.lastName}`}</h3>
                <p className="text-sm text-muted-foreground">{user.userID}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div >
                {/* Basic Information */}
                <div className="p-2">
                  <h4 className="text-sm font-semibold text-foreground mb-2 tracking-wide">Basic Information</h4>
                  <div className="space-y-2">
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm text-muted-foreground font-medium">Email:</span>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </span>
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Phone className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Phone:</span>
                      <span className="text-sm text-muted-foreground">{user.phoneNumber}</span>
                    </span>
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Location:</span>
                      <span className="text-sm text-muted-foreground">{user.location}</span>
                    </span>
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Shield className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Role:</span>
                      <span className="text-sm text-muted-foreground">{user.role}</span>
                    </span>
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Activity className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Status:</span>
                      <span className="text-sm text-muted-foreground">{user.accountStatus}</span>
                    </span>
                  </div>
                </div>

                {/* Account Details */}
                <div className="p-2">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Account Details</h4>
                  <div className="space-y-2">
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Calendar className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Created:</span>
                      <span className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleString()}</span>
                    </span>
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Calendar className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Last Active:</span>
                      <span className="text-sm text-muted-foreground">{user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}</span>
                    </span>
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Activity className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Profile:</span>
                      <span className="text-sm text-muted-foreground">{`${user.profileCompletionPercentage}% Complete`}</span>
                    </span>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="p-2">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Activity Statistics</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors">
                      <p className="text-xs text-muted-foreground font-medium">Total Logins</p>
                      <p className="text-lg font-semibold tracking-tight">{user.totalLogins}</p>
                    </div>
                    <div className="p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors">
                      <p className="text-xs text-muted-foreground font-medium">Total Visits</p>
                      <p className="text-lg font-semibold tracking-tight">{user.totalVisits}</p>
                    </div>
                    <div className="p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors">
                      <p className="text-xs text-muted-foreground font-medium">Avg Session</p>
                      <p className="text-lg font-semibold tracking-tight">{user.averageSessionTime}m</p>
                    </div>
                  </div>
                </div>
              </div>

              <div >
                {/* Security & Verification */}
                <div className="p-2">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Security & Verification</h4>
                  <div className="space-y-2">
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Shield className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">Email Verified:</span>
                      <Badge variant={user.isEmailVerified ? "success" : "destructive"} className="transition-colors">
                        {user.isEmailVerified ? "Verified" : "Not Verified"}
                      </Badge>
                    </span>
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Shield className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">SMS Verified:</span>
                      <Badge variant={user.isSmsVerified ? "success" : "destructive"} className="transition-colors">
                        {user.isSmsVerified ? "Verified" : "Not Verified"}
                      </Badge>
                    </span>
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Shield className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">2FA Status:</span>
                      <Badge variant={user.twoFactorEnabled ? "success" : "destructive"} className="transition-colors">
                        {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </span>
                    {isSuperAdmin && (
                      <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                        <KeyRound className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium">Password:</span>
                        <span className="text-sm text-muted-foreground">{passwordHash}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Account Status */}
                <div className="p-2">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Account Status</h4>
                  <div className="space-y-2">
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Shield className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">Account Lock:</span>
                      <Badge variant={user.isAccountLocked ? "destructive" : "success"} className="transition-colors">
                        {user.isAccountLocked ? "Locked" : "Unlocked"}
                      </Badge>
                    </span>
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Shield className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">Account Suspended:</span>
                      <Badge variant={user.accountSuspended ? "destructive" : "success"} className="transition-colors">
                        {user.accountSuspended ? "Suspended" : "Active"}
                      </Badge>
                    </span>
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Shield className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">Account Deleted:</span>
                      <Badge variant={user.isDeleted ? "destructive" : "success"} className="transition-colors">
                        {user.isDeleted ? "Deleted" : "Active"}
                      </Badge>
                    </span>
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Calendar className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Expiry Date:</span>
                      <span className="text-sm text-muted-foreground">{user.expiryDateAt ? new Date(user.expiryDateAt).toLocaleString() : 'Never'}</span>
                    </span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="p-2">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Additional Information</h4>
                  <div className="space-y-2">
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <User className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">Username:</span>
                      <span className="text-sm text-muted-foreground">{user.username}</span>
                    </span>
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Activity className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">Active Status:</span>
                      <span className="text-sm text-muted-foreground">{user.activeStatus}</span>
                    </span>
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Activity className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">Failed Logins:</span>
                      <span className="text-sm text-muted-foreground">{user.failedLoginCount}</span>
                    </span>
                    <span className="flex items-center space-x-2 group hover:bg-accent/50  rounded-md transition-colors">
                      <Activity className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">Time Spent:</span>
                      <span className="text-sm text-muted-foreground">{`${user.totalTimeSpent} mins`}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UserDetailsDialog
