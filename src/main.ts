import { Hono, HTTPException } from 'https://deno.land/x/hono@v4.2.5/mod.ts'
import { cors, serveStatic } from 'https://deno.land/x/hono@v4.2.5/middleware.ts'
import { db } from "./db.ts"

const auth = async (c, next) => {
    const user = c.req.header("Authorization")
    if (user === undefined) {
        throw new HTTPException(401, {message: `Missing Authorization header.`})
    }
    c.set("user", user)
    await next()
}

const api = new Hono()

api.use("/*", cors())
api.use("/*", auth)

api.get("/", async (c) => c.json(await db.week(c.get("user"))))
api.get("/:day", async (c) => c.json(await db.day(c.get("user"), c.req.param("day"))))
api.post("/:day", async (c) => c.json(await db.add(c.get("user"), c.req.param("day"), await c.req.json()), 201))
api.put("/:day/:id", async (c) => c.json(await db.edit(c.get("user"), c.req.param("day"), c.req.param("id"), await c.req.json())))
api.patch("/:day/:id", async (c) => c.json(await db.patch(c.get("user"), c.req.param("day"), c.req.param("id"), await c.req.json())))
api.delete("/:day/:id", async (c) => c.json(await db.delete(c.get("user"), c.req.param("day"), c.req.param("id")), 204))

const app = new Hono()
app.route("/api", api)
app.use('/doc/*', serveStatic({ root: './public' }))

Deno.serve(app.fetch)
