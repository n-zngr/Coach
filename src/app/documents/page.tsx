"use client";

import { useState, useEffect } from "react";

export default function Documents() {
    const [file, setFile] = useState<File | null>(null);
    const [files, setFiles] = useState<any[]>([]);

    const fetchFiles = async () => {
        const res = await fetch("/api/documents/files");
        const data = await res.json();
        setFiles(data);
    };

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
                fetchFiles();
            } else {
                alert("Failed to upload file");
            }
        };
    };

    const handleDownload = async (id: string, name: string) => {
        const res = await fetch(`/api/documents/download/${id}`);
        const blob = await res.blob();

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = name;
        link.click();
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">Documents</h1>
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
                <h2 className="text-lg font-semibold">Files</h2>
                <ul className="mt-4">
                    {files.map((file) => (
                        <li key={file._id} className="flex justify-between items-center mb-2">
                            <span>{file.filename}</span>
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

