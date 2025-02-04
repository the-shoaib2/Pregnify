import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, Clock } from "lucide-react"
import { InputOTP } from "@/components/ui/input-otp"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export function ForgotPasswordForm() {
  const navigate = useNavigate()
  const { sendPasswordResetEmail, verifyResetCode, resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [step, setStep] = useState("email") // email, otp, newPassword
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await sendPasswordResetEmail(email)
      toast.success("Reset code sent to your email")
      setStep("otp")
      setCountdown(60) // Start 60-second countdown
    } catch (error) {
      console.error('Failed to send reset email:', error)
      toast.error(error?.message || "Failed to send reset code")
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (countdown > 0) return
    setLoading(true)
    try {
      await sendPasswordResetEmail(email)
      toast.success("New reset code sent to your email")
      setCountdown(60) // Restart countdown
    } catch (error) {
      console.error('Failed to resend code:', error)
      toast.error(error?.message || "Failed to send reset code")
    } finally {
      setLoading(false)
    }
  }

  const handleOTPSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await verifyResetCode(email, otp)
      toast.success("Code verified successfully")
      setStep("newPassword")
    } catch (error) {
      console.error('Failed to verify code:', error)
      toast.error(error?.message || "Invalid reset code")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    setLoading(true)
    try {
      await resetPassword(email, otp, newPassword)
      toast.success("Password reset successfully")
      navigate("/login")
    } catch (error) {
      console.error('Failed to reset password:', error)
      toast.error(error?.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>
          {step === "email" && "Enter your email to receive a reset code"}
          {step === "otp" && "Enter the 8-digit code sent to your email"}
          {step === "newPassword" && "Enter your new password"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button className="w-full h-11" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>
            <Button
              variant="link"
              className="w-full"
              type="button"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-center block">Enter Reset Code</Label>
                <InputOTP
                  value={otp}
                  onChange={setOtp}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">
                  Code sent to {email}
                </p>
                {countdown > 0 ? (
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{countdown}s</span>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="h-auto p-0 text-primary hover:text-primary/80"
                  >
                    Resend Code
                  </Button>
                )}
              </div>
            </div>
            <Button className="w-full h-11" type="submit" disabled={loading || otp.length !== 8}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
            <Button
              variant="link"
              className="w-full"
              type="button"
              onClick={() => setStep("email")}
            >
              Back to Email
            </Button>
          </form>
        )}

        {step === "newPassword" && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="********"
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="********"
                    className="h-11"
                  />
                </div>
              </div>
            </div>
            <Button className="w-full h-11" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
            <Button
              variant="link"
              className="w-full"
              type="button"
              onClick={() => setStep("otp")}
            >
              Back to Code Verification
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}