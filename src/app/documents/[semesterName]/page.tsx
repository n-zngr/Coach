"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function SemesterPage() {
    const [subjects, setSubjects] = useState<string[]>([]);
    const [semesterName, setSemesterName] = useState<string>("");
    const router = useRouter();
    const params = useParams();
    const semesterNameParam = params.semesterName;

    // Fetch semester details
    const fetchSemesterData = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("Please log in to access this page.");
            router.push("/login");
            return;
        }

        try {
            // Make sure to use the correct parameter for the API request
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

    useEffect(() => {
        if (semesterNameParam) {
            fetchSemesterData();
        }
    }, [semesterNameParam]);  // Ensure that this dependency listens to changes in semesterNameParam

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
            </div>
        </div>
    );
}
