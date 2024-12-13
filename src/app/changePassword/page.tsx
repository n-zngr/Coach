"use client"

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

const ChangePassword = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleChangePassword = async () => {
    if (!email || typeof email !== 'string') {
      setMessage('Email is required');
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('Error changing password');
    }
  };

  return (
    <div>
      <h1>Change Password</h1>
      {email ? <p>Updating password for: {email}</p> : <p>No email provided</p>}
      <input
        type="password"
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="text-black"
      />
      <button onClick={handleChangePassword}>Change Password</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ChangePassword;
