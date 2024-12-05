"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function SubjectPage() {
    const [topics, setTopics] = useState<{ name: string }[]>([]);
    const [subjectName, setSubjectName] = useState<string>("");
    const [newTopic, setNewTopic] = useState<string>("");
    const router = useRouter();
    const params = useParams();
    const semesterName = params.semesterName;
    const subjectNameParam = params.subjectName;

    const fetchTopics = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("Please log in to access this page.");
            router.push("/login");
            return;
        }

        try {
            const response = await fetch(`/api/documents/semesters/${semesterName}/${subjectNameParam}`, {
                headers: { "user-id": userId },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch topics");
            }

            const data = await response.json();
            setSubjectName(data.name);
            setTopics(data.topics || []);
        } catch (error) {
            console.error("Error fetching topics:", error);
            alert("Could not load topics.");
        }
    };

    const addTopic = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("Login to access this page");
            router.push("/login");
            return;
        }

        if (!newTopic.trim()) {
            alert("Topic name cannot be empty");
            return;
        }

        try {
            const response = await fetch(`/api/documents/semesters/${semesterName}/${subjectNameParam}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "user-id": userId,
                },
                body: JSON.stringify({ topic: newTopic.trim() }),
            });

            if (!response.ok) {
                throw new Error("Failed to add topic");
            }

            const data = await response.json();
            setTopics(data.topics);
            setNewTopic("");
        } catch (error) {
            console.error("Error adding topic:", error);
            alert("Could not add topic");
        }
    };

    useEffect(() => {
        if (semesterName && subjectNameParam) {
            fetchTopics();
        }
    }, [semesterName, subjectNameParam]);

    if (!subjectName) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">{subjectName}</h1>

            <div className="mt-8">
                <h2 className="text-lg font-semibold">Topics</h2>
                <ul className="mt-4">
                    {topics.length > 0 ? (
                        topics.map((topic, index) => (
                            <li key={index} className="mb-2">
                                {topic.name}
                            </li>
                        ))
                    ) : (
                        <li className="text-gray-500">No topics available</li>
                    )}
                </ul>

                <div className="mt-4">
                    <input
                        type="text"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        placeholder="New Topic"
                        className="border p-2 rounded mr-2"
                    />
                    <button
                        onClick={addTopic}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Add Topic
                    </button>
                </div>
            </div>
        </div>
    );
}