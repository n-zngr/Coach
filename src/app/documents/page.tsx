"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import FileDisplay from '@/app/components/DisplayFiles';

const Documents = () => {
    const [semesters, setSemesters] = useState<{ id: string; name: string; subjects: string[] }[]>([]);
    const [name, setName] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();

    const verifyLogin = async () => {
        const userIdFromStorage = localStorage.getItem('userId');

        if (!userIdFromStorage) {
            router.push('/login');
            return false;
        }

        setUserId(userIdFromStorage);

        try {
            const response = await fetch('api/auth/verify', {
                headers: { 'user-id': userIdFromStorage }
            });

            if (!response.ok) {
                router.push('/login');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error verifying login: ', error);
            router.push('/login');
            return false;
        }
    };

    const fetchSemesters = async () => {
        if (!userId) return;

        try {
            const response = await fetch("/api/documents/semesters", {
                method: "GET",
                headers: { "user-id": userId },
            });

            if (response.ok) {
                const data = await response.json();

                if (Array.isArray(data)) {
                    setSemesters(data);
                } else {
                    console.error("Invalid data format for semesters:", data);
                    setSemesters([]);
                }
            } else {
                console.error("Failed to fetch semesters");
                setSemesters([]);
            }
        } catch (error) {
            console.error("Error fetching semesters:", error);
            setSemesters([]);
        }
    };


    const handleSubmit = async () => {
        if (!name || !userId) return;

        try {
            const response = await fetch("/api/documents/semesters", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "user-id": userId,
                },
                body: JSON.stringify({ name }),
            });

            if (response.ok) {
                const newSemester = await response.json();
                setSemesters((prev) => [...prev, newSemester]);
                setName("");
            } else {
                console.error("Failed to add semester");
            }
        } catch (error) {
            console.error("Error adding semester:", error);
        }
    };


    useEffect(() => {
        const initializePage = async () => {
            const loggedIn = await verifyLogin();
            if (loggedIn) {
                fetchSemesters();
            }
        }

        initializePage();
    }, [userId]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Semesters</h1>
            <div className="mb-4">
                <input
                    type="text"
                    className="border rounded p-2 w-full"
                    placeholder="Semester Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                    onClick={handleSubmit}
                >
                    Add Semester
                </button>
            </div>
            <h2 className="text-xl font-semibold mb-2">Semesters</h2>
            <ul className="list-disc pl-5">
                {semesters.map((semester) => (
                    <li key={semester.id} className="mb-1">
                        <a href={`/documents/${semester.id}`} className="text-blue-500 underline">
                            {semester.name}
                        </a>
                    </li>
                ))}
            </ul>

            <h1 className='text-2xl font-semibold my-4'>Documents</h1>
            <FileDisplay />
        </div>
    );
};

export default Documents;
