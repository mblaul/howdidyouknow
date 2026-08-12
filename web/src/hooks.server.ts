import {
  validateSessionToken,
  setSessionTokenCookie,
  deleteSessionTokenCookie,
  generateSessionToken,
  createSession,
} from "$lib/server/auth";
import { db } from "$lib/db";
import { wishlistSharesTable } from "$lib/db/schema";
import { and, eq } from "drizzle-orm";

import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  let token = event.cookies.get("session") ?? null;

  if (token === null) {
    const shareToken = event.url.searchParams.get("token");
    if (shareToken && event.url.pathname.startsWith("/wishlists/")) {
      const wishlistId = event.url.pathname.split("/")[2];
      if (wishlistId) {
        const shareRecord = await db
          .select()
          .from(wishlistSharesTable)
          .where(
            and(
              eq(wishlistSharesTable.token, shareToken),
              eq(wishlistSharesTable.wishlistId, wishlistId)
            )
          )
          .execute();

        if (shareRecord.length > 0 && shareRecord[0].userId) {
          const sessionToken = generateSessionToken();
          const session = await createSession(sessionToken, shareRecord[0].userId);
          setSessionTokenCookie(event, sessionToken, session.expiresAt);
          token = sessionToken;
        }
      }
    }
  }

  if (token === null) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  const { session, user } = await validateSessionToken(token);

  if (session !== null) {
    setSessionTokenCookie(event, token, session.expiresAt);
  } else {
    deleteSessionTokenCookie(event);
  }

  event.locals.session = session;
  event.locals.user = user;

  return resolve(event);
};
