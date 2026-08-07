import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email(),
});

export type LoginFormSchema = typeof loginFormSchema;

export const createGiftFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().optional(),
  position: z.number().int().default(0),
});

export type CreateGiftFormSchema = typeof createGiftFormSchema;

export const createWishlistFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type CreateWishlistFormSchema = typeof createWishlistFormSchema;

export const shareWishlistFormSchema = z.object({
  email: z.string().email(),
});

export type ShareWishlistFormSchema = typeof shareWishlistFormSchema;

