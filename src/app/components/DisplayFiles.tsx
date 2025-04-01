"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppLink } from "./LinkView";

export interface File {
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

interface DisplayFilesProps {
    onFileClick: (file: File) => void;
    onLinkClick: (link: AppLink) => void;
}

const DisplayFiles: React.FC<DisplayFilesProps> = ({ onFileClick, onLinkClick }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [links, setLinks] = useState<AppLink[]>([]);
    const [loading, setLoading] = useState(true);
    /*const [query, setQuery] = useState("");*/
    /*const [searchActive, setSearchActive] = useState(false);*/
    /*const [subjectTypes, setSubjectTypes] = useState<{ id: string; name: string }[]>([]);*/
    /*const [selectedSubjectType, setSelectedSubjectType] = useState<string | null>(null);*/

    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter(Boolean);
    const semesterId = pathSegments[1] || null;
    const subjectId = pathSegments[2] || null;
    const topicId = pathSegments[3] || null;

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fileRes, linkRes] = await Promise.all([
                fetch(`/api/documents/files`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        semesterId: semesterId ?? "",
                        subjectId: subjectId ?? "",
                        topicId: topicId ?? "",
                    },
                }),
                fetch(`/api/documents/links`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        semesterId: semesterId ?? "",
                        subjectId: subjectId ?? "",
                        topicId: topicId ?? "",
                    },
                }),
            ]);

            if (!fileRes.ok) {
                throw new Error("Failed to fetch files");
            } else if (!linkRes.ok) {
                throw new Error("Failed to fetch links");
            }

            const fileData = await fileRes.json();
            const linkData = await linkRes.json();

            setFiles(fileData);
            setLinks(linkData);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        /*const fetchSubjectTypes = async () => {
        try {
            const res = await fetch("/api/documents/subjectTypes", { credentials: "include" });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setSubjectTypes(data);
        } catch {
            console.error("Failed to fetch subject types");
        }
        };*/

        /*fetchSubjectTypes();*/
        fetchData();
    }, [semesterId, subjectId, topicId]);

    /*const handleSearch = async () => {
        if (!query.trim() && !selectedSubjectType) {
        resetSearch();
        return;
        }

        setLoading(true);
        setSearchActive(true);

        try {
        const res = await fetch("/api/documents/search", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, subjectTypeId: selectedSubjectType }),
        });

        if (!res.ok) throw new Error();
        const data = await res.json();
        setFiles(data.filter((item: any) => item.filename));
        setLinks(data.filter((item: any) => item.url));
        } catch (err) {
        console.error("Search failed:", err);
        } finally {
        setLoading(false);
        }
    };*/

    /*const resetSearch = () => {
        setQuery("");
        setSelectedSubjectType(null);
        setSearchActive(false);
        fetchData();
    };*/

    if (loading) return <p>Loading files and links...</p>;

    return (
        <div>{/*}
            <h2 className="text-xl font-semibold mb-4">Documents & Links</h2>
            {/*
            <div className="flex space-x-2 mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search..."
                    className="w-full p-2 border text-black border-neutral-200 dark:border-neutral-800 rounded-lg"
                />
                <button onClick={handleSearch} className="py-2 px-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg font-bold">
                    Search
                </button>
                <select
                    value={selectedSubjectType || ""}
                    onChange={(e) => setSelectedSubjectType(e.target.value || null)}
                    className="p-2 border rounded-lg text-black"
                >
                    <option value="">All Types</option>
                        {subjectTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                            {type.name}
                            </option>
                        ))}
                </select>
                {searchActive && (
                    <button onClick={resetSearch} className="bg-neutral-500 text-white font-bold py-2 px-4 rounded-lg">
                        Reset
                    </button>
                )}
            </div>*/}

            <ul className="flex flex-col space-y-4">
                {files.map((file) => (
                    <button
                        key={file._id}
                        onClick={() => onFileClick(file)}
                        className="group flex items-center text-left p-4 gap-4 border rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    >
                        <div className="flex justify-center w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800">
                        <svg className="self-center h-6 w-6" width="13" height="16" viewBox="0 0 13 16" fill="currentColor">
                            <path d="..." />
                        </svg>
                        </div>
                        <span className="text-lg font-medium flex-1">{file.filename}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg font-bold">
                        View File
                        </div>
                    </button>
                ))}

                {links.map((link) => (
                    <button
                        key={link._id}
                        onClick={() => onLinkClick(link)}
                        className="group flex items-center text-left p-4 gap-4 border rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    >
                        <div className="flex justify-center w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800">
                            <svg className="self-center h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M10 13a5 5 0 0 1-7.07 0..." />
                            </svg>
                        </div>
                        <span className="text-lg font-medium flex-1">{link.name}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg font-bold">
                            View Link
                        </div>
                    </button>
                ))}
            </ul>
        </div>
    );
};

export default DisplayFiles;
