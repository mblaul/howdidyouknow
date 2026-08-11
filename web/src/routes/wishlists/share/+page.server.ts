import { shareWishlistFormSchema } from "$lib/components/forms/form.schema";
import { db } from "$lib/db";
import { usersTable, wishlistSharesTable, wishlistsTable } from "$lib/db/schema";
import { nodemailerTransport } from "$lib/server/email";
import { fail, redirect, error, type Actions, type RequestEvent } from "@sveltejs/kit";
import { and, eq, isNull } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  const userId = event.locals.user?.id;
  if (!userId) {
    throw redirect(302, "/login");
  }

  const wishlistId = event.url.searchParams.get("id") || "";

  const wishlists = await db
    .select()
    .from(wishlistsTable)
    .where(and(eq(wishlistsTable.userId, userId), isNull(wishlistsTable.deletedAt)))
    .execute();

  const form = await superValidate(
    { wishlistId },
    zod(shareWishlistFormSchema)
  );

  return {
    form,
    wishlists,
  };
};

export const actions = {
  default: async (event: RequestEvent) => {
    const userId = event.locals.user?.id;
    if (!userId) {
      throw error(401, "Unauthorized");
    }

    const form = await superValidate(event, zod(shareWishlistFormSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    const { email, wishlistId } = form.data;

    // 1. Verify wishlist exists and owned by caller
    const wishlist = await db
      .select()
      .from(wishlistsTable)
      .where(
        and(
          eq(wishlistsTable.id, wishlistId),
          eq(wishlistsTable.userId, userId),
          isNull(wishlistsTable.deletedAt)
        )
      )
      .execute();

    if (wishlist.length === 0) {
      return fail(404, { form, message: "Wishlist not found" });
    }

    // 2. Find or create user to share with
    let targetUser = (
      await db
        .select()
        .from(usersTable)
        .where(and(eq(usersTable.email, email), isNull(usersTable.deletedAt)))
        .execute()
    )[0];

    if (!targetUser) {
      const [newUser] = await db
        .insert(usersTable)
        .values({ email })
        .returning()
        .execute();
      targetUser = newUser;
    }

    // 3. Generate access token & insert share
    const token = crypto.randomUUID();
    await db.insert(wishlistSharesTable).values({
      token,
      wishlistId,
      userId: targetUser.id,
      role: "viewer",
    }).execute();

    // 4. Construct share URL
    const shareUrl = `${event.url.origin}/wishlists/${wishlistId}?token=${token}`;
    console.log(`\n========================================`);
    console.log(`📨 WISHLIST SHARE LINK: ${shareUrl}`);
    console.log(`========================================\n`);

    // 5. Send email
    try {
      const info = await nodemailerTransport.sendMail({
        from: "noreply@howdidyouknow.app",
        to: email,
        subject: `Wishlist Shared: ${wishlist[0].name}`,
        text: `You have been given access to view "${wishlist[0].name}"! Access it here: ${shareUrl}`,
      });
      console.log("Nodemailer info:", info.message);
    } catch (err) {
      console.error("Failed to send email:", err);
    }

    return {
      form,
      success: true,
      shareUrl,
      token,
    };
  },
} satisfies Actions;
