import {
  boolean,
  integer,
  doublePrecision,
  pgTable,
  varchar,
  pgEnum,
  timestamp,
  bigint,
  unique,
} from "drizzle-orm/pg-core";
export const tread_type = pgEnum("tread_type", ["long", "short"]);

export const user = pgTable("user", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  password: varchar("password", { length: 256 }).notNull(),
  is_active: boolean("is_active").default(false).notNull(),
});

export const tread = pgTable(
  "tread",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    price: doublePrecision("price").notNull(),
    symbol: varchar("symbol", { length: 50 }).notNull(),
    user_id: integer("user_id").references(() => user.id),
    tread_type: tread_type("tread_type").notNull(),
    quantity: doublePrecision("quantity").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      symbolUserUnique: unique().on(
        table.symbol,
        table.user_id,
        table.tread_type
      ),
    };
  }
);

export const account_balance = pgTable(
  "account_balance",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    balance: doublePrecision("balance").notNull(),
    symbol: varchar("symbol", { length: 50 }).notNull(),
    user_id: integer("user_id").references(() => user.id),
  },
  (table) => {
    return {
      symbolUserUnique: unique().on(table.symbol, table.user_id),
    };
  }
);
export const tread_history = pgTable("tread_history", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  // Basic info
  stream: varchar("stream", { length: 50 }).notNull(),
  e: varchar("e", { length: 50 }).notNull(),
  E: bigint("E", { mode: "bigint" }).notNull(),
  s: varchar("s", { length: 20 }).notNull(), // symbol

  // Prices
  p: doublePrecision("p").notNull(), // last price
  P: doublePrecision("P").notNull(), // price change percent
  w: doublePrecision("w").notNull(), // weighted avg price
  x: doublePrecision("x").notNull(), // previous close
  c: doublePrecision("c").notNull(), // current close
  Q: doublePrecision("Q").notNull(), // close qty
  b: doublePrecision("b").notNull(), // best bid
  B: doublePrecision("B").notNull(), // best bid qty
  a: doublePrecision("a").notNull(), // best ask
  A: doublePrecision("A").notNull(), // best ask qty
  o: doublePrecision("o").notNull(), // open price
  h: doublePrecision("h").notNull(), // high price
  l: doublePrecision("l").notNull(), // low price
  v: doublePrecision("v").notNull(), // total traded base asset volume
  q: doublePrecision("q").notNull(), // total traded quote asset volume

  // Timestamps
  O: bigint("O", { mode: "bigint" }).notNull(), // open time
  C: bigint("C", { mode: "bigint" }).notNull(), // close time

  // Trade IDs
  F: bigint("F", { mode: "bigint" }).notNull(), // first trade ID
  L: bigint("L", { mode: "bigint" }).notNull(), // last trade ID
  n: bigint("n", { mode: "bigint" }).notNull(),
  createdAt: timestamp("created_at"), // total number of trades
});

export const options_tread = pgTable("options_tread", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  user_id: integer("user_id").references(() => user.id),
  quantity: doublePrecision("quantity").notNull(),
  open_price: doublePrecision("open_price").notNull(),
  close_price: doublePrecision("close_price").notNull(),
  take_profit: doublePrecision("take_profit").notNull(),
  stop_loss: doublePrecision("stop_loss").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
