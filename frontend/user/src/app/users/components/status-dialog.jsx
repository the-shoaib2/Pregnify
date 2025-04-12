import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"

const ACCOUNT_STATUSES = ["ACTIVE", "INACTIVE", "VERIFIED", "DEACTIVATED", "PENDING", "SUSPENDED", "DELETED", "LOCKED"]

const getStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400"
    case "INACTIVE":
      return "bg-slate-500/15 text-slate-600 hover:bg-slate-500/25 dark:text-slate-300"
    case "VERIFIED":
      return "bg-green-500/15 text-green-600 hover:bg-green-500/25 dark:text-green-400"
    case "DEACTIVATED":
      return "bg-gray-500/15 text-gray-600 hover:bg-gray-500/25 dark:text-gray-400"
    case "SUSPENDED":
      return "bg-red-500/15 text-red-600 hover:bg-red-500/25 dark:text-red-400"
    case "PENDING":
      return "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 dark:text-amber-400"
    case "DELETED":
      return "bg-zinc-500/15 text-zinc-600 hover:bg-zinc-500/25 dark:text-zinc-400"
    case "LOCKED":
      return "bg-neutral-500/15 text-neutral-600 hover:bg-neutral-500/25 dark:text-neutral-400"
    default:
      return "bg-slate-500/15 text-slate-600 hover:bg-slate-500/25 dark:text-slate-300"
  }
}


const StatusDialog = ({ 
  open, 
  onOpenChange, 
  selectedUser, 
  onStatusChange, 
  onStatusSelectionChange 
}) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const currentStatus = selectedUser?.accountStatus || "ACTIVE"
  const newStatus = selectedUser?.newStatus || currentStatus

  const form = useForm({
    defaultValues: {
      status: newStatus
    }
  })

  const handleStatusChange = async () => {
    setIsUpdating(true)
    try {
      await onStatusChange()
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusSelect = (value) => {
    form.setValue("status", value)
    onStatusSelectionChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-lg font-bold tracking-tight">Change User Status</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            Select the new status for <span className="font-medium text-foreground">{selectedUser?.firstName} {selectedUser?.lastName}</span>
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <Form {...form}>
          <form className="space-y-6 p-6">
            <FormField
              name="currentStatus"
              render={() => (
                <FormItem>
                  <div className="flex items-center justify-start">
                    <FormLabel className="w-24">Current Status </FormLabel>
                    <Badge className={getStatusColor(currentStatus)} variant="secondary">
                      {currentStatus}
                    </Badge>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="w-24">New Status</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={handleStatusSelect}
                    disabled={isUpdating}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ACCOUNT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center">
                            <Badge className={getStatusColor(status)} variant="secondary">
                              {status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Changing the status will affect the user's access to the system.
                  </FormDescription>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <Separator />
        <DialogFooter className="p-4 pt-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isUpdating}>Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleStatusChange}
            className={getStatusColor(newStatus)}
            variant="secondary"
            disabled={isUpdating || currentStatus === newStatus}
          >
            {isUpdating && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default StatusDialog
