"use client";

import { useState, useEffect } from "react";

export default function Documents() {
    const [files, setFiles] = useState<any[]>([]);
    const [semesters, setSemesters] = useState<any[]>([]);
    const [newSemester, setNewSemester] = useState<string>("");

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

    // Add a new semester
    const addSemester = async () => {
        if (!newSemester.trim()) return;

        const res = await fetch("/api/documents/semesters", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "user-id": localStorage.getItem("userId") || "",
            },
            body: JSON.stringify({ name: newSemester }),
        });

        if (res.ok) {
            setNewSemester("");
            fetchSemesters();
        } else {
            alert("Failed to add semester");
        }
    };

    useEffect(() => {
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
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
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
                    {semesters.map((semester) => (
                        <li key={semester._id} className="mb-2">
                            {semester.name}
                        </li>
                    ))}
                </ul>
                <div className="mt-4">
                    <input
                        type="text"
                        placeholder="New Semester"
                        value={newSemester}
                        onChange={(e) => setNewSemester(e.target.value)}
                        className="border p-2 rounded mr-2"
                    />
                    <button
                        onClick={addSemester}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Add Semester
                    </button>
                </div>
            </div>
        </div>
    );
}