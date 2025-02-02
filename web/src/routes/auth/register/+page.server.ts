import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import type { RequestEvent } from "./$types";
import { fail, superValidate } from "sveltekit-superforms";
import { formSchema } from "./form.schema";
import { zod } from "sveltekit-superforms/adapters";
import { db } from "$lib/db";
import { usersTable } from "$lib/db/schema";
import { nodemailerTransport } from "$lib/server/email";

export const load: PageServerLoad = async () => {
  return {
    form: await superValidate(zod(formSchema)),
  };
};

export const actions = {
  default: async (event: RequestEvent) => {
    const form = await superValidate(event, zod(formSchema));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }

    const newUser = (
      await db
        .insert(usersTable)
        .values(form.data)
        .returning({ id: usersTable.id })
    )[0];

    const token = generateSessionToken();
    await createSession(token, newUser.id);

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
      }
    );

    return {
      form,
    };
  },
} satisfies Actions;
