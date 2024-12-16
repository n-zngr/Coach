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

const RecentFiles: React.FC<ShowRecentProps> = ({ semesterId, subjectId, topicId }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const params = new URLSearchParams();
                if (semesterId) params.append("semesterId", semesterId);
                if (subjectId) params.append("subjectId", subjectId);
                if (topicId) params.append("topicId", topicId);

                const response = await fetch(`/api/documents/files?${params.toString()}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    const sortedFiles = data
                        .sort((a: File, b: File) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                        .slice(0, 3);
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
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Files</h2>
            <div className="flex flex-wrap gap-4">
                {files.map((file) => (
                    <div key={file._id} className="flex items-center gap-4 p-4 rounded-lg shadow-md bg-white dark:bg-gray-800 dark:shadow-gray-700 hover:shadow-lg transition-shadow">
                        <img
                        src="/icon-document.svg"
                        alt="Document Icon"
                        className="w-12 h-12"
                        />
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">{file.filename}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(file.uploadDate).toLocaleDateString()} &middot;{" "}
                            {(file.length / (1024 * 1024)).toFixed(1)} MB
                        </p>
                    </div>
                    </div>
                ))}
            </div>
        </div>

    );
};

export default RecentFiles;