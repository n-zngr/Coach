"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import FileDisplay from "@/app/components/DisplayFiles";

type Topic = {
    id: string;
    name: string;
};

type Subject = {
    id: string;
    name: string;
    topics: Topic[];
};

const SubjectPage = () => {
    const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const router = useRouter();
    const semesterId = params?.semesterId as string;
    const subjectId = params?.subjectId as string;

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

                if (semesterId && subjectId) {
                    fetchTopics();
                }
            } catch (error) {
                console.error('Error authenticating user:', error);
                router.push('/login');
            }
        }

        authenticateUser();
    }, [semesterId, subjectId]);

    const fetchTopics = async () => {
        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}/${subjectId}`, {
                method: "GET",
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    const formattedData: Topic[] = data.map((topic: any) => ({
                        id: topic.id,
                        name: topic.name
                    }))
                    setTopics(formattedData);
                } else {
                    console.error('Failed to fetch subjects');
                    setTopics([]);
                }
            } else if (response.status === 404) {
                console.error(`Invalid subject page: ${subjectId}`);
                router.back();
            }
        } catch (error) {
            console.error("Error fetching topics:", error);
            setTopics([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!name) return;

        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}/${subjectId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ name }),
            });

            if (response.ok) {
                const newTopic = await response.json();
                setTopics((prev) => [...prev, newTopic]);
                setName('');
            } else {
                console.error("Failed to add topic");
            }
        } catch (error) {
            console.error("Error adding topic:", error);
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
            <h1 className="text-2xl font-bold mb-4">Manage Topics</h1>
            <div className="mb-4">
                <input
                    type="text"
                    className="border rounded p-2 w-full"
                    placeholder="Topic Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                    onClick={handleSubmit}
                >
                    Add Topic
                </button>
            </div>
            <h2 className="text-xl font-semibold mb-2">Topics</h2>
            <ul className="list-disc pl-5">
                {topics.map((topic) => (
                    <li key={topic.id} className="mb-1">
                        <a href={`/documents/${semesterId}/${subjectId}/${topic.id}`} className='text-blue-500 underline'>
                            {topic.name}
                        </a>
                    </li>
                ))}
            </ul>
            <h1 className='text-2xl font-semibold my-4'>Documents</h1>
            <FileDisplay />
        </div>
    );
};

export default SubjectPage;