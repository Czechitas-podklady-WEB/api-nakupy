import { Hono } from "@hono/hono";
import { appendTrailingSlash } from "@hono/hono/trailing-slash";
import { getCookie, setCookie } from "@hono/hono/cookie";
import { cors } from "@hono/hono/cors";
import { serveStatic } from "@hono/hono/deno";
import { db } from "./db.ts";
import { generateName } from "./name-generator.ts";

type Variables = {
  user: string;
};

const api = new Hono<{ Variables: Variables }>();

api.use("/*", cors());
api.use("/*", async (c, next) => {
  let user: string | undefined = getCookie(c, "User");
  if (user === undefined) {
    user = generateName();
  }
  c.set("user", user);
  setCookie(c, "User", user, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 14, //14 dnů v sekundách
  });
  await next();
});

api.get("/", async (c) => c.json(await db.week(c.get("user"))));
api.get(
  "/:day",
  async (c) => c.json(await db.day(c.get("user"), c.req.param("day"))),
);
api.post(
  "/:day",
  async (c) =>
    c.json(
      await db.add(c.get("user"), c.req.param("day"), await c.req.json()),
      201,
    ),
);
api.delete(
  "/:day",
  async (c) =>
    c.json(await db.deleteDay(c.get("user"), c.req.param("day")), 204),
);
api.put(
  "/:day/:id",
  async (c) =>
    c.json(
      await db.edit(
        c.get("user"),
        c.req.param("day"),
        c.req.param("id"),
        await c.req.json(),
      ),
    ),
);
api.patch(
  "/:day/:id",
  async (c) =>
    c.json(
      await db.patch(
        c.get("user"),
        c.req.param("day"),
        c.req.param("id"),
        await c.req.json(),
      ),
    ),
);
api.delete(
  "/:day/:id",
  async (c) =>
    c.json(
      await db.delete(c.get("user"), c.req.param("day"), c.req.param("id")),
      204,
    ),
);

const app = new Hono();
app.use(appendTrailingSlash());
app.route("/api/", api);
app.get("/doc", (c) => c.redirect("/doc/"));
app.use("/doc/*", serveStatic({ root: "./public" }));

export default { fetch: app.fetch };
