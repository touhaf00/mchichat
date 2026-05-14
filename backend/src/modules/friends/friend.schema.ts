import { z } from "zod";

export const searchUserSchema = z.object({username: z.string().trim().min(1,"Username requis"),});
export const sendFriendRequestSchema = z.object({receiverId: z.string().trim().min(1,"Receiver id requis"),});
export const updateFriendRequestSchema = z.object({status: z.enum(["ACCEPTED","REJECTED"]),});

export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;
export type UpdateFriendRequestInput = z.infer<typeof updateFriendRequestSchema>;