import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { env } from "../config/env";

let io: Server;

export function initSocket(server: HttpServer) {
    const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) =>
        origin.trim()
    );

    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log(`Socket connecté : ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`Socket déconnecté : ${socket.id}`);
        });
    });

    return io;
}

export function getIo() {
    if (!io) {
        throw new Error("Socket.IO non initialisé");
    }

    return io;
}