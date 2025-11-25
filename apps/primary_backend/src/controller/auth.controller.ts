import api_responce from "../utils/api_responce.js";
import { api_error } from "../utils/api_error.js";
import { async_handler } from "../utils/async_handler.js";
import { user, db, eq } from "@database/main/dist/index.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";


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
  const hashed_password =  bcrypt.hashSync(password, salt);
  if (!hashed_password) throw new api_error(400, "generate solt failed");

  const [add_new_user] = await db
    .insert(user)
    .values({
      name: name,
      email: email,
      password: hashed_password,
      is_active: true,
    })
    .returning();

  if (!add_new_user) {
    throw new api_error(400, "database insert failed");
  }

  return new api_responce(201, "user added successfully", add_new_user).send(
    res
  );
});

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

   const token = JWT.sign({id: user_data.id}, process.env.JWT_SECRET as string, {expiresIn: "1d"});
   if(!token) throw new api_error(400, "token not generated")

   return new api_responce(200, "login successfully", {token , email:user_data.email, name: user_data.name}).send(res)
   

});
