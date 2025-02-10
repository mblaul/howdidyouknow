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
import { eq } from "drizzle-orm";

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

    let userId = (
      await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, form.data.email))
    )[0]?.id;

    if (userId === undefined) {
      userId = (
        await db
          .insert(usersTable)
          .values({ email: form.data.email })
          .onConflictDoNothing({ target: usersTable.email })
          .returning({ id: usersTable.id })
      )[0].id;
    }

    const token = generateSessionToken();

    await createSession(token, userId);

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
