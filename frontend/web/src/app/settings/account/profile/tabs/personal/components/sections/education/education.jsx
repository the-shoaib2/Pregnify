import { useState, useEffect, useCallback, useMemo } from 'react'
import { Loader } from "lucide-react"
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
import toast from 'react-hot-toast'
import { SettingsService } from '@/services/settings/account/personal'
import EducationCard from './education-card'

export default function EducationSection({ formValues, setFormValues, loading, handleEdit }) {
    const [dataInitialized, setDataInitialized] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [educationToDelete, setEducationToDelete] = useState(null)
    const [expandedEducationIds, setExpandedEducationIds] = useState([])
    const [isDeleting, setIsDeleting] = useState(false)
    // Local state to track education data for immediate UI updates
    const [localEducationData, setLocalEducationData] = useState([])

    // Sync local state with props
    useEffect(() => {
        if (Array.isArray(formValues)) {
            setLocalEducationData(formValues);
            setDataInitialized(formValues.length > 0);
        } else {
            setLocalEducationData([]);
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
                    setLocalEducationData(Array.isArray(formValues) ? formValues : []);
                }
            }
        } catch (error) {
            console.error("Error deleting education:", error);
            toast.error("An error occurred while trying to delete the education entry.");
            // Revert local state on error
            setLocalEducationData(Array.isArray(formValues) ? formValues : []);
        } finally {
            setIsDeleting(false);
            setOpenDialog(false);
            setEducationToDelete(null);
        }
    }, [educationToDelete, setFormValues, formValues]);

    if (!dataInitialized && loading) {
        return <div className="py-4">Loading education information...</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Education Information</h3>
            
            <div className="education-fields-container">
                {educationData.map((education) => (
                    <EducationCard 
                        key={education.id}
                        education={education}
                        handleEdit={handleEdit}
                        handleDeleteClick={handleDeleteClick}
                        isExpanded={expandedEducationIds.includes(education.id)}
                        handleToggleCollapse={handleToggleCollapse}
                        isDeleting={isDeleting && educationToDelete?.id === education.id}
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
