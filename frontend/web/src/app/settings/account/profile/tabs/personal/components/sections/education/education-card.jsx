import { memo, useCallback } from 'react'
import { Edit, Trash, ChevronsUpDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const EducationCard = memo(({ 
    education, 
    handleEdit, 
    handleDeleteClick, 
    isExpanded, 
    handleToggleCollapse,
    isDeleting
}) => {
    // Use useCallback for event handlers to prevent unnecessary re-renders
    const onEditClick = useCallback(() => {
        handleEdit(education);
    }, [handleEdit, education]);

    const onDeleteClick = useCallback(() => {
        handleDeleteClick(education);
    }, [handleDeleteClick, education]);

    const onToggleClick = useCallback(() => {
        handleToggleCollapse(education.id);
    }, [handleToggleCollapse, education.id]);

    return (
        <Card className="mb-2 shadow-md">
            <Collapsible open={isExpanded}>
                <CollapsibleTrigger asChild>
                    <div className="education-entry p-3 flex justify-between items-center cursor-pointer">
                        <div className="flex flex-col">
                            <span className="font-bold text-sm">{education.degree}</span>
                            <span className="text-gray-600 text-xs">{education.institution}</span>
                        </div>
                        <div className="flex items-center">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="ml-2 border-none" 
                                onClick={onEditClick}
                                disabled={isDeleting}
                            >
                                <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-2 border-none text-red-600 focus:text-red-600 focus:ring-0"
                                onClick={onDeleteClick}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Trash className="h-3 w-3 text-red-600 focus:text-red-600" />
                                )}
                            </Button>

                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="ml-2 border-none" 
                                onClick={onToggleClick}
                                disabled={isDeleting}
                            >
                                <ChevronsUpDown className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <Separator />
                    <CardContent className="p-4">
                        <p className="text-sm"><strong>Field of Study:</strong> {education.fieldOfStudy}</p>
                        <p className="text-sm"><strong>Start Year:</strong> {education.startYear}</p>
                        <p className="text-sm"><strong>End Year:</strong> {education.endYear}</p>
                        <p className="text-sm"><strong>Ongoing:</strong> {education.isOngoing ? "Yes" : "No"}</p>
                        <p className="text-sm"><strong>GPA:</strong> {education.gpa}</p>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
});

EducationCard.displayName = 'EducationCard';

export default EducationCard;
