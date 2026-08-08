import { createGiftFormSchema } from "$lib/components/forms/form.schema";
import { db } from "$lib/db";
import { giftsTable } from "$lib/db/schema";
import { and, eq, isNull, max } from "drizzle-orm";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  return {
    wishlistId: event.params.id,
    form: await superValidate(zod(createGiftFormSchema)),
  };
};

export const actions = {
  default: async (event) => {
    const wishlistId = event.params.id;
    const form = await superValidate(event, zod(createGiftFormSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const result = await db
      .select({ maxPos: max(giftsTable.position) })
      .from(giftsTable)
      .where(
        and(
          eq(giftsTable.wishlistId, wishlistId),
          isNull(giftsTable.deletedAt)
        )
      )
      .execute();

    const maxPosition = result[0]?.maxPos ?? -1;
    const newPosition = maxPosition + 1;

    await db
      .insert(giftsTable)
      .values({
        name: form.data.name,
        link: form.data.link || null,
        description: form.data.description || null,
        position: newPosition,
        wishlistId,
        userId: event.locals.user.id,
      })
      .returning()
      .execute();

    redirect(302, `/wishlists/${wishlistId}`);
  },
} satisfies Actions;
