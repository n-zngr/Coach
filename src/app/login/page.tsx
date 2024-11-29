"use client";

import React, { useState } from "react";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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

      alert(data.message);
    } catch (error) {
      console.error("Error logging in:", error);
      alert(error instanceof Error ? error.message : "Unknown error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="email" placeholder="E-Mail" onChange={handleChange} className="text-black" required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} className="text-black" required />
      <button type="submit" onClick={handleSubmit}>Login</button>
    </form>
  );
}

export default LoginPage;
