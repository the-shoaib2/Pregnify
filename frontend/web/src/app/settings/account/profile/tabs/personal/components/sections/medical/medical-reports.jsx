import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { FileText } from "lucide-react";
import { format } from 'date-fns';

export default function MedicalReports({ reports = [] }) {
  if (!reports || reports.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            No Medical Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No medical reports have been added yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className="relative">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {report.type}
              </div>
              <span className="text-sm text-muted-foreground">
                {format(new Date(report.date), 'MMM dd, yyyy')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(report.details).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="font-medium capitalize">{key}:</span>
                  <span>{value}</span>
                </div>
              ))}
              {report.doctorId && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Doctor ID:</span>
                  <span>{report.doctorId}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
