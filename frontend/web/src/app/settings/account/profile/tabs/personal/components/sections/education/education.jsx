import { useState, useEffect, useCallback, useMemo } from 'react'
import { Loader, Plus } from "lucide-react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast'
import { SettingsService } from '@/services/settings/account/personal'
import EducationCard from './education-card'
import EducationDialog from './education-form'

export default function EducationSection({ formValues, setFormValues, loading }) {
    const [dataInitialized, setDataInitialized] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [educationToDelete, setEducationToDelete] = useState(null)
    const [expandedEducationIds, setExpandedEducationIds] = useState([])
    const [isDeleting, setIsDeleting] = useState(false)
    // Local state to track education data for immediate UI updates
    const [localEducationData, setLocalEducationData] = useState([])
    // State to track the education being edited
    const [educationToEdit, setEducationToEdit] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    // Keep a backup of the original data for reverting optimistic updates if needed
    const [originalEducationData, setOriginalEducationData] = useState([])

    // Sync local state with props
    useEffect(() => {
        if (Array.isArray(formValues)) {
            setLocalEducationData(formValues);
            setOriginalEducationData(formValues);
            setDataInitialized(formValues.length > 0);
        } else {
            setLocalEducationData([]);
            setOriginalEducationData([]);
            setDataInitialized(false);
        }
    }, [formValues]);

    // Use local state for rendering instead of directly using formValues
    const educationData = useMemo(() => {
        return localEducationData;
    }, [localEducationData]);

    const handleDeleteClick = useCallback((education) => {
        setEducationToDelete(education);
        setOpenDialog(true);
    }, []);

    // Internal handler for edit button clicks
    const handleEditClick = useCallback((education) => {
        setEducationToEdit(education);
        setIsEditing(true);
    }, []);

    // Handler for form changes
    const handleFormChange = useCallback((field, value) => {
        if (field === "education" && Array.isArray(value)) {
            // Update both local and parent state with the new data from API
            setLocalEducationData(value);
            setFormValues(value);
            setEducationToEdit(null);
            setIsEditing(false);
        } else if (field === "optimisticUpdate") {
            // Handle optimistic updates for immediate UI feedback
            const { type, data } = value;
            
            if (type === "add") {
                // Add new education entry to local state
                setLocalEducationData(prev => [...prev, data]);
            } else if (type === "update") {
                // Update existing education entry in local state
                setLocalEducationData(prev => 
                    prev.map(item => item.id === data.id ? data : item)
                );
            } else if (type === "delete") {
                // Remove education entry from local state
                setLocalEducationData(prev => 
                    prev.filter(item => item.id !== data.id)
                );
            } else if (type === "revert") {
                // Revert to original data if operation fails
                setLocalEducationData(originalEducationData);
            }
        }
    }, [setFormValues, originalEducationData]);

    const handleToggleCollapse = useCallback((educationId) => {
        setExpandedEducationIds((prevIds) =>
            prevIds.includes(educationId)
                ? prevIds.filter(id => id !== educationId)
                : [...prevIds, educationId]
        );
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!educationToDelete) return;
        
        setIsDeleting(true);
        
        // Immediately remove from local state for instant UI update
        setLocalEducationData(prev => 
            prev.filter(edu => edu.id !== educationToDelete.id)
        );
        
        try {
            const response = await SettingsService.deleteEducation(educationToDelete.id);
            
            if (response.success) {
                // Update the parent state after successful API call
                setFormValues(prev => {
                    if (!Array.isArray(prev)) return [];
                    return prev.filter(edu => edu.id !== educationToDelete.id);
                });
                
                toast.success("Education deleted successfully");
            } else {
                // If API call fails, revert the local state change
                if (response.status === 404) {
                    toast.error("Education entry not found. It may have already been deleted.");
                    // Still update parent state if server says it's not found
                    setFormValues(prev => {
                        if (!Array.isArray(prev)) return [];
                        return prev.filter(edu => edu.id !== educationToDelete.id);
                    });
                } else {
                    toast.error(response.message || "Failed to delete education");
                    // Revert local state if other error
                    setLocalEducationData(originalEducationData);
                }
            }
        } catch (error) {
            console.error("Error deleting education:", error);
            toast.error("An error occurred while trying to delete the education entry.");
            // Revert local state on error
            setLocalEducationData(originalEducationData);
        } finally {
            setIsDeleting(false);
            setOpenDialog(false);
            setEducationToDelete(null);
        }
    }, [educationToDelete, setFormValues, originalEducationData]);

    // Reset editing state when dialog is closed
    const handleDialogClose = useCallback(() => {
        setEducationToEdit(null);
        setIsEditing(false);
    }, []);

    if (!dataInitialized && loading) {
        return <div className="py-4">Loading education information...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Education Information</h3>
                <EducationDialog 
                    formValues={isEditing ? educationToEdit : {}} 
                    handleChange={handleFormChange}
                    loading={loading}
                    onClose={handleDialogClose}
                >
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Plus className="h-4 w-4" /> {isEditing ? 'Edit Education' : 'Add Education'}
                    </Button>
                </EducationDialog>
            </div>
            
            <div className="education-fields-container">
                {educationData.map((education) => (
                    <EducationCard 
                        key={education.id}
                        education={education}
                        handleEdit={handleEditClick}
                        handleDeleteClick={handleDeleteClick}
                        isExpanded={expandedEducationIds.includes(education.id)}
                        handleToggleCollapse={handleToggleCollapse}
                        isDeleting={isDeleting && educationToDelete?.id === education.id}
                        loading={loading}
                        handleFormChange={handleFormChange}
                    />
                ))}
            </div>

            {educationData.length === 0 && !loading && (
                <div className="text-center py-4 text-gray-500">
                    No education information added yet.
                </div>
            )}

            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this education entry?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting} onClick={() => setOpenDialog(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600" 
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
