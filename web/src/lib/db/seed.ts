import { Database } from "bun:sqlite";
import { randomUUIDv7 } from "bun";

const db = new Database("./src/db/dev-database.sqlite", { create: true });

db.query("DROP TABLE IF EXISTS users;").run();
db.query("DROP TABLE IF EXISTS gifts;").run();

// Create tables
db.query(
  `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL UNIQUE,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      createdAtTimestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAtTimestamp DATETIME,
      deletedAtTimestamp DATETIME
  );
  `,
).run();

db.query(
  `
    CREATE TABLE IF NOT EXISTS gifts (
        id TEXT PRIMARY KEY NOT NULL,
        wantedByUserId TEXT NOT NULL,
        purchasedByUserId TEXT,
        createdAtTimestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAtTimestamp DATETIME,
        deletedAtTimestamp DATETIME 
    );
  `,
).run();

// Seed data
const billGatesId = "billgatesid";
const steveJobsId = "stevejobsid";
const johnCarmackId = "johncarmackid";

db.query(
  `
    INSERT INTO users (id, email, firstName, lastName)
    VALUES
    ('${billGatesId}', 'billgates@email.com', 'Bill', 'Gates'),
    ('${steveJobsId}', 'stevejobs@email.com', 'Steve', 'Jobs'),
    ('${johnCarmackId}', 'johncarmack@email.com', 'John', 'Carmack');
  `,
).run();

db.query(
  `
  INSERT INTO gifts (id, wantedByUserId, purchasedByUserId)
  VALUES
  ('${randomUUIDv7()}', '${billGatesId}', '${steveJobsId}'),
  ('${randomUUIDv7()}', '${steveJobsId}', '${johnCarmackId}'),
  ('${randomUUIDv7()}', '${johnCarmackId}', NULL);
  `,
).run();
