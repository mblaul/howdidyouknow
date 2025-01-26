import { Hono } from "hono";
import { Database } from "bun:sqlite";
import { Gift } from "../../types/Gift";
import { randomUUIDv7 } from "bun";

const db = new Database("./src/db/dev-database.sqlite");
const app = new Hono();

const mockUserSessionUserId = "billgatesid";

app.get("/gifts/for-me", (c) => {
  const gifts = db
    .query(
      `
        SELECT 
          id,
          wantedByUserId,
          purchasedByUserId,
          createdAtTimestamp,
          updatedAtTimestamp,
          deletedAtTimestamp
        FROM 
          gifts
        WHERE
          wantedByUserId = '${mockUserSessionUserId}';
      `
    )
    .all() as Gift[];
  return c.json<Gift[]>(gifts);
});

app.get("/gifts/:id", (c) => {
  const gift = db
    .query(
      `
        SELECT
          id,
          wantedByUserId,
          purchasedByUserId,
          createdAtTimestamp,
          updatedAtTimestamp,
          deletedAtTimestamp
        FROM 
          gifts
        WHERE
          deletedAtTimestamp IS NULL AND
          id = '${c.req.param("id")}';
      `
    )
    .get() as Gift;
  return c.json<Gift>(gift, gift != null ? 200 : 404);
});

app.post("/gifts/create", (c) => {
  const id = randomUUIDv7();

  db.query(
    `
        INSERT INTO  
          gifts (id, wantedByUserId)
        VALUES
          ('${id}', '${mockUserSessionUserId}');
      `
  ).get();

  const gift = db
    .query(
      `
        SELECT 
          id,
          wantedByUserId,
          purchasedByUserId,
          createdAtTimestamp,
          updatedAtTimestamp,
          deletedAtTimestamp
        FROM 
          gifts
        WHERE
          id = '${id}';
      `
    )
    .get() as Gift;

  return c.json<Gift>(gift);
});
app.delete("/gifts/:id", (c) => {
  db.query(
    `
        UPDATE  
          gifts
        SET
          deletedAtTimestamp = CURRENT_TIMESTAMP
        WHERE
          id = '${c.req.param("id")}';
      `
  ).run();
  return c.text(`Gift(${c.req.param("id")}) deleted`);
});

export default app;
