import { api } from "../../lib/api";

export type SalonMessageAuthor = {
    id: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string | null;
};

export type SalonMessage = {
    id: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    authorId: string;
    salonId: string;
    attachmentUrl?: string | null;
    attachmentType?: string | null;
    attachmentName?: string | null;
    attachmentSize?: number | null;
    author?: SalonMessageAuthor;
};

export async function getMessages(salonId: string) {
    const res = await api.get<{ messages: SalonMessage[] }>(
        `/messages/salon/${salonId}`
    );

    return res.data;
}

export async function sendMessage(payload: {
    content?: string;
    salonId: string;
    attachment?: File | Blob | null;
    attachmentName?: string;
}) {
    const formData = new FormData();

    formData.append("salonId", payload.salonId);

    if (payload.content?.trim()) {
        formData.append("content", payload.content.trim());
    }

    if (payload.attachment) {
        formData.append(
            "attachment",
            payload.attachment,
            payload.attachmentName || "message-file"
        );
    }

    const res = await api.post<{ message: SalonMessage }>(
        "/messages",
        formData
    );

    return res.data;
}

export async function deleteMessageRequest(messageId: string) {
    const response = await api.delete<{ message: string }>(
        `/messages/${messageId}`
    );

    return response.data;
}

export async function updateMessageRequest(
    messageId: string,
    content: string
) {
    const response = await api.patch<{
        message: string;
        updatedMessage: SalonMessage;
    }>(`/messages/${messageId}`, {
        content,
    });

    return response.data;
}