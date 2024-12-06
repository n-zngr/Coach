"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const SubjectPage = () => {
    const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
    const [name, setName] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const params = useParams();
    const router = useRouter();
    const semesterId = params.semesterId as string;
    const subjectId = params.subjectId as string;

    const verifyLogin = async () => {
        const userIdFromStorage = localStorage.getItem("userId");

        if (!userIdFromStorage) {
            router.push("/login");
            return false;
        }

        setUserId(userIdFromStorage);

        try {
            const response = await fetch("/api/auth/verify", {
                headers: {
                    "user-id": userIdFromStorage,
                },
            });

            if (!response.ok) {
                router.push("/login");
                return false;
            }

            return true;
        } catch (error) {
            console.error("Error verifying login:", error);
            router.push("/login");
            return false;
        }
    };

    const fetchTopics = async () => {
        if (!userId || !semesterId || !subjectId) return;

        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}/${subjectId}`, {
                method: "GET",
                headers: { "user-id": userId },
            });

            if (response.ok) {
                const data = await response.json();
                setTopics(data);
            } else {
                console.error("Failed to fetch topics");
            }
        } catch (error) {
            console.error("Error fetching topics:", error);
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

    useEffect(() => {
        const initializePage = async () => {
            const loggedIn = await verifyLogin();
            if (loggedIn) {
                fetchTopics();
            }
        };

        initializePage();
    }, [semesterId, subjectId]);

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
                        {topic.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SubjectPage;