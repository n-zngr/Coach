"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Navigation from '@/app/components/Navigation';
import DisplayFiles from '@/app/components/DisplayFiles';
import RecentFiles from '@/app/components/RecentFiles';
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

type Semester = {
    id: string;
    name: string;
    subjects: Subject[];
};

export default function Documents() {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);
    const router = useRouter();

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

                await fetchSemesters();
            } catch (error) {
                console.error('Error authenticating user:', error);
                router.push('/login');
            }
        }

        authenticateUser();
    }, []);
    
    const fetchSemesters = async () => {
        try {
            const response = await fetch('/api/documents/semesters', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();

                if (Array.isArray(data)) {
                    const formattedData: Semester[] = data.map((semester: any) => ({
                        id: semester.id,
                        name: semester.name,
                        subjects: semester.subjects.map((subject: any) => ({
                            id: subject.id,
                            name: subject.name,
                            topics: subject.topics.map((topic: any) => ({
                                id: topic.id,
                                name: topic.name
                            }))
                        }))
                    }));
                    setSemesters(formattedData);
                } else {
                    console.error('Invalid data format for semesters:', data);
                    setSemesters([]);
                }
            } else {
                console.error('Failed to fetch semesters');
                setSemesters([]);
            }
        } catch (error) {
            console.error('Error fetching semesters:', error);
            setSemesters([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!name) return;

        try {
            const response = await fetch('/api/documents/semesters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ name }),
            });

            if (response.ok) {
                const newSemester = await response.json();
                setSemesters((prev) => [...prev, newSemester]);
                setName('');
            } else {
                console.error('Failed to add semester');
            }
        } catch (error) {
            console.error('Error adding semester:', error);
        }
    };

    const toggleNavigation = () => {
        setIsExpanded(!isExpanded);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <Navigation isExpanded={isExpanded} toggleNavigation={toggleNavigation} />
            <div className={`flex-1 p-16 transition-all duration-300 ${
                    isExpanded ? "ml-64" : "ml-12"
                }`}
                >
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

                <UploadFile />
                <RecentFiles />
                <h1 className='text-2xl font-semibold my-4'>Documents</h1>
                <DisplayFiles />
            </div>
        </div>
    );
};