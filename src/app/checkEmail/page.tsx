"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CheckEmail = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleCheckEmail = async () => {
    try {
      const response = await fetch('/api/checkEmail', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.message === 'User found') {
        router.push(`/change-password?email=${email}`);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Error checking email');
    }
  };

  return (
    <div>
      <h1>Check Email</h1>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="text-black"
      />
      <button onClick={handleCheckEmail}>Check Email</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CheckEmail;
