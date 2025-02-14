import { db } from "$lib/db";
import { giftsTable } from "$lib/db/schema";
import { json, type RequestHandler } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";

export const DELETE: RequestHandler = async (event) => {
  const { id } = await event.request.json();

  try {
    await db
      .update(giftsTable)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(giftsTable.userId, event.locals.user.id), eq(giftsTable.id, id)),
      )
      .execute();

    return json({
      status: 200,
      message: "Gift deleted",
    });
  } catch (e) {
    return json({
      status: 500,
      message: "Gift not deketed",
    });
  }
};
