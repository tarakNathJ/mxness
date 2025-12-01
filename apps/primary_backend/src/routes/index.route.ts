import {
  register_user,
  login_user,
  forgot_password,
  purchase_new_trade,
  sell_existing_trade,
  get_user_all_tread,
  get_user_balance,
  add_balance,
  // stop_loss_take_profit
  take_profit_and_stop_loss,
  cancel_tread_for_take_profit_and_stop_loss
} from "../controller/auth.controller.js";

import { verify_JWT } from "../middleware/index.middleware.js";
import express from "express";

const route = express.Router();

route.post("/add-balance", verify_JWT, add_balance);
route.post("/register", register_user);
route.post("/login", login_user);
route.post("/forgot-password", forgot_password);
route.post("/purchase-new-simple-trade", verify_JWT, purchase_new_trade);
route.post("/sell-existing-simple-trade", verify_JWT, sell_existing_trade);
route.get("/get-user-all-tread", verify_JWT, get_user_all_tread);
route.get("/get-user-balance", verify_JWT, get_user_balance);
route.post("/stop-loss-take-profit",verify_JWT ,take_profit_and_stop_loss);
route.post("/cancel_tread",verify_JWT,cancel_tread_for_take_profit_and_stop_loss)

export default route;
