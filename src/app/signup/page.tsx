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
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const { fullname, email, password, confirmPassword } = formData;
  
    // Client-side validation
    if (!fullname || !email || !password || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }
  
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    setError(null); // Reset error
  
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
        // Redirect user to a success page or login
        alert("User registered successfully!");
        router.push("/login"); // Or another page after successful signup
      } else {
        setError(data.message || "Failed to register user.");
      }
    } catch (error) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };  

  return (
    <div className="signup-form">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="fullname">Full Name</label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            value={formData.fullname}
            onChange={handleInputChange}
            className="text-black"
            required
          />
        </div>

        <div>
          <label htmlFor="email">E-Mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="text-black"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="text-black"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="text-black"
            required
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignupPage;