"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.message || 'Failed to login');
            }
    
            alert('Login sucessful');
            router.push('/documents');
        } catch (error) {
            console.error('Error loggin in: ', error);
            alert(error instanceof Error ? error.message : 'Unknown error occured');
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
            <button type="button" onClick={() => router.push("/resetPassword")}>Forgot Password?</button>
        </form>
    );
}

export default LoginPage;
