import { db } from "$lib/db";
import { giftsTable, usersTable } from "$lib/db/schema";
import { json, type RequestHandler } from "@sveltejs/kit";
import {and, eq} from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

export const POST: RequestHandler = async (event) => {
  const newGift = {
    name: "test",
    link: "google.com",
    description: "test description",
    userId: event.locals.user.id,
  };

  try {
    const gift = (
      await db.insert(giftsTable).values(newGift).returning().execute()
    )[0];
    return json({
      status: 201,
      message: "Gift created",
      gift,
    });
  } catch (e) {
    return json({
      status: 500,
      message: "Gift not created",
    });
  }
};

export const DELETE: RequestHandler = async (event) => {
  const { id } = await event.request.json();

  try {
    await db.update(giftsTable).set({deletedAt: new Date()}).where(and(eq(giftsTable.userId, event.locals.user.id), eq(giftsTable.id, id))).execute();

    return json({
      status: 200,
      message: "Gift deleted"
    });
  } catch (e) {
    return json({
      status: 500,
      message: "Gift not deketed",
    });
  }
};
