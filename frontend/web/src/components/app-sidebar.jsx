import * as React from "react"
import {
  Bot,
  Command,
  LifeBuoy,
  Send,
  Settings,
  Users,
  Calendar,
  Activity,
  MessageSquare,
  Database,
  FileText,
  UserCog,
  Ambulance,
  LineChart,

} from "lucide-react"
import { Link } from "react-router-dom"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import NavUser from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context/auth-context"

// Define role-based navigation items
const getNavItems = (role) => {
  const baseItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Activity,
      isActive: true,
      items: [
        { title: "Overview", url: "/dashboard" },
        { title: "Analytics", url: "/dashboard/analytics" },
        { title: "Notifications", url: "/dashboard/notifications" }
      ]
    }
  ]

  const roleBasedItems = {
    SUPER_ADMIN: [
      {
        title: "User Management",
        url: "/users",
        icon: Users,
        items: [
          { title: "All Users", url: "/users" },
          { title: "Roles & Permissions", url: "/users/roles" },
          { title: "Add User", url: "/users/add" },
          { title: "User Activity", url: "/users/activity" }
        ]
      },
      {
        title: "Doctor Panel",
        url: "/doctors",
        icon: UserCog,
        items: [
          { title: "Verify Doctors", url: "/doctors/verify" },
          { title: "Specializations", url: "/doctors/specializations" },
          { title: "Performance", url: "/doctors/performance" },
          { title: "Complaints", url: "/doctors/complaints" }
        ]
      },
      {
        title: "System",
        url: "/system",
        icon: Database,
        items: [
          { title: "Database", url: "/system/database" },
          { title: "Settings", url: "/system/settings" },
          { title: "Logs", url: "/system/logs" },
          { title: "Backups", url: "/system/backups" },
          { title: "API Keys", url: "/system/api-keys" },
          { title: "Security", url: "/system/security" }
        ]
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: LineChart,
        items: [
          { title: "User Growth", url: "/analytics/users" },
          { title: "AI Performance", url: "/analytics/ai" },
          { title: "System Health", url: "/analytics/system" },
          { title: "Revenue", url: "/analytics/revenue" }
        ]
      },
      {
        title: "AI Management",
        url: "/ai-management",
        icon: Bot,
        items: [
          { title: "Model Performance", url: "/ai-management/performance" },
          { title: "Training Data", url: "/ai-management/training" },
          { title: "Model Versions", url: "/ai-management/versions" },
          { title: "Error Analysis", url: "/ai-management/errors" },
          { title: "API Usage", url: "/ai-management/api" }
        ]
      },
      {
        title: "AI Analytics",
        url: "/ai-analytics",
        icon: LineChart,
        items: [
          { title: "Prediction Accuracy", url: "/ai-analytics/accuracy" },
          { title: "Usage Statistics", url: "/ai-analytics/usage" },
          { title: "Risk Assessment", url: "/ai-analytics/risk" },
          { title: "Model Insights", url: "/ai-analytics/insights" }
        ]
      }
    ],
    ADMIN: [
      {
        title: "User Management",
        url: "/users",
        icon: Users,
        items: [
          { title: "View Users", url: "/users" },
          { title: "Add User", url: "/users/add" },
          { title: "User Reports", url: "/users/reports" },
          { title: "Access Control", url: "/users/access" }
        ]
      },
      {
        title: "Appointments",
        url: "/appointments",
        icon: Calendar,
        items: [
          { title: "All Appointments", url: "/appointments" },
          { title: "Schedule Management", url: "/appointments/schedule" },
          { title: "Cancellations", url: "/appointments/cancellations" },
          { title: "Reports", url: "/appointments/reports" }
        ]
      },
      {
        title: "Emergency Services",
        url: "/emergency",
        icon: Ambulance,
        items: [
          { title: "Active Requests", url: "/emergency/active" },
          { title: "Response Times", url: "/emergency/response" },
          { title: "Hospital Network", url: "/emergency/hospitals" },
          { title: "Emergency Logs", url: "/emergency/logs" }
        ]
      },
      {
        title: "AI Monitoring",
        url: "/ai-monitoring",
        icon: Bot,
        items: [
          { title: "System Status", url: "/ai-monitoring/status" },
          { title: "Usage Reports", url: "/ai-monitoring/reports" },
          { title: "Alert History", url: "/ai-monitoring/alerts" },
          { title: "Performance Logs", url: "/ai-monitoring/logs" }
        ]
      }
    ],
    DOCTOR: [
      {
        title: "Appointments",
        url: "/appointments",
        icon: Calendar,
        items: [
          { title: "My Schedule", url: "/appointments/schedule" },
          { title: "Patient Appointments", url: "/appointments/patients" },
          { title: "Emergency Slots", url: "/appointments/emergency" },
          { title: "History", url: "/appointments/history" }
        ]
      },
      {
        title: "Patients",
        url: "/patients",
        icon: Users,
        items: [
          { title: "My Patients", url: "/patients" },
          { title: "Patient Records", url: "/patients/records" },
          { title: "Risk Assessments", url: "/patients/risks" },
          { title: "Treatment Plans", url: "/patients/treatments" }
        ]
      },
      {
        title: "AI Assistance",
        url: "/ai",
        icon: Bot,
        items: [
          { title: "Health Analysis", url: "/ai/analysis" },
          { title: "Risk Prediction", url: "/ai/prediction" },
          { title: "Treatment Suggestions", url: "/ai/treatments" }
        ]
      },
      {
        title: "AI Tools",
        url: "/ai-tools",
        icon: Bot,
        items: [
          { title: "Diagnosis Assistant", url: "/ai-tools/diagnosis" },
          { title: "Risk Calculator", url: "/ai-tools/risk" },
          { title: "Treatment Planner", url: "/ai-tools/treatment" },
          { title: "Medical Research", url: "/ai-tools/research" }
        ]
      },
      {
        title: "AI Insights",
        url: "/ai-insights",
        icon: LineChart,
        items: [
          { title: "Patient Analytics", url: "/ai-insights/patients" },
          { title: "Health Predictions", url: "/ai-insights/predictions" },
          { title: "Treatment Outcomes", url: "/ai-insights/outcomes" },
          { title: "Clinical Patterns", url: "/ai-insights/patterns" }
        ]
      }
    ],
    PATIENT: [
      {
        title: "My Health",
        url: "/health",
        icon: Activity,
        items: [
          { title: "Health Dashboard", url: "/health" },
          { title: "Medical Records", url: "/health/records" },
          { title: "Medications", url: "/health/medications" },
          { title: "Test Results", url: "/health/tests" }
        ]
      },
      {
        title: "Care",
        url: "/care",
        icon: FileText,
        items: [
          { title: "My Doctors", url: "/care/doctors" },
          { title: "Treatment Plans", url: "/care/treatments" },
          { title: "Prescriptions", url: "/care/prescriptions" },
          { title: "Health Tips", url: "/care/tips" }
        ]
      },
      {
        title: "Emergency",
        url: "/emergency",
        icon: Ambulance,
        items: [
          { title: "Quick Help", url: "/emergency/help" },
          { title: "Nearby Hospitals", url: "/emergency/hospitals" },
          { title: "Emergency Contacts", url: "/emergency/contacts" },
          { title: "First Aid Guide", url: "/emergency/guide" }
        ]
      },
      {
        title: "AI Health Assistant",
        url: "/ai-assistant",
        icon: Bot,
        items: [
          { title: "Health Chat", url: "/ai-assistant/chat" },
          { title: "Symptom Checker", url: "/ai-assistant/symptoms" },
          { title: "Diet Planner", url: "/ai-assistant/diet" },
          { title: "Activity Tracker", url: "/ai-assistant/activity" }
        ]
      },
      {
        title: "AI Predictions",
        url: "/ai-predictions",
        icon: LineChart,
        items: [
          { title: "Health Forecast", url: "/ai-predictions/forecast" },
          { title: "Risk Assessment", url: "/ai-predictions/risk" },
          { title: "Progress Analysis", url: "/ai-predictions/progress" },
          { title: "Recommendations", url: "/ai-predictions/recommendations" }
        ]
      }
    ],
    GUEST: [
      {
        title: "Services",
        url: "/services",
        icon: Activity,
        items: [
          { title: "Find Doctor", url: "/services/doctors" },
          { title: "Book Appointment", url: "/services/book" },
          { title: "Emergency Help", url: "/services/emergency" },
          { title: "Health Articles", url: "/services/articles" }
        ]
      },
      {
        title: "Information",
        url: "/info",
        icon: FileText,
        items: [
          { title: "About Us", url: "/info/about" },
          { title: "Our Services", url: "/info/services" },
          { title: "Contact Us", url: "/info/contact" },
          { title: "FAQs", url: "/info/faqs" }
        ]
      },
      {
        title: "AI Services",
        url: "/ai-services",
        icon: Bot,
        items: [
          { title: "Health Guide", url: "/ai-services/guide" },
          { title: "Basic Assessment", url: "/ai-services/assessment" },
          { title: "FAQ Bot", url: "/ai-services/faq" },
          { title: "Emergency Helper", url: "/ai-services/emergency" }
        ]
      }
    ]
  }

  // Common items based on role
  const commonItems = [
    {
      title: "Messages",
      url: "/messages",
      icon: MessageSquare,
      items: [
        { title: "Inbox", url: "/messages" },
        { title: "Sent", url: "/messages/sent" },
        { title: "Important", url: "/messages/important" },
        { title: "Archived", url: "/messages/archived" }
      ]
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [
        { title: "Account", url: "/settings/account", component: Link },
        { title: "Preferences", url: "/settings/preferences", component: Link },
        { title: "Billing", url: "/settings/billing", component: Link },
        { title: "System", url: "/settings/system", component: Link },
        { title: "Help & Legal", url: "/settings/help", component: Link }
      ]
    }
  ]

 

  const items = role === 'GUEST' 
    ? [...baseItems, ...(roleBasedItems[role] || [])]
    : [...baseItems, ...(roleBasedItems[role] || []), ...commonItems]

  return items
}

export function AppSidebar({ ...props }) {
  const { user } = useAuth()
  
  const navMainItems = React.useMemo(() => 
    getNavItems(user?.basicInfo?.role || 'GUEST'), [user?.basicInfo?.role]
  )

  const getInitials = (user) => {
    if (!user || !user?.basicInfo?.name?.firstName || !user?.basicInfo?.name?.lastName) return 'GU'
    return `${user.basicInfo?.name?.firstName.charAt(0)}${user.basicInfo?.name?.lastName.charAt(0)}`.toUpperCase()
  }

  const sidebarData = {
    user: {
      name: user ? `${user?.basicInfo?.name?.firstName} ${user?.basicInfo?.name?.lastName}` : 'Guest User',
      email: user?.basicInfo?.email,
      avatar: user?.basicInfo?.avatar ,
      initials: getInitials(user)
    },
    navMain: navMainItems,
    navSecondary: [
      {
        title: "Support",
        url: "/support",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "/feedback",
        icon: Send,
      },
    ],
    projects: []
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Pregnify</span>
                  <span className="truncate text-xs">{user?.basicInfo?.role}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        {/* <NavProjects projects={sidebarData.projects} /> */}
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
