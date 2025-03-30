import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Input,
  InputGroup,
  InputLeftAddon,
} from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { FileText, Plus, Trash2, Edit2 } from "lucide-react";

export default function MedicalReports({ reports, onAddReport, onUpdateReport, onDeleteReport }) {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [reportType, setReportType] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [reportDetails, setReportDetails] = useState({});
  const [doctorId, setDoctorId] = useState('');

  const handleAddReport = async () => {
    const newReport = {
      type: reportType,
      date: reportDate,
      details: reportDetails,
      doctor: doctorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onAddReport(newReport);
    resetForm();
    setOpen(false);
  };

  const handleUpdateReport = async () => {
    const updatedReport = {
      ...editingReport,
      type: reportType,
      date: reportDate,
      details: reportDetails,
      doctor: doctorId,
      updatedAt: new Date().toISOString()
    };

    await onUpdateReport(updatedReport);
    resetForm();
    setOpen(false);
  };

  const handleDeleteReport = async (report) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      await onDeleteReport(report);
    }
  };

  const resetForm = () => {
    setReportType('');
    setReportDate('');
    setReportDetails({});
    setDoctorId('');
    setEditMode(false);
    setEditingReport(null);
  };

  const handleEditReport = (report) => {
    setEditMode(true);
    setEditingReport(report);
    setReportType(report.type);
    setReportDate(report.date);
    setReportDetails(report.details);
    setDoctorId(report.doctor);
    setOpen(true);
  };

  const handleAddDetail = (key, value) => {
    setReportDetails(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => {
          resetForm();
          setOpen(true);
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Medical Report
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Medical Report' : 'Add Medical Report'}</DialogTitle>
            <DialogDescription>
              Add or edit medical report details
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select
                value={reportType}
                onValueChange={setReportType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blood Test">Blood Test</SelectItem>
                  <SelectItem value="X-ray">X-ray</SelectItem>
                  <SelectItem value="MRI">MRI</SelectItem>
                  <SelectItem value="CT Scan">CT Scan</SelectItem>
                  <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="reportDate">Report Date</Label>
              <Input
                type="date"
                id="reportDate"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label>Report Details</Label>
              <div className="space-y-2">
                <InputGroup>
                  <InputLeftAddon>Key:</InputLeftAddon>
                  <Input
                    placeholder="Enter detail key"
                    onChange={(e) => {
                      const key = e.target.value;
                      if (key && !reportDetails[key]) {
                        setReportDetails(prev => ({
                          ...prev,
                          [key]: ''
                        }));
                      }
                    }}
                  />
                </InputGroup>
                {Object.entries(reportDetails).map(([key, value]) => (
                  <InputGroup key={key}>
                    <InputLeftAddon>{key}:</InputLeftAddon>
                    <Input
                      value={value}
                      onChange={(e) => handleAddDetail(key, e.target.value)}
                    />
                  </InputGroup>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="doctorId">Doctor ID</Label>
              <Input
                id="doctorId"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                placeholder="Enter doctor ID"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={editMode ? handleUpdateReport : handleAddReport}>
              {editMode ? 'Update Report' : 'Add Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {reports.map((report) => (
        <Card key={report.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-col space-y-1">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {report.type}
                </div>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {format(new Date(report.date), 'MMM dd, yyyy')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(report.details).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="font-medium capitalize">{key}:</span>
                <span>{value}</span>
              </div>
            ))}
            {report.doctor && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Doctor ID:</span>
                <span>{report.doctor}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditReport(report)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteReport(report)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
