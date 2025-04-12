import { SidebarProvider } from "@/components/ui/sidebar"

export default function AppLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col overflow-x-hidden">
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
