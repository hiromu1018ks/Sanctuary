import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma";

const app = new Hono();
const prisma = new PrismaClient();

app.post("/", async c => {
  try {
    const body = await c.req.json();

    if (!body.user_id || !body.content) {
      return c.json({ error: "user_id and content are required" }, 400);
    }

    const post = await prisma.posts.create({
      data: {
        user_id: body.user_id,
        content: body.content,
      },
    });

    return c.json(post, 201);
  } catch (error) {
    console.error("Error creating post", error);
    return c.json({ error: "Failed to create post" }, 500);
  }
});
