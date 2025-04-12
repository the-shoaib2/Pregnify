import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"

export default function SpecializationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [specializations, setSpecializations] = useState([
    { id: 1, name: "Obstetrics", description: "Pregnancy and childbirth care", doctorsCount: 15 },
    { id: 2, name: "Gynecology", description: "Women's reproductive health", doctorsCount: 12 },
    { id: 3, name: "Pediatrics", description: "Child healthcare", doctorsCount: 8 },
    { id: 4, name: "Nutrition", description: "Diet and nutrition guidance", doctorsCount: 5 },
  ])

  const filteredSpecializations = specializations.filter(spec =>
    spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spec.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <RoleBasedLayout headerTitle="Doctor Specializations">
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Header and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Card className="flex-1">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search specializations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Specialization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Specialization</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="Enter specialization name" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Enter specialization description" />
                </div>
                <Button className="w-full">Add Specialization</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Specializations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Specializations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Doctors</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSpecializations.map((spec) => (
                  <TableRow key={spec.id}>
                    <TableCell className="font-medium">{spec.name}</TableCell>
                    <TableCell>{spec.description}</TableCell>
                    <TableCell>{spec.doctorsCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
} 