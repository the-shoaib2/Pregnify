import { ArrowLeft } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

export function LegalLayout({ children, title, description }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 flex items-center gap-2 text-sm font-medium hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 md:py-12">
        <div className="mx-auto max-w-3xl">
          {title && (
            <div className="mb-8 text-center">
              <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-lg text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
} 