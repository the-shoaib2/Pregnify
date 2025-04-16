"use client"

import { useState, useEffect } from "react"
import { lazy, Suspense } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PregnancyDataView } from "./PregnancyDataView"
import { PregnancyDataDialog } from "./PregnancyDataDialog"
import { PregnancyDataEditDialog } from "./PregnancyDataEditDialog"
import { PregnancyDataSkeleton } from "./PregnancyDataSkeleton"
import { PregnancyService } from "@/services/pregnify"
import toast from "react-hot-toast"

export const PregnancyDataForm = () => {
    const [open, setOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [existingData, setExistingData] = useState(null)

    // Fetch existing pregnancy data
    const fetchPregnancyData = async () => {
        try {
            setLoading(true)
            const response = await PregnancyService.getPregnancyDetails()
            if (response?.data?.[0]) {
                setExistingData(response.data[0])
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

    if (loading && !existingData) {
        return <PregnancyDataSkeleton />
    }

    return (
        <Suspense fallback={<PregnancyDataSkeleton />}>
            {existingData ? (
                <>
                    <PregnancyDataView 
                        data={existingData} 
                        onEdit={() => setEditOpen(true)}
                    />
                    <PregnancyDataEditDialog
                        open={editOpen}
                        onOpenChange={setEditOpen}
                        data={existingData}
                        onSuccess={(updatedData) => {
                            setExistingData(updatedData)
                            setEditOpen(false)
                        }}
                    />
                </>
            ) : (
                <PregnancyDataDialog 
                    open={open}
                    onOpenChange={setOpen}
                    onSubmit={async (data) => {
                        try {
                            setLoading(true)
                            const response = await PregnancyService.createPregnancyRecord(data)
                            if (response?.statusCode === 201 || response?.status === 201) {
                                toast.success("Pregnancy profile created successfully.")
                                setOpen(false)
                                fetchPregnancyData()
                            }
                        } catch (err) {
                            console.error("Error in onSubmit:", err)
                            setError(err.message || "Failed to create pregnancy profile")
                            toast.error(err.message || "Failed to create pregnancy profile")
                        } finally {
                            setLoading(false)
                        }
                    }}
                />
            )}
        </Suspense>
    )
} 