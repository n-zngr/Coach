"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const SemesterPage = () => {
    const [subjects, setSubjects] = useState<{ id: string; name: string; topics: string[] }[]>([]);
    const [name, setName] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const params = useParams(); // Using `useParams` hook
    const semesterId = params.semesterId as string; // Dynamically extract `semesterId`

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId && semesterId) {
            setUserId(storedUserId);
            fetchSubjects(storedUserId, semesterId);
        }
    }, [semesterId]);

    const fetchSubjects = async (userId: string, semesterId: string) => {
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
        </div>
    );
};

export default SemesterPage;
