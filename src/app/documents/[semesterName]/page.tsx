"use client";

import { useState, useEffect } from "react";

export default function Semester({ params }: { params: { semesterName: string } }) {
    const [file, setFile] = useState<File | null>(null);
    const [files, setFiles] = useState<any[]>([]);

    // Fetch files from the database
    const fetchFiles = async () => {
        const res = await fetch("/api/documents/files");
        const data = await res.json();
        setFiles(data); // Assume API returns all files, including metadata like semester
    };

    // Handle file upload
    const handleUpload = async () => {
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async () => {
            const base64Content = reader.result?.toString().split(",")[1];
            const res = await fetch("/api/documents/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileName: file.name,
                    fileContent: base64Content,
                }),
            });
            if (res.ok) {
                alert("File uploaded successfully");
                fetchFiles(); // Refresh the files list
            } else {
                alert("Failed to upload file");
            }
        };
    };

    // Handle file download
    const handleDownload = async (id: string, name: string) => {
        const res = await fetch(`/api/documents/download/${id}`);
        const blob = await res.blob();

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = name;
        link.click();
    };

    // Fetch files when the component mounts
    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <div className="p-4">
            {/* Display the current semester */}
            <h1 className="text-xl font-bold">Semester: {params.semesterName}</h1>
            <div className="mt-4">
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="block mb-2"
                />
                <button
                    onClick={handleUpload}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Upload File
                </button>
            </div>
            <div className="mt-8">
                <h2 className="text-lg font-semibold">All Files</h2>
                <ul className="mt-4">
                    {files.map((file) => (
                        <li key={file._id} className="flex justify-between items-center mb-2">
                            {/* Display the file's name and its associated semester */}
                            <span>
                                {file.filename}{" "}
                                <span className="text-gray-500 text-sm">
                                    (Semester: {file.semester || "Unknown"})
                                </span>
                            </span>
                            <button
                                onClick={() => handleDownload(file._id, file.filename)}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Download
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}