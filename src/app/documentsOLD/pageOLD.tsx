"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Documents() {
    const [files, setFiles] = useState<any[]>([]);
    const [semesters, setSemesters] = useState<any[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [newSemester, setNewSemester] = useState<string>("");
    const router = useRouter();

    const verifyLogin = async () => {
        const res = await fetch("/api/auth/verify", {
            headers: {
                "user-id": localStorage.getItem("userId") || "",
            },
        });

        if (!res.ok) {
            router.push("/login");
        }
    };

    // Fetch files
    const fetchFiles = async () => {
        const res = await fetch("/api/documents/files");
        const data = await res.json();
        setFiles(data);
    };

    // Fetch semesters
    const fetchSemesters = async () => {
        const res = await fetch("/api/documents/semesters", {
            headers: {
                "user-id": localStorage.getItem("userId") || "",
            },
        });
        const data = await res.json();
        setSemesters(data);
    };

    // Fetch subjects for a semester
    const fetchSubjects = async (semesterName: string) => {
        const res = await fetch(`/api/documents/semesters/${semesterName}`);
        const data = await res.json();
        setSubjects(data.subjects || []);
    };

    // Handle semester selection
    const handleSemesterSelect = (semesterName: string) => {
        setSelectedSemester(semesterName);
        fetchSubjects(semesterName);
    };

    const addSemester = async () => {
        if (!newSemester.trim()) return; // Ensure the semester name is not empty

        const res = await fetch("/api/documents/semesters", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "user-id": localStorage.getItem("userId") || "",
            },
            body: JSON.stringify({ name: newSemester }),
        });

        if (res.ok) {
            setNewSemester(""); // Clear the input field after adding
            fetchSemesters(); // Refresh the list of semesters
        } else {
            alert("Failed to add semester");
        }
    };

    useEffect(() => {
        verifyLogin();
        fetchFiles();
        fetchSemesters();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">Documents</h1>

            {/* Files Section */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold">Files</h2>
                <ul className="mt-4">
                    {files.map((file) => (
                        <li key={file._id} className="flex justify-between items-center mb-2">
                            <span>{file.filename}</span>
                            <button className="bg-green-500 text-white px-4 py-2 rounded">
                                Download
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Semesters Section */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold">Semesters</h2>
                <ul className="mt-4">
                    {Array.isArray(semesters) && semesters.length > 0 ? (
                        semesters.map((semester) => (
                            <li
                                key={semester.name}
                                className="mb-2 cursor-pointer"
                                onClick={() => handleSemesterSelect(semester.name)}
                            >
                                {semester.name}
                            </li>
                        ))
                    ) : (
                        <li className="text-gray-500">No semesters available</li>
                    )}
                </ul>

                {/* Add New Semester Section */}
                <div className="mt-4">
                    <input
                        type="text"
                        placeholder="New Semester"
                        value={newSemester}
                        onChange={(e) => setNewSemester(e.target.value)}
                        className="border p-2 rounded mr-2"
                    />
                    <button
                        onClick={addSemester} // The function is now defined
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Add Semester
                    </button>
                </div>
            </div>

            {/* Subjects Section */}
            {selectedSemester && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold">Subjects for {selectedSemester}</h2>
                    <ul className="mt-4">
                        {subjects.length > 0 ? (
                            subjects.map((subject) => (
                                <li key={subject} className="mb-2">
                                    {subject}
                                </li>
                            ))
                        ) : (
                            <li className="text-gray-500">No subjects available</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}