import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthService } from "@/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserCard } from "@/components/user-card"
import { toast } from "react-hot-toast"
import { Loader2, ArrowLeft, Mail, Lock, KeyRound, User } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function ForgotPasswordForm() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    password: '',
    confirmPassword: '',
  })

  const handleFindUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    console.log('Submitting email:', formData.email)

    try {
      const response = await AuthService.findUserForReset({
        email: formData.email
      })
      
      console.log('API Response:', response)
      
      if (response.data.success && response.data.data.found) {
        console.log('User found:', response.data.data)
        setUserData(response.data.data)
        setStep(2)
      } else {
        console.log('No user found with email:', formData.email)
        toast.error("No account found with this email")
      }
    } catch (error) {
      console.error('Error finding user:', error)
      toast.error(error?.response?.data?.message || "Failed to find user")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmUser = async () => {
    setLoading(true)

    try {
      await AuthService.sendResetCode({ 
        userId: userData.userId,
        resetToken: userData.resetToken,
        method: 'email',
        type: 'code'
      })
      
      toast.success("Verification code sent to your email")
      setStep(3)
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send code")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await AuthService.verifyResetCode({
        userId: userData.userId,
        resetToken: userData.resetToken,
        code: formData.code
      })
      
      setStep(4)
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid code")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    setLoading(true)

    try {
      await AuthService.resetPassword({
        userId: userData.userId,
        resetToken: userData.resetToken,
        code: formData.code,
        password: formData.password
      })
      
      toast.success("Password reset successfully")
      navigate('/login')
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          {step === 1 && "Enter your email address to reset your password"}
          {step === 2 && "Confirm your account details"}
          {step === 3 && "Enter the verification code sent to your email"}
          {step === 4 && "Enter your new password"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {step === 1 && (
          <form onSubmit={handleFindUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-9"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        )}

        {step === 2 && userData && (
          <div className="space-y-6">
            <UserCard user={userData} />

            <div className="space-y-2">
              <Button 
                onClick={handleConfirmUser} 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setStep(1)
                  setUserData(null)
                  setFormData(prev => ({ ...prev, email: '' }))
                }}
              >
                Try Different Email
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter verification code"
                  className="pl-9"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  className="pl-9"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  className="pl-9"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
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