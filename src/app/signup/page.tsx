"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

function SignupPage() {
    const [formData, setFormData] = useState({
        fullname:"",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { fullname, email, password, confirmPassword } = formData;

        if (!fullname || !email || !password || !confirmPassword) {
            setError("Please fill out all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setError(null);

        try {
            setIsSubmitting(true);
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fullname, email, password, confirmPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push("/login");
            } else {
                setError(data.message || "Failed to register user.");
            }
        } catch (err: any) {
            setError(`An unexpected error occurred: ${err.message || err}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-gradient-to-br from-white-900 to-white-700 dark:bg-gradient-to-br dark:from-black-300 dark:to-black-100">
            <div className="w-16 h-16 fixed top-8 left-8 rounded-lg border border-white-500 dark:border-black-500 text-black-900 dark:text-white-900">
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 20L20 16H8V20H16Z" fill="currentColor"/>
                    <path d="M8 8H16L20 4H8L4 8V20L8 16V8Z" fill="currentColor"/>
                </svg>
            </div>
            <div className="flex flex-col gap-8 m-auto w-full max-w-md">
                <header className="text-left border-b border-gray-500 pb-8">
                    <h2 className="text-2xl font-semibold text-black-100 dark:text-white-900">Create Account</h2>
                    <p className="text-gray-500">Please fill the form to register</p>
                </header>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block font-medium text-black-100 dark:text-white-900">Full Name</label>
                        <input
                            type="text"
                            name="fullname"
                            placeholder="Joe Doe"
                            value={formData.fullname}
                            onChange={handleInputChange}
                            className="w-full block bg-white-700 dark:bg-black-300 rounded-full border border-gray-500 pl-4 py-2 mt-1"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-black-100 dark:text-white-900">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="joe.doe@gmail.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full block bg-white-700 dark:bg-black-300 rounded-full border border-gray-500 pl-4 py-2 mt-1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-black-100 dark:text-white-900">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="p@ssw0rd"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full block bg-white-700 dark:bg-black-300 rounded-full border border-gray-500 pl-4 py-2 mt-1"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 focus:outline-none"
                            >
                                { showPassword ? (
                                    <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16.6823 5.1625C16.8868 5.39219 17 5.6906 17 6C17 6.3094 16.8868 6.60781 16.6823 6.8375C15.3875 8.25 12.4404 11 9 11C5.55961 11 2.61247 8.25 1.3177 6.8375C1.1132 6.60781 1 6.3094 1 6C1 5.6906 1.1132 5.39219 1.3177 5.1625C2.61247 3.75 5.55961 1 9 1C12.4404 1 15.3875 3.75 16.6823 5.1625Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M9 8.5C10.3621 8.5 11.4662 7.38071 11.4662 6C11.4662 4.61929 10.3621 3.5 9 3.5C7.63794 3.5 6.53377 4.61929 6.53377 6C6.53377 7.38071 7.63794 8.5 9 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                ) : (
                                    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.5232 5.96364C15.9918 6.39636 16.3864 6.81636 16.6823 7.14727C16.8868 7.38114 17 7.68497 17 8C17 8.31503 16.8868 8.61886 16.6823 8.85273C15.3875 10.2909 12.4404 13.0909 9 13.0909H8.50675M5.14035 11.9836C3.71196 11.1579 2.4213 10.1009 1.3177 8.85273C1.1132 8.61886 1 8.31503 1 8C1 7.68497 1.1132 7.38114 1.3177 7.14727C2.61247 5.70909 5.55961 2.90909 9 2.90909C10.3561 2.93835 11.6834 3.31911 12.8596 4.01636M15.7821 1L2.21787 15M7.26131 9.79455C6.79817 9.31937 6.53653 8.67401 6.53377 8C6.53377 7.3249 6.79361 6.67746 7.25611 6.20009C7.71862 5.72273 8.34592 5.45455 9 5.45455C9.65303 5.45739 10.2783 5.72743 10.7387 6.20545M11.1456 9.27273C10.9261 9.66002 10.6113 9.98054 10.2331 10.2018" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block font-medium text-black-100 dark:text-white-900">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="p@ssw0rd"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full block bg-white-700 dark:bg-black-300 rounded-full border border-gray-500 pl-4 py-2 mt-1"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 focus:outline-none"
                            >
                                { showConfirmPassword ? (
                                    <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16.6823 5.1625C16.8868 5.39219 17 5.6906 17 6C17 6.3094 16.8868 6.60781 16.6823 6.8375C15.3875 8.25 12.4404 11 9 11C5.55961 11 2.61247 8.25 1.3177 6.8375C1.1132 6.60781 1 6.3094 1 6C1 5.6906 1.1132 5.39219 1.3177 5.1625C2.61247 3.75 5.55961 1 9 1C12.4404 1 15.3875 3.75 16.6823 5.1625Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M9 8.5C10.3621 8.5 11.4662 7.38071 11.4662 6C11.4662 4.61929 10.3621 3.5 9 3.5C7.63794 3.5 6.53377 4.61929 6.53377 6C6.53377 7.38071 7.63794 8.5 9 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                ) : (
                                    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.5232 5.96364C15.9918 6.39636 16.3864 6.81636 16.6823 7.14727C16.8868 7.38114 17 7.68497 17 8C17 8.31503 16.8868 8.61886 16.6823 8.85273C15.3875 10.2909 12.4404 13.0909 9 13.0909H8.50675M5.14035 11.9836C3.71196 11.1579 2.4213 10.1009 1.3177 8.85273C1.1132 8.61886 1 8.31503 1 8C1 7.68497 1.1132 7.38114 1.3177 7.14727C2.61247 5.70909 5.55961 2.90909 9 2.90909C10.3561 2.93835 11.6834 3.31911 12.8596 4.01636M15.7821 1L2.21787 15M7.26131 9.79455C6.79817 9.31937 6.53653 8.67401 6.53377 8C6.53377 7.3249 6.79361 6.67746 7.25611 6.20009C7.71862 5.72273 8.34592 5.45455 9 5.45455C9.65303 5.45739 10.2783 5.72743 10.7387 6.20545M11.1456 9.27273C10.9261 9.66002 10.6113 9.98054 10.2331 10.2018" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 mt-12 px-4 rounded-full 
                        bg-white-700 dark:bg-black-300 hover:bg-white-500 dark:hover:bg-black-500
                        border border-gray-500 focus:outline-none focus:ring-1 focus:ring-white-900
                        text-sm font-medium text-black-100 dark:text-white-900
                        transition-colors duration-200"
                    >
                        {isSubmitting ? "Signing Up..." : "Sign Up"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;