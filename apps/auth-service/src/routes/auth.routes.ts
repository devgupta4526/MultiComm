import express, { Router } from "express";
import { createShop, createStripeConnectLink, getSeller, getUser, loginSeller, loginUser, refreshToken, registerSeller, registerUser, resetUserPassword, userForgotPassword, verifySeller, verifyUser } from "../controller/auth.controller";
import { verifyForgotPasswordOtp } from "../utils/auth.helper";
import isAuthenticated from "@packages/middlewares/isAuthenticated";
import { isSeller } from "@packages/middlewares/authorizeRoles";

const authRouter: Router = express.Router();

authRouter.post("/user-registration", registerUser);
authRouter.post("/verify-user", verifyUser);
authRouter.post("/login-user",loginUser);
authRouter.post("/forgot-password-user",userForgotPassword);
authRouter.post("/reset-password-user",resetUserPassword);
authRouter.post("/verify-forgot-password-user",verifyForgotPasswordOtp);
authRouter.post("/refresh-token",refreshToken);
authRouter.post("/seller-registration", registerSeller);
authRouter.post("/verify-seller", verifySeller);
authRouter.post("/create-shop",createShop);
authRouter.post("/create-stripe-link", createStripeConnectLink);
authRouter.post("/login-seller", loginSeller);

//Secure Route
// This route is protected by the isAuthenticated middleware
authRouter.get("/logged-in-user", isAuthenticated,getUser);
authRouter.get("/logged-in-seller", isAuthenticated,isSeller, getSeller);

export default authRouter;