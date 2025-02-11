import { db } from "$lib/db";
import { giftsTable } from "$lib/db/schema";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  return {
    gifts: await db
      .select()
      .from(giftsTable)
      .where(eq(giftsTable.userId, event.locals.user.id))
      .execute(),
  };
};
