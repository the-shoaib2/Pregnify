import { memo, useCallback } from 'react'
import { Edit, Trash, ChevronsUpDown, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import EducationDialog from './education-form'

const EducationCard = memo(({ 
    education, 
    handleEdit, 
    handleDeleteClick, 
    isExpanded, 
    handleToggleCollapse,
    isDeleting,
    loading,
    handleFormChange
}) => {
    // Use useCallback for event handlers to prevent unnecessary re-renders
    const onEditClick = useCallback(() => {
        handleEdit(education);
    }, [handleEdit, education]);

    const onDeleteClick = useCallback(() => {
        // Optimistically update UI before the actual delete happens
        if (handleFormChange) {
            handleFormChange("optimisticUpdate", {
                type: "delete",
                data: education
            });
        }
        handleDeleteClick(education);
    }, [handleDeleteClick, education, handleFormChange]);

    const onToggleClick = useCallback(() => {
        handleToggleCollapse(education.id);
    }, [handleToggleCollapse, education.id]);

    const handleLocalFormChange = useCallback((field, value) => {
        // Pass changes to parent component for optimistic updates
        if (handleFormChange) {
            handleFormChange(field, value);
        }
    }, [handleFormChange]);

    return (
        <Card className={`mb-2 shadow-md `}>
            <Collapsible open={isExpanded}>
                <CollapsibleTrigger asChild>
                    <div className="education-entry p-3 flex justify-between items-center cursor-pointer">
                        <div className="flex flex-col">
                            <span className="font-bold text-sm">{education.degree}</span>
                            <span className="text-gray-600 text-xs">{education.institution}</span>
                        </div>
                        <div className="flex items-center">
                            <EducationDialog
                                formValues={education}
                                handleChange={handleLocalFormChange}
                                loading={loading}
                            >
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="ml-2 border-none" 
                                    disabled={isDeleting}
                                >
                                    <Edit className="h-3 w-3" />
                                </Button>
                            </EducationDialog>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-2 border-none text-red-600 focus:text-red-600 focus:ring-0"
                                onClick={onDeleteClick}
                                disabled={isDeleting }
                            >
                                {isDeleting ? (
                                    <Loader className="h-3 w-3 animate-spin" />
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
