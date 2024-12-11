"use client";

import { useState, useEffect } from "react";

interface File {
    _id: string;
    filename: string;
    uploadDate: string;
    length: number;
    metadata: {
        userId: string;
        semesterId?: string;
        subjectId?: string;
        topicId?: string;
    };
}

interface FileDisplayProps {
    semesterId?: string;
    subjectId?: string;
    topicId?: string;
}

const DisplayFiles: React.FC<FileDisplayProps> = ({ semesterId, subjectId, topicId }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiles = async () => {
            setLoading(true);

            try {
                const params = new URLSearchParams();
                if (semesterId) params.append("semesterId", semesterId);
                if (subjectId) params.append("subjectId", subjectId);
                if (topicId) params.append("topicId", topicId);

                const queryUrl = `/api/documents/files?${params.toString()}`;
                console.log("Fetching files with URL: ", queryUrl); // 🛠️ Log for debugging

                const response = await fetch(queryUrl, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch files");
                }

                const data = await response.json();
                console.log("Files received: ", data); // 🛠️ Log for debugging
                setFiles(data);
            } catch (error: any) {
                console.error("Error fetching files: ", error);
            } finally {
                setLoading(false);
            }
        };

        console.log("SemesterId: ", semesterId, " SubjectId: ", subjectId, " TopicId: ", topicId); // 🛠️ Log for debugging
        fetchFiles();
    }, [semesterId, subjectId, topicId]);

    if (loading) {
        return <p>Loading files...</p>;
    }

    if (files.length === 0) {
        return <p>No files found for the selected filters.</p>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Files</h2>
            <ul className="list-disc pl-5">
                {files.map((file) => (
                    <li key={file._id} className="mb-4 p-2 border rounded-lg shadow-sm bg-gray-100">
                        <p>
                            <strong>Filename:</strong> {file.filename}
                        </p>
                        <p>
                            <strong>Uploaded on:</strong> {new Date(file.uploadDate).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>Size:</strong> {(file.length / 1024).toFixed(2)} KB
                        </p>
                        <p>
                            <strong>Path:</strong> 
                            <span className="text-sm text-gray-600">
                                /{file.metadata.userId} 
                                {file.metadata.semesterId ? ` / ${file.metadata.semesterId}` : ""} 
                                {file.metadata.subjectId ? ` / ${file.metadata.subjectId}` : ""} 
                                {file.metadata.topicId ? ` / ${file.metadata.topicId}` : ""}
                            </span>
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DisplayFiles;