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
    const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    const handleReplaceFile = async (selectedFile: globalThis.File) => {
        const formData = new FormData();
        formData.append("file", selectedFile, selectedFile.name);
        
        try {
            const response = await fetch(`/api/documents/replace/${file._id}`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to replace file');
            }

            console.log("File replaced successfully");
        } catch (error) {
            console.error('Error replacing file: ', error);
        }
    };

    const handleReplaceUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleReplaceFile(selectedFile);
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
                        (Move, linked documents, multiple document paths functionality to be implemented here.)
                    </div>
                    <button className='flex justify-center items-center w-fit bg-white-600 dark:bg-black-400 px-3 py-1 rounded-full gap-2'>
                        <p>
                            {filePath || "Location not set"}
                        </p>
                        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.6107 9.30934V12.0773C11.6107 12.322 11.5134 12.5567 11.3404 12.7298C11.1674 12.9028 10.9327 13 10.688 13H1.92267C1.67796 13 1.44328 12.9028 1.27024 12.7298C1.09721 12.5567 1 12.322 1 12.0773V3.31201C1 3.06731 1.09721 2.83262 1.27024 2.65959C1.44328 2.48656 1.67796 2.38935 1.92267 2.38935H4.69066M7.45866 8.84801L4.69066 9.34625L5.15199 6.54134L10.4389 1.27292C10.5246 1.18644 10.6267 1.1178 10.7391 1.07096C10.8516 1.02412 10.9722 1 11.094 1C11.2158 1 11.3364 1.02412 11.4488 1.07096C11.5612 1.1178 11.6633 1.18644 11.7491 1.27292L12.7271 2.25095C12.8136 2.33672 12.8822 2.43877 12.929 2.55121C12.9759 2.66364 13 2.78424 13 2.90604C13 3.02784 12.9759 3.14844 12.929 3.26088C12.8822 3.37331 12.8136 3.47536 12.7271 3.56113L7.45866 8.84801Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="relative px-6"> {/*Divider*/}
                        <div className="absolute bottom-0 left-0 h-[1px] w-[100%] bg-white-500 dark:bg-black-500"></div>
                    </div>
                </div>

                {/* Tag Section */}
                <div className="flex flex-col gap-4 px-6 pb-6 transition-all duration-300">
                    <h3 className="text-lg text-black-900 dark:text-white-100">Tags</h3>

                    {/* Display current tags for this file */}
                    <div className="flex flex-wrap gap-2 font-medium text-gray-500">
                        {tags.map((tag) => (
                            <div
                                key={tag._id || tag.id}
                                className="relative flex items-center border border-white-500 dark:border-black-500 bg-none hover:bg-black-300 rounded-full px-3 py-1 transition-colors duration-200 cursor-pointer"
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
                        <div className="border border-white-500 dark:border-black-500 bg-none hover:bg-black-300 rounded-full px-3 py-1 flex items-center transition-colors duration-200 cursor-pointer"
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
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 justify-center gap-4 p-4">
                    <button
                        onClick={handleDownload}
                        className="
                            bg-white-600 dark:bg-black-400 hover:bg-white-500 hover:dark:bg-black-500
                            border border-white-400 dark:border-black-600 rounded-lg
                            text-black-500 dark:text-white-500
                            transition-colors duration-200"
                    >
                        <div className='flex flex-col justify-center items-center gap-4 p-4 hover:text-black-100 hover:dark:text-white-900 text-gray-500 transition-colors duration-200'>
                            <svg width="26" height="32" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.25 7.4H15.75C15.9489 7.4 16.1397 7.48429 16.2803 7.63431C16.421 7.78434 16.5 7.98783 16.5 8.2V20.2C16.5 20.4122 16.421 20.6157 16.2803 20.7657C16.1397 20.9157 15.9489 21 15.75 21H2.25C2.05109 21 1.86032 20.9157 1.71967 20.7657C1.57902 20.6157 1.5 20.4122 1.5 20.2V8.2C1.5 7.98783 1.57902 7.78434 1.71967 7.63431C1.86032 7.48429 2.05109 7.4 2.25 7.4H3.75M9 1V13.8M9 13.8L6 10.6M9 13.8L12 10.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <p>Download</p>
                        </div>
                    </button>
                    <button
                        onClick={handleDelete}
                        className="
                            bg-white-600 dark:bg-black-400 hover:bg-white-500 hover:dark:bg-black-500
                            border border-white-400 dark:border-black-600 rounded-lg
                            text-black-500 dark:text-white-500
                            transition-colors duration-200"
                    >
                        <div className='flex flex-col justify-center items-center gap-4 p-4 text-gray-500 hover:text-black-100 hover:dark:text-white-900 transition-colors duration-200'>
                            <svg width="28" height="32" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.5 5.61538H19.5M6.75 5.61538V4.84615C6.75 3.82609 7.14509 2.84781 7.84835 2.12651C8.55161 1.40522 9.50544 1 10.5 1C11.4946 1 12.4484 1.40522 13.1517 2.12651C13.8549 2.84781 14.25 3.82609 14.25 4.84615V5.61538M8.25 8.69231V17.1538M12.75 8.69231V17.1538M3.75 5.61538H17.25V19.4615C17.25 19.8696 17.092 20.2609 16.8107 20.5494C16.5294 20.8379 16.1478 21 15.75 21H5.25C4.85218 21 4.47064 20.8379 4.18934 20.5494C3.90804 20.2609 3.75 19.8696 3.75 19.4615V5.61538Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <p>Delete</p>
                        </div>
                    </button>
                    <button
                        onClick={handleReplaceUploadClick}
                        className="
                            bg-white-600 dark:bg-black-400 hover:bg-white-500 hover:dark:bg-black-500
                            border border-white-400 dark:border-black-600 rounded-lg
                            text-black-500 dark:text-white-500
                            transition-colors duration-200"
                    >
                        <div className="flex flex-col justify-center items-center gap-4 p-4 text-gray-500 hover:text-black-100 hover:dark:text-white-900 transition-colors duration-200">
                            <svg width="26" height="32" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.25 7.92308H15.75C15.9489 7.92308 16.1397 8.00412 16.2803 8.14838C16.421 8.29264 16.5 8.4883 16.5 8.69231V20.2308C16.5 20.4348 16.421 20.6304 16.2803 20.7747C16.1397 20.919 15.9489 21 15.75 21H2.25C2.05109 21 1.86032 20.919 1.71967 20.7747C1.57902 20.6304 1.5 20.4348 1.5 20.2308V8.69231C1.5 8.4883 1.57902 8.29264 1.71967 8.14838C1.86032 8.00412 2.05109 7.92308 2.25 7.92308H3.75M9 11.7692V1M9 1L6 4.07692M9 1L12 4.07692" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <p>Upload</p>
                        </div>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />

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
                            onClick={handleReplaceUploadClick}
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