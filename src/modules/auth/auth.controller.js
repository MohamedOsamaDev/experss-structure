import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AsyncHandler } from "../../middleware/globels/AsyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import { forgetPasswordEmail } from "../../services/mails/forgetPassword/forgetPassword.Email.js";
import { generateSecurePin } from "../../utils/genratePinCode.js";
import {
  clearUserCacheIfAdmin,
  
} from "./auth.services.js";
import SetCookie from "../../utils/SetCookie.js";
import httpStatus from "../../assets/messages/httpStatus.js";
import confirmEmail from "../../services/mails/confirmation/confirmation.email.js";
import { UserModel } from "../../database/models/user.model.js";
import cache from "../../config/cache.js";
import { timeToSeconds } from "../../utils/formateTime.js";

const signUp = AsyncHandler(async (req, res, next) => {
  const user = new UserModel(req.body);
  await user.save(); // save the user body after updating
  let token = jwt.sign(
    { _id: user?._id, role: user?.role },
    process.env.SECRETKEY
  );
  res.cookie("token", token, SetCookie());

  confirmEmail(req.body.email);

  return res.status(200).json({
    message: `welcome ${user?.fullName}`,
    profile: {
      _id: user?._id,
      fullName: user?.fullName,
      email: user?.email,
      role: user?.role,
      phone: user?.phone,
    },
  });
});

const signIn = AsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find the user and populate necessary fields
  const user = await UserModel.findOne({ email })
    .populate("cart")
    .populate("influencer");

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return next(
      new AppError({
        message: "Incorrect email or password",
        code: httpStatus.badRequest.code,
      })
    );
  }

  // Check if the user is blocked
  if (user.isblocked) {
    return next(
      new AppError({
        message: "User is blocked",
        code: httpStatus.badRequest.code,
      })
    );
  }

  // Generate and set the authentication token
  const token = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.SECRETKEY,
    { expiresIn: "365d" } // Use a readable duration format
  );
  if (user.role === 'admin') {
    cache.set(user?._id.toString(), user, timeToSeconds("30d"));
  }
  res.cookie("token", token, SetCookie());


  // Return success response
  return res.status(200).json({
    message: `Welcome ${user.fullName}`,
    profile: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      influencer: user.influencer,
    },
  });
});

/* emails is disabled  */
const verfiyEmail = AsyncHandler(async (req, res, next) => {
  jwt.verify(req.params.token, process.env.SECRETKEY, async (err, decoded) => {
    if (err) return next(new AppError(err, 401));
    const user = await UserModel.findOneAndUpdate(
      { email: decoded.email },
      { confirmEmail: true }
    );

    if (!user)
      return next(new AppError({ message: "user not found", code: 401 }));

    if (user.confirmEmail)
      return next(
        new AppError({ message: `email Already verified`, code: 401 })
      );

    return res.status(200).json({ message: "Confirmed successfully" });
  });
});
const unsubscribe = AsyncHandler(async (req, res, next) => {
  jwt.verify(req.params.token, process.env.SECRETKEY, async (err, decoded) => {
    if (err) return next(new AppError(err, 401));
    const user = await UserModel.findOne({ email: decoded.email });
    if (!user) return next(new AppError(`user not found`, 401));
    if (user?.confirmEmail)
      return next(new AppError(`email Already verified`, 401));
    await UserModel.findOneAndDelete({ email: decoded.email });
    return res.status(200).json({ message: " now your not subscribe" });
  });
});
const FPsendEmail = AsyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const findUser = await UserModel.findOne({ email });
  if (!findUser) return next(new AppError(`user not found`, 401));
  if (findUser?.isblocked) return next(new AppError("user is blocked", 401));
  const securePin = generateSecurePin(6);
  const { success } = await forgetPasswordEmail(email, securePin);
  if (!success)
    return next(new AppError(`something wrong try again later`, 401));
  await UserModel.findByIdAndUpdate(findUser._id, {
    pincode: securePin,
    isresetPassword: true,
  });
  return res.status(200).json({ message: `We sent email to ${email} ` });
});

const forgetPassword = AsyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const OTP = Math.floor(100000 + Math.random() * 900000); // generate random 6-digit pin code
  const isresetPassword = Date.now() + 15 * 60000;

  const user = await UserModel.findOneAndUpdate(
    { email },
    { OTP, isresetPassword },
    { new: true }
  );

  if (!user) return res.status(400).json({ message: "User not found" });

  const emailSent = await forgetPasswordEmail({ OTP, email });
  if (!emailSent) return res.status(400).json({ message: "Cannot send email" });

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, "$1****$2");
  clearUserCacheIfAdmin(user);
  return res.status(200).json({ message: `Email sent to ${maskedEmail}` });
});

const ResetPassword = AsyncHandler(async (req, res, next) => {
  const { email, password, OTP } = req.body; // Added OTP to request body

  // Find the user by email
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  // Check if the reset password session is valid
  if (!user.isresetPassword || user.isresetPassword < Date.now()) {
    return res.status(400).json({ message: "Session expired or not found" });
  }

  // Check if the OTP is valid
  if (OTP !== user.OTP) return res.status(400).json({ message: "Invalid OTP" });

  // Hash the new password
  const hashedPassword = bcrypt.hashSync(password, 8);

  // Update the user's password and passwordChangedAt, and clear OTP
  await UserModel.findByIdAndUpdate(
    user._id,
    {
      password: hashedPassword,
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
      useFindAndModify: false,
    }
  );

  // Clear OTP and reset password session
  await UserModel.updateOne(
    { _id: user._id },
    { $unset: { OTP: "", isresetPassword: "" } }
  );

  // Generate a new token for the user
  const newToken = jwt.sign({ id: user._id }, process.env.SECRETKEY, {
    expiresIn: "30d",
  });

  // Set the new token in a cookie
  res.cookie("token", newToken, SetCookie());
  clearUserCacheIfAdmin(user);
  return res.status(200).json({ message: "Password changed" });
});

/* #################### */
const changepassword = AsyncHandler(async (req, res, next) => {
  const user = req.user;
  await UserModel.findByIdAndUpdate(user?._id, {
    password: req.body.newpassword,
    passwordChangedAt: Date.now() - 1000,
  });
  const token = jwt.sign(
    { _id: user?._id, role: user?.role },
    process.env.SECRETKEY,
    {
      expiresIn: 365 * 24 * 60 * 60 * 1000,
    }
  );

  res.cookie("token", token, SetCookie());
  clearUserCacheIfAdmin(user);
  return res.status(200).json({ message: "sucess" });
});
const updateuser = AsyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  const data = await UserModel.findByIdAndUpdate(_id, req.body, {
    new: true,
  }).select("-password");
  clearUserCacheIfAdmin(data);
  return res.status(200).json({
    message: "sucess",
    data: {
      _id,
      fullName: data?.fullName,
      email: data?.email,
      role: data?.role,
      phone: data?.phone,
      confirmEmail: data?.confirmEmail,
      influencer: data?.influencer,
    },
  });
});
const softdelete = AsyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  await UserModel.findByIdAndUpdate(_id, {
    isblocked: true,
    isActive: false,
  });
  clearUserCacheIfAdmin(req.user);
  return res.status(200).json({ message: "success" });
});
const verfiySession = AsyncHandler(async (req, res, next) => {
  const user = req.user;
  return res.status(200).json({
    profile: {
      _id: user?._id,
      fullName: user?.fullName,
      email: user?.email,
      role: user?.role,
      phone: user?.phone,
      confirmEmail: user?.confirmEmail,
      influencer: user?.influencer,
    },
    cart: user?.cart,
  });
});
const logOut = AsyncHandler(async (req, res, next) => {
  res.cookie(
    "token",
    "",
    SetCookie({
      maxAge: 0,
    })
  );
  res.clearCookie(
    "token",
    SetCookie({
      maxAge: 0,
    })
  );
  return res.status(200).json({ message: "success" });
});
export {
  signUp,
  signIn,
  logOut,
  updateuser,
  softdelete,
  verfiyEmail,
  unsubscribe,
  FPsendEmail,
  verfiySession,
  ResetPassword,
  changepassword,
  forgetPassword,
};
