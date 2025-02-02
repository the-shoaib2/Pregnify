import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '@/services/api'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { FaGoogle, FaGithub } from 'react-icons/fa'
import { useAuth } from '@/contexts/auth-context'

// Form field configuration
const ROLES = [
  // { value: 'SUPER_ADMIN', label: 'Super Admin' },
  // { value: 'ADMIN', label: 'Admin' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'PATIENT', label: 'Patient' },
  { value: 'GUEST', label: 'Guest' }
]

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' }
]

const FORM_FIELDS = [
  { name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'John' },
  { name: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Doe' },
  { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'john.doe@example.com' },
  { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+880 1XXX-XXXXXX' },
  { name: 'password', label: 'Password', type: 'password', required: true, placeholder: '••••••••' },
  { name: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true, placeholder: '••••••••' },
  { name: 'description', label: 'Description', type: 'textarea', rows: 3, placeholder: 'Tell us a bit about yourself...' },
  { name: 'termsAndConditions', label: 'I agree to the terms and conditions', type: 'checkbox', required: true }
]

const INITIAL_FORM_STATE = {
  role: 'PATIENT',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: {
    day: '',
    month: '',
    year: ''
  },
  password: '',
  confirmPassword: '',
  gender: '',
  termsAccepted: false,
  description: ''
}

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const { login } = useAuth()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? parseInt(value) : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone) {
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

    if (!formData.dateOfBirth.day || !formData.dateOfBirth.month || !formData.dateOfBirth.year) {
      toast.error('Please enter your complete date of birth')
      return false
    }

    if (!formData.gender) {
      toast.error('Please select your gender')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return false
    }

    if (!formData.termsAccepted) {
      toast.error('Please accept the terms and conditions')
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
        ...formData
      }
      
      const registerResponse = await authAPI.register(registrationData)
      
      if (registerResponse.success) {
        toast.success('Account created successfully!')
        
        // // Attempt auto-login
        // try {
        //   setLoadingMessage('Logging you in...')
        //   await login({
        //     email: formData.email,
        //     password: formData.password
        //   })
          
          toast.success('Welcome to your dashboard!')
        //   setFormData(INITIAL_FORM_STATE)
        //   navigate('/', { replace: true })
        // } catch (loginError) {
        //   console.error('Auto-login failed:', loginError)
        //   toast.error('Account created but auto-login failed. Please login manually.')
        //   navigate('/login')
        // }
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

  const renderFormField = ({ name, label, type, rows, required, options, placeholder }) => (
    <div key={name} className="space-y-1">
      <label className="block text-sm font-medium" htmlFor={name}>
        {label} {required && '*'}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          placeholder={placeholder}
          className="w-full p-2 text-sm rounded-md border focus:ring-2 focus:ring-primary"
          value={formData[name]}
          onChange={handleInputChange}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          required={required}
          className="w-full p-2 text-sm rounded-md border focus:ring-2 focus:ring-primary"
          value={formData[name]}
          onChange={handleInputChange}
        >
          <option value="">{placeholder}</option>
          {options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <div className="flex items-center space-x-2">
          <input
            id={name}
            type={type}
            name={name}
            required={required}
            className="rounded border-gray-300 text-primary focus:ring-primary"
            checked={formData[name]}
            onChange={handleInputChange}
          />
          <label htmlFor={name} className="text-sm text-muted-foreground">
            {label}
          </label>
        </div>
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
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
          <h1 className="text-2xl font-bold">Create Account</h1>
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
            {renderFormField(FORM_FIELDS[0])} {/* First Name */}
            {renderFormField(FORM_FIELDS[1])} {/* Last Name */}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {renderFormField(FORM_FIELDS[2])} {/* Email */}
            {renderFormField(FORM_FIELDS[3])} {/* Phone */}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {renderFormField(FORM_FIELDS[4])} {/* Password */}
            {renderFormField(FORM_FIELDS[5])} {/* Confirm Password */}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full p-2 text-sm rounded-md border focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Role</option>
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="w-full p-2 text-sm rounded-md border focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Gender</option>
                {GENDER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Date of Birth *</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <input
                  type="number"
                  name="dateOfBirth.day"
                  placeholder="Day"
                  min="1"
                  max="31"
                  value={formData.dateOfBirth.day}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 text-sm rounded-md border focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="dateOfBirth.month"
                  placeholder="Month"
                  min="1"
                  max="12"
                  value={formData.dateOfBirth.month}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 text-sm rounded-md border focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="dateOfBirth.year"
                  placeholder="Year"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.dateOfBirth.year}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 text-sm rounded-md border focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {renderFormField(FORM_FIELDS[6])} {/* Description */}

          <div className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="termsAccepted"
              id="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleInputChange}
              required
              className="form-checkbox h-4 w-4 border-[--border] rounded focus:ring-[--ring] text-[--primary] bg-[--background]"
            />
            <label htmlFor="termsAccepted" className="text-sm font-bold text-foreground">
              I agree to the terms and conditions *
            </label>
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
            className="text-primary font-bold underline-offset-4 hover:underline"
          >
            Login
          </Link>
        </p>

        <p className="text-center text-sm text-muted-foreground">
          By creating an account, you agree to our{' '}
          <Link 
            to="#" 
            className="text-primary underline-offset-4 hover:underline"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link 
            to="#" 
            className="text-primary underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
        </p>

      </div>
    </div>
  )
}