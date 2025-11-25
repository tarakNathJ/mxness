import JWT from "jsonwebtoken"
import { config } from "dotenv";
import { async_handler } from "../utils/async_handler.js";
import { api_error } from "../utils/api_error.js";
import { db ,user ,eq } from "@database/main/dist/index.js";

config()

export const verify_JWT = async_handler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log(token);
    if (!token) {
      throw new api_error(401, "Unauthorized request",Error.prototype);
    }
    const  ACCESS_TOKEN =   process.env.ACCESS_TOKEN_SECRET;
    if(!ACCESS_TOKEN){
        throw new api_error(401, "env not exist",Error.prototype);
    }


    const decodedToken = JWT.verify(token,process.env.JWT_SECRET!) as { email: string }; 
    if (!decodedToken || !decodedToken?.email) {
      throw new api_error(401, "Invalid Access Token",Error.prototype);
    }

    //@ts-ignore chack user exist or not
    const [existe_user]= db.select().from(user).where(eq(user.email,decodedToken.email)).execute()

    if (!existe_user || !existe_user ===undefined) {
      throw new api_error(401, "user not exist",Error.prototype);
    }
    // console.log(user);
    // @ts-ignore
    req.user =existe_user

    next();
  } catch (error :any) {
    throw new api_error(401, error?.message || "Invalid access token",Error.prototype);
  }
});