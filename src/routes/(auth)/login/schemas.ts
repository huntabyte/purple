import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address." }),
	password: z.string().min(1, "Please enter a password."),
});
