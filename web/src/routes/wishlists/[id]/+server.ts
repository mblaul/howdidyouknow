import { db } from "$lib/db";
import { wishlistsTable, giftsTable } from "$lib/db/schema";
import { json, type RequestHandler } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";

export const DELETE: RequestHandler = async (event) => {
  const wishlistId = event.params.id;
  const userId = event.locals.user?.id;

  if (!userId || !wishlistId) {
    return json({ status: 401, message: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.transaction(async (tx) => {
      const now = new Date();
      await tx
        .update(wishlistsTable)
        .set({ deletedAt: now })
        .where(
          and(
            eq(wishlistsTable.id, wishlistId),
            eq(wishlistsTable.userId, userId)
          )
        );

      await tx
        .update(giftsTable)
        .set({ deletedAt: now })
        .where(eq(giftsTable.wishlistId, wishlistId));
    });

    return json({ status: 200, message: "Wishlist deleted" });
  } catch (e) {
    return json({ status: 500, message: "Failed to delete wishlist" }, { status: 500 });
  }
};
