import { useState } from "react"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Wallet,
  Plus,
  Clock,
  DollarSign,
  Shield,
  AlertCircle,
} from "lucide-react"

const paymentMethods = [
  {
    id: 1,
    type: "credit_card",
    last4: "4242",
    expiry: "12/24",
    brand: "Visa",
    isDefault: true
  },
  {
    id: 2,
    type: "credit_card",
    last4: "8888",
    expiry: "08/25",
    brand: "Mastercard",
    isDefault: false
  }
]

const billingHistory = [
  {
    id: 1,
    date: "2024-02-01",
    amount: 29.99,
    status: "paid",
    description: "Premium Plan - Monthly"
  },
  {
    id: 2,
    date: "2024-01-01",
    amount: 29.99,
    status: "paid",
    description: "Premium Plan - Monthly"
  }
]

export default function PaymentPage() {
  const { user } = useAuth()
  const [showAddCard, setShowAddCard] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">Payment Methods</h3>
        <p className="text-sm text-muted-foreground">
          Manage your payment methods and billing history
        </p>
      </div>
      <Separator />

      <div className="grid gap-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle>Payment Methods</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddCard(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </div>
            <CardDescription>
              Your saved payment methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {method.brand} •••• {method.last4}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires {method.expiry}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.isDefault && (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Default
                    </span>
                  )}
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Billing History</CardTitle>
            </div>
            <CardDescription>
              Your recent billing history and invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billingHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-medium">
                      ${item.amount.toFixed(2)}
                    </p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    <Button variant="ghost" size="sm">
                      View Invoice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Transactions
            </Button>
          </CardFooter>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              <CardTitle>Billing Information</CardTitle>
            </div>
            <CardDescription>
              Your billing address and tax information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  placeholder="John Doe" 
                  defaultValue={`${user?.basicInfo?.name?.firstName} ${user?.basicInfo?.name?.lastName}`}
                />
              </div>
              <div className="space-y-2">
                <Label>Company Name (Optional)</Label>
                <Input placeholder="Company Ltd." />
              </div>
              <div className="space-y-2">
                <Label>Address Line 1</Label>
                <Input placeholder="123 Street Name" />
              </div>
              <div className="space-y-2">
                <Label>Address Line 2</Label>
                <Input placeholder="Apt, Suite, etc." />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label>State/Province</Label>
                <Input placeholder="State" />
              </div>
              <div className="space-y-2">
                <Label>ZIP/Postal Code</Label>
                <Input placeholder="ZIP Code" />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input placeholder="Country" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}