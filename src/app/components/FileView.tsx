"use client";

import { useState, useEffect, useRef } from 'react';

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

interface Semester {
    id: string;
    name: string;
    subjects: Subject[];
}

interface Subject {
    id: string;
    name: string;
    topics: Topic[];
}

interface Topic {
    id: string;
    name: string;
}

interface FileViewProps {
    file: File | null;
    onClose: () => void;
}

interface FileViewProps {
    file: File | null;
    onClose: () => void;
}

const FileView: React.FC<FileViewProps> = ({ file, onClose }) => {
    const [newFilename, setNewFilename] = useState<string>(file?.filename || "");
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showMoveCard, setShowMoveCard] = useState(false);
    const moveButtonRef = useRef<HTMLButtonElement | null>(null);
    
    useEffect(() => {
        setNewFilename(file?.filename || "");

        const fetchSemesters = async () => {
            try {
                const response = await fetch('/api/documents/semesters', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();
                setSemesters(data);
            } catch (error) {
                console.error("Error fetching semesters: ", error);
            }
        };

        fetchSemesters();
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

    const handleMoveFile = async () => {
        if (!selectedOption) {
            alert('Please select a new location for the file.');
            return;
        }

        const [semesterId, subjectId, topicId] = selectedOption.split('/');

        try {
            const response = await fetch (`/api/documents/move/${file._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ semesterId, subjectId, topicId })
            });

            if (!response.ok) {
                throw new Error('Failed to move file');
            }

            console.log('File moved successfully');
            setShowMoveCard(false);
        } catch (error) {
            console.error('Error moving file:', error);
        }
    };

    const toggleMoveCard = () => {
        setShowMoveCard((prev) => !prev);
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
                    <button
                    onClick={toggleMoveCard}
                    ref={moveButtonRef}
                    className="bg-yellow-500 text-white px-4 py-2 mt-2 rounded-md w-full"
                >
                    Move File
                </button>
                </div>
                
                {showMoveCard && (
                    <div className="absolute mt-2 bg-white shadow-lg border rounded p-4" style={{ top: moveButtonRef.current?.offsetHeight || 0 }}>
                        <h3 className="text-lg font-semibold mb-2 text-black">Select New Location</h3>
                        <select
                            onChange={(e) => setSelectedOption(e.target.value)}
                            value={selectedOption || ''}
                            className="w-full border border-gray-300 rounded p-2 mb-4"
                        >
                            <option value="">Select new file location</option>
                            {semesters.map(semester => (
                                <option key={semester.id} value={`${semester.id}`} disabled className="text-gray">{semester.name}</option>
                            ))}
                            {semesters.map(semester =>
                                semester.subjects.map(subject => (
                                    <option key={subject.id} value={`${semester.id}/${subject.id}`} disabled className="text-gray"> &nbsp;&nbsp;{subject.name}</option>
                                ))
                            )}
                            {semesters.map(semester =>
                                semester.subjects.map(subject =>
                                    subject.topics.map(topic => (
                                        <option
                                            key={topic.id}
                                            value={`${semester.id}/${subject.id}/${topic.id}`}
                                            className="text-black"
                                        >
                                            &nbsp;&nbsp;&nbsp;&nbsp;{topic.name}
                                        </option>
                                    ))
                                )
                            )}
                        </select>
                        <button
                            onClick={handleMoveFile}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                        >
                            Move File
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileView;