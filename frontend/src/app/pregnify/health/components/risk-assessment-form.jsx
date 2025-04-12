import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PregnancyService } from "@/services/pregnify"
import { useToast } from "@/components/ui/use-toast"
import { useNavigate } from "react-router-dom"

const formSchema = z.object({
  personal_information: z.object({
    age: z.number().min(18, "Age must be at least 18").max(50, "Age must be less than 50"),
    weight: z.number().min(30, "Weight must be at least 30kg").max(200, "Weight must be less than 200kg"),
    height: z.number().min(100, "Height must be at least 100cm").max(250, "Height must be less than 250cm"),
    bmi: z.number().min(15, "BMI must be at least 15").max(50, "BMI must be less than 50"),
  }),
  chronic_conditions: z.object({
    conditions: z.array(z.string()),
    medications: z.array(z.string()),
  }),
  lifestyle_factors: z.object({
    is_smoker: z.boolean(),
    excessive_alcohol_consumption: z.boolean(),
    substance_use: z.boolean(),
    exercise_frequency: z.enum(["NONE", "OCCASIONAL", "REGULAR", "FREQUENT"]),
    diet_quality: z.enum(["POOR", "FAIR", "GOOD", "EXCELLENT"]),
    stress_level: z.enum(["LOW", "MODERATE", "HIGH", "VERY_HIGH"]),
  }),
  medical_history: z.object({
    previous_pregnancies_count: z.number().min(0, "Must be 0 or greater"),
    previous_complications: z.array(z.string()),
    has_allergies: z.boolean(),
  }),
  vital_signs: z.object({
    blood_pressure_status: z.enum(["Low", "Normal", "High", "Very_High"]),
    blood_sugar_status: z.enum(["Low", "Normal", "High", "Very_High"]),
  }),
  environmental_and_social_factors: z.object({
    occupational_hazards_exposure: z.boolean(),
    environmental_exposures: z.boolean(),
    socioeconomic_status: z.enum(["LOW", "MEDIUM", "STABLE", "HIGH"]),
  }),
  pregnancy_details: z.object({
    current_week: z.number().min(1, "Must be at least 1 week").max(42, "Must be less than 42 weeks"),
    previous_complications: z.array(z.string()),
  }),
})

export function RiskAssessmentForm() {
  const [step, setStep] = useState(1)
  const { toast } = useToast()
  const navigate = useNavigate()
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personal_information: {
        age: 28,
        weight: 65,
        height: 165,
        bmi: 23.9,
      },
      chronic_conditions: {
        conditions: [],
        medications: [],
      },
      lifestyle_factors: {
        is_smoker: false,
        excessive_alcohol_consumption: false,
        substance_use: false,
        exercise_frequency: "REGULAR",
        diet_quality: "GOOD",
        stress_level: "MODERATE",
      },
      medical_history: {
        previous_pregnancies_count: 0,
        previous_complications: [],
        has_allergies: false,
      },
      vital_signs: {
        blood_pressure_status: "Normal",
        blood_sugar_status: "Normal",
      },
      environmental_and_social_factors: {
        occupational_hazards_exposure: false,
        environmental_exposures: false,
        socioeconomic_status: "STABLE",
      },
      pregnancy_details: {
        current_week: 12,
        previous_complications: [],
      },
    },
  })

  const onSubmit = async (data) => {
    try {
      await PregnancyService.createRiskAssessment(data)
      toast({
        title: "Success",
        description: "Risk assessment submitted successfully",
      })
      navigate("/health")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Risk Assessment</CardTitle>
        <Progress value={(step / 4) * 100} className="mt-4" />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="personal_information.age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personal_information.weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personal_information.height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personal_information.bmi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BMI</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Lifestyle Factors</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="lifestyle_factors.is_smoker"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Smoker</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lifestyle_factors.exercise_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exercise Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select exercise frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE">None</SelectItem>
                            <SelectItem value="OCCASIONAL">Occasional</SelectItem>
                            <SelectItem value="REGULAR">Regular</SelectItem>
                            <SelectItem value="FREQUENT">Frequent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lifestyle_factors.diet_quality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diet Quality</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select diet quality" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="POOR">Poor</SelectItem>
                            <SelectItem value="FAIR">Fair</SelectItem>
                            <SelectItem value="GOOD">Good</SelectItem>
                            <SelectItem value="EXCELLENT">Excellent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Medical History</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="medical_history.previous_pregnancies_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous Pregnancies</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vital_signs.blood_pressure_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Pressure Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood pressure status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Very_High">Very High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Pregnancy Details</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="pregnancy_details.current_week"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Pregnancy Week</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="environmental_and_social_factors.socioeconomic_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Socioeconomic Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select socioeconomic status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="STABLE">Stable</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
              {step < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit">Submit</Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 