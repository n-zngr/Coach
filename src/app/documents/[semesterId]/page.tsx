"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import FileDisplay from "@/app/components/DisplayFiles";

const SemesterPage = () => {
    const [subjects, setSubjects] = useState<{ id: string; name: string; topics: string[] }[]>([]);
    const [name, setName] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const params = useParams();
    const router = useRouter();
    const semesterId = params.semesterId as string;

    const verifyLogin = async () => {
        const userIdFromStorage = localStorage.getItem('userId');

        if (!userIdFromStorage) {
            router.push('/login');
            return false;
        }

        setUserId(userIdFromStorage);

        try {
            const response = await fetch('/api/auth/verify', {
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
    }

    const fetchSubjects = async (semesterId: string) => {
        if (!userId) return;

        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}`, {
                method: "GET",
                headers: { "user-id": userId },
            });

            if (response.ok) {
                const data = await response.json();
                setSubjects(data);
            } else {
                console.error("Failed to fetch subjects");
            }
        } catch (error) {
            console.error("Error fetching subjects:", error);
        }
    };


    const handleSubmit = async () => {
        if (!name || !userId || !semesterId) return;

        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "user-id": userId,
                },
                body: JSON.stringify({ name }),
            });

            if (response.ok) {
                const newSubject = await response.json();
                setSubjects((prev) => [...prev, newSubject]);
                setName("");
            } else {
                console.error("Failed to add subject");
            }
        } catch (error) {
            console.error("Error adding subject:", error);
        }
    };


    useEffect(() => {
        const initializePage = async () => {
            const loggedIn = await verifyLogin();
            if (loggedIn && semesterId) {
                fetchSubjects(semesterId);
            }
        }

        initializePage();
    }, [userId, semesterId]);

    

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Subjects</h1>
            <div className="mb-4">
                <input
                    type="text"
                    className="border rounded p-2 w-full"
                    placeholder="Subject Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                    onClick={handleSubmit}
                >
                    Add Subject
                </button>
            </div>
            <h2 className="text-xl font-semibold mb-2">Subjects</h2>
            <ul className="list-disc pl-5">
                {subjects.map((subject) => (
                    <li key={subject.id} className="mb-1">
                        {subject.name}
                    </li>
                ))}
            </ul>
            <h1 className='text-2xl font-semibold my-4'>Documents</h1>
            <FileDisplay semesterId={params.semesterId as string} />
        </div>
    );
};

export default SemesterPage;
