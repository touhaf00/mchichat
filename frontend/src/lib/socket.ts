import { io } from "socket.io-client";
import { env } from "./env";
import { getSessionAccessToken } from "./storage";

export const socket = io(env.socketUrl, {
    autoConnect: false,
    transports: ["websocket", "polling"],
    auth: {
        token: getSessionAccessToken(),
    },
});

export function reconnectSocketWithToken() {
    socket.auth = {
        token: getSessionAccessToken(),
    };

    if (!socket.connected) {
        socket.connect();
    }
}
