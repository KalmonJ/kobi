import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const postSchema = z.object({
  title: z.string(),
  body: z.string(),
  author: z.string(),
});

const app = new Hono()
  .post("/", zValidator("json", postSchema), (c) => {
    const data = c.req.valid("json");
    return c.json({
      success: true,
      message: `${data.author} of post ${data.title}`,
    });
  })
  .get("/", (c) => {
    c.text("Helooo");

    return c.json({
      success: true,
      data: [
        {
          title: "Hono",
          body: "Hono is awesome",
          author: "KalmonJ",
        },
      ],
    });
  });

export default app;
