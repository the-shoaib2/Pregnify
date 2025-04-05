import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function InputWithIcon({ icon: Icon, label, ...props }) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </Label>
      <Input {...props} />
    </div>
  )
} 