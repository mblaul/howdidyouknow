import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
  validateSessionToken,
} from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import type { RequestEvent } from "./$types";
import { nodemailerTransport } from "$lib/server/email";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { formSchema } from "../register/form.schema";
import { db } from "$lib/db";
import { usersTable } from "$lib/db/schema";

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
    const form = await superValidate(event, zod(formSchema));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }

    const token = generateSessionToken();
    await createSession(token, form.data.email);

    nodemailerTransport.sendMail(
      {
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Message",
        text: `
            Here is your link to sign in:
              http://localhost:5173/auth/login?token=${token} 
            `,
      },
      (err, info) => {
        console.log(info.envelope);
        console.log(info.messageId);
        console.log(info.message);
      },
    );

    return {
      form,
    };
  },
} satisfies Actions;
