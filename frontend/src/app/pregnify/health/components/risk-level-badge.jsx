import { Badge } from "@/components/ui/badge"

export const RiskLevelBadge = ({ level }) => {
  const getBadgeVariant = (level) => {
    switch (level) {
      case 'LOW':
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case 'MEDIUM':
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case 'HIGH':
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  return (
    <Badge variant="outline" className={`${getBadgeVariant(level)} text-xs`}>
      {level}
    </Badge>
  )
} 