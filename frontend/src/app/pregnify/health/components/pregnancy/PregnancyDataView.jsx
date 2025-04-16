"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { BasicInfoSection } from "./sections/BasicInfoSection"
import { PregnancyDetailsSection } from "./sections/PregnancyDetailsSection"
import { MedicalInfoSection } from "./sections/MedicalInfoSection"

export const PregnancyDataView = ({ data, onEdit }) => {
    return (
        <Card className="p-4 md:p-6">
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h3 className="text-lg md:text-xl font-semibold text-primary">Pregnancy Information</h3>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={onEdit}
                    >
                        Edit Information
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <BasicInfoSection data={data} />
                    <PregnancyDetailsSection data={data} />
                    <MedicalInfoSection data={data} />
                </div>
            </div>
        </Card>
    )
} 