import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthService } from "@/services"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FindUserForm } from "./forgot-password/find-user"
import { VerifyCodeForm } from "./forgot-password/verify-code"
import { ResetPasswordForm } from "./forgot-password/reset-password"
import { SelectRecoveryMethod } from "./forgot-password/select-recovery"
import { cn } from "@/lib/utils"

const STEPS = {
  FIND_USER: 'FIND_USER',
  SELECT_RECOVERY: 'SELECT_RECOVERY',
  VERIFY_CODE: 'VERIFY_CODE',
  RESET_PASSWORD: 'RESET_PASSWORD',
  COMPLETED: 'COMPLETED',
}

export function ForgotPasswordForm() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(STEPS.FIND_USER)
  const [userData, setUserData] = useState(null)
  const [resetToken, setResetToken] = useState(null)
  const [recoveryMethod, setRecoveryMethod] = useState(null)

  const handleFindUserSuccess = (data) => {
    setUserData(data)
    setCurrentStep(STEPS.SELECT_RECOVERY)
  }

  const handleRecoveryMethodSelected = (method) => {
    setRecoveryMethod(method)
    setCurrentStep(STEPS.VERIFY_CODE)
  }

  const handleVerifyCodeSuccess = (data) => {
    setResetToken(data.token)
    setCurrentStep(STEPS.RESET_PASSWORD)
  }

  const handleResetSuccess = () => {
    setCurrentStep(STEPS.COMPLETED)
  }

  const handleTokenExpired = () => {
    setResetToken(null)
    setCurrentStep(STEPS.SELECT_RECOVERY)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {currentStep === STEPS.FIND_USER && "Find Your Account"}
          {currentStep === STEPS.SELECT_RECOVERY && "Select Recovery Method"}
          {currentStep === STEPS.VERIFY_CODE && "Enter Verification Code"}
          {currentStep === STEPS.RESET_PASSWORD && "Reset Your Password"}
          {currentStep === STEPS.COMPLETED && "Password Reset Complete"}
        </CardTitle>
        <CardDescription>
          {currentStep === STEPS.FIND_USER && "Enter your email address to reset your password"}
          {currentStep === STEPS.SELECT_RECOVERY && "Choose how you want to reset your password"}
          {currentStep === STEPS.VERIFY_CODE && 
            `Enter the ${recoveryMethod?.type === 'code' ? 'verification code' : 'reset link'} sent to ${
              recoveryMethod?.method === 'email' ? userData?.maskedEmail : userData?.maskedPhone
            }`
          }
          {currentStep === STEPS.RESET_PASSWORD && "Create your new password"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {currentStep === STEPS.FIND_USER && (
          <FindUserForm onSuccess={handleFindUserSuccess} />
        )}

        {currentStep === STEPS.SELECT_RECOVERY && (
          <SelectRecoveryMethod
            userData={userData}
            onSuccess={handleRecoveryMethodSelected}
          />
        )}

        {currentStep === STEPS.VERIFY_CODE && (
          <VerifyCodeForm 
            userId={userData?.userId}
            method={recoveryMethod?.method}
            type={recoveryMethod?.type}
            onSuccess={handleVerifyCodeSuccess} 
          />
        )}

        {currentStep === STEPS.RESET_PASSWORD && (
          <ResetPasswordForm 
            token={resetToken} 
            onSuccess={handleResetSuccess}
            onTokenExpired={handleTokenExpired}
          />
        )}

        {currentStep === STEPS.COMPLETED && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className={cn(
                "h-12 w-12 rounded-full",
                "flex items-center justify-center",
                "animate-in zoom-in duration-300"
              )}>
                        <CheckCircle2 className="h-8 w-8 text-green-500 animate-in zoom-in" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">
                Password Reset Successful
              </h3>
              <p className="text-sm text-muted-foreground">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => navigate('/login')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Button>
      </CardFooter>
    </Card>
  )
}