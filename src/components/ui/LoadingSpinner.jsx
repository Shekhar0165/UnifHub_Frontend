// components/ui/LoadingSpinner.jsx
"use client";

import { useTheme } from "next-themes";
import { Loader2, RefreshCw, Hourglass, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cva } from "class-variance-authority";
import { useState, useEffect } from "react";

// Define variants using class-variance-authority
const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      xs: "h-3 w-3",
      small: "h-4 w-4",
      default: "h-8 w-8",
      large: "h-12 w-12",
      xl: "h-16 w-16",
    },
    variant: {
      primary: "text-primary",
      secondary: "text-secondary",
      accent: "text-accent",
      success: "text-green-500 dark:text-green-400",
      warning: "text-amber-500 dark:text-amber-400",
      error: "text-red-500 dark:text-red-400",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "primary",
  },
});

const textVariants = cva("font-medium", {
  variants: {
    size: {
      xs: "text-xs",
      small: "text-xs",
      default: "text-sm",
      large: "text-base",
      xl: "text-lg",
    },
    variant: {
      primary: "text-muted-foreground",
      secondary: "text-secondary-foreground",
      accent: "text-accent-foreground",
      success: "text-green-600 dark:text-green-400",
      warning: "text-amber-600 dark:text-amber-400",
      error: "text-red-600 dark:text-red-400",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "primary",
  },
});

const cardVariants = cva("border", {
  variants: {
    variant: {
      primary: "bg-card",
      secondary: "bg-secondary",
      accent: "bg-accent",
      success: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
      warning: "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
      error: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

const iconMap = {
  spinner: Loader2,
  refresh: RefreshCw,
  hourglass: Hourglass,
  sparkles: Sparkles,
};

const LoadingSpinner = ({
  fullScreen = true,
  text = "Loading...",
  size = "default",
  variant = "primary",
  icon = "spinner",
  pulseEffect = false,
  showProgress = false,
  progress = null,
  loadingDots = false,
  cardClassName = "",
  spinnerClassName = "",
  textClassName = "",
  overlay = true,
  istexthide = true
}) => {
  const { theme } = useTheme();
  const [dots, setDots] = useState("");
  const IconComponent = iconMap[icon] || Loader2;
  
  // Animated loading dots
  useEffect(() => {
    if (!loadingDots) return;
    
    const intervalId = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    
    return () => clearInterval(intervalId);
  }, [loadingDots]);
  
  // Create loading text with dots if enabled
  const loadingText = loadingDots ? `${text}${dots}` : text;

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`relative ${pulseEffect ? "animate-pulse" : ""}`}>
        <IconComponent 
          className={`${spinnerVariants({ size, variant })} ${spinnerClassName}`} 
        />
        
        {/* Show circular progress indicator */}
        {showProgress && typeof progress === 'number' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="absolute inset-0" viewBox="0 0 100 100">
              <circle 
                className="text-muted stroke-current" 
                strokeWidth="8" 
                fill="transparent" 
                r="42" 
                cx="50" 
                cy="50" 
              />
              <circle 
                className={`text-${variant} stroke-current`} 
                strokeWidth="8" 
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * progress) / 100}
                strokeLinecap="round"
                fill="transparent" 
                r="42" 
                cx="50" 
                cy="50" 
              />
            </svg>
            <span className={`absolute text-xs font-bold ${textVariants({ variant })}`}>
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
      
     {istexthide ? loadingText && (
        <p className={`${textVariants({ size, variant })} ${textClassName}`}>
          {loadingText}
        </p>
      ):" "}
    </div>
  );

  // If fullScreen is true, display the spinner in the center of the viewport
  if (fullScreen) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${overlay ? 'bg-background/80 backdrop-blur-sm' : ''} transition-all duration-300`}>
        <Card className={`${cardVariants({ variant })} shadow-lg ${cardClassName}`}>
          <CardContent className={`${size === 'xl' || size === 'large' ? 'p-8' : 'p-6'}`}>
            {spinnerContent}
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not fullScreen, just return the spinner for inline usage
  return spinnerContent;
};

export default LoadingSpinner;