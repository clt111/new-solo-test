import React from 'react';
import { cn } from '@/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-amber-50 to-orange-50",
      "dark:from-gray-900 dark:to-gray-800",
      "transition-colors duration-300",
      className
    )}>
      <div className={cn(
        "mx-auto max-w-7xl",
        "px-4 sm:px-6 lg:px-8",
        "py-4 sm:py-6 lg:py-8"
      )}>
        {children}
      </div>
    </div>
  );
};

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "mx-auto",
      "max-w-2xl lg:max-w-4xl xl:max-w-6xl",
      className
    )}>
      {children}
    </div>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      className={cn(
        "bg-white dark:bg-gray-800",
        "rounded-xl shadow-sm border border-gray-200 dark:border-gray-700",
        "p-4 sm:p-6",
        "transition-all duration-200",
        "hover:shadow-md hover:scale-[1.01]",
        "dark:hover:shadow-gray-700/50",
        onClick && "cursor-pointer text-left w-full",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions, className }) => {
  return (
    <div className={cn("mb-6 sm:mb-8", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-gray-300",
        "border-t-blue-600 dark:border-t-blue-400",
        sizeClasses[size]
      )} />
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}) => {
  return (
    <div className={cn(
      "text-center py-12 px-4",
      "bg-white dark:bg-gray-800 rounded-xl",
      "border-2 border-dashed border-gray-300 dark:border-gray-600",
      className
    )}>
      {icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
};