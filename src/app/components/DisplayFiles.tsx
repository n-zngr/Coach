"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import FileView from "@/app/components/FileView";

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

const DisplayFiles: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingFileId, setEditingFileId] = useState<string | null>(null);
    const [newFilename, setNewFilename] = useState<string>("");
    const [query, setQuery] = useState<string>("");
    const [searchActive, setSearchActive] = useState<boolean>(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch files");
            }

            const data = await response.json();
            setFiles(data);
        } catch (error: any) {
            console.error("Error fetching files: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [semesterId, subjectId, topicId]);

    const handleFileClick = (file: File) => {
        setSelectedFile(file);
    };

    const handleCloseFileView = () => {
        setSelectedFile(null);
    }

    const handleDownload = async (fileId: string, filename: string) => {
        try {
            const response = await fetch(`/api/documents/download/${fileId}`);

            if (!response.ok) {
                throw new Error('Failed to download file');
            }

            const blob = await response.blob();
            const downloadUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            link.click();

            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    const handleRename = async (fileId: string, newFilename: string) => {
        try {
            const response = await fetch(`/api/documents/rename/${fileId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ newFilename })
            });

            if (!response.ok) {
                throw new Error("Failed to rename file");
            }

            setFiles(files.map(file => 
                file._id === fileId ? { ...file, filename: newFilename } : file
            ));

            if (selectedFile && selectedFile._id === fileId) {
                setSelectedFile({ ...selectedFile, filename: newFilename });
            }
        } catch (error) {
            console.error("Error renaming file:", error);
        }
    };


    const handleDelete = async (fileId: string) => {
        try {
            const response = await fetch(`/api/documents/delete/${fileId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete files');
            }

            setFiles(files.filter(file => file._id !== fileId));
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const handleSearch = async () => {
        if (query.trim() === '') return;

        setLoading(true);
        setSearchActive(true);

        try {
            const response = await fetch('/api/documents/search', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
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
                    className="w-full p-2 border text-black border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                    onClick={handleSearch} 
                    className="bg-blue-500 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700"
                >
                    Search
                </button>
                {searchActive && (
                    <button 
                        onClick={resetSearch} 
                        className="bg-gray-500 text-white font-medium py-2 px-4 rounded-md hover:bg-gray-700"
                    >
                        Reset
                    </button>
                )}
            </div>
    
            {files.length === 0 && searchActive && (
                <p>No files found for the selected filters.</p>
            )}
    
            <ul className="space-y-4">
                {files.map((file) => (
                    <li 
                        key={file._id}
                        className="flex items-center p-2 border rounded-lg shadow-sm bg-white dark:bg-gray-800 text-black"
                        onClick={() => handleFileClick(file)}
                    >
                        <img src="/icon-document.svg" alt="Document Icon" className="w-6 h-6 mr-3"/>
                        <span className="text-lg font-medium flex-1">{file.filename}</span>
                    </li>
                ))}
            </ul>
            {selectedFile && (
                <FileView 
                    file={selectedFile} 
                    onClose={handleCloseFileView} 
                    onRename={handleRename} 
                    onDelete={handleDelete} 
                    onDownload={handleDownload} 
                />
            )}
        </div>
    );
};

export default DisplayFiles;
