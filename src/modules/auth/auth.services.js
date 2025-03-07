import jwt from "jsonwebtoken";
import { UserModel } from "../../database/models/user.model.js";
import cache from "../../config/cache.js";
import { timeToSeconds } from "../../utils/formateTime.js";

export const decodeJwt = (key = "", signature = "") => {
  try {
    // Verify token
    return jwt.verify(key, signature);
  } catch (error) {
    // Token verification failed or some other error occurred
    return false;
  }
};
export const detectJwtAndDecodeJwtFromRequest = (req) => {
  const token =
    req?.headers?.token || req?.params?.token || req?.cookies?.token;
  if (!token) return false;
  // Verify token
  const decoded = decodeJwt(token, process.env.SECRETKEY);
  // Check if token is expired
  if (!decoded) return false;
  return { decoded, token };
};
export const getUserAndVerify = async (decodeReq) => {
  try {
    if (!decodeReq) return false;
    const iscahced = cache.get(decodeReq._id.toString());
    if (iscahced) return iscahced;
    // Check if user exists
    const user = await UserModel.findById(decodeReq._id)
      .populate([
        { path: "cart" },
        {
          path: "influencer",
          populate: {
            path: "coupon",
            select: " expires code discount commission",
          },
        },
      ])
      .lean()
      .exec();
    // Check if user exists, is not blocked, and has a valid token
    if (!user || user?.isblocked) return false;
    if (user?.passwordChangedAt) {
      const passwordChangedAtTime = Math.floor(
        user?.passwordChangedAt?.getTime() / 1000
      );
      if (passwordChangedAtTime > decodeReq?.iat) return false;
    }
    cache.set(user?._id.toString(), user, timeToSeconds("30d"));
    return user;
  } catch (error) {
    console.log("🚀 ~ getUserAndVerify ~ error:", error);
    // Token verification failed or some other error occurred
    return false;
  }
};
export const clearUserCacheIfAdmin = (user) => {
  if (user && user?.role === "admin") {
    try {
      cache.del(user?._id?.toString());
    } catch (error) {
      console.log("🚀 ~ clearUserCacheIfAdmin ~ error:", error);
    }
  }
};
