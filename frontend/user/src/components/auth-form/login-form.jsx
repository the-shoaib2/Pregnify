import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { toast } from "react-hot-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { useNavigate, Link } from "react-router-dom"
import { useState } from "react"
import { Loader, Eye, EyeOff, Key } from "lucide-react"
import { startAuthentication } from "@simplewebauthn/browser"
import { AuthService } from "@/services/auth"

const validateEmail = (email) => {
  if (!email) {
    return 'Email is required'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }

  return null
}

const validatePassword = (password) => {
  if (!password) {
    return 'Password is required'
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  if (!passwordRegex.test(password)) {
    return 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character'
  }

  return null
}

export function LoginForm({
  className,
  ...props
}) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isAppleLoading, setIsAppleLoading] = useState(false)
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const validateForm = () => {
    const emailError = validateEmail(formData.email)
    if (emailError) {
      toast.error(emailError)
      return false
    }

    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      toast.error(passwordError)
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    const startTime = performance.now()

    try {
      console.time('Login Process')
      const response = await login(formData)

      if (!response?.tokens?.accessToken) {
        throw new Error('Authentication failed - Invalid credentials')
      }

      const loginTime = Math.round(performance.now() - startTime)
      console.log(`✨ Login completed in ${loginTime}ms`)
      console.timeEnd('Login Process')

      toast.success('Login Successful!')
      navigate('/', { replace: true })

    } catch (error) {
      console.error('Login error:', error)

      // Enhanced error handling
      if (error.response?.status === 429) {
        toast.error('Too many attempts. Please try again in a few minutes.')
      } else if (error.response?.status === 401) {
        toast.error('Invalid email or password')
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.')
      } else {
        toast.error(error.message || 'Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasskeyLogin = async () => {
    try {
      setIsPasskeyLoading(true)
      const options = await AuthService.getPasskeyOptions()
      const authentication = await startAuthentication(options)
      const verified = await AuthService.verifyPasskey(authentication)

      if (verified.success) {
        toast.success("Successfully logged in with passkey")
        navigate("/")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to authenticate with passkey")
    } finally {
      setIsPasskeyLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-[400px] mx-auto p-4 sm:p-0", className)} {...props}>
      <Card className="w-full">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your credentials to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="flex flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-[42px]"
                  disabled={isAppleLoading}
                  onClick={(e) => {
                    e.preventDefault()
                    setIsAppleLoading(true)
                    // Apple login integration will be added here
                    setIsAppleLoading(false)
                  }}
                >
                  {isAppleLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                        fill="currentColor" />
                    </svg>
                  )}
                  <span className="ml-2 hidden sm:inline">Apple</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-[42px]"
                  disabled={isGoogleLoading}
                  onClick={(e) => {
                    e.preventDefault()
                    setIsGoogleLoading(true)
                    // Google login integration will be added here
                    setIsGoogleLoading(false)
                  }}
                >
                  {isGoogleLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor" />
                    </svg>
                  )}
                  <span className="ml-2 hidden sm:inline">Google</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-[42px]"
                  disabled={isPasskeyLoading}
                  onClick={handlePasskeyLogin}
                >
                  {isPasskeyLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Passkey</span>
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    required
                    disabled={isLoading}
                    value={formData.email}
                    onChange={handleChange}
                    className="h-[42px]"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="*********"
                      autoCapitalize="none"
                      autoComplete="current-password"
                      autoCorrect="off"
                      required
                      disabled={isLoading}
                      value={formData.password}
                      onChange={handleChange}
                      className="h-[42px] pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute  right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
              </div>

              <Button type="submit" className="w-full h-[42px]" disabled={isLoading}>
                {isLoading ? (
                  <>
                    Logging in...
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Login"
                )}
              </Button>

              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/register" className="hover:text-primary hover:underline underline-offset-4 font-bold">
                  Register
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our{" "}
        <Link to="/legal/terms">Terms of Service</Link>{" "}
        and{" "}
        <Link to="/legal/privacy">Privacy Policy</Link>.
      </div>
    </div>
  )
}
