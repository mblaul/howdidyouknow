import { createGiftFormSchema } from "$lib/components/forms/form.schema";
import { db } from "$lib/db";
import { giftsTable, usersTable } from "$lib/db/schema";
import {
  fail,
  json,
  redirect,
  type Actions,
  type RequestEvent,
  type RequestHandler,
} from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

export const actions = {
  default: async (event: RequestEvent) => {
    const form = await superValidate(event, zod(createGiftFormSchema));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }

    await db
      .insert(giftsTable)
      .values({
        name: form.data.name,
        link: form.data.link,
        description: form.data.description,
        userId: event.locals.user.id,
      })
      .returning()
      .execute();

    redirect(302, "/wishlists");
  },
} satisfies Actions;
