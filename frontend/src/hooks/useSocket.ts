import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function useSocket<T>(event: string, callback: (data: T) => void) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const socket = getSocket();

    const handler = (data: T) => {
      savedCallback.current(data);
    };

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [event]);
}

export function useSocketConnection() {
  const socket = getSocket();

  const isConnected = useCallback(() => {
    return socket.connected;
  }, [socket]);

  return { socket, isConnected };
}
