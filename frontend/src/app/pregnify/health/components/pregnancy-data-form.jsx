"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { DatePicker } from "@/components/ui/date-picker"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { PlusCircle, Loader } from "lucide-react"
import { PregnancyService } from "@/services/pregnify"

const formSchema = z.object({
    dueDate: z.date({
        required_error: "Due date is required",
    }).min(new Date(), {
        message: "Due date must be in the future",
    }),
    pregnancyWeek: z.number().min(1).max(42, {
        message: "Pregnancy week must be between 1 and 42",
    }),
    height: z.number().min(100, {
        message: "Height must be at least 100cm",
    }).max(250, {
        message: "Height must not exceed 250cm",
    }),
    weight: z.number().min(30, {
        message: "Weight must be at least 30kg",
    }).max(200, {
        message: "Weight must not exceed 200kg",
    }),
    bloodGroup: z.string().min(1, {
        message: "Blood group is required",
    }),
    lastMenstrualDate: z.date({
        required_error: "Last menstrual date is required",
    }).max(new Date(), {
        message: "Last menstrual date must be in the past",
    }),
})

const capitalizeFirstLetter = (str) => {
    if (!str) return "Not set";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export function PregnancyDataForm() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [existingData, setExistingData] = useState(null)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            pregnancyWeek: undefined,
            height: undefined,
            weight: undefined,
            bloodGroup: "",
            dueDate: null,
            lastMenstrualDate: null,
        },
    })

    // Fetch existing pregnancy data
    const fetchPregnancyData = async () => {
        try {
            setLoading(true)
            const response = await PregnancyService.getPregnancyDetails()
            if (response?.data?.[0]) {
                const pregnancyData = response.data[0]
                setExistingData(pregnancyData)
            }
        } catch (err) {
            console.error("Error fetching pregnancy data:", err)
            if (err.response?.status !== 404) {
                toast.error("Failed to fetch pregnancy data")
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPregnancyData()
    }, [])

    const onSubmit = async (data) => {
        try {
            setLoading(true)
            setError(null)

            if (!data.lastMenstrualDate || !data.dueDate) {
                toast.error("Please select both last menstrual date and due date")
                return
            }

            const formattedData = {
                dueDate: format(data.dueDate, "yyyy-MM-dd"),
                pregnancyWeek: data.pregnancyWeek,
                height: data.height,
                weight: data.weight,
                bloodGroup: data.bloodGroup,
                lastMenstrualDate: format(data.lastMenstrualDate, "yyyy-MM-dd"),
                medicalInformation: {
                    bloodGroup: data.bloodGroup.replace('+', '_'),
                    height: data.height,
                    currentWeight: data.weight,
                }
            }

            const response = await PregnancyService.createPregnancyRecord(formattedData)

            if (response?.statusCode === 201 || response?.status === 201) {
                toast.success("Pregnancy profile created successfully.")
                setOpen(false)
                form.reset()
                fetchPregnancyData()
            } else if (response?.statusCode === 400 || response?.status === 400) {
                toast.error("Pregnancy data already exists. Please update the existing record instead.")
                setOpen(false)
            } else {
                throw new Error("Failed to save pregnancy data")
            }
        } catch (err) {
            console.error("Error in onSubmit:", err)
            if (err.response?.status === 400) {
                toast.error("Pregnancy data already exists. Please update the existing record instead.")
                setOpen(false)
            } else {
            setError(err.message || "Failed to create pregnancy profile")
            toast.error(err.message || "Failed to create pregnancy profile")
            }
        } finally {
            setLoading(false)
        }
    }

    if (loading && !existingData) {
        return <div className="flex justify-center p-4">Loading...</div>
    }

    return (
        <>
            {!existingData ? (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Card className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                            <div className="flex items-center gap-6">
                                <div className="p-3 bg-primary/20 rounded-full">
                                    <PlusCircle className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-primary">Add Pregnancy Data</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Add or update your pregnancy information to get personalized health insights
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Pregnancy Information</DialogTitle>
                            <DialogDescription className="text-base">
                                Add your pregnancy details here to get personalized health insights and recommendations.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="lastMenstrualDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Last Menstrual Date</FormLabel>
                                                <FormControl>
                                                    <DatePicker
                                                        date={field.value}
                                                        setDate={(date) => {
                                                            field.onChange(date);
                                                            form.trigger("lastMenstrualDate");
                                                        }}
                                                        className="w-full"
                                                        toDate={new Date()}
                                                        placeholder="Select last menstrual date"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="dueDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Due Date</FormLabel>
                                                <FormControl>
                                                    <DatePicker
                                                        date={field.value}
                                                        setDate={(date) => {
                                                            field.onChange(date);
                                                            form.trigger("dueDate");
                                                        }}
                                                        className="w-full"
                                                        fromDate={new Date()}
                                                        placeholder="Select due date"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="pregnancyWeek"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pregnancy Week</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={42}
                                                        placeholder="Current week (1-42)"
                                                        value={field.value || ""}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="bloodGroup"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Blood Group</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select blood group" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="A+">A+</SelectItem>
                                                        <SelectItem value="A-">A-</SelectItem>
                                                        <SelectItem value="B+">B+</SelectItem>
                                                        <SelectItem value="B-">B-</SelectItem>
                                                        <SelectItem value="AB+">AB+</SelectItem>
                                                        <SelectItem value="AB-">AB-</SelectItem>
                                                        <SelectItem value="O+">O+</SelectItem>
                                                        <SelectItem value="O-">O-</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="height"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Height (cm)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={100}
                                                        max={250}
                                                        placeholder="Enter height in cm"
                                                        value={field.value || ""}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="weight"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Weight (kg)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={30}
                                                        max={200}
                                                        placeholder="Enter weight in kg"
                                                        value={field.value || ""}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {error && (
                                    <div className="text-sm text-red-500">
                                        {error}
                                    </div>
                                )}

                                <DialogFooter>
                                    <Button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader className="h-4 w-4 animate-spin mr-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            ) : (
                <Card className="p-4 md:p-6">
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <h3 className="text-lg md:text-xl font-semibold text-primary">Pregnancy Information</h3>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                    form.reset({
                                        pregnancyWeek: existingData.pregnancyWeek,
                                        height: existingData.medicalInformation?.height,
                                        weight: existingData.medicalInformation?.currentWeight,
                                        bloodGroup: existingData.medicalInformation?.bloodGroup?.replace('_', '+'),
                                        dueDate: existingData.dueDate ? new Date(existingData.dueDate) : null,
                                        lastMenstrualDate: existingData.lastMenstrualDate ? new Date(existingData.lastMenstrualDate) : null,
                                        pregnancyType: existingData.pregnancyType,
                                        conceptionMethod: existingData.conceptionMethod,
                                        smokingStatus: existingData.smokingStatus,
                                        alcoholConsumption: existingData.alcoholConsumption,
                                        exerciseFrequency: existingData.exerciseFrequency,
                                        hasGestationalDiabetes: existingData.hasGestationalDiabetes,
                                        hasPreeclampsia: existingData.hasPreeclampsia,
                                        hasAnemia: existingData.hasAnemia,
                                    });
                                    setOpen(true);
                                }}
                            >
                                Edit Information
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-primary">Basic Information</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">Due Date</p>
                                        <p className="text-sm font-medium">
                                            {existingData.dueDate ? format(new Date(existingData.dueDate), "MMM d, yyyy") : "Not set"}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">Pregnancy Week</p>
                                        <p className="text-sm font-medium">{existingData.pregnancyWeek || "Not set"}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">Blood Group</p>
                                        <p className="text-sm font-medium">
                                            {existingData.medicalInformation?.bloodGroup ? 
                                                capitalizeFirstLetter(existingData.medicalInformation.bloodGroup.replace('_', '+')) : 
                                                "Not set"}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">Height</p>
                                        <p className="text-sm font-medium">
                                            {existingData.medicalInformation?.height ? `${existingData.medicalInformation.height} cm` : "Not set"}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">Weight</p>
                                        <p className="text-sm font-medium">
                                            {existingData.medicalInformation?.currentWeight ? `${existingData.medicalInformation.currentWeight} kg` : "Not set"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-primary">Pregnancy Details</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">Pregnancy Type</p>
                                        <p className="text-sm font-medium">{capitalizeFirstLetter(existingData.pregnancyType)}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">Conception Method</p>
                                        <p className="text-sm font-medium">{capitalizeFirstLetter(existingData.conceptionMethod)}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">Smoking Status</p>
                                        <p className="text-sm font-medium">{capitalizeFirstLetter(existingData.smokingStatus)}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">Alcohol Consumption</p>
                                        <p className="text-sm font-medium">{capitalizeFirstLetter(existingData.alcoholConsumption)}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">Exercise Frequency</p>
                                        <p className="text-sm font-medium">{capitalizeFirstLetter(existingData.exerciseFrequency)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-primary">Medical Information</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">Gestational Diabetes</p>
                                        <span className={`text-xs font-medium ${existingData.hasGestationalDiabetes ? "text-red-500" : "text-green-500"}`}>
                                            {existingData.hasGestationalDiabetes ? "Yes" : "No"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">Preeclampsia</p>
                                        <span className={`text-xs font-medium ${existingData.hasPreeclampsia ? "text-red-500" : "text-green-500"}`}>
                                            {existingData.hasPreeclampsia ? "Yes" : "No"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">Anemia</p>
                                        <span className={`text-xs font-medium ${existingData.hasAnemia ? "text-red-500" : "text-green-500"}`}>
                                            {existingData.hasAnemia ? "Yes" : "No"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">Risk Score</p>
                                        <p className="text-sm font-medium">{existingData.latestRiskAssessment?.riskScore || "Not assessed"}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">Last Updated</p>
                                        <p className="text-sm font-medium">
                                            {existingData.latestRiskAssessment?.assessmentDate ? 
                                                format(new Date(existingData.latestRiskAssessment.assessmentDate), "MMM d, yyyy") : 
                                                "Not available"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </>
    )
} 