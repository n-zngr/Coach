"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "" });

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to log in.");
            }

            // Store the userId in localStorage upon successful login
            if (data.userId) {
                localStorage.setItem("userId", data.userId);
                alert("Login successful!");
                router.push('/documents');
            } else {
                throw new Error("Login successful, but userId is missing.");
            }
        } catch (error) {
            console.error("Error logging in:", error);
            alert(error instanceof Error ? error.message : "Unknown error occurred");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <input
                type="text"
                name="email"
                placeholder="E-Mail"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
            />
            <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
                Login
            </button>
        </form>
    );
}

export default LoginPage;
