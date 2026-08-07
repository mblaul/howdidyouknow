import { createWishlistFormSchema } from "$lib/components/forms/form.schema";
import { db } from "$lib/db";
import { wishlistsTable } from "$lib/db/schema";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return {
    form: await superValidate(zod(createWishlistFormSchema)),
  };
};

export const actions = {
  default: async (event) => {
    const form = await superValidate(event, zod(createWishlistFormSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    await db
      .insert(wishlistsTable)
      .values({
        name: form.data.name,
        userId: event.locals.user.id,
      })
      .returning()
      .execute();

    redirect(302, "/wishlists");
  },
} satisfies Actions;
