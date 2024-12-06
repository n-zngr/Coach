"use client";

import { useState } from "react";
import { useRouter } from "next/router";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(""); // Reset error state

    try {
      const response = await fetch('./api/email_pwreset', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      // Check if the response is ok (status 200-299)
      if (!response.ok) {
        // If response status is not OK, handle the error
        const errorMessage = await response.text(); // Read the response body as text
        throw new Error(errorMessage);
      }

      const data = await response.json(); // Parse the response as JSON

      if (data.objectId) {
        // Navigate to the password reset page with the ObjectId
        const router = useRouter();
        router.push(`/pwreset/${data.objectId}`);
      } else {
        setError("Email not registered.");
      }
    } catch (error) {
      console.error("Error submitting email:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <form onSubmit={handleEmailSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="text-black"
          required
        />
        <button type="submit">Submit</button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
};

export default ForgotPasswordPage;
