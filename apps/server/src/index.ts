import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { Octokit } from "octokit";
import type { Context } from "./types/context";
import * as schema from "./db/schema";
import { sessions, users } from "./db/schema";
import { eq } from "drizzle-orm";

const app = new Hono<Context>();

app.post("/webhook", async (c) => {
  const db = drizzle(c.env.DB, {
    schema,
  });
  const githubEvent = c.req.header("x-github-event");

  async function handlePullRequestEvent(event: any) {
    if ("action" in event && event.action === "opened") {
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.repo, event.repository.full_name),
      });

      console.log(JSON.stringify(event, null, 2));

      if (!session) throw new Error("Unauthorized");

      const octokit = new Octokit({ auth: session.token });

      const res = await octokit.rest.pulls.listFiles({
        repo: event.repository.name,
        owner: event.repository.owner.login!,
        pull_number: event.pull_request.number,
      });
    }
  }

  switch (githubEvent) {
    case "pull_request":
      const event = await c.req.json();
      await handlePullRequestEvent(event);
      break;

    default:
      console.log("Unknown event");
      break;
  }

  return c.text("Accepted", {
    status: 202,
  });
});

app.post("/sessions", async (c) => {
  const db = drizzle(c.env.DB, {
    schema,
  });
  const body = await c.req.json();
  try {
    await db.insert(sessions).values({
      clientId: body.clientId,
      clientSecret: body.clientSecret,
      token: body.token,
      userId: body.userId,
      repo: body.repo,
    });
    return c.json({ message: "Success" });
  } catch (error: any) {
    console.log(error);
    return c.json({ message: error.message });
  }
});

app.post("/users", async (c) => {
  const db = drizzle(c.env.DB, {
    schema,
  });
  const body = await c.req.json();
  try {
    const res = db
      .insert(users)
      .values({
        email: body.email,
        avatar: body.avatar,
        name: body.name,
        username: body.username,
      })
      .onConflictDoUpdate({
        target: users.username,
        set: {
          email: body.email,
          avatar: body.avatar,
          name: body.name,
          username: body.username,
        },
      })
      .returning({ id: users.id })
      .get({ id: users.id });

    return c.json({ message: "Success", data: res });
  } catch (error: any) {
    console.log(error.message);
    return c.json({ message: "Unable to login" });
  }
});

export default app;
