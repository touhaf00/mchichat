import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

let io: Server;

export function initSocket(server: HttpServer) {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("Socket connecté :", socket.id);

        socket.on("join_user", (userId: string) => {
            socket.join(`user:${userId}`);
        });

        socket.on("join_salon", (salonId: string) => {
            socket.join(`salon:${salonId}`);
        });

        socket.on("leave_salon", (salonId: string) => {
            socket.leave(`salon:${salonId}`);
        });

        socket.on("join_private_conversation", (conversationId: string) => {
            socket.join(`private:${conversationId}`);
        });

        socket.on("leave_private_conversation", (conversationId: string) => {
            socket.leave(`private:${conversationId}`);
        });

        socket.on("disconnect", () => {
            console.log("Socket déconnecté :", socket.id);
        });
    });

    return io;
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.IO non initialisé");
    }

    return io;
}