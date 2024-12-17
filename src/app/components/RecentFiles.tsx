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
            <div className="flex flex-1 flex-wrap gap-4 mb-8">
                {files.map((file) => (
                    <button key={file._id} className="
                        flex flex-1 basis-[calc(33.333%-1rem)] gap-4 p-4 
                        bg-white dark:bg-gray-950 border border-rounded rounded-lg border-gray-200 dark:border-gray-800
                        hover:bg-gray-100 hover:dark:bg-gray-900
                        cursor-pointer transition-colors duration-300
                    ">
                        <div>
                            <div className="p-4 rounded-lg bg-gray-200 dark:bg-gray-800">
                                <svg className="w-4 h-4" width="13" height="16" viewBox="0 0 13 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M1.625 1.14286C1.48134 1.14286 1.34357 1.20306 1.24198 1.31022C1.1404 1.41739 1.08333 1.56273 1.08333 1.71429V14.2857C1.08333 14.4373 1.1404 14.5826 1.24198 14.6898C1.34357 14.7969 1.48134 14.8571 1.625 14.8571H11.375C11.5187 14.8571 11.6564 14.7969 11.758 14.6898C11.8596 14.5826 11.9167 14.4373 11.9167 14.2857V6.85714H7.04167C6.74251 6.85714 6.5 6.60131 6.5 6.28571V1.14286H1.625ZM7.58333 1.95098L11.1506 5.71429H7.58333V1.95098ZM0.475951 0.502103C0.780698 0.180612 1.19402 0 1.625 0H7.04167C7.18533 0 7.3231 0.0602039 7.42468 0.167368L12.8414 5.88165C12.9429 5.98882 13 6.13416 13 6.28571V14.2857C13 14.7404 12.8288 15.1764 12.524 15.4979C12.2193 15.8194 11.806 16 11.375 16H1.625C1.19402 16 0.780698 15.8194 0.475951 15.4979C0.171205 15.1764 0 14.7404 0 14.2857V1.71429C0 1.25963 0.171205 0.823594 0.475951 0.502103Z" fill="black"/>
                                </svg>
                            </div>
                        </div>
                        <div className="flex flex-col text-left">
                            <p className="font-bold text-gray-900 dark:text-white">{file.filename}</p>
                            <p className="mt-auto text-sm text-gray-500 dark:text-gray-400">
                                {new Date(file.uploadDate).toLocaleDateString()} &middot;{" "}
                                {(file.length / (1024 * 1024)).toFixed(1)} MB
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>

    );
};

export default RecentFiles;