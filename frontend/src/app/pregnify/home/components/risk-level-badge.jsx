import { SYSTEM_ENUMS } from "@/services/pregnify"

export const RiskLevelBadge = ({ level }) => {
  const getBadgeVariant = (level) => {
    switch (level) {
      case SYSTEM_ENUMS.RISK_LEVEL.LOW:
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case SYSTEM_ENUMS.RISK_LEVEL.MEDIUM:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case SYSTEM_ENUMS.RISK_LEVEL.HIGH:
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case SYSTEM_ENUMS.RISK_LEVEL.CRITICAL:
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeVariant(level)}`}>
      {level}
    </div>
  )
} 