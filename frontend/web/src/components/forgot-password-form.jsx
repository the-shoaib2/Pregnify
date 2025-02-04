import { useState } from "react"
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
import { Loader2 } from "lucide-react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

const toastConfig = {
  position: 'top-center',
  duration: 3000,
  style: {
    minWidth: 'fit-content',
    textAlign: 'center'
  }
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState("email") // email, otp, newPassword
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState("")

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Call your API to send OTP email
      await sendOTPEmail(email)
      toast.success("OTP sent to your email", toastConfig)
      setStep("otp")
    } catch (error) {
      toast.error(error.message || "Failed to send OTP", toastConfig)
    } finally {
      setLoading(false)
    }
  }

  const handleOTPSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Verify OTP
      await verifyOTP(email, otp)
      toast.success("OTP verified successfully", toastConfig)
      setStep("newPassword")
    } catch (error) {
      toast.error(error.message || "Invalid OTP", toastConfig)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Reset password
      await resetPassword(email, otp, newPassword)
      toast.success("Password reset successfully", toastConfig)
      // Redirect to login
      navigate("/login")
    } catch (error) {
      toast.error(error.message || "Failed to reset password", toastConfig)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>
          {step === "email" && "Enter your email to receive a reset code"}
          {step === "otp" && "Enter the code sent to your email"}
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
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Enter OTP</Label>
              <InputOTP
                value={otp}
                onChange={setOtp}
                maxLength={6}
                render={({ slots }) => (
                  <InputOTPGroup>
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </form>
        )}

        {step === "newPassword" && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                className="w-full"
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
} 