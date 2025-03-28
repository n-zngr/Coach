"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// import FileView from "@/app/components/FileView";

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

interface DisplayFilesProps {
    onFileClick: (file: File) => void;
}

const DisplayFiles: React.FC<DisplayFilesProps> = ({ onFileClick }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    // const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [query, setQuery] = useState<string>("");
    const [searchActive, setSearchActive] = useState<boolean>(false);
    const [subjectTypes, setSubjectTypes] = useState<{ id: string; name: string }[]>([]);
    const [selectedSubjectType, setSelectedSubjectType] = useState<string | null>(null);

    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter(Boolean);

    const semesterId = pathSegments[1] || null;
    const subjectId = pathSegments[2] || null;
    const topicId = pathSegments[3] || null;

    const fetchFiles = async () => {
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

            const data = await response.json();
            setFiles(data);
        } catch (error) {
            console.error("Error fetching files: ", error);
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
    
        fetchSubjectTypes();
        fetchFiles();
    }, [semesterId, subjectId, topicId]);

    /*const handleFileClick = (file: File) => {
        setSelectedFile(file); // No longer required, as FileView is displayed in page.
    };*/

    /*const handleCloseFileView = () => {
        setSelectedFile(null); // No longer required, as FileView is displayed in page.
    };*/

    const handleSearch = async () => {
        if (!query.trim() && !selectedSubjectType) {
            resetSearch();
            return;
        }
    
        setLoading(true);
        setSearchActive(true);
    
        try {
            const response = await fetch('/api/documents/search', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, subjectTypeId: selectedSubjectType }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch search results');
            }
    
            const data = await response.json();
            setFiles(data);
        } catch (error) {
            console.error('Error searching files:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetSearch = () => {
        setQuery('');
        setSearchActive(false);
        const fetchFiles = async () => {
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

                const data = await response.json();
                setFiles(data);
            } catch (error: any) {
                console.error("Error fetching files: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    };

    if (loading) {
        return <p>Loading files...</p>;
    }

    if (files.length === 0) {
        return <p>No files found for the selected filters.</p>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Files</h2>
            <div className="flex space-x-2 mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search for files..."
                    className="w-full p-2
                        border text-black border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none"
                />
                <button 
                    onClick={handleSearch} 
                    className="
                        py-2 px-4
                        bg-neutral-200 dark:bg-neutral-800
                        hover:bg-neutral-100 hover:dark:bg-neutral-900
                        rounded-lg
                        font-bold text-black dark:text-white
                        transition-colors duration-300"
                >
                    Search
                </button>
                <select
                    value={selectedSubjectType || ''}
                    onChange={(e) => setSelectedSubjectType(e.target.value || null)}
                    className="p-2 border rounded-lg text-black"
                >
                    <option value="">All Subject Types</option>
                    {subjectTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.name}
                        </option>
                    ))}
                </select>
                {searchActive && (
                    <button 
                        onClick={resetSearch} 
                        className="
                        bg-neutral-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-neutral-600
                        transition-colors duration-300"
                    >
                        Reset
                    </button>
                )}
            </div>
            

            {files.length === 0 && searchActive && (
                <p>No files found for the selected filters.</p>
            )}

            <ul className="flex flex-col space-y-4">
                {files.map((file) => (
                    <button 
                        key={file._id}
                        className="group
                            flex items-center text-left p-4 gap-4
                            border border-rounded rounded-lg border-neutral-200 dark:border-neutral-800
                            hover:bg-neutral-100 hover:dark:bg-neutral-900
                            cursor-pointer transition-colors duration-300"
                        onClick={() => onFileClick(file)}
                    >
                        <div className="flex justify-center w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800">
                            <svg className="self-center h-6 w-6" width="13" height="16" viewBox="0 0 13 16" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M1.625 1.14286C1.48134 1.14286 1.34357 1.20306 1.24198 1.31022C1.1404 1.41739 1.08333 1.56273 1.08333 1.71429V14.2857C1.08333 14.4373 1.1404 14.5826 1.24198 14.6898C1.34357 14.7969 1.48134 14.8571 1.625 14.8571H11.375C11.5187 14.8571 11.6564 14.7969 11.758 14.6898C11.8596 14.5826 11.9167 14.4373 11.9167 14.2857V6.85714H7.04167C6.74251 6.85714 6.5 6.60131 6.5 6.28571V1.14286H1.625ZM7.58333 1.95098L11.1506 5.71429H7.58333V1.95098ZM0.475951 0.502103C0.780698 0.180612 1.19402 0 1.625 0H7.04167C7.18533 0 7.3231 0.0602039 7.42468 0.167368L12.8414 5.88165C12.9429 5.98882 13 6.13416 13 6.28571V14.2857C13 14.7404 12.8288 15.1764 12.524 15.4979C12.2193 15.8194 11.806 16 11.375 16H1.625C1.19402 16 0.780698 15.8194 0.475951 15.4979C0.171205 15.1764 0 14.7404 0 14.2857V1.71429C0 1.25963 0.171205 0.823594 0.475951 0.502103Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <span className="text-lg font-medium flex-1">{file.filename}</span>
                        <div className="flex justify-self-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="px-4 py-2
                            bg-neutral-200 dark:bg-neutral-800
                            rounded-lg
                            font-bold text-black dark:text-white
                            transition-colors duration-300
                            ">
                                <p>View File</p>
                            </div>
                        </div>
                    </button>
                ))}
            </ul>
            {/* {selectedFile && ( // No longer required, as FileView is displayed in page.
                <FileView
                    file={selectedFile}
                    onClose={handleCloseFileView}
                />
            )} */}
        </div>
    );
};

export default DisplayFiles;