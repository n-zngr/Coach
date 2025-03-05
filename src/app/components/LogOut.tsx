"use client";

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout', { method: 'POST' });

            if (response.ok) {
                router.push('/login');
            } else {
                console.error('Failed to log out');
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    };

    return (
        <button onClick={handleLogout} 
            className="block text-left p-3 rounded-md
            hover:bg-blue-100 dark:hover:bg-blue-800 
            font-semibold text-blue-600 dark:text-blue-400 
            transition-all">
            Log Out
        </button>
    );
}