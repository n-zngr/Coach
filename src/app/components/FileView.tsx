"use client";

import { useState, useEffect } from 'react';

interface FileViewProps {
    file: File | null;
    onClose: () => void;
    onRename: (fileId: string, newFilename: string) => void;
    onDelete: (fileId: string) => void;
    onDownload: (fileId: string, filename: string) => void;
}

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

const FileView: React.FC<FileViewProps> = ({ file, onClose, onRename, onDelete, onDownload }) => {
    const [newFilename, setNewFilename] = useState<string>(file?.filename || '');
    
    useEffect(() => {
        setNewFilename(file?.filename || '');
    }, [file]);

    if (!file) return null;

    const handleRenameSubmit = () => {
        onRename(file._id, newFilename);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end">
            <div className="w-96 bg-white dark:bg-gray-900 h-full p-6 overflow-y-auto transition-transform transform translate-x-0">
                <button 
                    className="text-red-500 mb-4" 
                    onClick={onClose}
                >
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
                        onClick={handleRenameSubmit} 
                        className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md"
                    >
                        Rename
                    </button>
                </div>

                <div className="mb-4">
                    <p><strong>File ID:</strong> {file._id}</p>
                    <p><strong>Upload Date:</strong> {new Date(file.uploadDate).toLocaleString()}</p>
                    <p><strong>File Size:</strong> {(file.length / 1024).toFixed(2)} KB</p>
                </div>

                <div className="mt-6 space-y-4">
                    <button 
                        onClick={() => onDownload(file._id, file.filename)} 
                        className="bg-green-500 text-white w-full py-2 rounded-md"
                    >
                        Download
                    </button>

                    <button 
                        onClick={() => onDelete(file._id)} 
                        className="bg-red-500 text-white w-full py-2 rounded-md"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileView;