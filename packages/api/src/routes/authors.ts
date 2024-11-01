import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const authorsSchema = z.object({
  name: z.string(),
  email: z.string(),
});

const app = new Hono()
  .post("/sign-in", zValidator("json", authorsSchema), (c) => {
    const data = c.req.valid("json");
    return c.json({
      success: true,
      message: `${data.name} of post ${data.email}`,
    });
  })
  .get("/", (c) => {
    c.text("Helooo");

    return c.json({
      success: true,
      data: [
        {
          name: "Jhon Doe",
          email: "example@email.com",
        },
      ],
    });
  });

export default app;
