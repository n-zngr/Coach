"use client";

import { useState, useEffect } from 'react';

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

interface FileViewProps {
    file: File | null;
    onClose: () => void;
}

const FileView: React.FC<FileViewProps> = ({ file, onClose }) => {
    const [newFilename, setNewFilename] = useState<string>(file?.filename || "");
    
    useEffect(() => {
        setNewFilename(file?.filename || "");
    }, [file]);

    if (!file) return null;

    const handleRename = async () => {
        try {
            const response = await fetch(`/api/documents/rename/${file._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newFilename }),
            });

            if (!response.ok) {
                throw new Error("Failed to rename file");
            }

            console.log("File renamed successfully");
        } catch (error) {
            console.error("Error renaming file:", error);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(`/api/documents/download/${file._id}`);

            if (!response.ok) {
                throw new Error('Failed to download file');
            }

            const blob = await response.blob();
            const downloadUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = file.filename;
            link.click();

            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/documents/delete/${file._id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            onClose();
            console.log('File deleted successfully');
        } catch (error) {
            console.error('Error deleting file', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end">
            <div className={`
                h-full bg-white dark:bg-neutral-900 p-6 overflow-y-auto 
                transition-transform duration-300 
                ${file ? 'translate-x-0 w-96' : 'translate-x-full w-0'}`}
            >
                <button className="text-red-500 mb-4" onClick={onClose}>
                    Close [X]
                </button>
                <h2 className="text-xl font-semibold mb-4">File Details</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Filename</label>
                    <input
                        type="text"
                        value={newFilename}
                        onChange={(e) => setNewFilename(e.target.value)}
                        className="w-full p-2 border rounded-md text-black"
                    />
                    <button
                        onClick={handleRename}
                        className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md"
                    >
                        Rename
                    </button>
                </div>
                <div className="mb-4">
                    <p>
                        <strong>Upload Date:</strong> {new Date(file.uploadDate).toLocaleString()}
                    </p>
                    <p>
                        <strong>File Size:</strong> {(file.length / 1024).toFixed(2)} KB
                    </p>
                </div>
                <div className="mt-6 space-y-4">
                    <button onClick={handleDownload} className="bg-green-500 text-white w-full py-2 rounded-md">
                        Download
                    </button>
                    <button onClick={handleDelete} className="bg-red-500 text-white w-full py-2 rounded-md">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileView;