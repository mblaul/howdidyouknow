import { db } from "./index";
import { reset } from "drizzle-seed";
import { usersTable, wishlistsTable } from "./schema";
import * as schema from "./schema";

const seedUsers = [{ email: "seededUser@howdidyouknow.io" }];
const seedWishlists = [
  { name: "Seeded Wishlist 1" },
  { name: "Seeded Wishlist 2" },
];

const seededGifts = [
  {
    name: "Seeded Gift 1",
    link: "https://google.com",
    description: "Seeded Gift 1 Description",
  },
  {
    name: "Seeded Gift 2",
    link: "https://google.com",
    description: "Seeded Gift 2 Description",
  },
  {
    name: "Seeded Gift 3",
    link: "https://google.com",
    description: "Seeded Gift 3 Description",
  },
];

async function main() {
  await reset(db, schema);

  const users = await db
    .insert(usersTable)
    .values(seedUsers)
    .returning({ id: usersTable.id, email: usersTable.email })
    .execute();

  const seededUser = users[0];

  const wishlists = await db
    .insert(wishlistsTable)
    .values(
      seedWishlists.map((wishlist) => ({ ...wishlist, userId: seededUser.id })),
    )
    .returning({ id: wishlistsTable.id, name: wishlistsTable.name })
    .execute();

  const seededWishlist = wishlists[0];

  await db
    .insert(schema.giftsTable)
    .values(
      seededGifts.map((gift) => ({
        ...gift,
        userId: seededUser.id,
        wishlistId: seededWishlist.id,
      })),
    )
    .returning({ id: schema.giftsTable.id, name: schema.giftsTable.name })
    .execute();
}

main();
