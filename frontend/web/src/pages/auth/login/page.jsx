import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Add delay if previous attempt was rate limited
      if (error?.isRateLimit) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      // Validate form data
      if (!formData.email || !formData.password) {
        toast.error('Please fill in all fields')
        return
      }

      // Log the attempt
      console.log('Attempting login with:', { email: formData.email })

      // Attempt login
      const response = await login(formData)
      
      // Log success response
      console.log('Login successful:', response)

      toast.success('Login successful')
      navigate('/')
    } catch (err) {
      setError(err)
      
      // Show appropriate error message
      const message = err.isRateLimit 
        ? 'Please wait a moment before trying again'
        : err.message || 'Login failed'
        
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md space-y-6">


        <div className="p-6 space-y-6 bg-card text-card-foreground rounded-lg border border-border shadow-sm">

        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">
                Email
              </label>
              <input
                type="email"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="m@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">
                Password
              </label>
              <input
                type="password"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <Button 
              type="submit" 
              className={`w-full ${isLoading || error?.isRateLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading || error?.isRateLimit}
            >
              {isLoading ? 'Logging in...' : 
               error?.isRateLimit ? 'Please wait...' : 
               'Login'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Google
            </Button>
            <Button 
              variant="outline" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              GitHub
            </Button>


          </div>

          <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link 
            to="/signup" 
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign up
            </Link>
          </p>
        </div>


      </div>
    </div>
  )
} 