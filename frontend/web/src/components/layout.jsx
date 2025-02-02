import { AppSidebar } from "./app-sidebar"

export function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-6">
          {children}
        </div>
      </main>
    </div>
  )
} 