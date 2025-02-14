import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email(),
});

export type LoginFormSchema = typeof loginFormSchema;

export const createGiftFormSchema = z.object({
  name: z.string(),
  link: z.string().url(),
  description: z.string(),
});

export type CreateGiftFormSchema = typeof createGiftFormSchema;
