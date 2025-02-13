import { useState, useCallback } from "react"
import { useSettings } from "@/contexts/settings-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Download,
  Upload,
  FileJson,
  FileArchive,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Lock,
  Key,
  FileText,
  Trash2,
  History,
  Settings2
} from "lucide-react"
import { toast } from "react-hot-toast"

// Data categories for export
const DATA_CATEGORIES = {
  settings: { label: "Settings & Preferences", default: true },
  profile: { label: "Profile Information", default: true },
  medical: { label: "Medical Records", default: true },
  appointments: { label: "Appointments & Events", default: true },
  documents: { label: "Documents & Files", default: true },
  activity: { label: "Activity History", default: false },
  analytics: { label: "Analytics Data", default: false }
}

export default function DataManagementPage() {
  const { user } = useAuth()
  const { updateSettings, getSectionSettings } = useSettings()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [importProgress, setImportProgress] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState(
    Object.entries(DATA_CATEGORIES).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value.default
    }), {})
  )

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    encryptBackup: true,
    endToEndEncryption: true,
    secureBackups: true,
    accessLogs: true,
    dataRetention: 90, // days
    autoDeleteOldBackups: true
  })

  // Export history
  const [exportHistory] = useState([
    { id: 1, date: '2024-03-15', type: 'JSON', size: '2.3 MB', status: 'completed' },
    { id: 2, date: '2024-03-01', type: 'ZIP', size: '1.8 MB', status: 'completed' },
  ])

  const handleExportData = async (format) => {
    setIsExporting(true)
    setExportProgress(0)
    
    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        setExportProgress(i)
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Prepare export data based on selected categories
      const exportData = {
        metadata: {
          timestamp: new Date().toISOString(),
          user: user?.id,
          version: "1.0",
          categories: Object.keys(selectedCategories).filter(key => selectedCategories[key])
        },
        data: Object.entries(selectedCategories)
          .filter(([_, selected]) => selected)
          .reduce((acc, [category]) => ({
            ...acc,
            [category]: {} // Would be actual data in production
          }), {})
      }

      // Encrypt if enabled
      const finalData = securitySettings.encryptBackup 
        ? await encryptData(exportData)
        : exportData

      // Create and download file
      const blob = new Blob([JSON.stringify(finalData, null, 2)], { 
        type: format === 'zip' ? 'application/zip' : 'application/json' 
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pregnify-data-${new Date().toISOString()}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Data exported successfully')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const handleImportData = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportProgress(0)

    try {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          // Simulate progress
          for (let i = 0; i <= 100; i += 20) {
            setImportProgress(i)
            await new Promise(resolve => setTimeout(resolve, 500))
          }

          const data = JSON.parse(e.target.result)
          
          // Validate data structure
          if (!data.metadata?.timestamp || !data.metadata?.version) {
            throw new Error('Invalid backup file format')
          }

          // Decrypt if encrypted
          const importData = data.encrypted 
            ? await decryptData(data)
            : data

          // Validate data categories
          const validCategories = Object.keys(DATA_CATEGORIES)
          const importedCategories = importData.metadata.categories

          if (!importedCategories.every(cat => validCategories.includes(cat))) {
            throw new Error('Invalid data categories in backup file')
          }

          // Update settings with imported data
          await updateSettings('system', {
            importedData: importData.data,
            lastImport: new Date().toISOString()
          })

          toast.success('Data imported successfully')
        } catch (error) {
          console.error('Import failed:', error)
          toast.error(`Failed to import data: ${error.message}`)
        } finally {
          setIsImporting(false)
          setImportProgress(0)
        }
      }

      reader.readAsText(file)
    } catch (error) {
      console.error('Import failed:', error)
      toast.error('Failed to read file')
      setIsImporting(false)
      setImportProgress(0)
    }
  }

  // Mock encryption/decryption functions
  const encryptData = async (data) => {
    // Simulate encryption
    return { ...data, encrypted: true }
  }

  const decryptData = async (data) => {
    // Simulate decryption
    const { encrypted, ...decrypted } = data
    return decrypted
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">Data Management</h3>
        <p className="text-sm text-muted-foreground">
          Export, import, and manage your data securely
        </p>
      </div>
      <Separator />

      <div className="grid gap-6">
        {/* Export Options */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              <CardTitle>Export Data</CardTitle>
            </div>
            <CardDescription>
              Download your data in different formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Data Categories */}
            <div className="rounded-lg border p-4">
              <h4 className="mb-3 font-medium">Select Data to Export</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(DATA_CATEGORIES).map(([key, { label }]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Switch
                      checked={selectedCategories[key]}
                      onCheckedChange={(checked) => 
                        setSelectedCategories(prev => ({...prev, [key]: checked}))
                      }
                    />
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Formats */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <FileJson className="h-8 w-8 text-blue-500" />
                <div>
                  <h4 className="font-medium">JSON Format</h4>
                  <p className="text-sm text-muted-foreground">
                    Export as readable JSON file
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => handleExportData('json')}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <FileArchive className="h-8 w-8 text-orange-500" />
                <div>
                  <h4 className="font-medium">Compressed Archive</h4>
                  <p className="text-sm text-muted-foreground">
                    Export as compressed ZIP file
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => handleExportData('zip')}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </div>

            {/* Export Progress */}
            {isExporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Exporting data...</span>
                  <span>{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import Options */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              <CardTitle>Import Data</CardTitle>
            </div>
            <CardDescription>
              Import data from a backup file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-dashed p-8">
              <div className="flex flex-col items-center justify-center gap-4">
                <Database className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <h4 className="font-medium">Drop file to import</h4>
                  <p className="text-sm text-muted-foreground">
                    or click to select file
                  </p>
                </div>
                <input
                  type="file"
                  accept=".json,.zip"
                  className="hidden"
                  id="import-file"
                  onChange={handleImportData}
                  disabled={isImporting}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('import-file').click()}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Select File
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Import Progress */}
            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing data...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} />
              </div>
            )}

            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Important</p>
                  <p className="text-sm text-muted-foreground">
                    Importing data will override your current settings. Make sure to backup your existing data first.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export History */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <CardTitle>Export History</CardTitle>
            </div>
            <CardDescription>
              Recent data exports and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exportHistory.map((export_) => (
                <div
                  key={export_.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {export_.type} Export
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{export_.date}</span>
                      <span>•</span>
                      <span>{export_.size}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Data Security</CardTitle>
            </div>
            <CardDescription>
              Configure data security and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">End-to-End Encryption</div>
                <div className="text-sm text-muted-foreground">
                  Encrypt all data transfers
                </div>
              </div>
              <Switch
                checked={securitySettings.endToEndEncryption}
                onCheckedChange={(checked) => 
                  setSecuritySettings(prev => ({...prev, endToEndEncryption: checked}))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Secure Backups</div>
                <div className="text-sm text-muted-foreground">
                  Enable backup encryption
                </div>
              </div>
              <Switch
                checked={securitySettings.secureBackups}
                onCheckedChange={(checked) => 
                  setSecuritySettings(prev => ({...prev, secureBackups: checked}))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Access Logs</div>
                <div className="text-sm text-muted-foreground">
                  Track data access and changes
                </div>
              </div>
              <Switch
                checked={securitySettings.accessLogs}
                onCheckedChange={(checked) => 
                  setSecuritySettings(prev => ({...prev, accessLogs: checked}))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Auto-Delete Old Backups</div>
                <div className="text-sm text-muted-foreground">
                  Automatically remove backups older than {securitySettings.dataRetention} days
                </div>
              </div>
              <Switch
                checked={securitySettings.autoDeleteOldBackups}
                onCheckedChange={(checked) => 
                  setSecuritySettings(prev => ({...prev, autoDeleteOldBackups: checked}))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 