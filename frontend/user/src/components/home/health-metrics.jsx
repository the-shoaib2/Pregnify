import { motion } from 'framer-motion';
import { HeartPulse, Thermometer, Scale, Droplet, TrendingUp, TrendingDown, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const HealthMetric = ({ icon: Icon, label, value, unit, trend, trendValue }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-accent transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-full bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold">{value}<span className="text-sm text-muted-foreground ml-1">{unit}</span></p>
      </div>
    </div>
    {trend && (
      <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
        {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span className="text-sm font-medium">{trendValue}</span>
      </div>
    )}
  </motion.div>
);

const HealthMetrics = () => {
  const metrics = [
    {
      icon: HeartPulse,
      label: 'Heart Rate',
      value: 75,
      unit: 'bpm',
      trend: 'down',
      trendValue: '2%'
    },
    {
      icon: Thermometer,
      label: 'Temperature',
      value: 36.8,
      unit: '°C',
      trend: 'up',
      trendValue: '0.2°'
    },
    {
      icon: Scale,
      label: 'Weight',
      value: 65,
      unit: 'kg',
      trend: 'down',
      trendValue: '0.5kg'
    },
    {
      icon: Droplet,
      label: 'Water Intake',
      value: 1.8,
      unit: 'L',
      trend: 'up',
      trendValue: '0.2L'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Health Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => (
          <HealthMetric key={index} {...metric} />
        ))}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Daily Progress</span>
            <span className="font-medium">75%</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthMetrics; 