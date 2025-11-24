import type { async_handler } from "../types/type.js";
import type { Request, Response, NextFunction } from "express";

export const async_handler_middleware =
  (func: async_handler) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
        await func(req, res, next);
    } catch (error: any) {
      return res.status(error.status || error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };
