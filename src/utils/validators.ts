import { z } from "zod";

export const updateUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type updateUserType = z.infer<typeof updateUserSchema>;
