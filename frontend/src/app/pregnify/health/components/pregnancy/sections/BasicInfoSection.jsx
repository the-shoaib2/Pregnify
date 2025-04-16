"use client"

import { format } from "date-fns"

const capitalizeFirstLetter = (str) => {
    if (!str) return "Not set";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const BasicInfoSection = ({ data }) => {
    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-primary">Basic Information</h4>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="text-sm font-medium">
                        {data.dueDate ? format(new Date(data.dueDate), "MMM d, yyyy") : "Not set"}
                    </p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Pregnancy Week</p>
                    <p className="text-sm font-medium">{data.pregnancyWeek || "Not set"}</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Blood Group</p>
                    <p className="text-sm font-medium">
                        {data.medicalInformation?.bloodGroup ? 
                            capitalizeFirstLetter(data.medicalInformation.bloodGroup.replace('_', '+')) : 
                            "Not set"}
                    </p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Height</p>
                    <p className="text-sm font-medium">
                        {data.medicalInformation?.height ? `${data.medicalInformation.height} cm` : "Not set"}
                    </p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="text-sm font-medium">
                        {data.medicalInformation?.currentWeight ? `${data.medicalInformation.currentWeight} kg` : "Not set"}
                    </p>
                </div>
            </div>
        </div>
    )
} 