

import { config } from "dotenv";
config();
import { drizzle } from "drizzle-orm/node-postgres";
import { eq , gte ,gt ,and, lt ,lte ,sql ,desc} from "drizzle-orm";
import { user , tread , account_balance , tread_history ,tread_type ,options_tread ,user_unique_id} from "./db/schema.js"


const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set.");
}
export const db = drizzle(databaseUrl);
export {eq , gte ,gt , lt ,and,lte ,sql ,desc}
export {user , tread , account_balance , tread_history ,tread_type ,options_tread ,user_unique_id};