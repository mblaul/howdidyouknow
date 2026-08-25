import { db } from "$lib/db";
import { giftsTable } from "$lib/db/schema";
import { json, type RequestHandler } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";

export const DELETE: RequestHandler = async (event) => {
  const userId = event.locals.user?.id;
  if (!userId) {
    return json({ status: 401, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await event.request.json();

  try {
    await db
      .update(giftsTable)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(giftsTable.userId, userId), eq(giftsTable.id, id)),
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

export const PATCH: RequestHandler = async (event) => {
  const { id, position } = await event.request.json();
  const userId = event.locals.user?.id;

  if (!userId) {
    return json({ status: 401, message: "Unauthorized" }, { status: 401 });
  }

  try {
    await db
      .update(giftsTable)
      .set({ position: Number(position) })
      .where(and(eq(giftsTable.userId, userId), eq(giftsTable.id, id)))
      .execute();

    return json({ status: 200, message: "Position updated" });
  } catch (e) {
    return json({ status: 500, message: "Failed to update position" }, { status: 500 });
  }
};
export const PUT: RequestHandler = async (event) => {
  const { id, name, link, description } = await event.request.json();
  const userId = event.locals.user?.id;

  if (!userId) {
    return json({ status: 401, message: "Unauthorized" }, { status: 401 });
  }

  try {
    await db
      .update(giftsTable)
      .set({
        name: name !== undefined ? name : undefined,
        link: link !== undefined ? link : null,
        description: description !== undefined ? description : null,
      })
      .where(and(eq(giftsTable.userId, userId), eq(giftsTable.id, id)))
      .execute();

    return json({ status: 200, message: "Gift updated" });
  } catch (e) {
    return json({ status: 500, message: "Failed to update gift" }, { status: 500 });
  }
};
