"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

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

interface Link {
    _id: string;
    name: string;
    url: string;
    metadata: {
        userId: string;
        semesterId?: string;
        subjectId?: string;
        topicId?: string;
        tags?: string[];
    };
}

type FileOrLink = File | Link;

interface DisplayFilesProps {
    onFileClick: (file: FileOrLink) => void;
}

const DisplayFiles: React.FC<DisplayFilesProps> = ({ onFileClick }) => {
    const [files, setFiles] = useState<FileOrLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [subjectTypes, setSubjectTypes] = useState<{ id: string; name: string }[]>([]);
    const [selectedSubjectType, setSelectedSubjectType] = useState<string | null>(null);

    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter(Boolean);

    const semesterId = pathSegments[1] || null;
    const subjectId = pathSegments[2] || null;
    const topicId = pathSegments[3] || null;

    const fetchFiles = async (): Promise<File[]> => {
        setLoading(true);
        try {
            const response = await fetch(`/api/documents/files`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'semesterId': semesterId ?? '',
                    'subjectId': subjectId ?? '',
                    'topicId': topicId ?? '',
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch files");
            }

            const data: File[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching files: ", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const fetchLinks = async (): Promise<Link[]> => {
        setLoading(true);
        try {
            const response = await fetch(`/api/documents/links`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'semesterId': semesterId ?? '',
                    'subjectId': subjectId ?? '',
                    'topicId': topicId ?? '',
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch links");
            }

            const data: Link[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching links: ", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchSubjectTypes = async () => {
            try {
                const response = await fetch('/api/documents/subjectTypes', { method: 'GET', credentials: 'include' });
                if (!response.ok) throw new Error('Failed to fetch subject types');

                const data = await response.json();
                setSubjectTypes(data);
            } catch (error) {
                console.error('Error fetching subject types:', error);
            }
        };

        const fetchData = async () => {
            setFiles([]);
            const filesData = await fetchFiles();
            const linksData = await fetchLinks();
            setFiles([...filesData, ...linksData]);
        };

        fetchSubjectTypes();
        fetchData();
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
            <ul className="flex flex-col space-y-4">
                {files.map((file) => {
                    const isLink = 'url' in file;
                    const key = isLink ? `link-${file._id}` : `file-${file._id}`;
                    return (
                        <button
                            key={key}
                            className="group
                                flex items-center text-left p-4 gap-4
                                border border-rounded rounded-lg border-neutral-200 dark:border-neutral-800
                                hover:bg-neutral-100 hover:dark:bg-neutral-900
                                cursor-pointer transition-colors duration-300"
                            onClick={() => onFileClick(file)}
                        >
                            <div className="flex justify-center w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800">
                                {isLink ? (
                                    <svg
                                        className="self-center h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L10 6" />
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.77-1.77" />
                                    </svg>
                                ) : (
                                    <svg className="self-center h-6 w-6" width="13" height="16" viewBox="0 0 13 16" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M1.625 1.14286C1.48134 1.14286 1.34357 1.20306 1.24198 1.31022C1.1404 1.41739 1.08333 1.56273 1.08333 1.71429V14.2857C1.08333 14.4373 1.1404 14.5826 1.24198 14.6898C1.34357 14.7969 1.48134 14.8571 1.625 14.8571H11.375C11.5187 14.8571 11.6564 14.7969 11.758 14.6898C11.8596 14.5826 11.9167 14.4373 11.9167 14.2857V6.85714H7.04167C6.74251 6.85714 6.5 6.60131 6.5 6.28571V1.14286H1.625ZM7.58333 1.95098L11.1506 5.71429H7.58333V1.95098ZM0.475951 0.502103C0.780698 0.180612 1.19402 0 1.625 0H7.04167C7.18533 0 7.3231 0.0602039 7.42468 0.167368L12.8414 5.88165C12.9429 5.98882 13 6.13416 13 6.28571V14.2857C13 14.7404 12.8288 15.1764 12.524 15.4979C12.2193 15.8194 11.806 16 11.375 16H1.625C1.19402 16 0.780698 15.8194 0.475951 15.4979C0.171205 15.1764 0 14.2857V1.71429C0 1.25963 0.171205 0.823594 0.475951 0.502103Z" fill="currentColor" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-lg font-medium flex-1">{isLink ? file.name : file.filename}</span>
                            <div className="flex justify-self-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="px-4 py-2
                                    bg-neutral-200 dark:bg-neutral-800
                                    rounded-lg
                                    font-bold text-black dark:text-white
                                    transition-colors duration-300
                                    ">
                                    <p>{isLink ? "View Link" : "View File"}</p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </ul>
        </div>
    );
};

export default DisplayFiles;
