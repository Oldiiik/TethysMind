import { Progress } from './ui/progress';

interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  color?: 'default' | 'success' | 'warning' | 'danger';
}

export function ProgressBar({ 
  value, 
  label, 
  showPercentage = true, 
  className = '',
  color = 'default'
}: ProgressBarProps) {
  const getColorClass = () => {
    switch (color) {
      case 'success':
        return '[&>div]:bg-green-500';
      case 'warning':
        return '[&>div]:bg-yellow-500';
      case 'danger':
        return '[&>div]:bg-red-500';
      default:
        return '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm text-muted-foreground">{label}</span>}
          {showPercentage && <span className="text-sm">{value}%</span>}
        </div>
      )}
      <Progress value={value} className={getColorClass()} />
    </div>
  );
}
