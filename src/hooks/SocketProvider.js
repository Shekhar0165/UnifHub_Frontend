// SocketProvider.jsx
'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Toaster } from '@/components/ui/toaster';
import Notification from '@/app/Components/Chat/Notification';
import Notificationall from '@/app/Components/Chat/Notificationall';

export default function SocketProvider() {
  const [userid, setUserid] = useState('');
  const [notificationData, setNotificationData] = useState(null);
  const [notificationall, setNotificationall] = useState(null);

  useEffect(() => {
    const HandleGetUserId = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/socket/io`, {
          headers: {
            'Content-Type': "application/json"
          },
          withCredentials: true
        });
        setUserid(res.data.id);
      } catch (error) {
        console.error("Error getting user ID:", error);
      }
    };
    HandleGetUserId();
  }, []);

  useEffect(() => {
    if (!userid) return;

    const socket = io(process.env.NEXT_PUBLIC_API);
    window.socket = socket;


    socket.on('connect', () => {
      socket.emit('user-connected', userid);
    });

    // socket.on('user-status', (data) => {
    //   console.log("👤 User status:", data);
    // });

    // Call notification component when message received
    socket.on('messageNotification', (data) => {

      // Set notification data to trigger the Notification component
      setNotificationData({
        ...data,
        timestamp: new Date().toISOString(),
        id: data.id || Date.now()
      });

      // Clear notification data after a brief moment to allow for re-triggering
      setTimeout(() => {
        setNotificationData(null);
      }, 100);
    });

    // socket.on('disconnect', () => {
    //   console.log("❌ Socket disconnected");
    // });

    socket.on('reconnect', () => {
      socket.emit('user-connected', userid);
    });

    const handleBeforeUnload = () => {
      socket.emit('user-disconnect', userid);
      socket.disconnect();
    };

    const handleNotification = (data) => {
    console.log("sattart")
    setNotificationall({
      ...data,
    });

    setTimeout(() => {
      setNotificationall(null);
    }, 100);
  };

  window.socket.off("Notification");
  window.socket.on("Notification", handleNotification);

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      handleBeforeUnload();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.socket.off("Notification");
      delete window.socket;
    };
  }, [userid]);


  return (
    <>
      {/* Render notification component when data is available */}
      {notificationData && (
        <Notification
          data={notificationData}
          onDismiss={() => setNotificationData(null)}
        />
      )}


      {notificationall && (
        <Notificationall data={notificationall} onDismiss={() => setNotificationall(null)} />
      )}

      <Toaster />
    </>
  );
}