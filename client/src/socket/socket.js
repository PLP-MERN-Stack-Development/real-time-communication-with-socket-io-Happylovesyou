import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // Make sure it matches your server port
export const socket = io(SOCKET_URL, {
  autoConnect: false, // Connect manually
});
