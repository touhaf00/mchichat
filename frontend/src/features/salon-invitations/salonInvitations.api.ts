import { api } from "../../lib/api";

export type SalonInvitation = {
    id: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    salon: {
        id: string;
        name: string;
        description?: string | null;
        visibility: "PUBLIC" | "PRIVATE";
    };
    sender: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
    };
};

export async function inviteToSalonRequest(
    salonId: string,
    receiverId: string
) {
    const response = await api.post(`/salons/${salonId}/invite`, {
        receiverId,
    });

    return response.data;
}

export async function getSalonInvitationsRequest() {
    const response = await api.get<{ invitations: SalonInvitation[] }>(
        "/salon-invitations"
    );

    return response.data;
}

export async function acceptSalonInvitationRequest(invitationId: string) {
    const response = await api.post(
        `/salon-invitations/${invitationId}/accept`
    );

    return response.data;
}

export async function rejectSalonInvitationRequest(invitationId: string) {
    const response = await api.post(
        `/salon-invitations/${invitationId}/reject`
    );

    return response.data;
}