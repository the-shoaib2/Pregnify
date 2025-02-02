import * as React from "react"
import { cn } from "../../lib/utils"

const Tabs = ({ children, defaultValue, className, ...props }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue)

  const tabChildren = React.Children.map(children, (child) => {
    if (child.type === TabsList) {
      return React.cloneElement(child, {
        activeTab,
        onTabChange: setActiveTab,
      })
    }
    return child
  })

  return (
    <div className={cn("", className)} {...props}>
      {tabChildren}
    </div>
  )
}

const TabsList = ({ children, activeTab, onTabChange, className, ...props }) => {
  return (
    <div 
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (child.type === TabsTrigger) {
          return React.cloneElement(child, {
            isActive: child.props.value === activeTab,
            onClick: () => onTabChange(child.props.value)
          })
        }
        return child
      })}
    </div>
  )
}

const TabsTrigger = ({ children, value, isActive, onClick, className, ...props }) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive 
          ? "bg-background text-foreground shadow-sm" 
          : "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      data-state={isActive ? "active" : "inactive"}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ children, value, activeTab, className, ...props }) => {
  if (value !== activeTab) return null

  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
