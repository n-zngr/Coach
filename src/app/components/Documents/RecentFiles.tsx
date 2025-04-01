"use client";

import { useState, useEffect } from "react";

interface AppFile {
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
    const [files, setFiles] = useState<AppFile[]>([]);
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
                        .sort((a: AppFile, b: AppFile) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
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
            <header className="border-b border-black-500 dark:border-white-500 mb-8">
                <div className="flex justify-between">
                    <h1 className="font-base text-xl self-end pb-1">Recently Uploaded</h1>
                </div>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                    <button key={file._id}
                        className="flex justify-between group
                            bg-transparent hover:bg-white-800 dark:hover:bg-black-200
                            border border-black-900 dark:border-white-100 rounded-xl
                            gap-4 p-4
                            transition-colors duration-300"
                        >
                        <div className="flex gap-4">
                            <div className="w-12 h-12
                                flex justify-center items-center
                                bg-white-800 dark:bg-black-200
                                border border-black-900 dark:border-white-100 rounded-md"
                            >
                                <svg width="16" height="19" viewBox="0 0 13 16" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M1.625 1.14286C1.48134 1.14286 1.34357 1.20306 1.24198 1.31022C1.1404 1.41739 1.08333 1.56273 1.08333 1.71429V14.2857C1.08333 14.4373 1.1404 14.5826 1.24198 14.6898C1.34357 14.7969 1.48134 14.8571 1.625 14.8571H11.375C11.5187 14.8571 11.6564 14.7969 11.758 14.6898C11.8596 14.5826 11.9167 14.4373 11.9167 14.2857V6.85714H7.04167C6.74251 6.85714 6.5 6.60131 6.5 6.28571V1.14286H1.625ZM7.58333 1.95098L11.1506 5.71429H7.58333V1.95098ZM0.475951 0.502103C0.780698 0.180612 1.19402 0 1.625 0H7.04167C7.18533 0 7.3231 0.0602039 7.42468 0.167368L12.8414 5.88165C12.9429 5.98882 13 6.13416 13 6.28571V14.2857C13 14.7404 12.8288 15.1764 12.524 15.4979C12.2193 15.8194 11.806 16 11.375 16H1.625C1.19402 16 0.780698 15.8194 0.475951 15.4979C0.171205 15.1764 0 14.7404 0 14.2857V1.71429C0 1.25963 0.171205 0.823594 0.475951 0.502103Z" fill="currentColor"/>
                                </svg>
                            </div>
                            <div className="flex flex-col text-left">
                                <p className="font-bold text-black-100 dark:text-white-900">{file.filename}</p>
                                <p className="mt-auto text-sm text-gray-500">
                                    {new Date(file.uploadDate).toLocaleDateString()} &middot;{" "}
                                    {(file.length / (1024 * 1024)).toFixed(1)} MB
                                </p>
                            </div>
                        </div>
                        <div className="h-fit flex items-center justify-center opacity-0 group-hover:opacity-100
                            bg-black-100 dark:bg-white-900 hover:bg-transparent hover:dark:bg-transparent 
                            border hover:border-black-100 hover:dark:border-white-900 rounded-full
                            px-4 py-2 font-light text-white-900 dark:text-black-100 text-nowrap
                            hover:text-black-100 hover:dark:text-white-900
                            transition-all duration-300"
                        >
                            View File
                        </div>
                    </button>
                ))}
            </div>
        </div>

    );
};

export default RecentFiles;