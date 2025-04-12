import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import WebsiteForm from './website-form';
import ItemCard from "@/components/shared/item-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from '@/components/ui/card';

export default function WebsiteList({ websites, onUpdate }) {
  // Ensure websites is always an array
  const websitesArray = Array.isArray(websites) ? websites : [];
  const [newWebsite, setNewWebsite] = useState({
    website: '',
    url: '',
  });

  const [editWebsite, setEditWebsite] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleAddWebsite = () => {
    onUpdate(newWebsite);
    setNewWebsite({ website: '', url: '' });
  };

  const handleUpdateWebsite = (updatedWebsite) => {
    onUpdate(updatedWebsite);
  };

  const handleRemoveWebsite = (id) => {
    onUpdate(websitesArray.filter((w) => w.id !== id));
  };

  const handleEdit = (website) => {
    setEditWebsite(website);
    setIsDialogOpen(true);
  };

  const handleDelete = (website) => {
    handleRemoveWebsite(website.id);
  };

  const handleFormChange = (field, value) => {
    if (editWebsite) {
      setEditWebsite((prev) => ({ ...prev, [field]: value }));
    } else {
      setNewWebsite((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Card>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">Websites</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setEditWebsite(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Website
          </Button>
        </div>

        {!isCollapsed && (
          <ScrollArea className="h-[200px] w-full">
            <div className="space-y-4">
              {websitesArray.length > 0 ? (
                websitesArray.slice(0, 3).map((website) => (
                  <ItemCard
                    key={website.id}
                    item={website}
                    handleEdit={handleEdit}
                    handleDeleteClick={handleDelete}
                    isExpanded={false}
                    handleToggleCollapse={() => { }}
                    isDeleting={false}
                    loading={false}
                    handleFormChange={handleFormChange}
                    FormDialog={WebsiteForm}
                    titleField="website"
                    subtitleField="url"
                    detailFields={[]}
                    itemType="website"
                  />
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No websites added yet
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <WebsiteForm
          website={editWebsite || newWebsite}
          onUpdate={handleUpdateWebsite}
          onRemove={handleRemoveWebsite}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>
    </Card>
  );
}
