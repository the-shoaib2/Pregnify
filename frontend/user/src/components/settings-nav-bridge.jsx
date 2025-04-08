import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { settingsNavGroups } from "@/components/settings-nav"
import { GripVertical, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export function SettingsNavBridge() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  
  // Find the current active item
  const currentGroup = settingsNavGroups.find(group => 
    group.items.some(item => item.href === location.pathname)
  )
  const currentItem = currentGroup?.items.find(item => 
    item.href === location.pathname
  )
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background/90"
          )}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0 bg-sidebar text-sidebar-foreground">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="text-lg font-semibold">Settings</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav className="space-y-4 p-4">
            {settingsNavGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <div className="flex items-center gap-2 px-2">
                  <group.icon className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {group.title}
                  </h4>
                </div>
                <div className="flex flex-col space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        location.pathname === item.href
                          ? "bg-sidebar-primary/10 text-sidebar-primary-foreground hover:bg-sidebar-primary/20"
                          : "hover:bg-sidebar-primary/5",
                        "justify-start w-full"
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                      {location.pathname === item.href && (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )}
                    </Link>
                  ))}
                </div>
                <Separator className="my-2" />
              </div>
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
} 