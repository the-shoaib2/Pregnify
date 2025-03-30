import { Suspense, useMemo, useState, useCallback } from 'react';
import ErrorBoundary from "@/components/error-boundary";
import { FormSectionSkeleton, CardSkeleton } from "../../skeleton";
import { FileText, ChevronUp, ChevronDown, User } from "lucide-react";
import MedicalReports from "./medical-reports";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuSeparator,
  ContextMenuContent,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuCheckboxItem,
} from "@/components/ui/context-menu";

export default function MedicalDocuments({ documents, onUpload }) {
  const [expandedSections, setExpandedSections] = useState({
    medicalReports: true
  });

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleExpandAll = useCallback(() => {
    setExpandedSections(prev => 
      Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedSections(prev => 
      Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    );
  }, []);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  const handleForward = useCallback(() => {
    window.history.forward();
  }, []);

  // Memoized card header component with command menu
  const CardWithCollapse = useMemo(() => ({ 
    section, 
    title, 
    description, 
    children,
    isLoading,
    icon: Icon = User
  }) => (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card className="relative">
          <Collapsible
            open={expandedSections[section]}
            onOpenChange={() => toggleSection(section)}
          >
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  {expandedSections[section] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Icon className="h-5 w-5 text-primary" />
                {title}
              </CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>

            <CollapsibleContent>
              <CardContent className="pt-0">
                {isLoading ? <FormSectionSkeleton /> : children}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem inset onClick={handleReload}>
          Reload
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset onClick={handleBack}>
          Backward
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset onClick={handleForward}>
          Forward
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem inset onClick={() => toggleSection(section)}>
          {expandedSections[section] ? "Collapse" : "Expand"} {title}
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset onClick={handleExpandAll}>
          Expand All
          <ContextMenuShortcut>⌘E</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset onClick={handleCollapseAll}>
          Collapse All
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>
              Save Page As...
              <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Developer Tools
              <ContextMenuShortcut>⌘I</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked={true} onCheckedChange={() => {}}>
          Show Bookmarks Bar
          <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
        </ContextMenuCheckboxItem>
      </ContextMenuContent>
    </ContextMenu>
  ), [expandedSections, toggleSection, handleExpandAll, handleCollapseAll, handleReload, handleBack, handleForward]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<CardSkeleton />}>
        <CardWithCollapse
          section="medicalReports"
          title="Medical Documents"
          description="Upload and manage your medical documents"
          icon={FileText}
        >
          <MedicalReports 
            reports={documents}
            onAddReport={onUpload}
            loading={false}
          />
        </CardWithCollapse>
      </Suspense>
    </ErrorBoundary>
  );
}
