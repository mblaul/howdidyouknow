import { db } from "$lib/db";
import { wishlistsTable } from "$lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  return {
    wishlists: await db
      .select()
      .from(wishlistsTable)
      .where(
        and(
          isNull(wishlistsTable.deletedAt),
          eq(wishlistsTable.userId, event.locals.user.id),
        ),
      )
      .execute(),
  };
};
