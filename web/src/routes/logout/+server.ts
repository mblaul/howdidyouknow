import { redirect } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

import { invalidateSession, deleteSessionTokenCookie } from "$lib/server/auth";

export const GET = async (event: RequestEvent) => {
    const session = event.cookies.get("session");
    if (session !== undefined) {
      invalidateSession(session);
      deleteSessionTokenCookie(event);
    }

    redirect(302, "/");
};
