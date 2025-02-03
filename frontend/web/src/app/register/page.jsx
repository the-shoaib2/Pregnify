import { Activity } from "lucide-react"
import { RegisterForm } from "@/components/register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 p-4 md:p-8">
      <div className="flex w-full max-w-2xl flex-col gap-4">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="size-4" />
          </div>
          Pregnify
        </a>
        <RegisterForm />
      </div>
    </div>
  )
} 