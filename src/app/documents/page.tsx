"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

import FileDisplay from '@/app/components/DisplayFiles';
import { parseParameter } from "next/dist/shared/lib/router/utils/route-regex";

const Documents = () => {
    const [semesters, setSemesters] = useState<{ id: string; name: string; subjects: string[] }[]>([]);
    const [name, setName] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkUserAuthentication = async () => {
            try {
                const storedUserId = localStorage.getItem('userId');

                if (!storedUserId) {
                    router.push('/login');
                    return;
                }

                setUserId(storedUserId);

                const authResponse = await fetch('/api/auth/verify', {
                    method: 'GET',
                    headers: { 'user-id': storedUserId }
                });

                if (authResponse.status === 401) {
                    router.push('/login');
                    return;
                }

                const authData = await authResponse.json();
                if (!authData.isLoggedIn) {
                    router.push('/login');
                    return;
                }

                await fetchSemesters(storedUserId);
            } catch (error) {
                console.error('Error during authentication check: ', error);
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        }

        checkUserAuthentication();
    }, []);

    const fetchSemesters = async (userId: string) => {
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

    if (isLoading) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            </div>
        );
    }

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
            <FileDisplay/>
        </div>
    );
};

export default Documents;