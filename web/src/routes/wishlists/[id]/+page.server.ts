import { db } from "$lib/db";
import { wishlistsTable, giftsTable } from "$lib/db/schema";
import { error } from "@sveltejs/kit";
import { and, eq, isNull, asc, max } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

import { createGiftFormSchema } from "$lib/components/forms/form.schema";
import { fail, type Actions } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { wishlistSharesTable } from "$lib/db/schema";

export const load: PageServerLoad = async (event) => {
  const wishlistId = event.params.id;
  const userId = event.locals.user?.id;
  const token = event.url.searchParams.get("token");

  if (!userId && !token) {
    throw error(401, "Unauthorized");
  }

  let hasAccess = false;

  if (userId) {
    const ownerList = await db
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
    if (ownerList.length > 0) {
      hasAccess = true;
    }
  }

  if (!hasAccess && token) {
    const shareRecord = await db
      .select()
      .from(wishlistSharesTable)
      .where(
        and(
          eq(wishlistSharesTable.token, token),
          eq(wishlistSharesTable.wishlistId, wishlistId)
        )
      )
      .execute();
    if (shareRecord.length > 0) {
      hasAccess = true;
    }
  }

  if (!hasAccess) {
    throw error(404, "Wishlist not found or access denied");
  }

  const wishlists = await db
    .select()
    .from(wishlistsTable)
    .where(and(eq(wishlistsTable.id, wishlistId), isNull(wishlistsTable.deletedAt)))
    .execute();

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

const addGiftHandler = async (event: any) => {
  const wishlistId = event.params.id;
  const userId = event.locals.user?.id;

  if (!userId) {
    throw error(401, "Unauthorized");
  }

  const form = await superValidate(event, zod(createGiftFormSchema));

  if (!form.valid) {
    return fail(400, { form });
  }

  // Query max position directly using SQL aggregate
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
      userId,
    })
    .returning()
    .execute();

  return { form };
};

export const actions: Actions = {
  default: addGiftHandler,
};



