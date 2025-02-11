import { db } from "$lib/db";
import { giftsTable } from "$lib/db/schema";
import { json, type RequestHandler } from "@sveltejs/kit";

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
