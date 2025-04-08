import { SidebarProvider } from "@/components/ui/sidebar"

export default function AppLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
