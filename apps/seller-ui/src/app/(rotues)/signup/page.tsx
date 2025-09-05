"use client"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { countries } from '../../utils/countries';
import CreateShop from 'apps/seller-ui/src/shared/modules/auth/create-shop';
import StripeLogo from 'apps/seller-ui/src/assets/svgs/stripelogo';


type FormData = {
    name: string;
    email: string;
    phone_number: string;
    country: string;
    password: string;
}

const SignUp = () => {
    const [activeStep, setActiveStep] = useState(1);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showOtp, setShowOtp] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [sellerId, setSellerId] = useState<string | null>(null);
    const [timer, setTimer] = useState(60);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [sellerData, setSellerData] = useState<FormData | null>(null);
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
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/seller-registration`,
                data
            );
            return response.data;
        }, onSuccess: (_, formData) => {
            setSellerData(formData);
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
            if (!sellerData) return;
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-seller`,
                {
                    ...sellerData,
                    otp: otp.join(""),
                }
            );
            return response.data;
        },
        onSuccess: (data) => {
            console.log("OTP verified successfully:", data);
            setSellerId(data?.data?.id); // ✅ Correct
            console.log("Seller Id Success :", data?.data?.id);
            setActiveStep(2);
        }
    });



    const resendOtp = () => {
        if (sellerData) {
            signupMutation.mutate(sellerData);
        }
    }

    const connectStripe = async () => {
        console.log("Connecting to Stripe with sellerId:", sellerId);
        if (!sellerId) return;
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-stripe-link`,
                { sellerId }
            );
            if (response.data.url) {
                // Redirect to Stripe link  
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Error connecting to Stripe:', error);
        }
    }

    return (

        <div className='w-full flex flex-col items-center pt-10 h-screen'>
            {/* {Stepper} */}
            <div className='relative flex items-center justify-between md:w-[50%] mb-8'>
                <div className='absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10' />
                {[1, 2, 3].map((step) => (
                    <div key={step} >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center
                     text-white font-bold 
                     ${step <= activeStep ? 'bg-blue-600' : 'bg-gray-500'}`}>
                            {step}
                        </div>
                        <span className='ml-[-15]'>
                            {step === 1 ? "Create Account" : step === 2 ? "Setup Shop" : "Connect Bank"}
                        </span>
                    </div>
                ))}
            </div>
            {/* Step Connect  */}
            <div className='md:w-[480px] p-8 bg-white shadow rounded-lg'>
                {activeStep === 1 && (
                    <>
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

                                <label className="block text-gray-700 mb-1">Phone Number</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="1234567890"
                                        className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
                                        {...register("phone_number", {
                                            required: "Phone number is required",
                                            pattern: {
                                                value: /^[0-9]{10}$/,
                                                message: "Invalid phone number",
                                            },
                                        })}
                                    />
                                    {errors.phone_number && (
                                        <p className="text-red-500"> {String(errors.phone_number.message)}
                                        </p>
                                    )}
                                </div>
                                <label className="block text-gray-700 mb-1">Country</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
                                        {...register("country", { required: "Country is required" })}
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map((country) => (
                                            <option key={country.code} value={country.name}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.country && (
                                        <p className="text-red-500"> {String(errors.country.message)}
                                        </p>
                                    )}
                                </div>

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
                                {signupMutation.isError && signupMutation.error instanceof AxiosError && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {signupMutation.error.response?.data?.message || signupMutation.error.message || "An error occurred"}
                                    </p>
                                )}
                                <p className="text-center text-sm mt-4">
                                    Already have an account?{" "}
                                    <Link href={"/login"} className="text-blue-500 cursor-pointer">
                                        Login
                                    </Link>
                                </p>
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
                                        console.log("Verify button clicked", sellerData, otp.join(""));
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
                    </>
                )}

                {activeStep === 2 && (
                    <>
                        <CreateShop
                            sellerId={sellerId || ""}
                            setActiveStep={setActiveStep}
                        />
                    </>
                )}

                {activeStep === 3 && (
                    <div className='text-center'>
                        <h3 className='text-2xl font-semibold'>Withdraw Method</h3>
                        <br />
                        <button
                            className="w-full flex items-center justify-center gap-4 text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg"
                            onClick={connectStripe}>
                            Connect Stripe <StripeLogo />
                        </button>
                    </div>
                )}

            </div>
        </div>



    )
}

export default SignUp;
