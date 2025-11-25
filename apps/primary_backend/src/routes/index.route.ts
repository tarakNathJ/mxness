import {
  register_user,
  login_user,
  forgot_password,
  purchase_new_trade,
} from "../controller/auth.controller.js";

import { verify_JWT } from "../middleware/index.middleware.js";
import express from "express";

const route = express.Router();

route.post("/register", register_user);
route.post("/login", login_user);
route.post("/forgot-password", forgot_password);
route.post("/purchase-new-simple-trade", verify_JWT, purchase_new_trade);

export default route;
