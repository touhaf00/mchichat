import { api } from "../../lib/api";

export type PrivateUser = {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email?: string;
};

export type PrivateMessage = {
    id: string;
    content: string;
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
    content: string
) {
    const response = await api.post<{ message: PrivateMessage }>(
        `/private-conversations/${conversationId}/messages`,
        {
            content,
        }
    );

    return response.data;
}

export async function deletePrivateMessageRequest(messageId: string) {
    const response = await api.delete<{ message: string }>(
        `/private-messages/${messageId}`
    );

    return response.data;
}