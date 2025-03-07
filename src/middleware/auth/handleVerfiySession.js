import { AsyncHandler } from "../globels/AsyncHandler.js";
import jwt from "jsonwebtoken";

export const handleVerfiySession = AsyncHandler(async (req, res, next) => {
  const token = req.headers.token || req.params.token || req.cookies.token;

  return next();
});
