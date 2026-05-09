import { z } from "zod";

export const inviteToSalonSchema = z.object({receiverId: z.string().trim().min(1, "Receiver id requis"),});