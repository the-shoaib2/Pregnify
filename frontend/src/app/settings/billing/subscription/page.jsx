import { useState } from "react"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  CreditCard,
  Check,
  Clock,
  AlertCircle,
  ArrowRight,
  Zap,
  Shield,
  Users,
  Database,
  Star
} from "lucide-react"

const plans = [
  {
    id: "basic",
    name: "Basic",
    description: "Essential features for individuals",
    price: 9.99,
    interval: "month",
    features: [
      "Basic health tracking",
      "Limited consultations",
      "Email support",
      "Basic reports"
    ]
  },
  {
    id: "pro",
    name: "Professional",
    description: "Advanced features for healthcare providers",
    price: 29.99,
    interval: "month",
    features: [
      "Advanced health tracking",
      "Unlimited consultations",
      "Priority support",
      "Advanced analytics",
      "Custom reports",
      "API access"
    ],
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for large organizations",
    price: null,
    interval: "month",
    features: [
      "All Professional features",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "Custom deployment",
      "Advanced security"
    ]
  }
]

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState("pro")

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">Subscription</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and billing plan
        </p>
      </div>
      <Separator />

      <div className="grid gap-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  You are currently on the Professional plan
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  Active
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Professional Plan</div>
                <div className="text-sm text-muted-foreground">
                  $29.99/month
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Change Plan
                </Button>
                <Button variant="destructive" size="sm">
                  Cancel
                </Button>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Next billing date</p>
                  <p className="text-sm text-muted-foreground">
                    March 1, 2024
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View Invoice
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${
                plan.popular ? 'border-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline">
                  {plan.price ? (
                    <>
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-sm text-muted-foreground">
                        /{plan.interval}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">Custom pricing</span>
                  )}
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {selectedPlan === plan.id ? "Current Plan" : "Choose Plan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Usage & Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Usage & Limits</CardTitle>
            <CardDescription>
              Monitor your subscription usage and limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Team Members</span>
                </div>
                <span className="text-sm">8 of 10 used</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-4/5 rounded-full bg-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Storage</span>
                </div>
                <span className="text-sm">75% used</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-3/4 rounded-full bg-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">API Calls</span>
                </div>
                <span className="text-sm">40% used</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-2/5 rounded-full bg-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}