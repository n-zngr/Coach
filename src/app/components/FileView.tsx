"use client";

import { useState, useEffect, useCallback, ChangeEvent } from "react";

interface Tag {
    _id?: string;
    id?: string;
    name: string;
}

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
        tags?: Tag[];
    };
}

const FileView: React.FC<FileViewProps> = ({ file, onClose, onRename, onDelete, onDownload }) => {
    const [newFilename, setNewFilename] = useState<string>(file?.filename || "");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

    useEffect(() => {
        setNewFilename(file?.filename || "");
        if (file) {
            fetchTags(file._id);
        }
        // Clear any selected tag when file changes.
        setSelectedTag(null);
        setTagInput("");
    }, [file]);

    if (!file) return null;

    const handleRenameSubmit = useCallback(() => {
        onRename(file._id, newFilename);
    }, [file._id, newFilename, onRename]);

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
            // Refresh tags for this file.
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
                body: JSON.stringify({ fileId: file._id, tagId: selectedTag._id || selectedTag.id, newName }),
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

    const handleRemoveTag = useCallback(async (tagToRemove: Tag) => {
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
    }, [file._id, fetchTags]);

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
                            Rename
                        </button>
                    </div>
                    <div className="tags-container mt-4 flex flex-wrap">
                        {tags.map((tag) => (
                            <div
                                key={tag._id || tag.id}
                                onClick={() => selectTag(tag)}
                                className={`tag-box inline-block border rounded-md p-2 mr-2 mb-2 relative bg-gray-200 text-black cursor-pointer ${
                                    selectedTag && (selectedTag._id || selectedTag.id) === (tag._id || tag.id)
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