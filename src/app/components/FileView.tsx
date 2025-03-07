"use client";

import { useState, useEffect, useCallback, ChangeEvent, useRef } from "react";

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
        tags?: Tag[];
    };
}

interface Tag {
    _id?: string;
    id?: string;
    name: string;
}

interface FileViewProps {
    file: File | null;
    onClose: () => void;
}


const FileView: React.FC<FileViewProps> = ({ file, onClose }) => {
    const [newFilename, setNewFilename] = useState<string>(file?.filename || "");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

    // Move file states
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showMoveCard, setShowMoveCard] = useState(false);
    const [filePath, setFilePath] = useState<string | null>(null);
    const moveButtonRef = useRef<HTMLButtonElement | null>(null);

    // Replace file state
    const [replaceFile, setReplaceFile] = useState<globalThis.File | null>(null);

    useEffect(() => { // Updates on file change, renders tags and file name
        setNewFilename(file?.filename || "");
        if (file) {
            fetchTags(file._id);
        }
        // Clear any selected tag when file changes.
        setSelectedTag(null);
        setTagInput("");
    }, [file]);

    useEffect(() => { // Updates on file change, builds file location and move options
        const fetchSemesters = async () => {
            try {
                const response = await fetch('/api/documents/semesters', {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await response.json();
                setSemesters(data);

                if (file?.metadata.semesterId && file?.metadata.subjectId && file?.metadata.topicId) {
                    const semester = data.find((semester: Semester) => semester.id === file.metadata.semesterId);
                    const subject = semester?.subjects.find((subject: Subject) => subject.id === file.metadata.subjectId);
                    const topic = subject?.topics.find((topic: Topic) => topic.id === file.metadata.topicId);
                    setFilePath(`${semester?.name || ""} / ${subject?.name || ""} / ${topic?.name || ""}`);
                }
            } catch (error) {
                console.error('Error fetching semesters: ', error);
            }
        };
        fetchSemesters();
    }, [file]);

    if (!file) return null;

    // --- File Actions Logic ---
    const handleRename = async () => {
        try {
            const response = await fetch(`/api/documents/rename/${file._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ newFilename })
            });

            if (!response.ok) {
                throw new Error('Failed to rename file');
            }

            console.log('File renamed successfully');
        } catch (error) {
            console.error('Error renaming file:', error);
        }
    }

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
            console.error('Error downloading file', error);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/documents/delete/${file._id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error ('Failed to delete file');
            }
            
            console.log('File deleted successfully');
            onClose();
        } catch (error) {
            console.error('Error deleting file', error);
        }
    }
    
    // Move file handler
    const handleMoveFile = async () => {
        if (!selectedOption) {
            alert("Please select a new location for the file.");
            return;
        }
        
        const parts = selectedOption.split("/");
        if (parts.length !== 3) {
            alert("Invalid location selected.");
            return;
        }
        
        const [semesterId, subjectId, topicId] = parts;
        
        try {
            const response = await fetch(`/api/documents/move/${file._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ semesterId, subjectId, topicId }),
            });
            
            if (!response.ok) {
                throw new Error("Failed to move file");
            }
            
            console.log("File moved successfully");
            setShowMoveCard(false);
        } catch (error) {
            console.error("Error moving file:", error);
        }
    };
    
    const toggleMoveCard = () => {
        setShowMoveCard((prev) => !prev);
    };
    
    // Replace file handler
    const handleReplaceFile = async () => {
        if (!replaceFile) {
            alert("Please select a file to replace.");
            return;
        }
        
        const formData = new FormData();
        formData.append('file', replaceFile, replaceFile.name);
        
        try {
            const response = await fetch(`/api/documents/replace/${file._id}`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to replace file');
            }
            console.log('File replaced successfully');
        } catch (error) {
            console.error('Error replacing file: ', error);
        }
    };
    
    // --- Tag Logic ---
    const fetchTags = useCallback(async (fileId: string) => {
        try {
            const res = await fetch(`/api/documents/tags?fileId=${fileId}`, { credentials: "include" });

            if (!res.ok) {
                console.error("Failed to fetch tags");
                return;
            }

            const data = await res.json();
            setTags(data.tags || []);
        } catch (error) {
            console.error("Error fetching tags:", error);
        }
    }, []);

    const handleAddTag = useCallback(async () => {
        const newTag = tagInput.trim();
        if (!newTag) return;
        try {
            const res = await fetch("/api/documents/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ fileId: file._id, tag: newTag }),
            });
        if (!res.ok) {
            console.error("Failed to add tag");
            return;
        }
            fetchTags(file._id);
        } catch (error) {
            console.error("Error adding tag:", error);
        }
        setTagInput("");
        setSelectedTag(null);
    }, [file._id, tagInput, fetchTags]);

    const handleRenameTag = useCallback(async () => {
        if (!selectedTag) return;
        const newName = tagInput.trim();
        if (!newName) return;
        try {
            const res = await fetch("/api/documents/tags", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    fileId: file._id,
                    tagId: selectedTag._id || selectedTag.id,
                    newName,
                }),
            });

            if (!res.ok) {
                console.error("Failed to rename tag");
                return;
            }

            fetchTags(file._id);
        } catch (error) {
            console.error("Error renaming tag:", error);
        }
        setTagInput("");
        setSelectedTag(null);
    }, [file._id, selectedTag, tagInput, fetchTags]);

    const handleRemoveTag = useCallback(
        async (tagToRemove: Tag) => {
            try {
                const res = await fetch("/api/documents/tags", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ fileId: file._id, tag: tagToRemove.name }),
                });
                if (!res.ok) {
                    console.error("Failed to remove tag");
                    return;
                }
                fetchTags(file._id);
            } catch (error) {
                console.error("Error removing tag:", error);
            }
        }, [file._id, fetchTags]
    );
    

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setTagInput(e.target.value);
    }, []);
    
    const selectTag = useCallback((tag: Tag) => {
        setSelectedTag(tag);
        setTagInput(tag.name);
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end">
            <div
                className={`
                h-full bg-white dark:bg-neutral-900 p-6 overflow-y-auto 
                transition-transform duration-300 
                ${file ? "translate-x-0 w-96" : "translate-x-full w-0"}
                `}
            >
                <button className="text-red-500 mb-4" onClick={onClose}>
                Close [X]
                </button>

                <h2 className="text-xl font-semibold mb-4">File Details</h2>

                {/* Filename & Rename */}
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

                {/* Tag Section */}
                <div className="mb-4">
                    <div className="tag-input-container">
                        <input
                        type="text"
                        placeholder="Type tag name"
                        value={tagInput}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md text-black"
                        />
                    </div>
                    <div className="add-button-container mt-2 flex space-x-2">
                        <button
                        onClick={handleAddTag}
                        className="bg-green-500 text-white px-4 py-2 rounded-md"
                        >
                        Add
                        </button>
                        <button
                        onClick={handleRenameTag}
                        disabled={!selectedTag}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
                        >
                        Rename Tag
                        </button>
                    </div>
                    <div className="tags-container mt-4 flex flex-wrap">
                        {tags.map((tag) => (
                        <div
                            key={tag._id || tag.id}
                            onClick={() => selectTag(tag)}
                            className={`tag-box inline-block border rounded-md p-2 mr-2 mb-2 relative bg-gray-200 text-black cursor-pointer ${
                            selectedTag &&
                            (selectedTag._id || selectedTag.id) === (tag._id || tag.id)
                                ? "border-blue-500"
                                : ""
                            }`}
                        >
                            {tag.name}
                            <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTag(tag);
                            }}
                            className="absolute top-0 right-0 p-1 text-red-500"
                            aria-label={`Remove tag ${tag.name}`}
                            >
                            ×
                            </button>
                        </div>
                        ))}
                    </div>
                </div>

                {/* File Information */}
                <div className="mb-4">
                    <p>
                        <strong>File ID:</strong> {file._id}
                    </p>
                    <p>
                        <strong>Upload Date:</strong> {new Date(file.uploadDate).toLocaleString()}
                    </p>
                    <p>
                        <strong>File Size:</strong> {(file.length / 1024).toFixed(2)} KB
                    </p>
                    <p>
                        <strong>File Location:</strong> {filePath || "Location not set"}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-4">
                    <button
                        onClick={handleDownload}
                        className="bg-green-500 text-white w-full py-2 rounded-md"
                    >
                        Download
                    </button>
                    <button
                        onClick={handleDelete}
                        className="bg-red-500 text-white w-full py-2 rounded-md"
                    >
                        Delete
                    </button>
                    <button
                        onClick={toggleMoveCard}
                        ref={moveButtonRef}
                        className="bg-blue-500 text-white w-full py-2 rounded-md"
                    >
                        Move File
                    </button>
                    {showMoveCard && (
                        <div
                            className="absolute mt-2 bg-white shadow-lg border rounded p-4"
                            style={{ top: moveButtonRef.current?.offsetHeight || 0 }}
                        >
                            <h3 className="text-lg font-semibold mb-2 text-black">
                                Select New Location
                            </h3>
                            <select
                                onChange={(e) => setSelectedOption(e.target.value)}
                                value={selectedOption || ""}
                                className="w-full border border-gray-300 rounded p-2 mb-4"
                            >
                                <option value="">Select new file location</option>
                                {semesters.map((semester) => (
                                <option
                                    key={semester.id}
                                    value={`${semester.id}`}
                                    disabled
                                    className="text-gray-500"
                                >
                                    {semester.name}
                                </option>
                                ))}
                                {semesters.map((semester) =>
                                    semester.subjects.map((subject) => (
                                        <option
                                        key={subject.id}
                                        value={`${semester.id}/${subject.id}`}
                                        disabled
                                        className="text-gray-500"
                                        >
                                        &nbsp;&nbsp;{subject.name}
                                        </option>
                                    ))
                                )}
                                {semesters.map((semester) =>
                                    semester.subjects.map((subject) =>
                                        subject.topics.map((topic) => (
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
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                            Replace File
                        </label>
                        <input
                            type="file"
                            onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                            className="w-full p-2 border rounded-md"
                        />
                        <button
                            onClick={handleReplaceFile}
                            className="bg-yellow-500 text-white w-full py-2 rounded-md mt-2"
                        >
                            Replace
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default FileView;