import { 
  Activity,
  LogIn,
  UserPlus,
  Settings,
  Mail,
  Phone,
  Shield
} from "lucide-react";

// Activity type icons mapping
export const ACTIVITY_ICONS = {
  LOGIN: LogIn,
  REGISTER: UserPlus,
  SETTINGS_UPDATE: Settings,
  EMAIL_VERIFY: Mail,
  PHONE_VERIFY: Phone,
  SECURITY_UPDATE: Shield,
  DEFAULT: Activity
};

// Activity type colors mapping
export const ACTIVITY_COLORS = {
  LOGIN: "text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800",
  LOGOUT: "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800",
  REGISTER: "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800",
  SETTINGS_UPDATE: "text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800",
  EMAIL_VERIFY: "text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800",
  PHONE_VERIFY: "text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800",
  SECURITY_UPDATE: "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800",
  DEFAULT: "text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800"
}; 