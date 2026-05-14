import { api } from "../../lib/api";

export type SalonOwner = {
    id: string;
    username: string;
    email: string;
};

export type Salon = {
    id: string;
    name: string;
    description?: string | null;
    visibility: "PUBLIC" | "PRIVATE";
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    owner?: SalonOwner;
    members?: SalonMember[];
};

export type MessageAuthor = {
    id: string;
    username: string;
    email: string;
};

export type SalonMessage = {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    authorId: string;
    salonId: string;
    author?: MessageAuthor;
};

export type SalonMember = {
    id: string;
    userId: string;
    salonId: string;
    joinedAt: string;
    user?: {
        id: string;
        username: string;
        email: string;
    };
};

export type SalonDetails = Salon & {
    members?: SalonMember[];
    messages?: SalonMessage[];
};

export type CreateSalonPayload = {
    name: string;
    description?: string;
    visibility: "PUBLIC" | "PRIVATE";
};

export type UpdateSalonPayload = {
    name?: string;
    description?: string;
    visibility?: "PUBLIC" | "PRIVATE";
};

export type SalonMembershipRequest = {
    id: string;
    salonId: string;
    requesterId: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    createdAt: string;
    updatedAt: string;
    salon: Salon;
    requester: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
    };
};

export async function getSalonsRequest() {
    const response = await api.get<{ salons: Salon[] }>("/salons");
    return response.data;
}

export async function getSalonByIdRequest(id: string) {
    const response = await api.get<{ salon: SalonDetails }>(`/salons/${id}`);
    return response.data;
}

export async function createSalonRequest(payload: CreateSalonPayload) {
    const response = await api.post<{ message: string; salon: Salon }>("/salons", payload);
    return response.data;
}

export async function updateSalonRequest(id: string, payload: UpdateSalonPayload) {
    const response = await api.put<{ message: string; salon: Salon }>(`/salons/${id}`, payload);
    return response.data;
}

export async function deleteSalonRequest(id: string) {
    const response = await api.delete<{ message: string }>(`/salons/${id}`);
    return response.data;
}

export async function requestSalonMembershipRequest(salonId: string) {
    const response = await api.post<{
        message: string;
        request: SalonMembershipRequest;
    }>(`/salons/${salonId}/membership-requests`);

    return response.data;
}

export async function getSalonMembershipRequestsRequest() {
    const response = await api.get<{
        requests: SalonMembershipRequest[];
    }>("/salons/membership-requests");

    return response.data;
}

export async function acceptSalonMembershipRequestRequest(requestId: string) {
    const response = await api.post<{
        message: string;
        request: SalonMembershipRequest;
    }>(`/salons/membership-requests/${requestId}/accept`);

    return response.data;
}

export async function rejectSalonMembershipRequestRequest(requestId: string) {
    const response = await api.post<{
        message: string;
        request: SalonMembershipRequest;
    }>(`/salons/membership-requests/${requestId}/reject`);

    return response.data;
}