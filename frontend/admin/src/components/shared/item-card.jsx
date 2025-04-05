import { memo, useCallback } from 'react'
import { Edit, Trash, ChevronsUpDown, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const ItemCard = memo(({
    item,
    handleEdit,
    handleDeleteClick,
    isExpanded,
    handleToggleCollapse,
    isDeleting,
    loading,
    handleFormChange,
    FormDialog,
    titleField,
    subtitleField,
    detailFields,
    itemType
}) => {
    // Use useCallback for event handlers to prevent unnecessary re-renders
    const onEditClick = useCallback(() => {
        handleEdit(item);
    }, [handleEdit, item]);

    const onDeleteClick = useCallback(() => {
        // Just call the delete handler without optimistic updates
        handleDeleteClick(item);
    }, [handleDeleteClick, item]);

    const onToggleClick = useCallback(() => {
        handleToggleCollapse(item.id);
    }, [handleToggleCollapse, item.id]);

    const handleLocalFormChange = useCallback((field, value) => {
        // Pass changes to parent component for optimistic updates
        if (handleFormChange) {
            handleFormChange(field, value);
        }
    }, [handleFormChange]);

    return (
        <Card className={`mb-2 shadow-md`}>
            <Collapsible open={isExpanded}>
                <CollapsibleTrigger asChild>
                    <div className="item-entry p-3 flex justify-between items-center cursor-pointer">
                        <div className="flex flex-col">
                            <span className="font-bold text-sm">{item[titleField]}</span>
                            <span className="text-gray-600 text-xs">{item[subtitleField]}</span>
                        </div>
                        <div className="flex items-center">
                            <FormDialog
                                formValues={item}
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
                            </FormDialog>

                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-2 border-none text-red-600 focus:text-red-600 focus:ring-0"
                                onClick={onDeleteClick}
                                disabled={isDeleting}
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
                        {detailFields.map((field) => (
                            <p key={field.key} className="text-sm">
                                <strong>{field.label}:</strong> {
                                    typeof field.value === 'function' 
                                        ? field.value(item) 
                                        : (item[field.key] !== undefined ? 
                                            (typeof item[field.key] === 'boolean' ? 
                                                (item[field.key] ? 'Yes' : 'No') : 
                                                item[field.key]
                                            ) : 'N/A')
                                }
                            </p>
                        ))}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
});

ItemCard.displayName = 'ItemCard';

export default ItemCard;
