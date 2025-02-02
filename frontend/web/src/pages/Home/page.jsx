import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { authAPI } from '@/services'
import LoadingScreen from '@/components/loading-screen'
import { SuperAdminDashboard } from '@/components/dashboards/super-admin-dashboard'
import { AdminDashboard } from '@/components/dashboards/admin-dashboard'
import { DoctorDashboard } from '@/components/dashboards/doctor-dashboard'

export default function Home() {
  const { user } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAPI.checkAuth()
        setUserData(response.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl text-red-600">Error: {error}</h2>
      </div>
    )
  }

  // Render dashboard based on user role
  const renderDashboard = () => {
    switch (userData?.role) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard userData={userData} />
      case 'ADMIN':
        return <AdminDashboard userData={userData} />
      case 'DOCTOR':
        return <DoctorDashboard userData={userData} />
      default:
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl">Welcome to the system</h2>
            <p className="text-muted-foreground">Please contact an administrator for access.</p>
          </div>
        )
    }
  }

  return (
    <div className="container mx-auto p-6">
      {renderDashboard()}
    </div>
  )
} 