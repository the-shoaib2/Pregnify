import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "react-hot-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Loader2, Eye, EyeOff, Key } from "lucide-react"
import { startAuthentication } from "@simplewebauthn/browser"

const API_URL = import.meta.env.VITE_API_URL;

// Passkey authentication API calls
const getAuthenticationOptions = async () => {
  const response = await fetch(`${API_URL}/auth/passkey/authenticate/options`);
  return response.json();
};

const verifyAuthentication = async (authentication) => {
  const response = await fetch(`${API_URL}/auth/passkey/authenticate/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(authentication)
  });
  return response.json();
};

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
  const { login, fetchUserData } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await login(formData)
      if (response?.tokens?.accessToken) {
        toast.success('Login successful')
        navigate('/')
      } else {
        throw new Error('No token received')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    (<div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your credentials to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            
            <div className="grid gap-6">
              <div className="flex flex-row gap-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={isAppleLoading}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsAppleLoading(true);
                    // Add your Apple login logic here
                    setTimeout(() => setIsAppleLoading(false), 2000);
                  }}
                >
                  {isAppleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                        fill="currentColor" />
                    </svg>
                  )}
                  <span className="ml-2">Apple</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={isGoogleLoading}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsGoogleLoading(true);
                    // Add your Google login logic here
                    setTimeout(() => setIsGoogleLoading(false), 2000);
                  }}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor" />
                    </svg>
                  )}
                  <span className="ml-2">Google</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isPasskeyLoading}
                  onClick={async () => {
                    try {
                      setIsPasskeyLoading(true);
                      // Get authentication options from your server
                      const options = await getAuthenticationOptions();
                      
                      // Start the authentication process
                      const authentication = await startAuthentication(options);
                      
                      // Verify with your server
                      const verified = await verifyAuthentication(authentication);
                      
                      if (verified.success) {
                        toast.success("Successfully logged in with passkey");
                        // Handle successful login
                        navigate("/");
                      }
                    } catch (error) {
                      console.error(error);
                      toast.error("Failed to authenticate with passkey");
                    } finally {
                      setIsPasskeyLoading(false);
                    }
                  }}
                >
                  {isPasskeyLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  <span className="ml-2">Passkey</span>
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
              

              
              <div className="grid gap-6">
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
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password" >Password</Label>
                    <a href="/forgot-password" className="ml-auto text-sm underline-offset-4 hover:underline">
                      Forgot your password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      autoCapitalize="none"
                      autoComplete="current-password"
                      autoCorrect="off"
                      required 
                      placeholder="********" 
                      disabled={isLoading}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      Logging in...
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/register" className="underline underline-offset-4 font-bold">
                  Register
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div
        className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="/terms-of-service">Terms of Service</a>{" "}
        and <a href="/privacy-policy">Privacy Policy</a>.
      </div>
    </div>)
  );
}
