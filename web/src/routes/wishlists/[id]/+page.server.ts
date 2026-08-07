import { db } from "$lib/db";
import { wishlistsTable, giftsTable } from "$lib/db/schema";
import { error } from "@sveltejs/kit";
import { and, eq, isNull, asc } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

import { createGiftFormSchema } from "$lib/components/forms/form.schema";
import { fail, type Actions } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async (event) => {
  const wishlistId = event.params.id;
  const userId = event.locals.user?.id;

  if (!userId) {
    throw error(401, "Unauthorized");
  }

  const wishlists = await db
    .select()
    .from(wishlistsTable)
    .where(
      and(
        eq(wishlistsTable.id, wishlistId),
        eq(wishlistsTable.userId, userId),
        isNull(wishlistsTable.deletedAt)
      )
    )
    .execute();

  if (wishlists.length === 0) {
    throw error(404, "Wishlist not found");
  }

  const gifts = await db
    .select()
    .from(giftsTable)
    .where(
      and(
        eq(giftsTable.wishlistId, wishlistId),
        isNull(giftsTable.deletedAt)
      )
    )
    .orderBy(asc(giftsTable.position), asc(giftsTable.createdAt))
    .execute();

  const form = await superValidate(zod(createGiftFormSchema));

  return {
    wishlist: wishlists[0],
    gifts,
    form,
  };
};

export const actions: Actions = {
  addGift: async (event) => {
    const wishlistId = event.params.id;
    const userId = event.locals.user?.id;

    if (!userId) {
      throw error(401, "Unauthorized");
    }

    const form = await superValidate(event, zod(createGiftFormSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    await db
      .insert(giftsTable)
      .values({
        name: form.data.name,
        link: form.data.link || null,
        description: form.data.description || null,
        position: form.data.position,
        wishlistId,
        userId,
      })
      .returning()
      .execute();

    return { form };
  }
};

