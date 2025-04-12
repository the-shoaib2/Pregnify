import { useState, useEffect, useCallback, useMemo } from 'react'
import { Loader, Plus, Trash2, Info } from "lucide-react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import ItemCard from './item-card'
import toast from 'react-hot-toast'

export default function Section({ 
    formValues, 
    handleChange,
    handleSave,
    loading,
    title,
    description,
    emptyMessage,
    ItemFormDialog,
    apiService,
    itemType,
    titleField,
    subtitleField,
    detailFields,
    FormFields,
    profile
}) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [dataInitialized, setDataInitialized] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [expandedItemIds, setExpandedItemIds] = useState([])
    // Local state to track data for immediate UI updates
    const [localItemData, setLocalItemData] = useState([])
    // State to track the item being edited
    const [itemToEdit, setItemToEdit] = useState(null)
    // Keep a copy of the original data for reverting on error
    const [originalItemData, setOriginalItemData] = useState([])

    // Sync local state with props
    useEffect(() => {
        if (Array.isArray(formValues)) {
            setLocalItemData(formValues);
            setOriginalItemData(formValues);
            setDataInitialized(formValues.length > 0 || formValues.length === 0);
        } else {
            setLocalItemData([]);
            setOriginalItemData([]);
            setDataInitialized(false);
        }
    }, [formValues]);

    // Use local state for rendering instead of directly using formValues
    const itemData = useMemo(() => {
        return localItemData;
    }, [localItemData]);

    // Internal handler for edit button clicks
    const handleEditClick = useCallback((item) => {
        setItemToEdit(item);
        setIsEditing(true);
    }, []);

    // Handler for form changes
    const handleFormChange = useCallback((field, value) => {
        if (field === itemType.toLowerCase() && Array.isArray(value)) {
            // Update both local and parent state with the new data from API
            setLocalItemData(value);
            handleChange(value);
            setItemToEdit(null);
            setIsEditing(false);
        } else if (field === "optimisticUpdate") {
            // Handle optimistic updates for immediate UI feedback
            const { type, data } = value;

            if (type === "add") {
                // Add new entry to local state
                setLocalItemData(prev => [...prev, data]);
            } else if (type === "update") {
                // Update existing entry in local state
                setLocalItemData(prev =>
                    prev.map(item => item.id === data.id ? data : item)
                );
            } else if (type === "delete") {
                // Remove entry from local state
                setLocalItemData(prev =>
                    prev.filter(item => item.id !== data.id)
                );
            } else if (type === "revert") {
                // Revert to original data if operation fails
                setLocalItemData(originalItemData);
            }
        }
    }, [handleChange, originalItemData, itemType]);

    const handleItemFormChange = useCallback((field, value) => {
        handleFormChange(field, value);
    }, [handleFormChange]);

    // Handle delete button click
    const handleDeleteClick = useCallback((item) => {
        setItemToDelete(item);
        setOpenDialog(true);
    }, []);

    // Handle cancel delete
    const handleCancelDelete = useCallback(() => {
        setOpenDialog(false);
        setItemToDelete(null);
    }, []);

    const handleToggleCollapse = useCallback((itemId) => {
        setExpandedItemIds((prevIds) =>
            prevIds.includes(itemId)
                ? prevIds.filter(id => id !== itemId)
                : [...prevIds, itemId]
        );
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);

        try {
            // Make API call first before updating UI
            const response = await apiService.delete(itemToDelete.id);

            if (response.success) {
                // Only remove from local state after successful API call
                setLocalItemData(prev =>
                    prev.filter(item => item.id !== itemToDelete.id)
                );

                // Update the parent state after successful API call
                if (handleChange) {
                    handleChange(prev => {
                        if (!Array.isArray(prev)) return [];
                        return prev.filter(item => item.id !== itemToDelete.id);
                    });
                }

                toast.success(`${itemType} deleted successfully`);
            } else {
                // Handle API error
                if (response.status === 404) {
                    toast.error(`${itemType} entry not found. It may have already been deleted.`);
                    // Still update parent state if server says it's not found
                    setLocalItemData(prev =>
                        prev.filter(item => item.id !== itemToDelete.id)
                    );
                    
                    if (handleChange) {
                        handleChange(prev => {
                            if (!Array.isArray(prev)) return [];
                            return prev.filter(item => item.id !== itemToDelete.id);
                        });
                    }
                } else {
                    toast.error(response.message || `Failed to delete ${itemType.toLowerCase()}`);
                }
            }
        } catch (error) {
            console.error(`Error deleting ${itemType.toLowerCase()}:`, error);
            toast.error(`An error occurred while trying to delete the ${itemType.toLowerCase()} entry.`);
        } finally {
            setIsDeleting(false);
            setOpenDialog(false);
            setItemToDelete(null);
        }
    }, [itemToDelete, handleChange, originalItemData, apiService, itemType]);

    // Reset editing state when dialog is closed
    const handleDialogClose = useCallback(() => {
        setIsEditing(false);
        setItemToEdit(null);
    }, []);

    // Memoize the item list to prevent unnecessary re-renders
    const itemList = useMemo(() => {
        return (
            <div className="space-y-4 mt-4">
                {localItemData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-4 border rounded-md text-muted-foreground">
                        <Info className="h-6 w-6 text-gray-500 mb-2" />
                        <p className="text-center text-lg font-medium">
                            {emptyMessage || `No ${itemType.toLowerCase()} information found.`}
                        </p>
                        <p className="text-sm text-gray-400">
                            Click the button above to add your first {itemType.toLowerCase()}.
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-[320px] rounded-md">
                        <div className="space-y-4 pr-4">
                            {localItemData.map((item) => (
                                <ItemCard
                                    key={item.id}
                                    item={item}
                                    handleEdit={handleEditClick}
                                    handleDeleteClick={handleDeleteClick}
                                    isExpanded={expandedItemIds.includes(item.id)}
                                    handleToggleCollapse={handleToggleCollapse}
                                    isDeleting={isDeleting && itemToDelete?.id === item.id}
                                    loading={loading}
                                    handleFormChange={handleItemFormChange}
                                    FormDialog={ItemFormDialog}
                                    titleField={titleField}
                                    subtitleField={subtitleField}
                                    detailFields={detailFields}
                                    itemType={itemType}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </div>
        );
    }, [localItemData, emptyMessage, itemType, titleField, subtitleField, detailFields, expandedItemIds, handleToggleCollapse, handleEditClick, handleDeleteClick, handleItemFormChange, ItemFormDialog, loading, isDeleting, itemToDelete]);

    if (!dataInitialized && loading) {
        return <div className="py-4">Loading {itemType.toLowerCase()} information...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{title || `${itemType} Information`}</h3>
                <ItemFormDialog
                    formValues={isEditing ? itemToEdit : {}}
                    handleChange={handleFormChange}
                    loading={loading}
                    onClose={handleDialogClose}
                    title={title}
                    itemType={itemType}
                    apiService={apiService}
                    FormFields={FormFields}
                >
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Plus className="h-4 w-4" /> {isEditing ? `Edit ${itemType}` : `Add ${itemType}`}
                    </Button>
                </ItemFormDialog>
            </div>

            {itemList}

            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this {itemType.toLowerCase()} entry?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting} onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
