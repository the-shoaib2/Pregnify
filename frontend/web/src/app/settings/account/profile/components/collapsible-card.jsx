import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CollapsibleCard({ 
  title, 
  description, 
  children, 
  footer,
  defaultOpen = true,
  className 
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className={className}>
      <CardHeader className="relative pr-12">
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 hover:bg-muted"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <div className={cn(
        "grid transition-all",
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden">
          <CardContent className={cn(
            "transition-all",
            isOpen ? "py-6" : "py-0"
          )}>
            {children}
          </CardContent>
          {footer && (
            <CardFooter className={cn(
              "transition-all",
              isOpen ? "pb-6" : "pb-0"
            )}>
              {footer}
            </CardFooter>
          )}
        </div>
      </div>
    </Card>
  )
}
