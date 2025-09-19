import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from "../utils/auth.helper";
import { AuthError, ValidationError } from "@packages/error_handler";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookies";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
   apiVersion: "2025-08-27.basil",
});


//Register User 
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "user");
        const { name, email } = req.body;

        const existingUser = await prisma.users.findUnique({ where: { email } });

        if (existingUser) {
            throw next(new ValidationError("User Exists with this email"));
        }
        await checkOtpRestrictions(email, next);

        await trackOtpRequests(email, next);

        await sendOtp(name, email, "user-activation-email");
        res.status(200).json({
            message: "OTP sent to email. Please verify your account"
        })

    } catch (error) {
        next(error);
    }

}

//Verify User with otp
export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, password, name } = req.body;
        if (!email || !otp || !password || !name) {
            return next(new ValidationError("All Fields are Required!!!"));
        }

        const existingUser = await prisma.users.findUnique({ where: { email } });

        if (existingUser) {
            throw next(new ValidationError("User Exists with this email"));
        }

        await verifyOtp(email, otp, next);

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: { name, email, password: hashedPassword },
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully"
        });
    } catch (error) {
        return next(error);
    }
}

//Login User
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ValidationError("All Fields are required"));
        }

        const user = await prisma.users.findUnique({ where: { email } });

        if (!user) {
            return next(new AuthError("User does not exist"));
        }

        // verify password
        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            return next(new AuthError("Invalid email or password"));
        }

        res.clearCookie("seller-access-token");
        res.clearCookie("seller-refresh-token");

        // Generate access and refresh token
        const accessToken = jwt.sign(
            { id: user.id, role: 'user' },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id, role: 'user' },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: '7d' }
        );

        //store the refresh and the access token in the httpOnly secure cookie

        setCookie(res, "refresh_token", refreshToken);
        setCookie(res, "access_token", accessToken);

        res.status(200).json({
            message: "Login Successfull",
            user: { id: user.id, email: user.email, name: user.name }
        });


    } catch (error) {
        next(error);
    }
}


//user forgot password
export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await handleForgotPassword(req, res, next, "user");

}

// Reset User Password
export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        return next(new ValidationError("Email and New Password are required"));
    }
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
        return next(new ValidationError("User not Found!!!"));
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password!);

    if (isSamePassword) {
        return next(new ValidationError("New Password is same as the previous One"));
    }

    //hash the new password 
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
        where: { email },
        data: { password: hashedPassword }
    });

    res.status(200).json({
        message: "Password reset Successfully!!"
    });
}

// Verify Forgot Password OTP
export const verifyUserForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await verifyForgotPasswordOtp(req, res, next);
}

// Refresh Token
export const refreshToken = async (req: any, res: Response, next: NextFunction) => {
    try {
        const refresh_token = req.cookies.refresh_token ||
            req.cookies["refresh_token"] ||
            req.cookies["seller-refresh-token"] ||
            req.headers.authorization?.split(" ")[1];

        if (!refresh_token) {
            throw new ValidationError("Unauthorized: No refresh token provided");
        }

        // Verify the refresh token
        const decoded = jwt.verify(
            refresh_token,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as { id: string, role: string };

        if (!decoded || !decoded.id || !decoded.role) {
            return new JsonWebTokenError("Invalid refresh token");
        }

        let account;
        if (decoded.role === "user") {
            account = await prisma.users.findUnique({ where: { id: decoded.id } });
        }
        else if (decoded.role === "seller") {
            account = await prisma.sellers.findUnique({
                where: { id: decoded.id },
                include: {
                    Shop: true,
                }
            });
        }


        if (!account) {
            return new AuthError("User not found");
        }
        // Generate a new access token
        const newAccessToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: '15m' }
        );

        // Set the new access token in the cookie
        if (decoded.role === "user") {
            setCookie(res, "access_token", newAccessToken);
        }
        else if (decoded.role === "seller") {
            setCookie(res, "seller-access-token", newAccessToken);
        }

        req.role = decoded.role;

        res.status(200).json({
            message: "Access token refreshed successfully",
            newAccessToken
        });
    } catch (error) {
        next(error);
    }
}


// get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        console.log("get User");
        const user = req.user;
        console.log(user);
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
}


// register a new seller 
export const registerSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "seller");
        const { name, email } = req.body;

        const existingSeller = await prisma.sellers.findUnique({ where: { email } });

        if (existingSeller) {
            throw new ValidationError("Seller Exists with this email");
        }
        await checkOtpRestrictions(email, next);

        await trackOtpRequests(email, next);

        await sendOtp(name, email, "seller-activation");
        res.status(200).json({
            message: "OTP sent to email. Please verify your account"
        });

    } catch (error) {
        next(error);
    }
}

//verify seller with otp
export const verifySeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, password, name, phone_number, country } = req.body;

        if (!email || !otp || !password || !name || !phone_number || !country) {
            return next(new ValidationError("All Fields are Required!!!"));
        }

        const existingSeller = await prisma.sellers.findUnique({ where: { email } });

        if (existingSeller) {
            throw new ValidationError("Seller Exists with this email");
        }

        await verifyOtp(email, otp, next);

        const hashedPassword = await bcrypt.hash(password, 10);

        const seller = await prisma.sellers.create({
            data: { name, email, password: hashedPassword, phone_number, country },
        });

        res.status(201).json({
            success: true,
            message: "Seller registered successfully",
            data: seller
        });
    } catch (error) {
        next(error);
    }
}

//create a new shop for the seller
export const createShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, bio, address, website, category, sellerId } = req.body;

        if (!name || !bio || !address || !sellerId || !category) {
            return next(new ValidationError("All Fields are Required!!!"));
        }

        const shopData = {
            name,
            bio,
            address,
            category,
            website,
            sellerId
        }

        if (website && website.trim() !== "") {
            shopData.website = website;
        }

        const shop = await prisma.shops.create({
            data: shopData,
        });

        res.status(201).json({
            success: true,
            message: "Shop created successfully",
            shop
        });
    } catch (error) {
        next(error);
    }
}

//create stripe connect account link
export const createStripeConnectLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sellerId } = req.body;

        if (!sellerId) {
            return next(new ValidationError("Seller ID is required"));
        }

        const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });

        if (!seller) {
            return next(new ValidationError("Seller not found"));
        }

        const account = await stripe.accounts.create({
            country: "GB",
            email: seller.email ?? undefined,
            controller: {
                fees: { payer: 'application' },               // typical for platform-controlled fees
                losses: { payments: 'application' },          // typical for platform-controlled losses
                stripe_dashboard: { type: 'express' },        // this replaces type: 'express'
            },
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });


        await prisma.sellers.update({
            where: { id: sellerId },
            data: { stripeId: account.id },
        });

        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `http://localhost:3000/success`,
            return_url: `http://localhost:3000/success`,
            type: 'account_onboarding',
        });

        res.json({
            url: accountLink.url,
        });

    } catch (error) {
        next(error);
    }
}


//login seller
export const loginSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ValidationError("All Fields are required"));
        }

        const seller = await prisma.sellers.findUnique({ where: { email } });

        if (!seller) {
            return next(new AuthError("Seller does not exist"));
        }

        // verify password
        const isMatch = await bcrypt.compare(password, seller.password!);
        if (!isMatch) {
            return next(new AuthError("Invalid email or password"));
        }

        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        // Generate access and refresh token
        const accessToken = jwt.sign(
            { id: seller.id, role: 'seller' },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: seller.id, role: 'seller' },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: '7d' }
        );

        //store the refresh and the access token in the httpOnly secure cookie

        setCookie(res, "seller-refresh-token", refreshToken);
        setCookie(res, "seller-access-token", accessToken);

        res.status(200).json({
            message: "Login Successfull",
            seller: { id: seller.id, email: seller.email, name: seller.name }
        });

    } catch (error) {
        next(error);
    }
}

//get logged in seller
export const getSeller = async (req: any, res: Response, next: NextFunction) => {
    try {
        const seller = req.seller;
        res.status(200).json({
            success: true,
            seller,
        });
    } catch (error) {
        next(error);
    }
}