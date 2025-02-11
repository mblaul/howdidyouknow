import { db } from "$lib/db";
import { giftsTable } from "$lib/db/schema";
import { and, eq, is, isNull } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  return {
    gifts: await db
      .select()
      .from(giftsTable)
      .where(
        and(
          isNull(giftsTable.deletedAt),
          eq(giftsTable.userId, event.locals.user.id),
        ),
      )
      .execute(),
  };
};
