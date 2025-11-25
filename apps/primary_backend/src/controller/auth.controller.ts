import api_responce from "../utils/api_responce.js";
import { api_error } from "../utils/api_error.js";
import { async_handler } from "../utils/async_handler.js";
import {
  user,
  db,
  eq,
  account_balance,
  tread,
} from "@database/main/dist/index.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { and } from "drizzle-orm";
// import { take_current_tread_price } from "../utils/curent_stock_price.js";

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

// get curent price
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
    console.log(user_exist);
    throw new api_error(400, "user already exist try anather email");
  }
  const salt = await bcrypt.genSalt(10);
  const hashed_password = bcrypt.hashSync(password, salt);
  if (!hashed_password) throw new api_error(400, "generate solt failed");

  const [add_new_user] = await db
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
    });

  if (!add_new_user) {
    throw new api_error(400, "database insert failed");
  }

  return new api_responce(201, "user added successfully", add_new_user).send(
    res
  );
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
    { id: user_data.id },
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

  const [user_are_exist] = await db
    .select()
    .from(user)
    .where(eq(user.id, user_id));

  if (
    !user_are_exist ||
    user_are_exist === undefined ||
    user_are_exist === null
  ) {
    throw new api_error(400, "user not found");
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
  if (!chack_balance_for_this_simbol_balance_exist) {
    throw new api_error(400, "balance not found");
  }
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
        balance: balance + chack_balance_for_this_simbol_balance_exist.balance,
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

  const [user_are_exist] = await db
    .select()
    .from(user)
    .where(eq(user.id, user_id));
  if (
    user_are_exist === undefined ||
    user_are_exist === null ||
    !user_are_exist
  ) {
    throw new api_error(400, "user not found");
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

  const { price, status } = get_price_data_for_symbol(
    symbol,
    quantity,
    chack_balance_for_this_simbol_balance_exist.balance
  );

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
        tread_type: "long",
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
        balance: chack_balance_for_this_simbol_balance_exist.balance - price,
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
  return new api_responce(200, "purchase new simple trade", result).send(
    res
  );

});


