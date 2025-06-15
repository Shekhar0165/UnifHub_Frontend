import React, { useEffect, useState } from 'react';
import { Bell, X, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const Notification = ({ data, onDismiss }) => {
  const { toast } = useToast();
  const router = useRouter();

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log("Could not play notification sound:", error);
    }
  };

  const showNotification = () => {
    // Play sound
    playNotificationSound();
    
    // Show toast
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
      duration: 4000,
      action: (
        <button
          onClick={() => {
            // Store the notification message data for the chatbox
            sessionStorage.setItem('pendingMessage', JSON.stringify({
              id: data.id || Date.now(),
              content: data.message,
              timestamp: data.timestamp || new Date().toISOString(),
              sender: data.from._id,
              from: data.from,
              type: 'received',
              isFromNotification: true
            }));
            
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
  };

  // Trigger notification when component mounts or data changes
  useEffect(() => {
    if (data) {
      showNotification();
    }
  }, [data]);

  return null; // This component doesn't render anything visible
};

export default Notification;