import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="text-center text-sm text-muted-foreground md:text-left">
          <div className="flex items-center gap-4">
            <Link 
              to="/legal/terms" 
              className="hover:text-foreground hover:underline"
            >
              Terms of Service
            </Link>
            <Link 
              to="/legal/privacy" 
              className="hover:text-foreground hover:underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 