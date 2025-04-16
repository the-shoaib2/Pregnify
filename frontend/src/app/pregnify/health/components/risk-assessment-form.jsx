import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
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
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { ClipboardCheck } from "lucide-react"

const formSchema = z.object({
  personal_information: z.object({
    age: z.number().min(18, "Age must be at least 18").max(50, "Age must be less than 50"),
    weight: z.number().min(30, "Weight must be at least 30kg").max(200, "Weight must be less than 200kg"),
    height: z.number().min(100, "Height must be at least 100cm").max(250, "Height must be less than 250cm"),
    bmi: z.number().min(15, "BMI must be at least 15").max(50, "BMI must be less than 50"),
  }),
  chronic_conditions: z.object({
    conditions: z.array(z.string()).default([]),
    medications: z.array(z.string()).default([]),
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
    previous_complications: z.array(z.string()).default([]),
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
    previous_complications: z.array(z.string()).default([]),
  }),
})

export function RiskAssessmentForm({ pregnancyId }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  console.log('RiskAssessmentForm rendered with pregnancyId:', pregnancyId);

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
    mode: "onChange"
  })

  // Auto-fill existing data
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        if (pregnancyId) {
          const response = await PregnancyService.getRiskAssessment(pregnancyId);
          if (response?.data) {
            // Only update form with relevant data fields
            const formData = {
              personal_information: {
                age: response.data.age,
                weight: response.data.weight,
                height: response.data.height,
                bmi: response.data.bmi,
              },
              chronic_conditions: {
                conditions: JSON.parse(response.data.chronicConditions || '[]'),
                medications: JSON.parse(response.data.currentMedications || '[]'),
              },
              lifestyle_factors: {
                is_smoker: response.data.isSmoker,
                excessive_alcohol_consumption: response.data.alcoholConsumption,
                substance_use: response.data.substanceUse,
                exercise_frequency: response.data.exerciseHabits,
                diet_quality: response.data.dietQuality,
                stress_level: response.data.psychologicalHealth,
              },
              medical_history: {
                previous_pregnancies_count: response.data.previousPregnancies,
                previous_complications: JSON.parse(response.data.pregnancyComplications || '[]'),
                has_allergies: response.data.hasAllergies,
              },
              vital_signs: {
                blood_pressure_status: response.data.bloodPressureStatus,
                blood_sugar_status: response.data.bloodSugarStatus,
              },
              environmental_and_social_factors: {
                occupational_hazards_exposure: response.data.occupationalHazards,
                environmental_exposures: response.data.environmentalExposure,
                socioeconomic_status: response.data.financialStability,
              },
              pregnancy_details: {
                current_week: response.data.pregnancyWeek || 12,
                previous_complications: JSON.parse(response.data.pregnancyComplications || '[]'),
              }
            };
            form.reset(formData);
          }
        }
      } catch (error) {
        console.error("Error fetching existing risk assessment:", error);
      }
    };

    fetchExistingData();
  }, [pregnancyId, form]);

 

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Format the data according to the API requirements
      const submissionData = {
        age: data.personal_information.age,
        weight: data.personal_information.weight,
        height: data.personal_information.height,
        bmi: data.personal_information.bmi,
        chronicConditions: JSON.stringify(data.chronic_conditions),
        isSmoker: data.lifestyle_factors.is_smoker,
        alcoholConsumption: data.lifestyle_factors.excessive_alcohol_consumption,
        substanceUse: data.lifestyle_factors.substance_use,
        exerciseHabits: data.lifestyle_factors.exercise_frequency,
        dietQuality: data.lifestyle_factors.diet_quality,
        psychologicalHealth: data.lifestyle_factors.stress_level,
        previousPregnancies: data.medical_history.previous_pregnancies_count,
        hasAllergies: data.medical_history.has_allergies,
        bloodPressureStatus: data.vital_signs.blood_pressure_status,
        bloodSugarStatus: data.vital_signs.blood_sugar_status,
        occupationalHazards: data.environmental_and_social_factors.occupational_hazards_exposure,
        environmentalExposure: data.environmental_and_social_factors.environmental_exposures,
        financialStability: data.environmental_and_social_factors.socioeconomic_status,
        currentMedications: JSON.stringify(data.chronic_conditions.medications),
        pregnancyComplications: JSON.stringify(data.pregnancy_details.previous_complications),
      };

      const response = await PregnancyService.performRiskAssessment(pregnancyId, submissionData);
      
      if (response.success) {
        toast.success("Risk assessment submitted successfully");
        setOpen(false);
        // Refresh the risk assessment data
        window.location.reload();
      } else {
        toast.error(response.message || "Failed to submit risk assessment");
      }
    } catch (error) {
      console.error('Error submitting risk assessment:', error);
      toast.error(error.message || "Failed to submit risk assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const currentValues = form.getValues();
      const formattedValues = {
        ...currentValues,
        chronic_conditions: {
          conditions: Array.isArray(currentValues.chronic_conditions?.conditions) 
            ? currentValues.chronic_conditions.conditions 
            : [],
          medications: Array.isArray(currentValues.chronic_conditions?.medications) 
            ? currentValues.chronic_conditions.medications 
            : []
        }
      };
      
      form.setValue('chronic_conditions', formattedValues.chronic_conditions);
      
      const isValid = await form.trigger();
      
      if (isValid) {
        await onSubmit(formattedValues);
        setOpen(false); // Close dialog on successful submission
      } else {
        Object.entries(form.formState.errors).forEach(([field, error]) => {
          toast.error(`${field}: ${error.message || 'Invalid value'}`);
        });
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error("Failed to submit form");
    }
  };

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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
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
          </motion.div>
        )
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium">Lifestyle & Medical History</h3>
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
            </div>
          </motion.div>
        )
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium">Vital Signs & Conditions</h3>
            <div className="space-y-4">
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
              <FormField
                control={form.control}
                name="vital_signs.blood_sugar_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Sugar Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood sugar status" />
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
          </motion.div>
        )
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
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
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <ClipboardCheck className="mr-2 h-4 w-4" />
          Start Risk Assessment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Risk Assessment</DialogTitle>
          <DialogDescription>
            Complete this assessment to evaluate potential risks during your pregnancy
          </DialogDescription>
        </DialogHeader>
        <Card className="w-full">
          <CardHeader>
            <Progress value={(step / 4) * 100} className="mt-4" />
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <form onSubmit={handleFormSubmit} className="space-y-8">
                <AnimatePresence mode="wait">
                  {renderStep()}
                </AnimatePresence>

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
                    <Button 
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Assessment"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
} 