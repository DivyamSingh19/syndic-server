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


export const newPin = z.object({
  pin:z.string().length(6,"Pin must be exactly 6 digits").regex(/^\d{6}$/, "PIN must contain only numbers").transform(val => parseInt(val,10))
})


export const setupProfileSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in international format (e.g., +1234567890)")
    .max(20, "Phone number is too long"),
  
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country name is too long")
    .trim(),
  
  address: z
    .string()
    .min(1, "Address is required")
    .max(500, "Address is too long")
    .trim(),
  
  platformPin: z
    .string()
    .regex(/^\d{4,6}$/, "Platform PIN must be 4-6 digits")
});