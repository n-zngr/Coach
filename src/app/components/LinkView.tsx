"use client";

import React, { useState, useEffect, useCallback, ChangeEvent, useRef } from "react";
import TagDropdown from "./Tags/TagDropdown";
import CloseButton from "./Buttons/CloseButton";

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

export interface AppLink {
    _id: string;
    name: string;
    url: string;
    metadata: {
        userId: string;
        semesterId?: string;
        subjectId?: string;
        topicId?: string;
        tags?: { id: string; name: string }[];
        createdAt?: string;
    };
}

export interface Tag {
    _id?: string;
    id?: string;
    name: string;
}

interface LinkViewProps {
    link: AppLink | null;
    onClose: () => void;
}

const LinkView: React.FC<LinkViewProps> = ({ link, onClose }) => {
    // Rename file state
    const [newFilename, setNewFilename] = useState<string>(link?.name ?? "");
    const [originalFilename, setOriginalFilename] = useState<string>(link?.name || "");

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

    // Notification - Currently Unused
    // const [notification, setNotification] = useState<{ title: string; description: string; isVisible: boolean; }>({ title: '', description: '', isVisible: false })


    // --- Helper Functions ---
    const updateFilenameState = useCallback((filename: string) => {
        setNewFilename(filename);
        setOriginalFilename(filename);
    }, []);
    
    // --- Effects ---

    useEffect(() => { // Initialize linkname state
        if (link?.name) {
          updateFilenameState(link.name);
        }
    }, [link, updateFilenameState]);
    
    useEffect(() => { // Fetch semesters and build file path
        const fetchSemesters = async () => {
            try {
                const response = await fetch('/api/documents/semesters', {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await response.json();
                setSemesters(data);

                if (link?.metadata.semesterId && link?.metadata.subjectId && link?.metadata.topicId) {
                    const semester = data.find((sem: Semester) => sem.id === link.metadata.semesterId);
                    const subject = semester?.subjects.find((sub: Subject) => sub.id === link.metadata.subjectId);
                    const topic = subject?.topics.find((top: Topic) => top.id === link.metadata.topicId);
                    setFilePath(`${semester?.name || ""} / ${subject?.name || ""} / ${topic?.name || ""}`);
                }
            } catch (error) {
                console.error('Error fetching semesters: ', error);
            }
        };

        fetchSemesters();
    }, [link]);

    // --- link Actions ---
    const handleRename = useCallback(async () => {
        try {
            const response = await fetch(`/api/documents/rename/${link?._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newFilename })
            });

            if (!response.ok) {
                throw new Error('Failed to rename file');
            }

            console.log('File renamed successfully');
            setOriginalFilename(newFilename);
        } catch (error) {
            console.error('Error renaming file:', error);
        }
    }, [link?._id, newFilename]);

    const handleRenameInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewFilename(e.target.value);
    };

    const handleRenameInputBlur = () => {
        setTimeout(() => {
            if (newFilename.trim() !== originalFilename.trim()) {
                handleRename();
            }
        }, 150);
    };

    const handleRenameInputEnterPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (newFilename.trim() !== originalFilename.trim()) {
                handleRename();
            }
            e.currentTarget.blur();
        }
    }

    const handleDelete = useCallback(async () => {
        try {
            const response = await fetch(`/api/documents/delete/${link?._id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Delete failed:", response.status, errorText);
                throw new Error('Failed to delete file');
              }

            console.log('File deleted successfully');
            onClose();
        } catch (error) {
            console.error('Error deleting file', error);
        }
    }, [link?._id, onClose]);
    
    const handleMoveFile = useCallback(async () => {
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
            const response = await fetch(`/api/documents/move/${link?._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ semesterId, subjectId, topicId }),
            });

            if (!response.ok) {
                throw new Error("Failed to move file");
            }

            console.log("File moved successfully");
            setShowMoveCard(false);
            onClose();
        } catch (error) {
            console.error("Error moving file:", error);
        }
    }, [link?._id, selectedOption, onClose]);

    const toggleMoveCard = () => {
        setShowMoveCard((prev) => !prev);
    };

    // --- Tag Actions ---
    const fetchTags = useCallback(async (fileId: string) => {
        try {
            console.log("Fetching tags for fileId:", fileId);
            const response = await fetch(`/api/documents/tags/tags?fileId=${fileId}`, { credentials: "include" });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Failed to fetch tags:", response.status, errorText);
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

    useEffect(() => {
        if (link) {
          fetchTags(link._id);
          fetchAllTags();
        }
        setSelectedTag(null);
        setTagInput("");
    }, [link, fetchTags, fetchAllTags]);

    const handleAddTag = useCallback(async (tagName: string) => { // Add new tag logic – called when no existing tag matches the input.
        if (!tagName.trim() || !link) return;

        try {
            const response = await fetch("/api/documents/tags/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ fileId: link._id, tag: tagName.trim() }),
            });
            if (!response.ok) {
                console.error("Failed to add tag");
                return;
            }
            fetchTags(link._id);
        } catch (error) {
            console.error("Error adding tag:", error);
        }
        setTagInput("");
        setShowTagInput(false);
        setSelectedTag(null);
    }, [link, fetchTags]);

    const handleNewTagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTagInput(e.target.value);
    };

    const handleNewTagInputEnterPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const exists = filteredTags.some(tag => tag.name.toLowerCase() === tagInput.toLowerCase());
            if (!exists) {
                handleAddTag(tagInput);
            }

            e.currentTarget.blur();
        }
    }

    const handleNewTagInputBlur = () => {
        setTimeout(() => {
            const exists = allTags.some(tag => tag.name.toLowerCase() === tagInput.toLowerCase());
            if (tagInput.trim() && !exists) {
                handleAddTag(tagInput);
            }
            setShowTagInput(false);
        }, 150);
    };

    const handleRenameTag = useCallback(async () => {
        if (!selectedTag || !link) return;
        const newName = tagInput.trim();

        if (newName === (selectedTag.name || "").trim()) {
            setTagInput("");
            setSelectedTag(null);
            return;
        }

        try {
            const response = await fetch("/api/documents/tags/tags", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    fileId: link._id,
                    tagId: selectedTag._id || selectedTag.id,
                    newName,
                }),
            });

            if (!response.ok) {
                console.error("Failed to rename tag");
                return;
            }

            fetchTags(link._id);
        } catch (error) {
            console.error("Error renaming tag:", error);
        }

        setTagInput("");
        setSelectedTag(null);
    }, [link, selectedTag, tagInput, fetchTags]);

    const handleEditTagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTagInput(e.target.value);
    };

    const handleEditTagInputEnterPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const exists = allTags.some(tag => tag.name.toLowerCase() === tagInput.toLowerCase());
            if (!exists) {
                handleRenameTag();
            }
        }
    };

    const handleEditTagInputBlur = () => {
        handleRenameTag();
    };

    const handleRemoveTag = useCallback(async (tagToRemove: Tag) => {
        if (!link) return;
        try {
            const response = await fetch("/api/documents/tags/tags", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ fileId: link._id, tag: tagToRemove.name }),
            });
            if (!response.ok) {
                console.error("Failed to remove tag");
                return;
            }
            fetchTags(link._id);
        } catch (error) {
            console.error("Error removing tag:", error);
        }
    }, [link, fetchTags]);

    const handleSelectTag = useCallback((tag: Tag) => { // When an existing tag is selected from the dropdown.
        setTagInput(tag.name); // When a suggestion is selected, update the input.
        if (selectedTag) { // For inline editing, you may want to immediately update:
            handleRenameTag();
        } else { // For new tag addition, add the tag if it is not already associated.
            if (link && !tags.find(t => (t._id || t.id) === (tag._id || tag.id))) {
                fetch("/api/documents/tags/tags", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ fileId: link._id, tag: tag.name }),
                })
                .then((response) => {
                    if (!response.ok) console.error("Failed to add tag");
                    else {
                        fetchTags(link._id);
                    }
                })
                .catch((error) => console.error("Error adding tag:", error));
            }
        }
        setTagInput("");
        setShowTagInput(false);
    }, [link, selectedTag, tags, fetchTags, handleRenameTag]);

    const filteredTags = allTags.filter((tag) =>
        tag.name.toLowerCase().includes(tagInput.toLowerCase())
    );

    const selectTag = useCallback((tag: Tag) => {
        setSelectedTag(tag);
        setTagInput(tag.name);
    }, []);

    if (!link) return null;

    return (
        <div className="fixed top-0 right-0 h-screen flex justify-end text-black-100 dark:text-white-900 z-10">
            <div
                className={`
                    h-full flex flex-col bg-white-900 dark:bg-black-100 overflow-y-auto
                    border-l border-black-900 dark:border-white-100
                    transition-transform duration-300 
                    ${link ? "translate-x-0 w-96" : "translate-x-full w-0"}
                `}
            >
                <header className='flex flex-col p-6 pb-4 border-b border-black-900 dark:border-white-100 mb-6'>
                    <div className="flex flex-row justify-between">
                        <div className="flex">
                            <div className="size-[24px]">
                                <svg width="16.12" height="20" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.56764 7.15385H8.49766M5.56764 11.7692H12.8927M5.56764 16.3846H12.8927M17.2877 19.4615C17.2877 19.8696 17.1334 20.2609 16.8586 20.5494C16.5839 20.8379 16.2113 21 15.8227 21H2.63762C2.24907 21 1.87644 20.8379 1.6017 20.5494C1.32696 20.2609 1.17261 19.8696 1.17261 19.4615V2.53846C1.17261 2.13044 1.32696 1.73912 1.6017 1.4506C1.87644 1.16209 2.24907 1 2.63762 1H9.96267L17.2877 8.69231V19.4615Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="flex">
                                <h1 className="text-xl font-light">File Preview</h1>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <CloseButton onClick={onClose} />
                        </div>
                    </div>
                </header>

                {/* Filename & Rename */}
                <div className="flex flex-col gap-4 px-6 pb-6">
                    <div className="flex justify-between items-center gap-4">
                        <input
                            type='text'
                            value={newFilename}
                            onChange={handleRenameInputChange}
                            onBlur={handleRenameInputBlur}
                            onKeyDown={handleRenameInputEnterPressed}
                            className='w-full bg-transparent border-b border-transparent focus:border-white-500 focus:dark:border-black-500 focus:outline-none font-medium text-lg text-black-500 dark:text-white-500'
                        />
                    </div>
                    {link.url && (
                        <a
                            href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline break-all"
                        >
                            {link.url}
                        </a>
                    )}
                    <button ref={moveButtonRef}
                        onClick={toggleMoveCard}
                        className='w-fit
                        flex justify-center items-center 
                        bg-none hover:bg-black-100 hover:dark:bg-white-900
                        border border-black-100 dark:border-white-900 rounded-full
                        px-3 py-1 gap-2
                        hover:text-white-900 hover:dark:text-black-100
                        transition-colors duration-300
                        '>
                        <p>
                            {filePath || "Location not set"}
                        </p>
                        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.6107 9.30934V12.0773C11.6107 12.322 11.5134 12.5567 11.3404 12.7298C11.1674 12.9028 10.9327 13 10.688 13H1.92267C1.67796 13 1.44328 12.9028 1.27024 12.7298C1.09721 12.5567 1 12.322 1 12.0773V3.31201C1 3.06731 1.09721 2.83262 1.27024 2.65959C1.44328 2.48656 1.67796 2.38935 1.92267 2.38935H4.69066M7.45866 8.84801L4.69066 9.34625L5.15199 6.54134L10.4389 1.27292C10.5246 1.18644 10.6267 1.1178 10.7391 1.07096C10.8516 1.02412 10.9722 1 11.094 1C11.2158 1 11.3364 1.02412 11.4488 1.07096C11.5612 1.1178 11.6633 1.18644 11.7491 1.27292L12.7271 2.25095C12.8136 2.33672 12.8822 2.43877 12.929 2.55121C12.9759 2.66364 13 2.78424 13 2.90604C13 3.02784 12.9759 3.14844 12.929 3.26088C12.8822 3.37331 12.8136 3.47536 12.7271 3.56113L7.45866 8.84801Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="relative pt-2 px-6"> {/*Divider*/}
                        <div className="absolute bottom-0 left-0 h-[1px] w-[100%] bg-black-900 dark:bg-white-100"></div>
                    </div>
                </div>

                {/* Tag Section */}
                <div className="flex flex-col gap-4 px-6 pb-6 transition-all duration-300">
                    <h3 className="text-md font-light text-black-100 dark:text-white-900">Tags</h3>

                    {/* Display current tags for this file */}
                    <div className="
                        flex flex-wrap gap-2
                        font-light text-black-500 dark:text-white-500 border-black-100 dark:border-white-900
                        ">
                        {tags.map((tag) => (
                            <div
                                key={tag._id || tag.id}
                                className="relative
                                flex items-center
                                bg-none hover:bg-black-100 hover:dark:bg-white-900
                                border border-black-100 dark:border-white-900 rounded-full
                                px-3 py-1
                                hover:text-white-900 hover:dark:text-black-100
                                transition-colors duration-300 cursor-pointer"
                                onClick={() => {
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
                                            onChange={handleEditTagInputChange}
                                            onBlur={handleEditTagInputBlur}
                                            onKeyDown={handleEditTagInputEnterPressed}
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
                                        aria-label={`Remove tag ${tag.name}`}
                                    >
                                    ×
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* New Tag element */}
                        <div className="relative
                            flex items-center
                            bg-black-100 dark:bg-white-900 hover:bg-transparent hover:dark:bg-transparent
                            border border-black-100 dark:border-white-900 rounded-full
                            px-3 py-1
                            font-normal text-white-900 dark:text-black-100 text-nowrap
                            hover:text-black-100 hover:dark:text-white-900
                            transition-colors duration-300 cursor-pointer"
                            onClick={() => {
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
                                    onChange={handleNewTagInputChange}
                                    onBlur={handleNewTagInputBlur}
                                    onKeyDown={handleNewTagInputEnterPressed}
                                    className="bg-transparent border-b focus:outline-none"
                                    autoFocus
                                />
                                <TagDropdown filteredTags={filteredTags} onSelect={handleSelectTag} />
                                </div>
                            ) : (
                                <div className='flex justify-center items-center gap-2'>
                                    <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 1V9M1 4.97538H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>New Tag</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="relative pt-2 px-6"> {/*Divider*/}
                        <div className="absolute bottom-0 left-0 h-[1px] w-[100%] bg-black-900 dark:bg-white-100"></div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 justify-center gap-2 px-6">
                    <button
                        onClick={handleDelete}
                        className="
                            bg-none hover:bg-black-100 hover:dark:bg-white-900
                            border border-black-100 dark:border-white-900 rounded-lg
                            font-light text-black-100 dark:text-white-900 hover:text-white-900 hover:dark:text-black-100
                            transition-colors duration-200 cursor-pointer"
                    >
                        <div className='flex flex-col justify-center items-center gap-4 p-4'>
                            <svg width="28" height="32" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.5 5.61538H19.5M6.75 5.61538V4.84615C6.75 3.82609 7.14509 2.84781 7.84835 2.12651C8.55161 1.40522 9.50544 1 10.5 1C11.4946 1 12.4484 1.40522 13.1517 2.12651C13.8549 2.84781 14.25 3.82609 14.25 4.84615V5.61538M8.25 8.69231V17.1538M12.75 8.69231V17.1538M3.75 5.61538H17.25V19.4615C17.25 19.8696 17.092 20.2609 16.8107 20.5494C16.5294 20.8379 16.1478 21 15.75 21H5.25C4.85218 21 4.47064 20.8379 4.18934 20.5494C3.90804 20.2609 3.75 19.8696 3.75 19.4615V5.61538Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <p>Delete</p>
                        </div>
                    </button>

                    {/* Move Card */}
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
                </div>
            </div>
        </div>
    );
};

export default LinkView;