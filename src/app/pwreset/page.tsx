"use client";

import { useState } from "react";
import { useRouter } from "next/router";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { userId } = router.query;

  const handleResetPassword = async () => {
    if (!userId) {
      setError("Invalid user ID");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/pwreset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword: password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message);
        return;
      }
      
      setSuccess("Password reset successfully!");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="text-black"
        placeholder="Enter new password"
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="text-black"
        placeholder="Confirm new password"
      />
      <button onClick={handleResetPassword}>Reset Password</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};

export default ResetPasswordPage;
