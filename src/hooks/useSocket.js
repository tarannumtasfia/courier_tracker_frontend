// src/hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useSocket(onPackageUpdate) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io('https://courier-tracker-backend-x3hy.onrender.com'); // Adjust the URL if needed
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('package_updated', (data) => {
      console.log('📦 Package updated via socket:', data);
      if (onPackageUpdate) {
        onPackageUpdate(data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [onPackageUpdate]);
}
