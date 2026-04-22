import { io } from 'socket.io-client';

// In production, this would be your server URL. In dev, it's likely localhost:3000
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ['websocket'],
});
