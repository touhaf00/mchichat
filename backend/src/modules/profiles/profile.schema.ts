import { z } from "zod";

export const updateProfileSchema = z.object({
    firstName: z.string().trim().min(2).max(50).optional(),
    lastName: z.string().trim().min(2).max(50).optional(),
    username: z.string().trim().min(3).max(30).optional(),
    bio: z.string().trim().max(500).optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;