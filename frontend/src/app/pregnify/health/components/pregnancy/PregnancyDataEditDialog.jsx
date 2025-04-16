"use client"

import { useState } from "react"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
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
import { Loader2 } from "lucide-react"
import { PregnancyService } from "@/services/pregnify"
import toast from "react-hot-toast"

const formSchema = z.object({
    pregnancyWeek: z.number().min(1).max(42, {
        message: "Pregnancy week must be between 1 and 42",
    }),
    dueDate: z.date({
        required_error: "Due date is required",
    }),
    isFirstPregnancy: z.boolean(),
    previousPregnancies: z.number().min(0),
    previousComplications: z.string().optional(),
    pregnancyType: z.enum(["SINGLE", "TWINS", "MULTIPLE"]),
    conceptionMethod: z.enum(["NATURAL", "IVF", "OTHER"]),
    smokingStatus: z.enum(["NEVER", "FORMER", "CURRENT"]),
    alcoholConsumption: z.enum(["NONE", "OCCASIONAL", "REGULAR"]),
    exerciseFrequency: z.enum(["NONE", "LIGHT", "MODERATE", "INTENSE"]),
    dietaryRestrictions: z.string().optional(),
    hasGestationalDiabetes: z.boolean(),
    hasPreeclampsia: z.boolean(),
    hasAnemia: z.boolean(),
    otherConditions: z.string().optional(),
    medicalInformation: z.object({
        bloodGroup: z.string(),
        height: z.number().min(100).max(250),
        prePregnancyWeight: z.number().min(30).max(200),
        currentWeight: z.number().min(30).max(200),
        bloodPressure: z.string().optional(),
        medicalHistory: z.record(z.any()).optional(),
        chronicDiseases: z.record(z.any()).optional(),
        allergies: z.array(z.string()).optional(),
        medications: z.array(z.string()).optional(),
        geneticDisorders: z.record(z.any()).optional(),
    }),
})

export const PregnancyDataEditDialog = ({ open, onOpenChange, data, onSuccess }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const defaultValues = {
        pregnancyWeek: data?.pregnancyWeek || 1,
        dueDate: data?.dueDate ? new Date(data.dueDate) : new Date(),
        isFirstPregnancy: data?.isFirstPregnancy || false,
        previousPregnancies: data?.previousPregnancies || 0,
        previousComplications: data?.previousComplications || "",
        pregnancyType: data?.pregnancyType || "SINGLE",
        conceptionMethod: data?.conceptionMethod || "NATURAL",
        smokingStatus: data?.smokingStatus || "NEVER",
        alcoholConsumption: data?.alcoholConsumption || "NONE",
        exerciseFrequency: data?.exerciseFrequency || "NONE",
        dietaryRestrictions: data?.dietaryRestrictions || "",
        hasGestationalDiabetes: data?.hasGestationalDiabetes || false,
        hasPreeclampsia: data?.hasPreeclampsia || false,
        hasAnemia: data?.hasAnemia || false,
        otherConditions: data?.otherConditions || "",
        medicalInformation: {
            bloodGroup: data?.medicalInformation?.bloodGroup?.replace('_', '+') || "A+",
            height: data?.medicalInformation?.height || 150,
            prePregnancyWeight: data?.medicalInformation?.prePregnancyWeight || 50,
            currentWeight: data?.medicalInformation?.currentWeight || 50,
            bloodPressure: data?.medicalInformation?.bloodPressure || "",
            medicalHistory: data?.medicalInformation?.medicalHistory || {},
            chronicDiseases: data?.medicalInformation?.chronicDiseases || {},
            allergies: data?.medicalInformation?.allergies || [],
            medications: data?.medicalInformation?.medications || [],
            geneticDisorders: data?.medicalInformation?.geneticDisorders || {},
        }
    }

    console.log("Default values:", defaultValues)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues,
    })

    const onSubmit = async (values) => {
        try {
            setLoading(true)
            setError(null)

            // Calculate last menstrual date (dueDate - 280 days)
            const dueDate = new Date(values.dueDate)
            const lastMenstrualDate = new Date(dueDate)
            lastMenstrualDate.setDate(lastMenstrualDate.getDate() - 280)

            // Format blood group correctly (e.g., "B+" -> "B_POSITIVE")
            const formatBloodGroup = (group) => {
                if (!group) return null
                const [type, rh] = group.split('+')
                return `${type}_${rh ? 'POSITIVE' : 'NEGATIVE'}`
            }

            // Safely parse numeric values
            const parseNumber = (value) => {
                if (value === null || value === undefined || value === '') return null
                const num = Number(value)
                return isNaN(num) ? null : num
            }

            // Safely parse boolean values
            const parseBoolean = (value) => {
                if (value === null || value === undefined) return false
                return Boolean(value)
            }

            // Safely parse string values
            const parseString = (value) => {
                if (value === null || value === undefined) return ''
                return String(value).trim()
            }

            // Safely parse JSON values
            const parseJSON = (value) => {
                if (!value) return null
                try {
                    if (typeof value === 'string') {
                        return JSON.parse(value)
                    }
                    return value
                } catch (e) {
                    console.error("Error parsing JSON:", e)
                    return null
                }
            }

            const formattedData = {
                dueDate: format(dueDate, "yyyy-MM-dd"),
                pregnancyWeek: parseNumber(values.pregnancyWeek),
                height: parseNumber(values.medicalInformation.height),
                prePregnancyWeight: parseNumber(values.medicalInformation.prePregnancyWeight),
                currentWeight: parseNumber(values.medicalInformation.currentWeight),
                bloodGroup: formatBloodGroup(values.medicalInformation.bloodGroup),
                lastMenstrualDate: format(lastMenstrualDate, "yyyy-MM-dd"),
                status: "ACTIVE",
                isFirstPregnancy: parseBoolean(values.isFirstPregnancy),
                previousPregnancies: parseNumber(values.previousPregnancies),
                pregnancyType: parseString(values.pregnancyType),
                conceptionMethod: parseString(values.conceptionMethod),
                smokingStatus: parseString(values.smokingStatus),
                alcoholConsumption: parseString(values.alcoholConsumption),
                exerciseFrequency: parseString(values.exerciseFrequency),
                dietaryRestrictions: parseString(values.dietaryRestrictions),
                hasGestationalDiabetes: parseBoolean(values.hasGestationalDiabetes),
                hasPreeclampsia: parseBoolean(values.hasPreeclampsia),
                hasAnemia: parseBoolean(values.hasAnemia),
                otherConditions: parseJSON(values.otherConditions),
                bloodPressure: parseString(values.medicalInformation.bloodPressure)
            }


            // Remove null values from the data
            const cleanData = Object.fromEntries(
                Object.entries(formattedData).filter(([_, value]) => value !== null)
            )

            console.log("Submitting data:", cleanData)
            const response = await PregnancyService.updatePregnancyDetails(data.id, cleanData)
            
            if (response?.statusCode === 200) {
                toast.success("Pregnancy data updated successfully")
                onSuccess?.(response.data)
                onOpenChange(false)
            } else {
                throw new Error("Failed to update pregnancy data")
            }
        } catch (err) {
            console.error("Error in onSubmit:", err)
            setError(err.message || "Failed to update pregnancy data")
            toast.error(err.message || "Failed to update pregnancy data")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Edit Pregnancy Information</DialogTitle>
                    <DialogDescription className="text-base">
                        Update your pregnancy details here to get personalized health insights and recommendations.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
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
                                name="pregnancyType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pregnancy Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select pregnancy type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="SINGLE">Single</SelectItem>
                                                <SelectItem value="TWINS">Twins</SelectItem>
                                                <SelectItem value="MULTIPLE">Multiple</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="conceptionMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Conception Method</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select conception method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NATURAL">Natural</SelectItem>
                                                <SelectItem value="IVF">IVF</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
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
                                name="medicalInformation.height"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Height (cm)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={100}
                                                max={250}
                                                placeholder="Enter height in cm"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="medicalInformation.currentWeight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Weight (kg)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={30}
                                                max={200}
                                                placeholder="Enter current weight in kg"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
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
                                name="smokingStatus"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Smoking Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select smoking status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NEVER">Never</SelectItem>
                                                <SelectItem value="FORMER">Former</SelectItem>
                                                <SelectItem value="CURRENT">Current</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="alcoholConsumption"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Alcohol Consumption</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select alcohol consumption" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NONE">None</SelectItem>
                                                <SelectItem value="OCCASIONAL">Occasional</SelectItem>
                                                <SelectItem value="REGULAR">Regular</SelectItem>
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
                                name="exerciseFrequency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Exercise Frequency</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select exercise frequency" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NONE">None</SelectItem>
                                                <SelectItem value="LIGHT">Light</SelectItem>
                                                <SelectItem value="MODERATE">Moderate</SelectItem>
                                                <SelectItem value="INTENSE">Intense</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="medicalInformation.bloodGroup"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Blood Group</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={form.getValues("medicalInformation.bloodGroup")} />
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
                                name="hasGestationalDiabetes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gestational Diabetes</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(value === "true")}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="true">Yes</SelectItem>
                                                <SelectItem value="false">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="hasPreeclampsia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preeclampsia</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(value === "true")}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="true">Yes</SelectItem>
                                                <SelectItem value="false">No</SelectItem>
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
                                name="hasAnemia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Anemia</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(value === "true")}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="true">Yes</SelectItem>
                                                <SelectItem value="false">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isFirstPregnancy"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Pregnancy</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(value === "true")}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="true">Yes</SelectItem>
                                                <SelectItem value="false">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {!form.getValues("isFirstPregnancy") && (
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="previousPregnancies"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Previous Pregnancies</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="Number of previous pregnancies"
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
                                    name="previousComplications"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Previous Complications</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Any previous complications"
                                                    value={field.value || ""}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="otherConditions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Other Conditions</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Any other medical conditions"
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 