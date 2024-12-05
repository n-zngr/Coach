"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function SemesterPage() {
    const [subjects, setSubjects] = useState<string[]>([]);
    const [semesterName, setSemesterName] = useState<string>("");
    const [newSubject, setNewSubject] = useState<string>("");
    const router = useRouter();
    const params = useParams();
    const semesterNameParam = params.semesterName;

    const fetchSemesterData = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("Please log in to access this page.");
            router.push("/login");
            return;
        }

        try {
            const response = await fetch(`/api/documents/semesters/${semesterNameParam}`, {
                headers: { "user-id": userId },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch semester data.");
            }

            const data = await response.json();
            setSemesterName(data.name);
            setSubjects(data.subjects || []);
        } catch (error) {
            console.error("Error fetching semester data:", error);
            alert("Could not load semester data.");
        }
    };

    const addSubject = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert("Please log in to access this page.");
            router.push("/login");
            return;
        }

        if (!newSubject.trim()) {
            alert("Subject name cannot be empty");
            return;
        }

        try {
            const response = await fetch(`/api/documents/semesters/${semesterNameParam}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "user-id": userId
                },
                body: JSON.stringify({ subject: newSubject })
            });

            if (!response.ok) {
                throw new Error("Failed to add subject");
            }

            const data = await response.json();
            setSubjects(data.subjects);
            setNewSubject("");
        } catch (error) {
            console.error("Error adding subject", error);
            alert("Could not add subject");
        }
    }

    useEffect(() => {
        if (semesterNameParam) {
            fetchSemesterData();
        }
    }, [semesterNameParam]);

    if (!semesterName) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">{semesterName}</h1>

            <div className="mt-8">
                <h2 className="text-lg font-semibold">Subjects</h2>
                <ul className="mt-4">
                    {subjects.length > 0 ? (
                        subjects.map((subject, index) => (
                            <li key={index} className="mb-2">
                                {subject}
                            </li>
                        ))
                    ) : (
                        <li className="text-gray-500">No subjects available</li>
                    )}
                </ul>

                <div className="mt-4">
                    <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="New Subject"
                        className="border p-2 rounded mr-2"
                    />
                    <button
                        onClick={addSubject}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Add Subject
                    </button>
                </div>
            </div>
        </div>
    );
}
