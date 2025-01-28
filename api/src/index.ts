import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";

const app = new Hono();

app.use(
  "/api/auth/**",
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Allow credentials
  })
);
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

export default app;
