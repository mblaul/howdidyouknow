import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
  validateSessionToken,
} from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import type { RequestEvent } from "./$types";
import { nodemailerTransport } from "$lib/server/email";

export const load: PageServerLoad = async (event) => {
  const tokenSearchParam = event.url.searchParams.get("token");

  if (tokenSearchParam) {
    console.log("Logging you in...");

    const { session, user } = await validateSessionToken(tokenSearchParam);

    if (session === null) {
      redirect(302, "/uhoh");
    }

    setSessionTokenCookie(event, tokenSearchParam, session.expiresAt);
    redirect(302, "/in");
  }
};

export const actions = {
  default: async (event: RequestEvent) => {
    const token = generateSessionToken();
    await createSession(token, "test");

    nodemailerTransport.sendMail(
      {
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Message",
        text: `
            Here is you link to sign in:
              http://localhost:5173/auth/login?token=${token} 
            `,
      },
      (err, info) => {
        console.log(info.envelope);
        console.log(info.messageId);
        console.log(info.message);
      }
    );
  },
} satisfies Actions;
