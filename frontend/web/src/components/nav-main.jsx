"use client"

import { ChevronRight } from "lucide-react"
import { NavMainSkeleton } from "@/components/nav-main-skeleton"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Skeleton component for sub-items
const SubItemSkeleton = () => (
  <div className="flex items-center gap-2 rounded-md px-3 py-1.5">
    <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
    <div className="h-4 w-24 rounded bg-muted animate-pulse" />
  </div>
)

export function NavMain({
  items,
  isLoading
}) {
  const [openItems, setOpenItems] = useState({})
  const [loadingItems, setLoadingItems] = useState({})

  if (isLoading) {
    return <NavMainSkeleton />
  }

  const toggleItem = async (e, itemTitle) => {
    e.preventDefault()
    
    // Only show loading when expanding
    if (!openItems[itemTitle]) {
      setOpenItems(prev => ({ ...prev, [itemTitle]: true }))
      setLoadingItems(prev => ({ ...prev, [itemTitle]: true }))
      await new Promise(resolve => setTimeout(resolve, 200))
      setLoadingItems(prev => ({ ...prev, [itemTitle]: false }))
    } else {
      setOpenItems(prev => ({ ...prev, [itemTitle]: false }))
    }
  }

  return (
    <nav className="space-y-0.5">
      {items.map((item, index) => (
        <div key={index} className="group">
          <NavLink
            to={item.url}
            className={({ isActive }) => cn(
              "relative flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
              "hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "transparent",
              item.items?.length > 0 ? "cursor-default" : "cursor-pointer"
            )}
            onClick={(e) => item.items?.length > 0 && toggleItem(e, item.title)}
          >
            <div className="flex items-center gap-2">
              {item.icon && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className={cn(
                    "h-4 w-4",
                    "text-muted-foreground transition-colors duration-200",
                    "group-hover:text-accent-foreground"
                  )} />
                </motion.div>
              )}
              <span>{item.title}</span>
            </div>
            
            {item.items?.length > 0 && (
              <motion.div
                animate={{ rotate: openItems[item.title] ? 90 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <ChevronRight 
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground",
                    "group-hover:text-accent-foreground"
                  )}
                />
              </motion.div>
            )}
          </NavLink>
          
          {item.items && (
            <AnimatePresence>
              {openItems[item.title] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: "auto",
                    opacity: 1,
                    transition: {
                      height: { duration: 0.2 },
                      opacity: { duration: 0.2, delay: 0.1 }
                    }
                  }}
                  exit={{ 
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: { duration: 0.2 },
                      opacity: { duration: 0.1 }
                    }
                  }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 mt-1 space-y-1 border-l pl-2">
                    <AnimatePresence mode="wait">
                      {loadingItems[item.title] ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {Array(item.items.length).fill(0).map((_, i) => (
                            <SubItemSkeleton key={i} />
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.items.map((subItem, subIndex) => (
                            <motion.div
                              key={subIndex}
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: subIndex * 0.05 }}
                            >
                              <NavLink
                                to={subItem.url}
                                className={({ isActive }) => cn(
                                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-all duration-200",
                                  "hover:bg-accent hover:text-accent-foreground",
                                  isActive 
                                    ? "bg-accent/50 text-accent-foreground font-medium" 
                                    : "text-muted-foreground",
                                  "relative",
                                  isActive && "before:absolute before:left-[-13px] before:top-1/2 before:-translate-y-1/2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary before:animate-pulse"
                                )}
                              >
                                <span className="truncate">{subItem.title}</span>
                              </NavLink>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      ))}
    </nav>
  )
}
