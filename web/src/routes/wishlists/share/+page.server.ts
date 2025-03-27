import {
  createGiftFormSchema,
  shareWishlistFormSchema,
} from "$lib/components/forms/form.schema";
import { db } from "$lib/db";
import { giftsTable, usersTable } from "$lib/db/schema";
import { nodemailerTransport } from "$lib/server/email";
import {
  fail,
  json,
  redirect,
  type Actions,
  type RequestEvent,
} from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

export const actions = {
  default: async (event: RequestEvent) => {
    const form = await superValidate(event, zod(shareWishlistFormSchema));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }

    nodemailerTransport.sendMail(
      {
        from: "sender@example.com",
        to: form.data.email,
        subject: "Message",
        text: `You have been invited to view a wishlist! Click here to view it: <<INSERT LINK HERE>>`,
      },
      (err, info) => {
        console.log(info.envelope);
        console.log(info.messageId);
        console.log(info.message);
      },
    );

    redirect(302, "/wishlists");
  },
} satisfies Actions;
