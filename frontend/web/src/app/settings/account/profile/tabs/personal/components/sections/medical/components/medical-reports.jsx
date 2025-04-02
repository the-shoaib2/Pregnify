import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { FileText, ChevronUp, ChevronDown } from "lucide-react";
import { format } from 'date-fns';
import Section from '../../../../../../../../../../components/shared/section';
import ItemFormDialog from '../../../../../../../../../../components/shared/item-form';
import MedicalReportsFormFields from '../medical-reports-fields';
import { createServiceAdapter } from '../../../../../../../../../../components/shared/service-adapter';
import { SettingsService } from '@/services/settings/account/personal';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export default function MedicalReports({ reports = [] }) {
  const [reportsService] = useState(() => createServiceAdapter(SettingsService, 'MedicalReports'));
  const [isExpanded, setIsExpanded] = useState(false);

  // Format the date for the subtitle field
  const formattedReports = reports.map(report => ({
    ...report,
    formattedDate: format(new Date(report.date), 'MMM dd, yyyy - h:mm a')
  }));

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const detailFields = [
    {
      key: 'date',
      label: 'Date',
      value: (item) => format(new Date(item.date), 'MMM dd, yyyy - h:mm a')
    },
    { key: 'doctor', label: 'Doctor' },
    {
      key: 'details',
      label: 'Details',
      value: (item) => {
        const details = item.details || {};
        return (
          <div className="space-y-2">
            {details.hemoglobin && (
              <div className=" text-sm">
                <span className="font-medium">Hemoglobin: </span>
                <span>{details.hemoglobin}</span>
              </div>
            )}
            {details.bloodSugar && (
              <div className="text-sm">
                <span className="font-medium">Blood Sugar: </span>
                <span>{details.bloodSugar}</span>
              </div>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <Card className="mt-4">
      <Collapsible 
      open={isExpanded}
      onOpenChange={handleToggle}
      >
        <CardHeader className="relative p-4 ">
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CardTitle className="flex items-center text-lg gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Medical Reports
          </CardTitle>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <Section
              formValues={formattedReports}
              handleChange={() => { }}
              handleSave={() => { }}
              loading={false}
              title=""
              emptyMessage="No medical reports added yet."
              ItemFormDialog={(props) => (
                <ItemFormDialog
                  {...props}
                  title="Medical Report"
                  itemType="Medical Report"
                  apiService={reportsService}
                  FormFields={MedicalReportsFormFields}
                />
              )}
              apiService={reportsService}
              itemType="Medical Report"
              titleField="type"
              subtitleField="formattedDate"
              detailFields={detailFields}
              FormFields={MedicalReportsFormFields}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
