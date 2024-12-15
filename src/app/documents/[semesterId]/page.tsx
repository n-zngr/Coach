"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';

import DisplayFiles from "@/app/components/DisplayFiles";
import RecentFiles from "@/app/components/RecentFiles";
import UploadFile from '@/app/components/UploadFile';

type Topic = {
    id: string;
    name: string;
};

type Subject = {
    id: string;
    name: string;
    topics: Topic[];
};

export default function SemesterPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const router = useRouter();
    const semesterId = params?.semesterId;

    useEffect(() => {
        const authenticateUser = async () => {
            try {
                const response = await fetch('/api/auth', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!response.ok) {
                    console.warn('User not authenticated, redirecting to /login');
                    router.push('/login');
                    return;
                }

                if (semesterId) {
                    await fetchSubjects();
                }
            } catch (error) {
                console.error('Error authenticating user:', error);
                router.push('/login');
            }
        }

        authenticateUser();

        
    }, [semesterId]);

    const fetchSubjects = async () => {
        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    const formattedData: Subject[] = data.map((subject: any) => ({
                        id: subject.id,
                        name: subject.name,
                        topics: (subject.topics || []).map((topic: any) => ({
                            id: topic.id,
                            name: topic.name
                        }))
                    }));
                    setSubjects(formattedData);
                } else {
                    console.error('Failed to fetch subjects');
                    setSubjects([]);
                }
            } else if (response.status === 404) {
                console.error(`Invalid subject page: ${semesterId}`);
                router.back();
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setSubjects([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!name) return;

        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name })
            });

            if (response.ok) {
                const newSubject = await response.json();
                setSubjects((prev) => [...prev, newSubject]);
                setName('');
            } else {
                console.error('Failed to add subject');
            }
        } catch (error) {
            console.error('Error adding subject', error);
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
            {subjects.length === 0 ? (
                <p>No subjects found. Add a new subject to get started.</p>
            ) : (
                <ul className="list-disc pl-5">
                    {subjects.map((subject) => (
                        <li key={subject.id} className="mb-1">
                            <a 
                                href={`/documents/${semesterId}/${subject.id}`} 
                                className="text-blue-500 underline"
                            >
                                {subject.name}
                            </a>
                        </li>
                    ))}
                </ul>
            )}

            <UploadFile />
            <h1 className='text-2xl font-semibold my-4'>Documents</h1>
            <DisplayFiles />
            <h1 className='text-2xl font-semibold my-4'>Recent Documents</h1>
            <RecentFiles />
        </div>
    );
}
