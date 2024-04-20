import { HTTPException } from 'https://deno.land/x/hono@v4.2.5/mod.ts'
import {ulid} from "https://deno.land/std@0.223.0/ulid/mod.ts";

type Item = {
    id?: string,
    product: string,
    amount: number,
    unit?: string,
    done?: boolean,
}

type DayItems = {
    day: string,
    items: Item[]
}

enum Day {
    Mon = "mon",
    Tue = "tue",
    Wed = "wed",
    Thu = "thu",
    Fri = "fri",
    Sat = "sat",
    Sun = "sun",
}

const dayOrder = [Day.Mon, Day.Tue, Day.Wed, Day.Thu, Day.Fri, Day.Sat, Day.Sun]

const kv = await Deno.openKv();

const validateDay = (day: string): void => {
    if (dayOrder.indexOf(day) < 0) {
        throw new HTTPException(404, {message: `Invalid day: ${day}.`})
    }
}

const buildItem = (entry: Deno.KvEntry<Item>): Item => {
    const id: string = entry.key[2] as string
    return {id, ...entry.value}
}

export const db = {
    add: async (user: string, day: string, item: Item) => {
        validateDay(day)
        const id = ulid()
        item = {done: false, ...item}
        const result = await kv.set([user, day, id], item)
        return {
            id,
            ...item
        }
    },

    get: async (user: string, day: string, id: string): Promise<Item | null> => {
        validateDay(day)
        const item = await kv.get<Item>([user, day, id]);
        return item.value
    },

    edit: async (user: string, day: string, id: string, item: Item): Promise<Item | null> => {
        validateDay(day)
        const {value: currentItem} = await kv.get<Item>([user, day, id]);
        if (currentItem === null) {
            throw new HTTPException(404, {message: `Item with ID ${id} not found.`})
        }
        delete item.id
        const result = await kv.set([user, day, id], item)
        return {
            id,
            ...item
        }
    },

    patch: async (user: string, day: string, id: string, item: Item): Promise<Item | null> => {
        validateDay(day)
        const {value: currentItem} = await kv.get<Item>([user, day, id]);
        if (currentItem === null) {
            throw new HTTPException(404, {message: `Item with ID ${id} not found.`})
        }
        delete item.id
        const result = await kv.set([user, day, id], {...currentItem, ...item})
        return {
            id,
            ...currentItem,
            ...item
        }
    },

    delete: async (user: string, day: string, id: string): Promise<void> => {
        validateDay(day)
        await kv.delete([user, day, id]);
    },

    deleteDay: async (user: string, day: string): Promise<void> => {
        validateDay(day)
        await kv.delete([user, day]);
    },

    day: async (user: string, day: string): Promise<Item[]> => {
        validateDay(day)
        const items = kv.list<Item>({prefix: [user, day]});
        const result: Item[] = []
        for await (const entry of items) {
            result.push(buildItem(entry));
        }
        return result
    },

    week: async (user: string): Promise<DayItems[]> => {
        const items = kv.list<Item>({prefix: [user]});
        const result: DayItems[] = [
            {
                day: Day.Mon,
                items: []
            },
            {
                day: Day.Tue,
                items: []
            },
            {
                day: Day.Wed,
                items: []
            },
            {
                day: Day.Thu,
                items: []
            },
            {
                day: Day.Fri,
                items: []
            },
            {
                day: Day.Sat,
                items: []
            },
            {
                day: Day.Sun,
                items: []
            },
        ]
        for await (const entry of items) {
            const day: string = entry.key[1] as string
            const dayIndex = dayOrder.indexOf(day)
            result[dayIndex].items.push(buildItem(entry));
        }
        return result
    },

}
