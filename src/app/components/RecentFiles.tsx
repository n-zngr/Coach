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
                    <div key={file._id} className="flex items-center flex-row gap-4 p-4 border border-rounded border-gray-200 rounded-lg bg-white dark:bg-gray-800">
                        <div className="p-4 rounded-lg bg-gray-200 dark:bg-gray-800">
                            <img src="/icon-document.svg" alt="Document Icon" className="w-8 h-8"/>
                        </div>
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