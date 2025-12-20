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
  p: doublePrecision("p").notNull(), 
  P: doublePrecision("P").notNull(),  
  w: doublePrecision("w").notNull(), 
  x: doublePrecision("x").notNull(), 
  c: doublePrecision("c").notNull(), 
  Q: doublePrecision("Q").notNull(), 
  b: doublePrecision("b").notNull(), 
  B: doublePrecision("B").notNull(),  
  a: doublePrecision("a").notNull(), 
  A: doublePrecision("A").notNull(), 
  o: doublePrecision("o").notNull(), 
  h: doublePrecision("h").notNull(), 
  l: doublePrecision("l").notNull(), 
  v: doublePrecision("v").notNull(), 
  q: doublePrecision("q").notNull(), 

  // Timestamps
  O: bigint("O", { mode: "bigint" }).notNull(), 
  C: bigint("C", { mode: "bigint" }).notNull(), 

  // Trade IDs
  F: bigint("F", { mode: "bigint" }).notNull(),  
  L: bigint("L", { mode: "bigint" }).notNull(), 
  n: bigint("n", { mode: "bigint" }).notNull(),
  createdAt: timestamp("created_at"),  
});

export const options_tread = pgTable("options_tread", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  user_id: integer("user_id").references(() => user.id),
  quantity: doublePrecision("quantity").notNull(),
  tread_type :tread_type("tread_type").notNull(),
  open_price: doublePrecision("open_price").notNull(),
  close_price: doublePrecision("close_price"),
  take_profit: doublePrecision("take_profit").notNull(),
  stop_loss: doublePrecision("stop_loss").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const user_unique_id = pgTable("user_unique_id",{
  id:integer("id").primaryKey().generatedAlwaysAsIdentity(),
  user_id:integer("user_id").references(()=>user.id),
  unique_id:varchar("unique_id",{length:256}).notNull().unique(),
  created_at:timestamp("created_at").defaultNow().notNull(),
  updated_at:timestamp("updated_at").defaultNow().notNull(),
})
