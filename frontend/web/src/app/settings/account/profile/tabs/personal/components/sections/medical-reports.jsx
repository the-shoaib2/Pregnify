import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { InputWithIcon } from "@/components/input-with-icon"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { 
  FileText, 
  CalendarIcon,
  Save,
  Loader,
  Plus,
  Trash2,
  Edit,
} from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

export default function MedicalReportsSection({
  reports: initialReports = [],
  onAddReport,
  onUpdateReport,
  onDeleteReport,
  loading,
  profile
}) {
  const [saving, setSaving] = useState(false)
  const [reportDate, setReportDate] = useState(null)
  const [editing, setEditing] = useState(false)
  const [currentReport, setCurrentReport] = useState(null)
  const [formValues, setFormValues] = useState({
    reportType: '',
    reportDate: '',
    reportDetails: {
      hemoglobin: '',
      bloodSugar: ''
    },
    doctorId: ''
  })
  const [reports, setReports] = useState(initialReports)

  // Handle form change
  const handleChange = useCallback((field, value) => {
    setFormValues(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }
      }
      return {
        ...prev,
        [field]: value
      }
    })
  }, [])

  // Handle date selection
  const handleDateSelect = useCallback((date) => {
    setReportDate(date)
    setFormValues(prev => ({
      ...prev,
      reportDate: format(date, 'yyyy-MM-dd')
    }))
  }, [])

  // Reset form
  const resetForm = useCallback(() => {
    setFormValues({
      reportType: '',
      reportDate: '',
      reportDetails: {
        hemoglobin: '',
        bloodSugar: ''
      },
      doctorId: ''
    })
    setReportDate(null)
    setEditing(false)
    setCurrentReport(null)
  }, [])

  // Edit report
  const handleEditReport = useCallback((report) => {
    setCurrentReport(report)
    setFormValues({
      reportType: report.reportType,
      reportDate: report.reportDate,
      reportDetails: report.reportDetails || {
        hemoglobin: '',
        bloodSugar: ''
      },
      doctorId: report.doctorId
    })
    setReportDate(report.reportDate ? new Date(report.reportDate) : null)
    setEditing(true)
  }, [])

  // Submit form
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      if (!formValues.reportType) {
        toast.error('Report type is required')
        return
      }
      
      if (!formValues.reportDate) {
        toast.error('Report date is required')
        return
      }
      
      if (editing && currentReport) {
        await onUpdateReport(currentReport.id, formValues)
        toast.success('Medical report updated successfully')
      } else {
        await onAddReport(formValues)
        toast.success('Medical report added successfully')
      }
      
      resetForm()
    } catch (error) {
      console.error('Error saving medical report:', error)
      toast.error('Failed to save medical report')
    } finally {
      setSaving(false)
    }
  }, [formValues, editing, currentReport, onAddReport, onUpdateReport, resetForm])

  // Delete report
  const handleDeleteReport = useCallback(async (id) => {
    try {
      await onDeleteReport(id)
      toast.success('Medical report deleted successfully')
    } catch (error) {
      console.error('Error deleting medical report:', error)
      toast.error('Failed to delete medical report')
    }
  }, [onDeleteReport])

  // Initialize from props or fetch data on component mount
  useEffect(() => {
    // If initialReports has data, use it
    if (initialReports && initialReports.length > 0) {
      setReports(initialReports);
      return;
    }
    
    // Otherwise, check if we can extract them from the profile data
    try {
      // Extract medical reports from profile if available
      const medicalInfo = profile?.basicInfo?.medical?.[0];
      if (medicalInfo && medicalInfo.medicalReports && medicalInfo.medicalReports.length > 0) {
        setReports(medicalInfo.medicalReports);
      }
    } catch (error) {
      console.error("Error initializing medical reports:", error);
    }
  }, [initialReports, profile]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md">
        <h4 className="text-md font-medium">{editing ? 'Edit Medical Report' : 'Add New Medical Report'}</h4>
        
        <div className="grid gap-4 md:grid-cols-2">
          <InputWithIcon
            icon={FileText}
            label="Report Type"
            value={formValues.reportType}
            onChange={(e) => handleChange('reportType', e.target.value)}
            placeholder="Enter report type (e.g., Blood Test)"
            required
          />
          
          <div className="grid w-full items-center gap-1.5">
            <label className="text-sm font-medium leading-none">
              Report Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !reportDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {reportDate ? format(reportDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={reportDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <InputWithIcon
            icon={FileText}
            label="Hemoglobin"
            value={formValues.reportDetails.hemoglobin}
            onChange={(e) => handleChange('reportDetails.hemoglobin', e.target.value)}
            placeholder="Enter hemoglobin value"
          />
          
          <InputWithIcon
            icon={FileText}
            label="Blood Sugar"
            value={formValues.reportDetails.bloodSugar}
            onChange={(e) => handleChange('reportDetails.bloodSugar', e.target.value)}
            placeholder="Enter blood sugar value"
          />
        </div>
        
        <InputWithIcon
          icon={FileText}
          label="Doctor ID"
          value={formValues.doctorId}
          onChange={(e) => handleChange('doctorId', e.target.value)}
          placeholder="Enter doctor ID"
        />
        
        <div className="flex justify-end gap-2">
          {editing && (
            <Button 
              type="button" 
              variant="outline"
              onClick={resetForm}
            >
              Cancel
            </Button>
          )}
          
          <Button 
            type="submit" 
            disabled={saving || loading}
          >
            {(saving || loading) && (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-2 h-4 w-4" />
            {editing ? 'Update Report' : 'Add Report'}
          </Button>
        </div>
      </form>
      
      <div className="space-y-4">
        <h4 className="text-md font-medium">Medical Reports</h4>
        
        {reports.length === 0 ? (
          <div className="text-center p-4 border rounded-md text-muted-foreground">
            No medical reports found. Add your first report above.
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => (
              <div key={report.id} className="border p-3 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium">{report.reportType}</p>
                  <p className="text-sm text-muted-foreground">
                    {report.reportDate ? format(new Date(report.reportDate), "PPP") : "No date"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditReport(report)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteReport(report.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 