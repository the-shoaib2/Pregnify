import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  HeartPulse, 
  HandHeart, 
  Brain, 
  Stethoscope, 
  MessageCircle, 
  Ambulance 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const QuickActionCard = ({ icon: Icon, title, description, href, color }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Link to={href}>
      <Card className="transition-all duration-300 hover:shadow-md cursor-pointer">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Link>
  </motion.div>
);

const QuickActions = () => {
  const actions = [
    {
      title: "Health Dashboard",
      description: "Monitor your health metrics",
      icon: HeartPulse,
      href: "/health",
      color: "bg-blue-500"
    },
    {
      title: "Care Plan",
      description: "View your care schedule",
      icon: HandHeart,
      href: "/care",
      color: "bg-green-500"
    },
    {
      title: "AI Assistant",
      description: "Get personalized advice",
      icon: Brain,
      href: "/ai-assistant",
      color: "bg-purple-500"
    },
    {
      title: "Doctors",
      description: "Connect with healthcare providers",
      icon: Stethoscope,
      href: "/doctors",
      color: "bg-indigo-500"
    },
    {
      title: "Messages",
      description: "Chat with your care team",
      icon: MessageCircle,
      href: "/messages",
      color: "bg-pink-500"
    },
    {
      title: "Emergency",
      description: "Quick access to emergency services",
      icon: Ambulance,
      href: "/emergency",
      color: "bg-red-500"
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Access important features quickly</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <QuickActionCard key={index} {...action} />
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickActions; 