import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { PrismaClient } from "./generated/prisma";
import { errorHandler } from "./middleware/errorHandler";
import { loggerMiddleware } from "./middleware/logger";
import { corsMiddleware } from "./middleware/cors";

import postRouter from "./routes/posts";

const app = new Hono();
const prisma = new PrismaClient();

app.use("*", errorHandler);
app.use("*", loggerMiddleware);
app.use("*", corsMiddleware);

app.get("/", c => {
  return c.text("Hello Sanctuary API!");
});

app.get("/test-db", async c => {
  try {
    const userCount = await prisma.users.count();
    const postCount = await prisma.posts.count();

    return c.json({
      message: "Database connection successful!",
      data: {
        users: userCount,
        posts: postCount,
      },
    });
  } catch {
    return c.json({ error: "Failed to connect to the database" }, 500);
  }
});

// 投稿API
app.route("/api/posts", postRouter);

const port = 3001;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
