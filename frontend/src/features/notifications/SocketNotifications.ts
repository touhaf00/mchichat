import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { socket } from "../../lib/socket";
import { useNotifications } from "./NotificationProvider";

export function SocketNotifications() {
    const location = useLocation();
    const { user } = useAuth();

    const {
        showToast,
        incrementFriends,
        incrementSalon,
        incrementMessage,
    } = useNotifications();

    useEffect(() => {
        if (!user?.id) return;

        socket.connect();
        socket.emit("join_user", user.id);

        socket.on("friend_request_received", () => {
            incrementFriends();
            showToast("Nouvelle demande d'ami");
        });

        socket.on("salon_invitation_received", () => {
            incrementFriends();
            showToast("Nouvelle invitation salon");
        });

        socket.on("salon_message_notification", (data: { salonId: string }) => {
            const isInsideSalon = location.pathname === `/salons/${data.salonId}`;

            if (!isInsideSalon) {
                incrementSalon(data.salonId);
                showToast("Nouveau message dans un salon");
            }
        });

        socket.on(
            "private_message_notification",
            (data: { conversationId: string }) => {
                const isInsideMessagesPage = location.pathname === "/messages";

                if (!isInsideMessagesPage) {
                    incrementMessage(data.conversationId);
                    showToast("Nouveau message privé");
                } else {
                    incrementMessage(data.conversationId);
                }
            }
        );

        return () => {
            socket.off("friend_request_received");
            socket.off("salon_invitation_received");
            socket.off("salon_message_notification");
            socket.off("private_message_notification");
        };
    }, [
        user?.id,
        location.pathname,
        showToast,
        incrementFriends,
        incrementSalon,
        incrementMessage,
    ]);

    return null;
}
