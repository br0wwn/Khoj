import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (!user || !user.id) {
            // Disconnect socket if user logs out or user.id is not available
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        // Capture userId to avoid stale closure
        const userId = user.id;

        // Create socket connection
        const socketUrl = process.env.REACT_APP_SOCKET_URL;
        if (!socketUrl) {
          console.error('REACT_APP_SOCKET_URL is not configured');
          return;
        }
        const newSocket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            if (process.env.NODE_ENV !== 'production') {
                console.log('Socket connected:', newSocket.id);
                console.log('Registering user ID:', userId);
            }
            setConnected(true);
            // Register user with their ID
            if (userId) {
                newSocket.emit('register', userId);
            } else if (process.env.NODE_ENV !== 'production') {
                console.error('Cannot register: userId is null or undefined');
            }
        });

        newSocket.on('disconnect', () => {
            if (process.env.NODE_ENV !== 'production') {
                console.log('Socket disconnected');
            }
            setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Socket connection error:', error);
            }
            setConnected(false);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            newSocket.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const value = {
        socket,
        connected
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
