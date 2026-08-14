import { db } from "$lib/db";
import { giftsTable, wishlistsTable, wishlistSharesTable } from "$lib/db/schema";
import { json, type RequestHandler } from "@sveltejs/kit";
import { and, eq, isNull } from "drizzle-orm";

export const PATCH: RequestHandler = async (event) => {
  const userId = event.locals.user?.id;
  if (!userId) {
    return json({ status: 401, message: "Unauthorized" }, { status: 401 });
  }

  const { giftId, isPurchased } = await event.request.json();
  if (!giftId || typeof isPurchased !== "boolean") {
    return json({ status: 400, message: "Invalid payload" }, { status: 400 });
  }

  try {
    const gifts = await db
      .select()
      .from(giftsTable)
      .where(and(eq(giftsTable.id, giftId), isNull(giftsTable.deletedAt)))
      .execute();

    if (gifts.length === 0) {
      return json({ status: 404, message: "Gift not found" }, { status: 404 });
    }

    const gift = gifts[0];

    // Verify access (owner or viewer share record)
    const wishlist = await db
      .select()
      .from(wishlistsTable)
      .where(and(eq(wishlistsTable.id, gift.wishlistId), isNull(wishlistsTable.deletedAt)))
      .execute();

    if (wishlist.length === 0) {
      return json({ status: 404, message: "Wishlist not found" }, { status: 404 });
    }

    const isOwner = wishlist[0].userId === userId;

    if (!isOwner) {
      const shareRecord = await db
        .select()
        .from(wishlistSharesTable)
        .where(
          and(
            eq(wishlistSharesTable.wishlistId, gift.wishlistId),
            eq(wishlistSharesTable.userId, userId)
          )
        )
        .execute();

      if (shareRecord.length === 0) {
        return json({ status: 403, message: "Forbidden" }, { status: 403 });
      }
    }

    const now = new Date();
    const purchasedAt = isPurchased ? now : null;

    await db
      .update(giftsTable)
      .set({
        purchasedByUserId: isPurchased ? userId : null,
        purchasedAt
      })
      .where(eq(giftsTable.id, giftId))
      .execute();

    return json({ status: 200, message: "Purchase status updated", isPurchased, purchasedAt });
  } catch (e) {
    return json({ status: 500, message: "Failed to update purchase status" }, { status: 500 });
  }
};
