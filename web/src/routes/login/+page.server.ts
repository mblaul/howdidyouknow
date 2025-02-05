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
import { loginFormSchema } from "$lib/components/forms/form.schema";
import { db } from "$lib/db";
import { usersTable } from "$lib/db/schema";

export const load: PageServerLoad = async (event) => {
  const tokenSearchParam = event.url.searchParams.get("token");

  if (tokenSearchParam) {
    const { session, user } = await validateSessionToken(tokenSearchParam);

    if (session === null) {
      redirect(302, "/uhoh");
    }

    setSessionTokenCookie(event, tokenSearchParam, session.expiresAt);
    redirect(302, "/in");
  }

  return {
    form: await superValidate(event, zod(loginFormSchema)),
  };
};

export const actions = {
  default: async (event: RequestEvent) => {
    const form = await superValidate(event, zod(loginFormSchema));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }

    const user = (await db.insert(usersTable).values({ email: form.data.email }).returning({ id: usersTable.id}))[0];
    const token = generateSessionToken();

    console.log("user", user);

    await createSession(token, user.id);

    nodemailerTransport.sendMail(
      {
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Message",
        text: `
            Here is your link to sign in:
              http://localhost:5173/login?token=${token} 
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
