import { api } from "../../lib/api";

export type FriendUser = {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt?: string;
};

export type FriendRequest = {
    id: string;
    senderId: string;
    receiverId: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    createdAt: string;
    updatedAt: string;
    sender?: FriendUser;
    receiver?: FriendUser;
};

export async function searchUsersRequest(username: string) {
    const response = await api.get<{ users: FriendUser[] }>("/friends/search", {
        params: { username },
    });

    return response.data;
}

export async function sendFriendRequestRequest(receiverId: string) {
    const response = await api.post<{
        message: string;
        friendRequest: FriendRequest;
    }>("/friends/requests", {
        receiverId,
    });

    return response.data;
}

export async function getReceivedFriendRequestsRequest() {
    const response = await api.get<{ requests: FriendRequest[] }>(
        "/friends/requests/received"
    );

    return response.data;
}

export async function getSentFriendRequestsRequest() {
    const response = await api.get<{ requests: FriendRequest[] }>(
        "/friends/requests/sent"
    );

    return response.data;
}

export async function respondToFriendRequestRequest(
    requestId: string,
    status: "ACCEPTED" | "REJECTED"
) {
    const response = await api.patch<{
        message: string;
        friendRequest: FriendRequest;
    }>(`/friends/requests/${requestId}`, {
        status,
    });

    return response.data;
}

export async function getFriendsRequest() {
    const response = await api.get<{ friends: FriendUser[] }>("/friends");

    return response.data;
}