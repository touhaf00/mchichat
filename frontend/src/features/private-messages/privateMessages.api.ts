import { api } from "../../lib/api";

export type PrivateUser = {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email?: string;
    avatarUrl?: string | null;
};

export type PrivateMessage = {
    id: string;
    content?: string | null;
    gifUrl?: string | null;
    attachmentUrl?: string | null;
    attachmentType?: string | null;
    attachmentName?: string | null;
    attachmentSize?: number | null;
    conversationId: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    author?: PrivateUser;
};

export type PrivateConversationParticipant = {
    id: string;
    conversationId: string;
    userId: string;
    user: PrivateUser;
};

export type PrivateConversation = {
    id: string;
    createdAt: string;
    updatedAt: string;
    participants: PrivateConversationParticipant[];
    messages: PrivateMessage[];
};

export type SendPrivateMessagePayload = {
    content?: string;
    gifUrl?: string;
    attachment?: File | Blob | null;
    attachmentName?: string;
};

export async function getPrivateConversationsRequest() {
    const response = await api.get<{ conversations: PrivateConversation[] }>(
        "/private-conversations"
    );

    return response.data;
}

export async function createPrivateConversationRequest(friendId: string) {
    const response = await api.post<{
        message: string;
        conversation: PrivateConversation;
    }>("/private-conversations", {
        friendId,
    });

    return response.data;
}

export async function getPrivateMessagesRequest(conversationId: string) {
    const response = await api.get<{ messages: PrivateMessage[] }>(
        `/private-conversations/${conversationId}/messages`
    );

    return response.data;
}

export async function sendPrivateMessageRequest(
    conversationId: string,
    payload: SendPrivateMessagePayload
) {
    const formData = new FormData();

    if (payload.content?.trim()) {
        formData.append("content", payload.content.trim());
    }

    if (payload.gifUrl) {
        formData.append("gifUrl", payload.gifUrl);
    }

    if (payload.attachment) {
        formData.append(
            "attachment",
            payload.attachment,
            payload.attachmentName || "message-file"
        );
    }

    const response = await api.post<{ message: PrivateMessage }>(
        `/private-conversations/${conversationId}/messages`,
        formData
    );

    return response.data;
}

export const createPrivateMessageRequest = sendPrivateMessageRequest;

export async function deletePrivateMessageRequest(messageId: string) {
    const response = await api.delete<{ message: string }>(
        `/private-messages/${messageId}`
    );

    return response.data;
}