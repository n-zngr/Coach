"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import FileDisplay from "@/app/components/DisplayFiles";

const SubjectPage = () => {
    const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
    const [name, setName] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const semesterId = params.semesterId as string;
    const subjectId = params.subjectId as string;

    useEffect(() => {
        const checkUserAuthentication = async () => {
            try {
                const storedUserId = localStorage.getItem("userId");

                if (!storedUserId) {
                    router.push("/login");
                    return;
                }

                setUserId(storedUserId);

                const authResponse = await fetch("/api/auth/verify", {
                    method: "GET",
                    headers: { "user-id": storedUserId },
                });

                if (authResponse.status === 401) {
                    router.push("/login");
                    return;
                }

                const authData = await authResponse.json();
                if (!authData.isLoggedIn) {
                    router.push("/login");
                    return;
                }

                if (semesterId && subjectId) {
                    await fetchTopics(storedUserId, semesterId, subjectId);
                }
            } catch (error) {
                console.error("Error during authentication check: ", error);
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        };

        checkUserAuthentication();
    }, [semesterId, subjectId]);

    const fetchTopics = async (userId: string, semesterId: string, subjectId: string) => {
        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}/${subjectId}`, {
                method: "GET",
                headers: { "user-id": userId },
            });

            if (response.status === 404) {
                router.push("/404");
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setTopics(data);
            } else {
                console.error("Failed to fetch topics");
                setTopics([]);
            }
        } catch (error) {
            console.error("Error fetching topics:", error);
            setTopics([]);
        }
    };

    const handleSubmit = async () => {
        if (!name || !userId || !semesterId || !subjectId) return;

        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}/${subjectId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "user-id": userId,
                },
                body: JSON.stringify({ name }),
            });

            if (response.ok) {
                const newTopic = await response.json();
                setTopics((prev) => [...prev, newTopic]);
                setName("");
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
            <FileDisplay subjectId={params.subjectId as string}/>
        </div>
    );
};

export default SubjectPage;