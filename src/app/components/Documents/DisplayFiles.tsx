"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppLink } from "../LinkView";

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

    return (
        <>
            { loading && (
                <div className="flex items-center justify-center h-full w-full">
                    <svg className="animate-spin h-10 w-10 text-gray-200" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8.00994,8.00994,0,0,1,12,20Z"/>
                        <path fill="currentColor" d="M12.5,3H11.5V12h1Z"/>
                    </svg>
                </div>
            )}
            { !loading && (
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
                    <header className="border-b border-black-500 dark:border-white-500 mb-8">
                        <div className="flex justify-between">
                            <h1 className="font-base text-xl self-end pb-1">Documents & Links</h1>
                        </div>
                    </header>
                    <ul className="flex flex-col space-y-4">
                        {files.map((file) => (
                            <button
                                key={file._id}
                                onClick={() => onFileClick(file)}
                                className="group flex items-center text-left p-4 gap-4 border rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900"
                            >
                                <div className="flex justify-center items-center w-10 h-10 rounded-lg">
                                    <svg width="19" height="22" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5.56764 7.15385H8.49766M5.56764 11.7692H12.8927M5.56764 16.3846H12.8927M17.2877 19.4615C17.2877 19.8696 17.1334 20.2609 16.8586 20.5494C16.5839 20.8379 16.2113 21 15.8227 21H2.63762C2.24907 21 1.87644 20.8379 1.6017 20.5494C1.32696 20.2609 1.17261 19.8696 1.17261 19.4615V2.53846C1.17261 2.13044 1.32696 1.73912 1.6017 1.4506C1.87644 1.16209 2.24907 1 2.63762 1H9.96267L17.2877 8.69231V19.4615Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                                <div className="flex justify-center items-center w-10 h-10 rounded-lg">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M7.74285 2.60014C7.59145 2.76261 7.50902 2.97752 7.51294 3.19957C7.51686 3.42162 7.60681 3.63348 7.76385 3.79053C7.92089 3.94756 8.13275 4.03752 8.3548 4.04144C8.57685 4.04536 8.79176 3.96294 8.95425 3.81153L10.3828 2.383C10.5951 2.17064 10.8472 2.00218 11.1247 1.88725C11.4022 1.77232 11.6995 1.71317 11.9999 1.71317C12.3002 1.71317 12.5976 1.77232 12.8751 1.88725C13.1525 2.00218 13.4046 2.17064 13.617 2.383C13.8293 2.59536 13.9978 2.84747 14.1127 3.12492C14.2276 3.40239 14.2868 3.69978 14.2868 4.0001C14.2868 4.30042 14.2276 4.5978 14.1127 4.87526C13.9978 5.15272 13.8293 5.40483 13.617 5.6172L10.7599 8.47426C10.5476 8.68677 10.2956 8.85536 10.0181 8.97037C9.7406 9.0854 9.44318 9.14461 9.14282 9.14461C8.84244 9.14461 8.54502 9.0854 8.26754 8.97037C7.99007 8.85536 7.73799 8.68677 7.52572 8.47426C7.36323 8.32286 7.14832 8.24043 6.92627 8.24435C6.70422 8.24827 6.49236 8.33822 6.33532 8.49526C6.17828 8.6523 6.08833 8.86416 6.08441 9.08621C6.08049 9.30826 6.16292 9.52317 6.31432 9.68566C6.68575 10.0571 7.12671 10.3518 7.61202 10.5528C8.09734 10.7539 8.6175 10.8573 9.14282 10.8573C9.66812 10.8573 10.1883 10.7539 10.6736 10.5528C11.1589 10.3518 11.5999 10.0571 11.9713 9.68566L14.8284 6.82859C15.5785 6.07842 16 5.06098 16 4.0001C16 2.9392 15.5785 1.92177 14.8284 1.17161C14.0782 0.421432 13.0608 0 11.9999 0C10.939 0 9.92155 0.421432 9.17138 1.17161L7.74285 2.60014ZM2.383 13.617C2.17048 13.4046 2.00189 13.1526 1.88688 12.8752C1.77185 12.5977 1.71264 12.3002 1.71264 11.9999C1.71264 11.6995 1.77185 11.4021 1.88688 11.1246C2.00189 10.8471 2.17048 10.595 2.383 10.3828L5.24007 7.52572C5.45233 7.3132 5.70442 7.14461 5.98189 7.02959C6.25936 6.91457 6.55678 6.85536 6.85716 6.85536C7.15753 6.85536 7.45495 6.91457 7.73243 7.02959C8.0099 7.14461 8.26198 7.3132 8.47426 7.52572C8.63674 7.67712 8.85165 7.75954 9.0737 7.75562C9.29575 7.7517 9.50761 7.66175 9.66465 7.50471C9.82169 7.34767 9.91164 7.13581 9.91556 6.91376C9.91948 6.69171 9.83706 6.4768 9.68566 6.31432C9.31423 5.94285 8.87326 5.64818 8.38795 5.44715C7.90263 5.24611 7.38246 5.14263 6.85716 5.14263C6.33185 5.14263 5.81168 5.24611 5.32637 5.44715C4.84106 5.64818 4.4001 5.94285 4.02867 6.31432L1.17161 9.17138C0.421432 9.92155 0 10.939 0 11.9999C0 13.0608 0.421432 14.0782 1.17161 14.8284C1.92177 15.5785 2.9392 16 4.0001 16C5.06098 16 6.07842 15.5785 6.82859 14.8284L8.25713 13.3998C8.40853 13.2373 8.49095 13.0225 8.48703 12.8004C8.48311 12.5784 8.39316 12.3665 8.23612 12.2095C8.07907 12.0525 7.86722 11.9624 7.64517 11.9585C7.42311 11.9546 7.20821 12.037 7.04573 12.1884L5.6172 13.617C5.40492 13.8294 5.15283 13.9981 4.87537 14.1131C4.59789 14.2282 4.30047 14.2874 4.0001 14.2874C3.69972 14.2874 3.4023 14.2282 3.12482 14.1131C2.84735 13.9981 2.59527 13.8294 2.383 13.617Z" fill="currentColor"/>
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
            )}
        </>
    );
};

export default DisplayFiles;
