import { db, eq, options_tread } from "@database/main/dist/index.js";

export const cancel_tread = async (
  price: number,
  id: string
): Promise<boolean> => {
  try {
    const [result] = await db
      .update(options_tread)
      .set({ close_price: price })
      .where(eq(options_tread.tread_id, id))
      .returning({ id: options_tread.id });
    if (!result) return false;
    return true;
  } catch (error: any) {
    console.log("error on trade cancel");
    return false;
  }
};
