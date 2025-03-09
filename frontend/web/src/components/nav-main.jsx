"use client"

import { ChevronRight } from "lucide-react"
import { NavMainSkeleton } from "@/components/nav-main-skeleton"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"


export function NavMain({
  items,
  isLoading
}) {
  const [openItems, setOpenItems] = useState({})

  if (isLoading) {
    return <NavMainSkeleton />
  }

  const toggleItem = async (e, itemTitle) => {
    e.preventDefault()
    setOpenItems(prev => ({ ...prev, [itemTitle]: !prev[itemTitle] }))
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
                  whileHover={{ opacity: 0.8 }}
                  whileTap={{ opacity: 0.6 }}
                  transition={{ duration: 0.2 }}
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
                transition={{ 
                  duration: 0.3,
                  ease: "easeInOut"
                }}
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
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: 1,
                    height: "auto",
                    transition: {
                      opacity: { duration: 0.3, ease: "easeInOut" },
                      height: { duration: 0.3, ease: "easeInOut" }
                    }
                  }}
                  exit={{ 
                    opacity: 0,
                    height: 0,
                    transition: {
                      opacity: { duration: 0.2, ease: "easeInOut" },
                      height: { duration: 0.2, ease: "easeInOut" }
                    }
                  }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 mt-1 space-y-1 border-l pl-2">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeInOut"
                      }}
                    >
                      {item.items.map((subItem, subIndex) => (
                        <motion.div
                          key={subIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ 
                            duration: 0.3,
                            delay: subIndex * 0.05,
                            ease: "easeInOut"
                          }}
                        >
                          <NavLink
                            to={subItem.url}
                            className={({ isActive }) => cn(
                              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-all duration-300",
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
