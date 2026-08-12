import { db } from "$lib/db";
import { wishlistSharesTable, wishlistsTable } from "$lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  const userId = event.locals.user.id;

  const [wishlists, sharedWishlists] = await Promise.all([
    db
      .select()
      .from(wishlistsTable)
      .where(
        and(
          isNull(wishlistsTable.deletedAt),
          eq(wishlistsTable.userId, userId)
        )
      )
      .execute(),
    db
      .select({
        id: wishlistsTable.id,
        name: wishlistsTable.name,
        userId: wishlistsTable.userId,
        createdAt: wishlistsTable.createdAt,
        updatedAt: wishlistsTable.updatedAt,
        deletedAt: wishlistsTable.deletedAt,
        shareToken: wishlistSharesTable.token,
      })
      .from(wishlistSharesTable)
      .innerJoin(
        wishlistsTable,
        eq(wishlistSharesTable.wishlistId, wishlistsTable.id)
      )
      .where(
        and(
          eq(wishlistSharesTable.userId, userId),
          eq(wishlistSharesTable.role, "viewer"),
          isNull(wishlistsTable.deletedAt)
        )
      )
      .execute(),
  ]);

  return {
    wishlists,
    sharedWishlists,
  };
};

