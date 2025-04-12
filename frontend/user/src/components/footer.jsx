import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { 
  Activity,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  ChevronRight,
  Heart,
  Stethoscope,
  MessageSquare,
  Bot,
  Baby,
  Calendar,
  BookOpen,
  Users,
  Shield,
  HelpCircle,
  FileText,
  Code2,
  Globe,
  GitBranch,
  Star,
  Info
} from "lucide-react"

export function Footer() {
  const { user } = useAuth()
  const mainContributor = user?.basicInfo?.fullName || "MD Shoaib Khan"

  // Demo data (Replace with API calls in production)
  const demoData = {
    stats: {
      users: "10K+",
      doctors: "500+",
      articles: "1000+",
      support: "24/7"
    },
    features: [
      {
        title: "Pregnancy Tracker",
        icon: Calendar,
        description: "Track your pregnancy journey week by week",
        stats: "95% user satisfaction"
      },
      {
        title: "Health Monitoring",
        icon: Heart,
        description: "Monitor vital signs and health metrics",
        stats: "99.9% accuracy"
      },
      {
        title: "Doctor Connect",
        icon: Stethoscope,
        description: "Connect with healthcare professionals",
        stats: "500+ verified doctors"
      },
      {
        title: "AI Assistant",
        icon: Bot,
        description: "24/7 AI-powered pregnancy support",
        stats: "10K+ daily queries"
      },
      {
        title: "Community",
        icon: Users,
        description: "Join our supportive community",
        stats: "50K+ members"
      },
      {
        title: "Resources",
        icon: BookOpen,
        description: "Access pregnancy guides and resources",
        stats: "1000+ articles"
      }
    ],
    support: [
      {
        title: "Help Center",
        icon: HelpCircle,
        path: "/help",
        description: "Find answers to common questions"
      },
      {
        title: "Documentation",
        icon: FileText,
        path: "/docs",
        description: "Detailed guides and tutorials"
      },
      {
        title: "API",
        icon: Code2,
        path: "/api",
        description: "Developer resources and API docs"
      },
      {
        title: "Status",
        icon: Globe,
        path: "/status",
        description: "System status and updates"
      }
    ]
  }

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* About Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">About Pregnify</h3>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Comprehensive pregnancy care platform with AI technology and expert medical guidance.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-[10px] text-muted-foreground">
                <span className="font-medium">{demoData.stats.users}</span> Users
              </div>
              <div className="text-[10px] text-muted-foreground">
                <span className="font-medium">{demoData.stats.doctors}</span> Doctors
              </div>
              <div className="text-[10px] text-muted-foreground">
                <span className="font-medium">{demoData.stats.articles}</span> Articles
              </div>
              <div className="text-[10px] text-muted-foreground">
                <span className="font-medium">{demoData.stats.support}</span> Support
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://github.com/the-shoaib2/Pregnify" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
                title="GitHub Repository"
              >
                <Github className="h-3.5 w-3.5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" title="Twitter">
                <Twitter className="h-3.5 w-3.5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" title="LinkedIn">
                <Linkedin className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Features</h3>
            <div className="grid grid-cols-2 gap-2">
              {demoData.features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="flex items-start gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-primary mt-0.5" />
                    <div>
                      <p className="text-[11px] font-medium">{feature.title}</p>
                      <p className="text-[10px] text-muted-foreground">{feature.description}</p>
                      <p className="text-[9px] text-primary/80">{feature.stats}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              {demoData.support.map((link) => {
                const Icon = link.icon
                return (
                  <li key={link.title} className="flex items-start gap-1.5">
                    <Icon className="h-3.5 w-3.5 mt-0.5" />
                    <div>
                      <Link to={link.path} className="hover:text-primary transition-colors">
                        {link.title}
                      </Link>
                      <p className="text-[9px] text-muted-foreground">{link.description}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="space-y-1.5 pt-2">
              <h3 className="text-sm font-semibold">Contact</h3>
              <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                <li className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                  <Mail className="h-3.5 w-3.5" />
                  <span>support@pregnify.com</span>
                </li>
                <li className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                  <Phone className="h-3.5 w-3.5" />
                  <span>+1 (555) 123-4567</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Open Source */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Open Source</h3>
            <div className="space-y-2">
              <a 
                href="https://github.com/the-shoaib2/Pregnify" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-3.5 w-3.5" />
                <span>GitHub Repository</span>
              </a>
              <a 
                href="https://github.com/the-shoaib2/Pregnify/issues" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors"
              >
                <GitBranch className="h-3.5 w-3.5" />
                <span>Contribute</span>
              </a>
              <a 
                href="https://github.com/the-shoaib2/Pregnify/stargazers" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors"
              >
                <Star className="h-3.5 w-3.5" />
                <span>Star on GitHub</span>
              </a>
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-semibold">Legal</h3>
              <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                <li className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                </li>
                <li className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                </li>
                <li className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Pregnify. All rights reserved.
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Version 2.0.1 Beta | Released: April 2025 | Main Contributor: {mainContributor}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Built with ❤️ for expectant mothers worldwide
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            <a 
              href="https://github.com/the-shoaib2/Pregnify" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Feel free to contribute to our open-source project
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
} 