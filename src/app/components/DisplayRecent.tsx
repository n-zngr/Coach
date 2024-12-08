"use client";

import { useState, useEffect } from "react";

interface File {
    _id: string;
    filename: string;
    uploadDate: string;
    length: number;
    metadata: {
        userId: string;
        semesterId: string;
        subjectId: string;
        topicId: string;
    };
}

interface ShowRecentProps {
    semesterId?: string;
    subjectId?: string;
    topicId?: string;
}

const ShowRecent: React.FC<ShowRecentProps> = ({ semesterId, subjectId, topicId }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const userId = localStorage.getItem("userId");
                if (!userId) {
                    console.error("User ID is not available in localStorage.");
                    return;
                }

                const params = new URLSearchParams();
                params.append("userId", userId);
                if (semesterId) params.append("semesterId", semesterId);
                if (subjectId) params.append("subjectId", subjectId);
                if (topicId) params.append("topicId", topicId);

                const response = await fetch(`/api/documents/files?${params.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    // Sort files by uploadDate in descending order and take the first 6
                    const sortedFiles = data
                        .sort((a: File, b: File) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                        .slice(0, 6);
                    setFiles(sortedFiles);
                } else {
                    console.error("Failed to fetch files");
                }
            } catch (error) {
                console.error("Error fetching files: ", error);
            } finally {
                setLoading(false);
            }
        };

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
            <h2 className="text-xl font-semibold mb-4">Recent Files</h2>
            <ul className="list-disc pl-5">
                {files.map((file) => (
                    <li key={file._id} className="mb-2">
                        <p>
                            <strong>Filename:</strong> {file.filename}
                        </p>
                        <p>
                            <strong>Uploaded on:</strong> {new Date(file.uploadDate).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>Size:</strong> {(file.length / 1024).toFixed(2)} KB
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ShowRecent;