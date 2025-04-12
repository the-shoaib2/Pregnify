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
import { PlusCircle, Calendar, Scale, Ruler, Droplet, Loader } from "lucide-react"
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

export function PregnancyDataForm() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [existingData, setExistingData] = useState(null)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            pregnancyWeek: 4,
            height: 103,
            weight: 31,
            bloodGroup: "B+",
            dueDate: new Date("2025-04-10"),
            lastMenstrualDate: new Date("2025-04-01"),
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

    // Update form data when opening edit dialog
    const handleEditClick = () => {
        if (existingData) {
            form.reset({
                pregnancyWeek: existingData.pregnancyWeek,
                height: existingData.medicalInformation?.height,
                weight: existingData.medicalInformation?.currentWeight,
                bloodGroup: existingData.medicalInformation?.bloodGroup?.replace('_', '+'),
                dueDate: new Date(existingData.dueDate),
                lastMenstrualDate: new Date(existingData.lastMenstrualDate || existingData.dueDate),
            })
        }
        setOpen(true)
    }

    useEffect(() => {
        fetchPregnancyData()
    }, [])

    const onSubmit = async (data) => {
        try {
            setLoading(true)
            setError(null)

            const formattedData = {
                ...data,
                dueDate: format(data.dueDate, "yyyy-MM-dd"),
                lastMenstrualDate: format(data.lastMenstrualDate, "yyyy-MM-dd"),
                medicalInformation: {
                    bloodGroup: data.bloodGroup.replace('+', '_'),
                    height: data.height,
                    currentWeight: data.weight,
                }
            }

            const response = await PregnancyService.createPregnancyRecord(formattedData)

            if (response.statusCode === 201) {
                setOpen(false)
                form.reset()
                toast.success("Pregnancy data has been successfully saved.")
                fetchPregnancyData()
            }
        } catch (err) {
            setError(err.message || "Failed to create pregnancy profile")
            toast.error(err.message || "Failed to create pregnancy profile")
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
                                        name="dueDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Due Date</FormLabel>
                                                <FormControl>
                                                    <DatePicker
                                                        date={field.value}
                                                        setDate={field.onChange}
                                                        className="w-full"
                                                        fromDate={new Date()}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="lastMenstrualDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Last Menstrual Date</FormLabel>
                                                <FormControl>
                                                    <DatePicker
                                                        date={field.value}
                                                        setDate={field.onChange}
                                                        className="w-full"
                                                        toDate={new Date()}
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
                                                            <SelectValue placeholder="Choose your blood type" />
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
                                                        placeholder="Your height in cm"
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
                                                        placeholder="Your weight in kg"
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
                                    <Button type="submit" disabled={loading}>
                                        {loading ? (
                                            <Loader className="h-4 w-4 animate-spin" />
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
                <Card className="p-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-primary">Pregnancy Information</h3>
                            <Button variant="outline" onClick={handleEditClick}>
                                Edit
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Due Date</p>
                                <p className="font-medium">
                                    {existingData.dueDate ? format(new Date(existingData.dueDate), "MMMM d, yyyy") : "Not set"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pregnancy Week</p>
                                <p className="font-medium">{existingData.pregnancyWeek || "Not set"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Blood Group</p>
                                <p className="font-medium">
                                    {existingData.medicalInformation?.bloodGroup?.replace('_', '+') || "Not set"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Height</p>
                                <p className="font-medium">
                                    {existingData.medicalInformation?.height ? `${existingData.medicalInformation.height} cm` : "Not set"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Weight</p>
                                <p className="font-medium">
                                    {existingData.medicalInformation?.currentWeight ? `${existingData.medicalInformation.currentWeight} kg` : "Not set"}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            {existingData ? "Edit Pregnancy Information" : "Add Pregnancy Information"}
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            {existingData 
                                ? "Update your pregnancy details here to get personalized health insights and recommendations."
                                : "Add your pregnancy details here to get personalized health insights and recommendations."
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Due Date</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    date={field.value}
                                                    setDate={field.onChange}
                                                    className="w-full"
                                                    fromDate={new Date()}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="lastMenstrualDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Last Menstrual Date</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    date={field.value}
                                                    setDate={field.onChange}
                                                    className="w-full"
                                                    toDate={new Date()}
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
                                                        <SelectValue placeholder="Choose your blood type" />
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
                                                    placeholder="Your height in cm"
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
                                                    placeholder="Your weight in kg"
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
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <Loader className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Save"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
} 