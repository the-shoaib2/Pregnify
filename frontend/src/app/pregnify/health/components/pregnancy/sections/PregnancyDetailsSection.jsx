"use client"

const capitalizeFirstLetter = (str) => {
    if (!str) return "Not set";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const PregnancyDetailsSection = ({ data }) => {
    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-primary">Pregnancy Details</h4>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Pregnancy Type</p>
                    <p className="text-sm font-medium">{capitalizeFirstLetter(data.pregnancyType)}</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Conception Method</p>
                    <p className="text-sm font-medium">{capitalizeFirstLetter(data.conceptionMethod)}</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Smoking Status</p>
                    <p className="text-sm font-medium">{capitalizeFirstLetter(data.smokingStatus)}</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Alcohol Consumption</p>
                    <p className="text-sm font-medium">{capitalizeFirstLetter(data.alcoholConsumption)}</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Exercise Frequency</p>
                    <p className="text-sm font-medium">{capitalizeFirstLetter(data.exerciseFrequency)}</p>
                </div>
            </div>
        </div>
    )
} 