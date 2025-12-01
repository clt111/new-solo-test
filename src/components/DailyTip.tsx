import React, { useState } from 'react';
import { cn } from '@/utils';
import { Lightbulb, RefreshCw, X } from 'lucide-react';
import { dailyTipService } from '@/services/daily';

interface DailyTipProps {
  tip: string;
  className?: string;
}

export const DailyTip: React.FC<DailyTipProps> = ({ tip, className }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentTip, setCurrentTip] = useState(tip);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // 添加一个小延迟让动画更自然
    setTimeout(() => {
      setCurrentTip(dailyTipService.getRandomTip());
      setIsRefreshing(false);
    }, 300);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn(
      "bg-gradient-to-r from-yellow-50 to-orange-50",
      "dark:from-yellow-900/20 dark:to-orange-900/20",
      "border border-yellow-200 dark:border-yellow-800",
      "rounded-xl p-4",
      "relative overflow-hidden",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-200/20 dark:bg-yellow-800/20 rounded-full -translate-y-10 translate-x-10" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-200/20 dark:bg-orange-800/20 rounded-full translate-y-8 -translate-x-8" />
      
      <div className="relative z-10">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className={cn(
              "w-8 h-8 rounded-full",
              "bg-yellow-100 dark:bg-yellow-800/30",
              "flex items-center justify-center"
            )}>
              <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                每日小贴士
              </h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={cn(
                    "p-1 rounded-lg text-yellow-600 dark:text-yellow-400",
                    "hover:bg-yellow-100 dark:hover:bg-yellow-800/30",
                    "transition-colors duration-200",
                    isRefreshing && "animate-spin"
                  )}
                  title="换一条提示"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
                <button
                  onClick={handleClose}
                  className={cn(
                    "p-1 rounded-lg text-yellow-600 dark:text-yellow-400",
                    "hover:bg-yellow-100 dark:hover:bg-yellow-800/30",
                    "transition-colors duration-200"
                  )}
                  title="关闭"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
              {currentTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SimpleTipProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export const SimpleTip: React.FC<SimpleTipProps> = ({ 
  message, 
  type = 'info', 
  className 
}) => {
  const colors = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200',
      icon: 'text-green-600 dark:text-green-400',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: 'text-yellow-600 dark:text-yellow-400',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: 'text-red-600 dark:text-red-400',
    },
  };

  const color = colors[type];

  return (
    <div className={cn(
      color.bg,
      color.border,
      'border rounded-lg p-3',
      className
    )}>
      <div className="flex items-start gap-3">
        <Lightbulb className={cn('h-4 w-4 mt-0.5 flex-shrink-0', color.icon)} />
        <p className={cn('text-sm leading-relaxed', color.text)}>
          {message}
        </p>
      </div>
    </div>
  );
};