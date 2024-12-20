"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import SearchFiles from '@/app/components/SearchFiles';

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

    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter(Boolean);

    const semesterId = pathSegments[1] || null;
    const subjectId = pathSegments[2] || null;
    const topicId = pathSegments[3] || null;

    useEffect(() => {
        const fetchFiles = async () => {
            setLoading(true);

            try {
                console.log("Requesting files with:", { semesterId, subjectId, topicId }); // Log for debugging

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
                console.log("Files received: ", data); // Log for debugging
                setFiles(data);
            } catch (error: any) {
                console.error("Error fetching files: ", error);
            } finally {
                setLoading(false);
            }
        };

        console.log("Path data - SemesterId:", semesterId, "SubjectId:", subjectId, "TopicId:", topicId); // Log for debugging
        fetchFiles();
    }, [semesterId, subjectId, topicId]);

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

    const handleRenameClick = (fileId: string, currentFilename: string) => {
        setEditingFileId(fileId);
        setNewFilename(currentFilename);
    };

    const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewFilename(e.target.value);
    };

    const handleRenameSubmit = async (fileId: string) => {
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

            setEditingFileId(null);
            setNewFilename("");
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
    }

    if (loading) {
        return <p>Loading files...</p>;
    }

    if (files.length === 0) {
        return <p>No files found for the selected filters.</p>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Files</h2>
            <SearchFiles />

            <ul className="space-y-4">
                {files.map((file) => (
                    <li key={file._id} className="flex items-center p-2 border rounded-lg shadow-sm bg-gray-100 text-black">
                        <img 
                            src="/icon-document.svg" 
                            alt="Document Icon" 
                            className="w-6 h-6 mr-3"
                        />

                        {editingFileId === file._id ? (
                            <input 
                                type="text" 
                                value={newFilename} 
                                onChange={handleFilenameChange} 
                                className="flex-1 p-1 border rounded"
                            />
                        ) : (
                            <span className="text-lg font-medium flex-1">{file.filename}</span>
                        )}

                        <div className="flex space-x-2">
                            <button 
                                className="text-white bg-blue-500 hover:bg-blue-700 font-medium py-1 px-2 rounded"
                                onClick={() => 
                                    editingFileId === file._id 
                                    ? handleRenameSubmit(file._id) 
                                    : handleRenameClick(file._id, file.filename)
                                }
                            >
                                {editingFileId === file._id ? "Submit" : "Rename"}
                            </button>

                            <button 
                                className="text-white bg-red-500 hover:bg-red-700 font-medium py-1 px-2 rounded"
                                onClick={() => handleDelete(file._id)}
                            >
                                Delete
                            </button>


                            <button 
                                className="text-white bg-green-500 hover:bg-green-700 font-medium py-1 px-2 rounded"
                                onClick={() => handleDownload(file._id, file.filename)}
                            >
                                Download
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DisplayFiles;