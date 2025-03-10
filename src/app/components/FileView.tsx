"use client";

import React from 'react';
import { useState, useEffect, useCallback, ChangeEvent, useRef } from "react";
import TagDropdown from "./Tags/TagDropdown";

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

export interface Tag {
    _id?: string;
    id?: string;
    name: string;
}

interface FileViewProps {
    file: File | null;
    onClose: () => void;
}


const FileView: React.FC<FileViewProps> = ({ file, onClose }) => {
    // Rename file state
    const [newFilename, setNewFilename] = useState<string>(file?.filename || "");

    // Tag states
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<Tag[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
    const [showTagInput, setShowTagInput] = useState(false);

    // Move file states
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showMoveCard, setShowMoveCard] = useState(false);
    const [filePath, setFilePath] = useState<string | null>(null);
    const moveButtonRef = useRef<HTMLButtonElement | null>(null);

    // Replace file state
    const [replaceFile, setReplaceFile] = useState<globalThis.File | null>(null);

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

    const handleClose = async () => { // Additional handleClose method, to include rename on FileView closure
        if (newFilename.trim() !== file.filename.trim()) {
            await handleRename();
        }
        onClose();
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
            const response = await fetch(`/api/documents/tags/tags?fileId=${fileId}`, { credentials: "include" });

            if (!response.ok) {
                console.error("Failed to fetch tags");
                return;
            }

            const data = await response.json();
            setTags(data.tags || []);
        } catch (error) {
            console.error("Error fetching tags:", error);
        }
    }, []);

    const fetchAllTags = useCallback(async () => {
        try {
            const response = await fetch('/api/documents/tags/allTags', { credentials: 'include' });

            if (!response.ok) {
                console.error('Failed to fetch all tags');
                return;
            }
            
            const data = await response.json();
            setAllTags(data.tags || []);
        } catch (error) {
            console.error('Error fetching all tags:', error);
        }
    }, []);

    useEffect(() => { // Updates on file change, renders tags and file name
        setNewFilename(file?.filename || "");
        if (file) {
            fetchTags(file._id);
            fetchAllTags();
        }
        // Clear any selected tag when file changes.
        setSelectedTag(null);
        setTagInput("");
    }, [file, fetchTags, fetchAllTags]);
    
    const handleRenameTag = useCallback(async () => {
        if (!selectedTag) return;
        const newName = tagInput.trim();
        if (!newName) return;
        try {
            const response = await fetch("/api/documents/tags/tags", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    fileId: file._id,
                    tagId: selectedTag._id || selectedTag.id,
                    newName,
                }),
            });
        
            if (!response.ok) {
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
                const res = await fetch("/api/documents/tags/tags", {
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

    const handleAddTag = useCallback(async (tagName: string) => { // Add new tag logic – called when no existing tag matches the input.
        if (!tagName.trim()) return;

        try {
            const response = await fetch("/api/documents/tags/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ fileId: file?._id, tag: tagName.trim() }),
            });
        if (!response.ok) {
            console.error("Failed to add tag");
            return;
        }
            fetchTags(file!._id);
        } catch (error) {
            console.error("Error adding tag:", error);
        }
        setTagInput("");
        setShowTagInput(false);
        setSelectedTag(null);
    }, [file._id, tagInput, fetchTags]);
    
    const handleSelectTag = useCallback((tag: Tag) => { // When an existing tag is selected from the dropdown.
        // When a suggestion is selected, update the input.
        setTagInput(tag.name);
        // For inline editing, you may want to immediately update:
        if (selectedTag) {
            handleRenameTag();
        } else {
        // For new tag addition, add the tag if it’s not already associated.
        if (!tags.find(t => (t._id || t.id) === (tag._id || tag.id))) {
            fetch("/api/documents/tags/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ fileId: file?._id, tag: tag.name }),
            })
            .then((response) => {
                if (!response.ok) console.error("Failed to add tag");
                else {
                    fetchTags(file!._id);
                }
            })
            .catch((error) => console.error("Error adding tag:", error));
        }
        setTagInput("");
        setShowTagInput(false);
        }
    }, [file, selectedTag, tags, fetchTags, handleRenameTag]);

    const filteredTags = allTags.filter((tag) =>
        tag.name.toLowerCase().includes(tagInput.toLowerCase())
    );
    
    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            // If no existing tag matches, create new.
            const exists = filteredTags.some(tag => tag.name.toLowerCase() === tagInput.toLowerCase());
            if (!exists) {
                handleAddTag(tagInput);
            }
        }
    };

    const handleTagInputBlur = () => { // On blur, if the tagInput is non-empty and doesn’t match an existing tag, add it.
        setTimeout(() => { // A small timeout helps with the click selection on the dropdown
            if (tagInput.trim()) {
                const exists = filteredTags.some(tag => tag.name.toLowerCase() === tagInput.toLowerCase());
                if (!exists) {
                    handleAddTag(tagInput);
                }
            }
            setShowTagInput(false);
        }, 150);
    };

    
    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setTagInput(e.target.value);
    }, []);
    
    const selectTag = useCallback((tag: Tag) => {
        setSelectedTag(tag);
        setTagInput(tag.name);
    }, []);

    return (
        <div className="fixed inset-0 flex justify-end">
            <div
                className={`
                    h-full flex flex-col bg-white-800 dark:bg-black-200 overflow-y-auto
                    border-l border-white-500 dark:border-black-500
                    transition-transform duration-300 
                    ${file ? "translate-x-0 w-96" : "translate-x-full w-0"}
                `}
            >
                <header className='flex flex-col p-6'>
                    <div className="flex flex-row justify-between">
                        <div className="flex">
                            <div className="size-[24px]">
                                <svg width="16.12" height="20" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.56764 7.15385H8.49766M5.56764 11.7692H12.8927M5.56764 16.3846H12.8927M17.2877 19.4615C17.2877 19.8696 17.1334 20.2609 16.8586 20.5494C16.5839 20.8379 16.2113 21 15.8227 21H2.63762C2.24907 21 1.87644 20.8379 1.6017 20.5494C1.32696 20.2609 1.17261 19.8696 1.17261 19.4615V2.53846C1.17261 2.13044 1.32696 1.73912 1.6017 1.4506C1.87644 1.16209 2.24907 1 2.63762 1H9.96267L17.2877 8.69231V19.4615Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="flex">
                                <h1 className="text-xl">File Preview</h1>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button
                                className="w-8 h-8 flex rounded-full justify-center items-center bg-white-500 hover:bg-white-600 dark:bg-black-500 dark:hover:bg-black-600 active:scale-95 transition-all duration-100"
                                onClick={handleClose}
                            >
                                <svg width="12" height="12" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17 1L1 17M1 1L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="relative px-6 pt-4"> {/* Divider */}
                        <div className="absolute bottom-0 left-0 h-[1px] w-[100%] bg-white-500 dark:bg-black-500"></div>
                    </div>
                </header>

                {/* Filename & Rename */}
                <div className="flex flex-col gap-4 px-6 pb-6">
                    <div className="flex justify-between items-center gap-4">
                        <input
                            type='text'
                            value={newFilename}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewFilename(e.target.value)}
                            className='w-full bg-transparent border-b border-transparent focus:border-white-500 focus:dark:border-black-500 focus:outline-none font-medium text-lg text-black-500 dark:text-white-500'
                        />
                        <p className='whitespace-nowrap text-gray-500'>
                            {(file.length / 1024).toFixed(0)} KB
                        </p>
                    </div>
                    <div className="flex">
                        <p className="text-base text-black-900 dark:text-white-100">
                            File description will be displayed here once implemented.
                        </p>
                    </div>
                    <div className="flex">
                        (Move functionality to be implemented here.)
                    </div>
                    <div className="relative px-6"> {/*Divider*/}
                        <div className="absolute bottom-0 left-0 h-[1px] w-[100%] bg-white-500 dark:bg-black-500"></div>
                    </div>
                </div>

                {/* Tag Section */}
                <div className="flex flex-col mb-4 px-6 gap-4">
                    <h3 className="text-lg text-black-900 dark:text-white-100">Tags</h3>

                    {/* Display current tags for this file */}
                    <div className="flex flex-wrap gap-2 font-medium text-gray-500">
                        {tags.map((tag) => (
                            <div
                                key={tag._id || tag.id}
                                className="relative flex items-center border border-white-500 dark:border-black-500 bg-none hover:bg-black-300 rounded-full px-3 py-1 cursor-pointer"
                                onClick={() => {
                                    // Trigger inline editing for this tag.
                                    setShowTagInput(false);
                                    selectTag(tag);
                                }}
                            >
                                <div className='flex justify-center items-center gap-2'>
                                    <svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1.6172 7.04857L4.95149 10.3829C5.07203 10.5032 5.23542 10.5709 5.40578 10.5709C5.57613 10.5709 5.73953 10.5032 5.86006 10.3829L10.6623 5.86717C10.8609 5.67839 10.9733 5.41639 10.9733 5.1424V2.02673C10.9733 1.47445 10.5256 1.02673 9.97333 1.02673L6.85777 1.02673C6.58377 1.02673 6.32177 1.13916 6.13299 1.33774L1.6172 6.14C1.49682 6.26053 1.4292 6.42393 1.4292 6.59428C1.4292 6.76464 1.49682 6.92803 1.6172 7.04857Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M7.75 3.625C7.75 3.97018 8.02982 4.25 8.375 4.25C8.72018 4.25 9 3.97018 9 3.625C9 3.27982 8.72018 3 8.375 3C8.02982 3 7.75 3.27982 7.75 3.625Z" fill="currentColor"/>
                                    </svg>

                                    {selectedTag &&
                                    (selectedTag._id || selectedTag.id) === (tag._id || tag.id) ? (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={handleInputChange}
                                            onBlur={handleRenameTag}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleRenameTag();
                                                }
                                            }}
                                            className="bg-transparent border-b focus:outline-none"
                                            autoFocus
                                        />
                                        <TagDropdown filteredTags={filteredTags} onSelect={handleSelectTag} />
                                    </div>
                                    ) : (
                                        <span>{tag.name}</span>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveTag(tag);
                                        }}
                                        className="text-gray-500"
                                        aria-label={`Remove tag ${tag.name}`}
                                    >
                                    ×
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* New Tag element */}
                        <div className="border border-white-500 dark:border-black-500 bg-none hover:bg-black-300 rounded-full px-3 py-1 flex items-center cursor-pointer"
                            onClick={() => {
                            // When clicking the "New Tag" element, show the inline input.
                                setSelectedTag(null);
                                setTagInput("");
                                setShowTagInput(true);
                            }}>
                            {showTagInput ? (
                                <div className="relative">
                                <input
                                    type="text"
                                    placeholder="New Tag"
                                    value={tagInput}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                                    onBlur={handleTagInputBlur}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            // If no existing tag matches, add the new tag.
                                            const exists = filteredTags.some(
                                                (tag) => tag.name.toLowerCase() === tagInput.toLowerCase()
                                            );
                                            if (!exists) {
                                                handleAddTag(tagInput);
                                            }
                                        }
                                    }}
                                    className="bg-transparent border-b focus:outline-none"
                                    autoFocus
                                />
                                <TagDropdown filteredTags={filteredTags} onSelect={handleSelectTag} />
                                </div>
                            ) : (
                                <div className='flex justify-center items-center gap-2 text-gray-500'>
                                    <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 1V9M1 4.97538H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>New Tag</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="relative px-6"> {/*Divider*/}
                        <div className="absolute bottom-0 left-0 h-[1px] w-[100%] bg-white-500 dark:bg-black-500"></div>
                    </div>
                </div>

                {/* File Information */}
                <div className="mb-4">
                    <p>
                        <strong>Upload Date:</strong> {new Date(file.uploadDate).toLocaleString()}
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