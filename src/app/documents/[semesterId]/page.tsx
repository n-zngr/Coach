"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import FileDisplay from "@/app/components/DisplayFiles";

const SemesterPage = () => {
    const [subjects, setSubjects] = useState<{ id: string; name: string; topics: string[] }[]>([]);
    const [name, setName] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const semesterId = params.semesterId as string;

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

                if (semesterId) {
                    await fetchSubjects(storedUserId, semesterId);
                }
            } catch (error) {
                console.error('Error during authentication check: ', error);
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        }

        checkUserAuthentication();
    }, [semesterId]);

    const fetchSubjects = async (userId: string, semesterId: string) => {
        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}`, {
                method: "GET",
                headers: { "user-id": userId },
            });

            if (response.status === 404) {
                router.push('/404');
            }

            if (response.ok) {
                const data = await response.json();
                
                if (Array.isArray(data)) {
                    setSubjects(data);
                } else {
                    console.error('Invalid data format for subjects: ', data);
                    setSubjects([]);
                }
            } else {
                console.error("Failed to fetch subjects");
                setSubjects([]);
            }
        } catch (error) {
            console.error("Error fetching subjects:", error);
            setSubjects([]);
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

    if (isLoading) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            </div>
        );
    }


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
                        <a href={`/documents/${semesterId}/${subject.id}`} className='text-blue-500 underline'>
                            {subject.name}
                        </a>
                    </li>
                ))}
            </ul>
            <h1 className='text-2xl font-semibold my-4'>Documents</h1>
            <FileDisplay semesterId={params.semesterId as string} />

        </div>
    );
};

export default SemesterPage;