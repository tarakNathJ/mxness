import api_responce from "../utils/api_responce.js";
import { api_error } from "../utils/api_error.js";
import { async_handler } from "../utils/async_handler.js";
import {
  user,
  db,
  eq,
  account_balance,
  tread,
  desc,
  options_tread,
  user_unique_id,
} from "@database/main/dist/index.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { and } from "drizzle-orm";
import { kafka_instance } from "../utils/ws_server_and_kafka_instance.js";

const kafka = new kafka_instance(
  process.env.KAFKA_GROUP_IDs!,
  process.env.KAFKA_TOPICs!
);

const curent_price: any = {};

// set curent price
export const set_curent_price = (symbol: string, price: number) => {
  try {
    if (curent_price[symbol]) {
      curent_price[symbol].price = price;
      curent_price[symbol].timestamp = Date.now();
      return true;
    } else {
      curent_price[symbol] = {
        price: price,
        timestamp: Date.now(),
      };
      return true;
    }
  } catch (error) {
    return false;
  }
};

// get curent price fro buy perpose
function get_price_data_for_symbol(
  symbol: string,
  quantity: number,
  existing_balance: number
) {
  if (!curent_price[symbol]) {
    throw new Error(`Symbol ${symbol} not found`);
  }

  const price = quantity * curent_price[symbol].price;
  if (price > existing_balance) {
    return {
      price: price,
      status: false,
    };
  }

  return { price: price, status: true };
}

// signup controller
export const register_user = async_handler(async (req, res) => {
  const { name, email, password } = req.body;

  //chack all fields
  // chack user all ready exist or not
  // genetrate hash
  // insert data in out db
  // return responce
  if (
    [name, email, password].some(
      (item) => item.trim() === undefined || item.trim() === ""
    )
  ) {
    throw new api_error(400, "please fill all the fields");
  }

  const user_exist = await db.select().from(user).where(eq(user.email, email));
  if (user_exist.length > 0) {
    throw new api_error(400, "user already exist try anather email");
  }
  const salt = await bcrypt.genSalt(10);
  const hashed_password = bcrypt.hashSync(password, salt);
  if (!hashed_password) throw new api_error(400, "generate solt failed");

  const result = await db.transaction(async (tx) => {
    const [add_new_user] = await tx
      .insert(user)
      .values({
        name: name,
        email: email,
        password: hashed_password,
        is_active: true,
      })
      .returning({
        name: user.name,
        email: user.email,
        id: user.id,
      });

    if (!add_new_user) throw new api_error(400, "database insert failed");

    const [create_new_unique_id] = await tx
      .insert(user_unique_id)
      .values({
        user_id: add_new_user.id,
        unique_id: `${add_new_user.name}-${Date.now()}`,
      })
      .returning({
        user_id: user_unique_id.user_id,
        unique_id: user_unique_id.unique_id,
      });
    return { add_new_user, create_new_unique_id };
  });

  if (!result) {
    throw new api_error(400, "database insert failed");
  }

  return new api_responce(201, "user added successfully", result).send(res);
});

// login controller
export const login_user = async_handler(async (req, res) => {
  const { email, password } = req.body;

  //   chack hole fields
  //find user data
  // chack password are write or wrong
  if (
    [email, password].some(
      (item) => item.trim() === undefined || item.trim() === ""
    )
  ) {
    throw new api_error(400, "please fill all the fields");
  }

  const [user_data] = await db.select().from(user).where(eq(user.email, email));

  if (!user_data) {
    throw new api_error(400, "user not found");
  }

  const is_password_match = bcrypt.compareSync(password, user_data.password);

  if (!is_password_match) {
    throw new api_error(400, "password not match");
  }

  const token = JWT.sign(
    { email: user_data.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );
  if (!token) throw new api_error(400, "token not generated");

  return new api_responce(200, "login successfully", {
    token,
    email: user_data.email,
    name: user_data.name,
  }).send(res);
});

// fogget password
export const forgot_password = async_handler(async (req, res) => {
  const { new_password, email } = req.body;

  if (
    [email, new_password].some(
      (item) => item.trim() === undefined || item.trim() === ""
    )
  ) {
    throw new api_error(400, "please fill all the fields");
  }

  const [fing_user] = await db.select().from(user).where(eq(user.email, email));
  if (!fing_user) throw new api_error(400, "user not found");

  const salt = await bcrypt.genSalt(10);
  const hashed_password = bcrypt.hashSync(new_password, salt);
  if (!hashed_password) throw new api_error(400, "generate solt failed");

  const [update_password] = await db
    .update(user)
    .set({ password: hashed_password })
    .where(eq(user.email, email))
    .returning();

  if (!update_password) throw new api_error(400, "update password failed");

  return new api_responce(200, "password updated successfully").send(res);
});

// add user balance

export const add_balance = async_handler(async (req, res) => {
  // chack .  all data are exist or not
  // find user  : db and chack
  // chack this symbol data are exist or not
  // chack if exist then update || if not exist then create
  // return responce

  const { symbol, balance } = req.body;
  // @ts-ignore
  const user_id = req.user.id;

  if (!symbol || !user_id || !balance) {
    throw new api_error(400, "please fill all the fields");
  }

  const [chack_balance_for_this_simbol_balance_exist] = await db
    .select()
    .from(account_balance)
    .where(
      and(
        eq(account_balance.symbol, symbol),
        eq(account_balance.user_id, user_id)
      )
    );
  // if (!chack_balance_for_this_simbol_balance_exist) {
  //   // throw new api_error(400, "balance not found");
  // }
  const [add_new_balance] = await db
    .insert(account_balance)
    .values({
      balance: balance,
      symbol: symbol,
      user_id: user_id,
    })
    .onConflictDoUpdate({
      target: [account_balance.symbol, account_balance.user_id],
      set: {
        balance: balance + chack_balance_for_this_simbol_balance_exist?.balance,
      },
    })
    .returning({
      balance: account_balance.balance,
      symbol: account_balance.symbol,
    });

  if (!add_new_balance) throw new api_error(400, "db insert failed");

  return new api_responce(
    200,
    "balance added successfully",
    add_new_balance
  ).send(res);
});

// purchase new simple tread
export const purchase_new_trade = async_handler(async (req, res) => {
  const { symbol, quantity } = req.body;
  // @ts-ignore
  const user_id = req.user.id;

  // chack all data and
  // chack user are exist or not
  // chack user balance are exist or not
  // get curent price and status -> and  base on  status ,take  decision
  // then take new tread and update balance
  // return responce

  if (!symbol || !user_id || !quantity) {
    throw new api_error(400, "please fill all the fields");
  }

  const [chack_balance_for_this_simbol_balance_exist] = await db
    .select()
    .from(account_balance)
    .where(
      and(
        eq(account_balance.symbol, "USD"),
        eq(account_balance.user_id, user_id)
      )
    );

  if (!chack_balance_for_this_simbol_balance_exist) {
    throw new api_error(400, "balance not found");
  }
  const [chack_this_tread_exist] = await db
    .select()
    .from(tread)
    .where(and(eq(tread.symbol, symbol), eq(tread.user_id, user_id)));

  const { price, status } = get_price_data_for_symbol(
    symbol,
    quantity,
    chack_balance_for_this_simbol_balance_exist.balance
  );

  const updated_price =
    chack_balance_for_this_simbol_balance_exist.balance - price;

  if (!status) {
    throw new api_error(400, "insufficient balance");
  }

  const result = await db.transaction(async (tx) => {
    const [add_new_trade] = await tx
      .insert(tread)
      .values({
        price: price,
        quantity: quantity,
        symbol: symbol,
        user_id: user_id,
        tread_type: "long" as const,
      })
      .onConflictDoUpdate({
        target: [tread.symbol, tread.user_id, tread.tread_type],
        set: {
          quantity: quantity + chack_this_tread_exist?.quantity,
        },
      })
      .returning({
        id: tread.id,
        price: tread.price,
        quantity: tread.quantity,
        symbol: tread.symbol,
      });

    const [update_user_balance] = await tx
      .update(account_balance)
      .set({
        balance: updated_price,
      })
      .where(
        and(
          eq(account_balance.symbol, "USD"),
          eq(account_balance.user_id, user_id)
        )
      )
      .returning({
        balance: account_balance.balance,
        symbol: account_balance.symbol,
      });
    return { add_new_trade, update_user_balance };
  });
  if (!result) throw new api_error(400, "database insert failed");
  return new api_responce(200, "purchase new simple trade", result).send(res);
});

// sell existing tread
export const sell_existing_trade = async_handler(async (req, res) => {
  const { symbol, quantity } = req.body;
  // @ts-ignore
  const user_id = req.user.id;

  // chack all data
  // chack user are exist or not
  // chack user balance
  // chack user crypto amount are exist or not
  // get  curent price
  // then update data  tread and account balance
  // return responce

  if (!symbol || !user_id || !quantity) {
    throw new api_error(400, "please fill all the fields");
  }

  const [chack_this_tread_exist] = await db
    .select()
    .from(tread)
    .where(and(eq(tread.symbol, symbol), eq(tread.user_id, user_id)));

  if (!chack_this_tread_exist) {
    throw new api_error(400, "tread not found");
  }

  if (chack_this_tread_exist.quantity < quantity) {
    throw new api_error(400, "insufficient quantity");
  }

  const [balance] = await db
    .select()
    .from(account_balance)
    .where(
      and(
        eq(account_balance.symbol, "USD"),
        eq(account_balance.user_id, user_id)
      )
    );

  if (!balance) {
    throw new api_error(400, "balance not found");
  }

  const { price } = get_price_data_for_symbol(symbol, quantity, 1);
  const result = await db.transaction(async (tx) => {
    const [sell_our_trade] = await tx
      .update(tread)
      .set({
        quantity: chack_this_tread_exist.quantity - quantity,
      })
      .where(and(eq(tread.symbol, symbol), eq(tread.user_id, user_id)))
      .returning({
        quantity: tread.quantity,
      });

    const [update_user_balance] = await tx
      .update(account_balance)
      .set({
        balance: balance.balance + price,
      })
      .where(
        and(
          eq(account_balance.user_id, user_id),
          eq(account_balance.symbol, "USD")
        )
      )
      .returning({
        balance: account_balance.balance,
        accout: account_balance.symbol,
      });

    return { sell_our_trade, update_user_balance };
  });

  if (!result) throw new api_error(400, "database insert failed");
  return new api_responce(201, "sell existing tread", result).send(res);
});

// get user balance
export const get_user_balance = async_handler(async (req, res) => {
  // @ts-ignore
  const user_id = req.user.id;
  const [user_balance] = await db
    .select()
    .from(account_balance)
    .where(eq(account_balance.user_id, user_id));

  if (!user_balance) {
    throw new api_error(400, "balance not found");
  }

  return new api_responce(200, "user balance", user_balance).send(res);
});

// get user all tread
export const get_user_all_tread = async_handler(async (req, res) => {
  // @ts-ignore
  const user_id = req.user.id;

  const [user_treads] = await db
    .select()
    .from(tread)
    .where(eq(tread.user_id, user_id))
    .orderBy(desc(tread.id));

  if (!user_treads || user_treads === undefined || user_treads === null) {
    throw new api_error(400, "tread not found");
  }
  return new api_responce(200, "user treads", user_treads).send(res);
});

export const take_profit_and_stop_loss = async_handler(async (req, res) => {
  const { symbol, quantity, type, take_profit, stop_loss } = req.body;
  // @ts-ignore

  // chack all data
  // chack user balance are exist or not
  // get current price
  // create new tread
  // return responce

  const user_id = req.user.id;

  if (!symbol || !user_id || !quantity || !type || !take_profit || !stop_loss) {
    throw new api_error(400, "please fill all the fields");
  }

  const [chack_balance_are_exist] = await db
    .select()
    .from(account_balance)
    .where(
      and(
        eq(account_balance.user_id, user_id),
        eq(account_balance.symbol, "USD")
      )
    );

  if (!chack_balance_are_exist) {
    throw new api_error(400, "balance not found");
  }

  const { price, status } = get_price_data_for_symbol(
    symbol,
    quantity,
    chack_balance_are_exist.balance
  );

  if (!status) {
    throw new api_error(400, "insufficient balance");
  }

  const result = await db.transaction(async (tx) => {
    const [create_new_trea] = await tx
      .insert(options_tread)
      .values({
        symbol: symbol,
        user_id: user_id,
        quantity: quantity,
        tread_type: type,
        take_profit: take_profit,
        stop_loss: stop_loss,
        open_price: price,
      })
      .returning({
        symbol: tread.symbol,
        user_id: tread.user_id,
        quantity: tread.quantity,
        tread_type: tread.tread_type,
        id: tread.id,
      });

    const [get_unique_id] = await tx
      .select()
      .from(user_unique_id)
      .where(eq(user_unique_id.user_id, user_id));

    if (!create_new_trea || !get_unique_id)
      throw new api_error(400, "database insert failed");

    const producer = await kafka.get_producer();
    producer.send({
      topic: process.env.KAFKA_TOPICs!,
      messages: [
        {
          value: JSON.stringify({
            type: "new_trade",
            data: {
              id: create_new_trea.id,
              user_unique_id: get_unique_id.unique_id,
              symbol: symbol,
              quantity: quantity,
              price: price,
              type: type,
              take_profit: take_profit,
              stop_loss: stop_loss,
            },
          }),
        },
      ],
    });

    return create_new_trea;
  });

  return new api_responce(201, "success fully create new tread", result).send(
    res
  );
});

export const cancel_tread_for_take_profit_and_stop_loss = async_handler(
  async (req, res) => {
    const { id } = req.body;
    //@ts-ignore
    const user_id = req.user.id;

    const [find_tread] = await db
      .select({
        id: tread.id,
        type: tread.tread_type,
        quantity: tread.quantity,
      })
      .from(tread)
      .where(eq(tread.id, id));
    if (!find_tread) throw new api_error(400, "your tread not find");
    const producer = await kafka.get_producer();
    producer.send({
      topic: process.env.KAFKA_TOPICs!,
      messages: [
        {
          value: JSON.stringify({
            type: "cancel_trade",
            data: {
              id: find_tread.id,
              type: find_tread.type,
              quantity: find_tread.quantity,
            },
          }),
        },
      ],
    });


    return new api_responce(200, "success fully cancel tread").send(req)
  }
);
