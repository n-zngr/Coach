"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const SubjectPage = () => {
    const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
    const [name, setName] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const params = useParams();
    const semesterId = params.semesterId as string;
    const subjectId = params.subjectId as string;

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId && semesterId && subjectId) {
            setUserId(storedUserId);
            fetchTopics(storedUserId, semesterId, subjectId);
        }
    }, [semesterId, subjectId]);

    const fetchTopics = async (userId: string, semesterId: string, subjectId: string) => {
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