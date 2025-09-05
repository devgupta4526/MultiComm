"use client"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import GoogleButton from '../../../shared/components/google-button';
import { Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { sign } from 'crypto';

type FormData = {
    name: string;
    email: string;
    password: string;
}

const SignUp = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showOtp, setShowOtp] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [timer, setTimer] = useState(60);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [userData, setUserData] = useState<FormData | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const startResendTimer = () => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const signupMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registration`,
                data
            );
            return response.data;
        }, onSuccess: (_, formData) => {
            setUserData(formData);
            setShowOtp(true);
            setCanResend(false);
            setTimer(60);
            startResendTimer();
        },
    });

    const onSubmit = (data: FormData) => {
        signupMutation.mutate(data);
    }

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]?/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!userData) return;
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-user`,
                {
                    ...userData,
                    otp: otp.join(""),
                }
            );
            return response.data;
        },
        onSuccess: () => {
            router.push("/login");
        }
    });



    const resendOtp = () => {
        if(userData) {
            signupMutation.mutate(userData);
        }
    }

    return (
        <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
            <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
                Sign Up
            </h1>
            <p className="text-center text-lg font-medium py-3 text-[#00000099]">
                Home · Sign Up
            </p>

            <div className="w-full flex justify-center items-center">
                <div className="md:w-[480px] w-1/3 p-8 bg-white  shadow rounded-lg">
                    <h3 className="text-3xl font-semibold text-center mb-2">
                        SignUp to Eshop
                    </h3>
                    <p className='text-center text-grey-500 mb-4'>
                        Already have an account? {" "}
                        <Link href={"/login"} className="text-blue-500">\
                            Login
                        </Link>
                    </p>

                    <GoogleButton />
                    <div className="flex items-center my-5 text-gray-400 text-sm">
                        <div className="flex-1 border-t border-gray-300" />
                        <span className="px-3">or Sign Up with Email</span>
                        <div className="flex-1 border-t border-gray-300" />
                    </div>
                    {!showOtp ? (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <label className="block text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                placeholder="Dev Gupta"
                                className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
                                {...register("name", {
                                    required: " is required",
                                })}
                            />
                            {errors.name && (
                                <p className="text-red-500"> {String(errors.name.message)}
                                </p>
                            )}
                            <label className="block text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="support@becodemy.com"
                                className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/,
                                        message: "Invalid email address",
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="text-red-500"> {String(errors.email.message)}
                                </p>
                            )}

                            <label className="block text-gray-700 mb-1">Password</label>

                            <div className="relative">
                                <input type={passwordVisible ? "text" : "password"}
                                    placeholder="Min. 6 characters"
                                    className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
                                    {...register("password",
                                        {
                                            required: "Password is required",
                                            minLength: { value: 6, message: "Password must be at least 6 characters", },
                                        })} />

                                <button
                                    type="button"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
                                    {passwordVisible ? <Eye /> : <EyeOff />}
                                </button>
                                {errors.password && (
                                    <p className="text-red-500"> {String(errors.password.message)}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={signupMutation.isPending}
                                className="w-full text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg">
                                {signupMutation.isPending ? "Signing Up..." : "Sign Up"}
                            </button>
                            {serverError &&
                                (
                                    <p className="text-red-500 text-sm">
                                        {serverError}
                                    </p>)}
                        </form>
                    ) : (
                        <div>
                            <h3 className="text-xl font-semibold text-center mb-4">
                                Enter ОТР
                            </h3>
                            <div className="flex justify-center gap-6">
                                {otp?.map((digit, index) =>
                                (<input
                                    key={index}
                                    type="text"
                                    ref={(el) => {
                                        if (el) inputRefs.current[index] = el;
                                    }}
                                    maxLength={1}
                                    className="w-12 h-12 text-center border border-gray-300 outline-none"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                />
                                ))}
                            </div>
                            <button
                                disabled={verifyOtpMutation.isPending}
                                onClick={() => {
                                    console.log("Verify button clicked", userData, otp.join(""));
                                    verifyOtpMutation.mutate();
                                }}

                                className='w-full text-lg cursor-pointer mt-4 bg-blue-500 text-white py-2 rounded-lg'>
                                {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                            </button>
                            <p
                                className="text-center text-sm mt-4">
                                {canResend ? (<button onClick={resendOtp}
                                    className="text-blue-500 cursor-pointer" >
                                    Resend OTP
                                </button>)
                                    : (`Resend OTP in ${timer} seconds`

                                    )}
                            </p>
                            {verifyOtpMutation.isError &&
                                verifyOtpMutation.error instanceof Error && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {
                                            verifyOtpMutation.error.message}
                                    </p>
                                )}
                        </div>
                    )}


                </div>
            </div >
        </div >

    )
}

export default SignUp;
