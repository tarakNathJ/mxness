import {register_user ,login_user} from "../controller/auth.controller.js"
import express from "express"

const route = express.Router()

route.post("/register", register_user);
route.post("/login", login_user);


export default route

