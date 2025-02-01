import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import type { RequestEvent } from "./$types";

export const actions = {
  default: async (event: RequestEvent) => {
    const token = generateSessionToken();
    const session = await createSession(token, "test");
    setSessionTokenCookie(event, token, session.expiresAt);
    redirect(302, "/");
  },
} satisfies Actions;
