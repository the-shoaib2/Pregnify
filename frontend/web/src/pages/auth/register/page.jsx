import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '@/services/api'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { FaGoogle, FaGithub } from 'react-icons/fa'
import { useAuth } from '@/contexts/auth-context'

// Form field configuration
const FORM_FIELDS = [
  { name: 'fullName', label: 'Full Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phoneNumber', label: 'Phone Number', type: 'tel', required: true },
  { name: 'address', label: 'Address', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
  { name: 'password', label: 'Password', type: 'password', required: true },
  { name: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true }
]

const INITIAL_FORM_STATE = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  address: '',
  description: ''
}

export default function Signup() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const { login } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.phoneNumber) {
      toast.error('Please fill in all required fields')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      setLoadingMessage('Creating your account...')

      const registrationData = {
        ...formData,
        confirmPassword: undefined
      }
      
      const registerResponse = await authAPI.register(registrationData)
      
      if (registerResponse.success) {
        toast.success('Account created successfully!')
        
        // Attempt auto-login
        try {
          setLoadingMessage('Logging you in...')
          await login({
            email: formData.email,
            password: formData.password
          })
          
          toast.success('Welcome to your dashboard!')
          setFormData(INITIAL_FORM_STATE)
          navigate('/', { replace: true })
        } catch (loginError) {
          console.error('Auto-login failed:', loginError)
          toast.error('Account created but auto-login failed. Please login manually.')
          navigate('/login')
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          'Registration failed'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }

  const handleSocialSignup = (provider) => async () => {
    try {
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider}`
    } catch (error) {
      toast.error(`${provider} signup failed`)
    }
  }

  const renderFormField = ({ name, label, type, rows, required }) => (
    <div key={name} className="space-y-1">
      <label className="block text-sm font-medium" htmlFor={name}>
        {label} {required && '*'}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          className="w-full p-2 text-sm rounded-md border focus:ring-2 focus:ring-primary"
          value={formData[name]}
          onChange={handleInputChange}
        />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          required={required}
          className="w-full p-2 text-sm rounded-md border focus:ring-2 focus:ring-primary"
          value={formData[name]}
          onChange={handleInputChange}
        />
      )}
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-8">
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm font-medium">{loadingMessage}</p>
          </div>
        </div>
      )}

      <div className="w-[680px] space-y-4 bg-card rounded-lg border p-6">
        <div className="space-y-1.5 text-center">
          <h1 className="text-2xl font-bold">Admin Create Account</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to create your account
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            type="button" 
            variant="outline"
            onClick={handleSocialSignup('google')}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-1.5"
          >
            <FaGoogle className="w-4 h-4" />
            Google
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={handleSocialSignup('github')}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-1.5"
          >
            <FaGithub className="w-4 h-4" />
            GitHub
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {renderFormField(FORM_FIELDS[0])} {/* Full Name */}
            {renderFormField(FORM_FIELDS[1])} {/* Email */}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {renderFormField(FORM_FIELDS[2])} {/* Phone */}
            {renderFormField(FORM_FIELDS[3])} {/* Address */}
          </div>

          {renderFormField({ ...FORM_FIELDS[4], rows: 2 })} {/* Description with reduced rows */}

          <div className="grid grid-cols-2 gap-3">
            {renderFormField(FORM_FIELDS[5])} {/* Password */}
            {renderFormField(FORM_FIELDS[6])} {/* Confirm Password */}
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-2 text-base font-medium mt-2"
            disabled={loading}
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
} 