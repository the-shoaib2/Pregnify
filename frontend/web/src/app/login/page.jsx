import { Activity } from "lucide-react"

import { LoginForm } from "@/components/auth-form/login-form"

export default function LoginPage() {
  return (
    (<div
      className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-lg flex-col gap-4">
        <a href="/" className="flex items-center gap-2 self-center font-bold text-xl">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="size-4" />
          </div>
          Pregnify
        </a>
        <LoginForm />
      </div>
    </div>)
  );
}
