"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import DisplayFiles from "@/app/components/DisplayFiles";
import RecentFiles from "@/app/components/RecentFiles";

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

export default function SemesterPage({ params }: { params: { semesterId: string } }) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { semesterId } = params;

    useEffect(() => {
        if (semesterId) {
            fetchSubjects();
        }
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
                    console.error('Invalid data format for subjects', data);
                    setSubjects([]);
                }
            } else {
                console.error('Failed to fetch subjects:');
                setSubjects([]);
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
                            {subject.topics.length > 0 && (
                                <ul className="list-inside list-disc pl-5">
                                    {subject.topics.map((topic) => (
                                        <li key={topic.id}>{topic.name}</li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <h1 className='text-2xl font-semibold my-4'>Documents</h1>
            <DisplayFiles />
            <h1 className='text-2xl font-semibold my-4'>Recent Documents</h1>
            <RecentFiles />
        </div>
    );
}