import z from "zod";

export const firstNameSchema = z
  .string()
  .trim()
  .min(2, "Too short")
  .max(30, "Too long");

export const lastNameSchema = z
  .string()
  .trim()
  .min(2, "Too short")
  .max(30, "Too long");

export const emailSchema = z
  .string()
  .email({ message: "Please enter a valid email" });

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must contain atleast 8 characters" });

export const newUser = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const userSchema = z.object({
  id: z.string().uuid(),
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  password: z.string(),
  isVerified: z.boolean().default(false),
  refreshToken: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
