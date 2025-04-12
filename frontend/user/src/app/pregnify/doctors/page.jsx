import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  MessageSquare,
  Calendar,
  MapPin,
  X
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useIsMobile } from "@/hooks/use-mobile"
import { DoctorCard } from "@/app/pregnify/doctors/doctor-card"

export default function DoctorsPage() {
  const isMobile = useIsMobile()
  const isSmallScreen = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties")
  const [selectedGender, setSelectedGender] = useState("All Genders")
  const [sortBy, setSortBy] = useState("rating")
  const [sortOrder, setSortOrder] = useState("desc")
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "OB/GYN",
      rating: 4.9,
      experience: 15,
      availability: "Available Today",
      location: "City General Hospital",
      image: "/doctors/sarah-johnson.jpg",
      languages: ["English", "Spanish"],
      education: "Harvard Medical School",
      insurance: ["Aetna", "Blue Cross", "Cigna"],
      consultationFee: 150,
      gender: "Female",
      isVerified: true,
      isOnline: true,
      description: "Specialized in high-risk pregnancies and minimally invasive gynecological surgeries."
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Maternal-Fetal Medicine",
      rating: 4.8,
      experience: 12,
      availability: "Available Tomorrow",
      location: "Women's Health Center",
      image: "/doctors/michael-chen.jpg",
      languages: ["English", "Mandarin"],
      education: "Johns Hopkins University",
      insurance: ["Aetna", "United Healthcare"],
      gender: "Male",
      consultationFee: 200,
      isVerified: true,
      isOnline: false,
      description: "Expert in managing high-risk pregnancies and fetal complications."
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialty: "OB/GYN",
      rating: 4.7,
      experience: 8,
      availability: "Available Next Week",
      location: "Family Care Clinic",
      image: "/doctors/emily-rodriguez.jpg",
      languages: ["English", "Spanish", "French"],
      education: "Stanford University",
      insurance: ["Blue Cross", "Cigna"],
      gender: "Female",
      consultationFee: 180,
      isVerified: true,
      isOnline: true,
      description: "Specialized in reproductive health and family planning."
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      specialty: "Perinatology",
      rating: 4.9,
      experience: 20,
      availability: "Available Today",
      location: "University Medical Center",
      image: "/doctors/james-wilson.jpg",
      languages: ["English", "German"],
      education: "Mayo Clinic College of Medicine",
      insurance: ["Aetna", "Blue Cross", "United Healthcare"],
      gender: "Male",
      consultationFee: 250,
      isVerified: true,
      isOnline: true,
      description: "Leading expert in fetal medicine and high-risk pregnancy management."
    },
    {
      id: 5,
      name: "Dr. Lisa Patel",
      specialty: "Reproductive Endocrinology",
      rating: 4.8,
      experience: 10,
      availability: "Available Tomorrow",
      location: "Fertility & Reproductive Health Center",
      image: "/doctors/lisa-patel.jpg",
      languages: ["English", "Hindi", "Gujarati"],
      education: "Yale School of Medicine",
      insurance: ["Aetna", "Cigna", "United Healthcare"],
      gender: "Female",
      consultationFee: 220,
      isVerified: true,
      isOnline: false,
      description: "Specialized in fertility treatments and reproductive endocrinology."
    },
    {
      id: 6,
      name: "Dr. Robert Kim",
      specialty: "General Practice",
      rating: 4.6,
      experience: 5,
      availability: "Available Today",
      location: "Community Health Center",
      image: "/doctors/robert-kim.jpg",
      languages: ["English", "Korean"],
      education: "University of California, San Francisco",
      insurance: ["Aetna", "Blue Cross", "Cigna", "United Healthcare"],
      gender: "Male",
      consultationFee: 120,
      isVerified: true,
      isOnline: true,
      description: "General practitioner with focus on women's health and preventive care."
    },
    {
      id: 7,
      name: "Dr. Maria Garcia",
      specialty: "Maternal-Fetal Medicine",
      rating: 4.9,
      experience: 18,
      availability: "Available Next Week",
      location: "Regional Medical Center",
      image: "/doctors/maria-garcia.jpg",
      languages: ["English", "Spanish", "Portuguese"],
      education: "University of Miami Miller School of Medicine",
      insurance: ["Aetna", "Blue Cross", "Cigna"],
      gender: "Female",
      consultationFee: 230,
      isVerified: true,
      isOnline: false,
      description: "Expert in managing complex pregnancies and fetal anomalies."
    },
    {
      id: 8,
      name: "Dr. David Lee",
      specialty: "Perinatology",
      rating: 4.7,
      experience: 14,
      availability: "Available Tomorrow",
      location: "Children's Hospital",
      image: "/doctors/david-lee.jpg",
      languages: ["English", "Mandarin", "Cantonese"],
      education: "University of Pennsylvania Perelman School of Medicine",
      insurance: ["Aetna", "Blue Cross", "United Healthcare"],
      gender: "Male",
      consultationFee: 210,
      isVerified: true,
      isOnline: true,
      description: "Specialized in fetal diagnosis and treatment of complex conditions."
    }
  ])

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const specialties = [
    "All Specialties",
    "Obstetrician",
    "Gynecologist",
    "Pediatrician",
    "Nutritionist",
    "Psychologist"
  ]

  const genders = [
    "All Genders",
    "Male",
    "Female"
  ]

  const sortOptions = [
    { value: "rating", label: "Rating" },
    { value: "experience", label: "Experience" },
    { value: "consultationFee", label: "Consultation Fee" }
  ]

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedSpecialty("All Specialties")
    setSelectedGender("All Genders")
    setSortBy("rating")
    setSortOrder("desc")
  }

  const filteredDoctors = doctors
    .filter((doctor) => {
      const matchesSpecialty = selectedSpecialty === "All Specialties" ||
        doctor.specialty.toLowerCase() === selectedSpecialty
      const matchesGender = selectedGender === "All Genders" ||
        doctor.gender === selectedGender
      const matchesSearch = searchQuery === "" ||
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSpecialty && matchesGender && matchesSearch
    })
    .sort((a, b) => {
      const order = sortOrder === "desc" ? -1 : 1
      if (sortBy === "rating") {
        return (a.rating - b.rating) * order
      } else if (sortBy === "experience") {
        return (a.experience - b.experience) * order
      } else if (sortBy === "consultationFee") {
        return (a.consultationFee - b.consultationFee) * order
      }
      return 0
    })

  return (
    <RoleBasedLayout headerTitle="Doctors">
      <div className="flex flex-1 flex-col gap-4 mx-auto w-full">
        {/* Header and Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search doctors by name, specialty, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Select
                    value={selectedSpecialty}
                    onValueChange={setSelectedSpecialty}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map(specialty => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedGender}
                    onValueChange={setSelectedGender}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map(gender => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {!isSmallScreen && "Clear Filters"}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {specialties.slice(1).map(specialty => (
                    <Badge
                      key={specialty}
                      variant={selectedSpecialty === specialty ? "default" : "outline"}
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => setSelectedSpecialty(specialty)}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full sm:w-[300px]">
            <CardHeader className="p-4">
              <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid gap-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Schedule Appointment</span>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">Message All Doctors</span>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Find Nearest Hospital</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <DoctorCard key={index} loading />
            ))
          ) : filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No doctors found matching your criteria.</p>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </RoleBasedLayout>
  )
} 