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
import { Loader } from "lucide-react"
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

export const PregnancyDataDialog = ({ open, onOpenChange, onSubmit }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

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

    const handleSubmit = async (data) => {
        try {
            setLoading(true)
            setError(null)

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

            await onSubmit(formattedData)
        } catch (err) {
            console.error("Error in handleSubmit:", err)
            setError(err.message || "Failed to save pregnancy data")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">Pregnancy Information</DialogTitle>
                    <DialogDescription className="text-base">
                        Add or update your pregnancy details here to get personalized health insights and recommendations.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
    )
}