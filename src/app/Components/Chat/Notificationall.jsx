import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  X, 
  MessageSquare, 
  Award, 
  Heart, 
  UserPlus, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Info,
  Star,
  Gift,
  Users,
  Zap,
  Share2,
  User,
  XCircle,
  PartyPopper,
  BellRing
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const Notificationall = ({ data, onDismiss }) => {
  const { toast } = useToast();
  const router = useRouter();

  // Your custom icon mapping function
  const getIconComponent = (iconName) => {
    const iconMap = {
      'Heart': Heart,
      'MessageSquare': MessageSquare,
      'Share2': Share2,
      'AlertCircle': AlertCircle,
      'CheckCircle2': CheckCircle2,
      'Info': Info,
      'User': User,
      'UserPlus': UserPlus,
      'CheckCircle': CheckCircle2,
      'XCircle': XCircle,
      'PartyPopper': PartyPopper,
      'BellRing': BellRing,
      'Bell': Bell,
    };
    return iconMap[iconName] || Bell;
  };

  // Your custom color mapping function
  const getNotificationColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'like': return 'text-red-500';
      case 'comment': return 'text-blue-500';
      case 'share': return 'text-green-500';
      case 'follow': return 'text-purple-500';
      case 'system': return 'text-purple-500';
      case 'warning': return 'text-orange-500';
      case 'alert': return 'text-red-600';
      case 'error': return 'text-red-600';
      case 'info': return 'text-cyan-500';
      case 'join': return 'text-green-500';
      case 'confirm': return 'text-teal-500';
      case 'success': return 'text-emerald-500';
      case 'reject': return 'text-rose-500';
      case 'canceled': return 'text-yellow-600';
      case 'congratulation': return 'text-amber-500';
      case 'update': return 'text-indigo-500';
      default: return 'text-gray-500';
    }
  };

  // Get appropriate background based on text color
  const getBackgroundColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'like': return 'bg-red-50 border-red-200';
      case 'comment': return 'bg-blue-50 border-blue-200';
      case 'share': return 'bg-green-50 border-green-200';
      case 'follow': return 'bg-purple-50 border-purple-200';
      case 'system': return 'bg-purple-50 border-purple-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'alert': return 'bg-red-50 border-red-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'info': return 'bg-cyan-50 border-cyan-200';
      case 'join': return 'bg-green-50 border-green-200';
      case 'confirm': return 'bg-teal-50 border-teal-200';
      case 'success': return 'bg-emerald-50 border-emerald-200';
      case 'reject': return 'bg-rose-50 border-rose-200';
      case 'canceled': return 'bg-yellow-50 border-yellow-200';
      case 'congratulation': return 'bg-amber-50 border-amber-200';
      case 'update': return 'bg-indigo-50 border-indigo-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  // Play notification sound based on type
  const playNotificationSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different sounds for different notification types
      let frequencies = [800, 600]; // default
      
      switch (type?.toLowerCase()) {
        case 'like':
        case 'heart':
          frequencies = [659, 784];
          break;
        case 'congratulation':
        case 'success':
          frequencies = [523, 659, 784]; // C, E, G chord
          break;
        case 'comment':
        case 'share':
          frequencies = [800, 600];
          break;
        case 'follow':
        case 'join':
          frequencies = [659, 784];
          break;
        case 'error':
        case 'alert':
          frequencies = [400, 300];
          break;
        case 'warning':
          frequencies = [500, 400];
          break;
        default:
          frequencies = [800, 600];
      }
      
      frequencies.forEach((freq, index) => {
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + (index * 0.1));
      });
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.log("Could not play notification sound:", error);
    }
  };


  const formatTime = (time) => {
    if (!time) return 'now';
    
    const now = new Date();
    const notificationTime = new Date(time);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);
    
    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const showNotification = () => {
    // Play sound based on notification type
    playNotificationSound(data.type);
    
    // For message notifications - use your exact UI
    if (data.type === 'message' && data.from) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <img
              src={data.from.profileImage}
              alt={data.from.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="font-semibold">{data.from.name}</span>
              <span className="text-sm text-muted-foreground max-w-[200px] truncate">
                {data.message}
              </span>
            </div>
          </div>
        ),
        duration: 3000,
        action: (
          <button
            onClick={() => {
              // Store the notification message data for the chatbox
              window.pendingMessage = {
                id: data.id || Date.now(),
                content: data.message,
                timestamp: data.timestamp || new Date().toISOString(),
                sender: data.from._id,
                from: data.from,
                type: 'received',
                isFromNotification: true
              };
              
              router.push(`/messages?tab=${data.from.userid}`);
              
              // Dismiss the notification
              if (onDismiss) onDismiss();
            }}
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring"
          >
            View
          </button>
        ),
      });
    } else {
      // For other notification types - use icon/avatar based UI
      const IconComponent = data.icon ? getIconComponent(data.icon) : getIconComponent('Bell');
      const textColor = getNotificationColor(data.type);
      
      toast({
        title: (
          <div className="flex items-center gap-2">
            {/* Icon or Avatar */}
            {data.avatar ? (
              <div className="w-8 h-8 flex items-center justify-center text-lg">
                {data.avatar}
              </div>
            ) : data.from?.profileImage ? (
              <img
                src={data.from.profileImage}
                alt={data.from.name || 'User'}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 ${textColor}`}>
                <IconComponent className="w-4 h-4" />
              </div>
            )}
            
            {/* Content */}
            <div className="flex flex-col">
              {data.title && (
                <span className="font-semibold">{data.title}</span>
              )}
              <span className="text-sm text-muted-foreground max-w-[200px] truncate">
                {data.message}
              </span>
              {data.from && !data.from.profileImage && (
                <span className="text-xs text-muted-foreground">
                  from {data.from.name || data.from.username}
                </span>
              )}
            </div>
          </div>
        ),
        duration: 3000,
        action: data.link ? (
          <button
            onClick={() => router.push(data.link)}
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring"
          >
            View
          </button>
        ) : null,
      });
    }

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 3000);
  };

  // Trigger notification when data is provided
  useEffect(() => {
    if (data) {
      showNotification();
    }
  }, [data]);

  return null; // This component doesn't render anything visible
};

export default Notificationall;