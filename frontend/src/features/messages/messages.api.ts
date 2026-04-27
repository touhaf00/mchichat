import { api } from "../../lib/api";

export async function getMessages(salonId: string) {
    const res = await api.get(`/messages/salon/${salonId}`);
    return res.data;
}

export async function sendMessage(payload: {
    content: string;
    salonId: string;
}) {
    const res = await api.post("/messages", payload);
    return res.data;
}