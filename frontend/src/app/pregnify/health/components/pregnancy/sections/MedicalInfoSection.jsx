"use client"

import { format } from "date-fns"

export const MedicalInfoSection = ({ data }) => {
    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-primary">Medical Information</h4>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Gestational Diabetes</p>
                    <span className={`text-xs font-medium ${data.hasGestationalDiabetes ? "text-red-500" : "text-green-500"}`}>
                        {data.hasGestationalDiabetes ? "Yes" : "No"}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Preeclampsia</p>
                    <span className={`text-xs font-medium ${data.hasPreeclampsia ? "text-red-500" : "text-green-500"}`}>
                        {data.hasPreeclampsia ? "Yes" : "No"}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Anemia</p>
                    <span className={`text-xs font-medium ${data.hasAnemia ? "text-red-500" : "text-green-500"}`}>
                        {data.hasAnemia ? "Yes" : "No"}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Risk Score</p>
                    <p className="text-sm font-medium">{data.latestRiskAssessment?.riskScore || "Not assessed"}</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Last Updated</p>
                    <p className="text-sm font-medium">
                        {data.latestRiskAssessment?.assessmentDate ? 
                            format(new Date(data.latestRiskAssessment.assessmentDate), "MMM d, yyyy") : 
                            "Not available"}
                    </p>
                </div>
            </div>
        </div>
    )
} 