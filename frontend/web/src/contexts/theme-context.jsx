import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context/auth-context"

const ThemeContext = createContext({})

export function ThemeProvider({ children }) {
  const { user, updatePreferences } = useAuth()
  const [theme, setTheme] = useState(() => {
    // Get initial theme from user preferences or localStorage
    const savedTheme = localStorage.getItem("theme")
    const userTheme = user?.preferences?.[0]?.theme
    return savedTheme || userTheme || "system"
  })

  // Update theme when user preferences change
  useEffect(() => {
    const userTheme = user?.preferences?.[0]?.theme
    if (userTheme && userTheme !== theme) {
      setTheme(userTheme)
    }
  }, [user])

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleChange = () => {
      if (theme === "system") {
        document.documentElement.classList.toggle("dark", mediaQuery.matches)
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  // Update theme classes and localStorage
  useEffect(() => {
    const isDark = 
      theme === "dark" || 
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

    document.documentElement.classList.toggle("dark", isDark)
    localStorage.setItem("theme", theme)
  }, [theme])

  const setThemeWithSync = async (newTheme) => {
    setTheme(newTheme)
    if (user) {
      try {
        await updatePreferences({
          ...user.preferences?.[0],
          theme: newTheme,
        })
      } catch (error) {
        console.error("Failed to sync theme preference:", error)
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeWithSync }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
} 