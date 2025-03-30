"use client";

import { useState, useEffect } from "react"; // useCallback, ChangeEvent, useRef
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

interface Tag {
    _id?: string;
    id?: string;
    name: string;
}

interface UploadFileProps {
    triggerUpload: boolean;
    setTriggerUpload: (value: boolean) => void;
}

const UploadFile: React.FC<UploadFileProps> = ({ triggerUpload, setTriggerUpload }) => {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [linkName, setLinkName] = useState<string>("");
    const [linkUrl, setLinkUrl] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    //const [showUploadCard, setShowUploadCard] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadType, setUploadType] = useState<"file" | "link">("file");
    // const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<Tag[]>([]);
    // const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

    // const uploadButtonRef = useRef<HTMLButtonElement | null>(null);

    const closeUploadCard = () => {
        setTriggerUpload(false);
    };

    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                const response = await fetch('/api/documents/semesters', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();
                setSemesters(data);
            } catch (error) {
                console.error("Error fetching semesters, subjects, and topics: ", error);
            }
        };

        fetchSemesters();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleClearFile = () => {
        setFile(null);
    };

    const handleUpload = async () => {
        if (!selectedOption) {
            setErrorMessage("Please select a topic.");
            return;
        }

        const [semesterId, subjectId, topicId] = selectedOption.split("/");

        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            if (uploadType === "file" && file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('semesterId', semesterId);
                formData.append('subjectId', subjectId);
                formData.append('topicId', topicId);

                const response = await fetch('/api/documents/upload', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error("Failed to upload file");
                }

                setSuccessMessage("File uploaded successfully!");
                setFile(null);

                // Tags upload does not exist and should be implemented here. 

                /*
                // Tag creation for files
                if (tags && tags.length > 0) {
                    for (const tag of tags) {
                        await fetch('/api/documents/tags', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ fileId: file._id, tag: tag.name }),
                            credentials: 'include',
                        });
                    }
                }
                */
            } else if (uploadType === "link" && linkName && linkUrl && selectedOption) {
                const linkData = {
                    name: linkName,
                    url: linkUrl,
                    metadata: {
                        semesterId,
                        subjectId,
                        topicId,
                        tags: tags.map(tag => tag.name) // Send only names to create tags on the server
                    },
                };

                const linkResponse = await fetch('/api/documents/links/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(linkData),
                });
    
                if (!linkResponse.ok) {
                    throw new Error("Failed to upload link");
                }

                setSuccessMessage("Link uploaded successfully!");
                setLinkName("");
                setLinkUrl("");
                setTags([]);
            } else {
                setErrorMessage("Please fill out all required fields.");
                return;
            }

            setSelectedOption(null);
            setTriggerUpload(false);
        } catch (error) {
            console.error("Error during upload: ", error);
            setErrorMessage(uploadType === "file" ? "File upload failed." : "Link upload failed.");
        } finally {
            setLoading(false);
        }
    };

    /*const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setTagInput(e.target.value);
    }, []); <= only used in commented out section, nigga what??????*/

    /*const handleAddTag = useCallback(async () => {
        const newTag = tagInput.trim();
        if (!newTag) return;
        const response = await fetch('/api/documents/link-tags', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newTag }),
            credentials: 'include'
        });
        if (response.ok) {
            const newTagData = await response.json();
            setTags([...tags, { name: newTagData.name, id: newTagData._id }]);
            setTagInput("");
        } else {
            console.error("Error creating tag");
        }
    }, [tags, tagInput]); only used in commented out section wow*/

    /*const handleRenameTag = useCallback(async () => {
        if (!selectedTag) return;
        const newName = tagInput.trim();
        if (!newName) return;
        setTags(tags.map(tag => tag === selectedTag ? { ...tag, name: newName } : tag));
        setTagInput("");
        setSelectedTag(null);
    }, [tags, selectedTag, tagInput]);

    const handleRemoveTag = useCallback((tagToRemove: Tag) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
        setSelectedTag(null);
    }, [tags]); only used in commented out section*/

    /*const selectTag = useCallback((tag: Tag) => {
        setSelectedTag(tag);
        setTagInput(tag.name);
    }, []); only used in commented out section :^)*/

    return (
        <div className="fixed top-0 right-0 h-screen flex justify-end text-black-100 dark:text-white-900 z-10">
            <div
                className={`h-full flex flex-col bg-white-900 dark:bg-black-100 overflow-y-auto
                    border-l border-black-900 dark:border-white-100
                    transition-transform duration-300
                    ${triggerUpload ? "translate-x-0 w-96" : "translate-x-full w-0"}
                `}
            >
                <header className="h-[4.5rem] flex flex-col justify-center border-b border-black-900 dark:border-white-100 px-6 mb-6">
                    <div className="flex flex-row justify-between">
                        <div className="flex align-middle items-center">
                            <div className="size-[24px] flex items-center">
                                {uploadType === 'file' ? (
                                    <svg width="16.12" height="20" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5.56764 7.15385H8.49766M5.56764 11.7692H12.8927M5.56764 16.3846H12.8927M17.2877 19.4615C17.2877 19.8696 17.1334 20.2609 16.8586 20.5494C16.5839 20.8379 16.2113 21 15.8227 21H2.63762C2.24907 21 1.87644 20.8379 1.6017 20.5494C1.32696 20.2609 1.17261 19.8696 1.17261 19.4615V2.53846C1.17261 2.13044 1.32696 1.73912 1.6017 1.4506C1.87644 1.16209 2.24907 1 2.63762 1H9.96267L17.2877 8.69231V19.4615Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M7.74285 2.60014C7.59145 2.76261 7.50902 2.97752 7.51294 3.19957C7.51686 3.42162 7.60681 3.63348 7.76385 3.79053C7.92089 3.94756 8.13275 4.03752 8.3548 4.04144C8.57685 4.04536 8.79176 3.96294 8.95425 3.81153L10.3828 2.383C10.5951 2.17064 10.8472 2.00218 11.1247 1.88725C11.4022 1.77232 11.6995 1.71317 11.9999 1.71317C12.3002 1.71317 12.5976 1.77232 12.8751 1.88725C13.1525 2.00218 13.4046 2.17064 13.617 2.383C13.8293 2.59536 13.9978 2.84747 14.1127 3.12492C14.2276 3.40239 14.2868 3.69978 14.2868 4.0001C14.2868 4.30042 14.2276 4.5978 14.1127 4.87526C13.9978 5.15272 13.8293 5.40483 13.617 5.6172L10.7599 8.47426C10.5476 8.68677 10.2956 8.85536 10.0181 8.97037C9.7406 9.0854 9.44318 9.14461 9.14282 9.14461C8.84244 9.14461 8.54502 9.0854 8.26754 8.97037C7.99007 8.85536 7.73799 8.68677 7.52572 8.47426C7.36323 8.32286 7.14832 8.24043 6.92627 8.24435C6.70422 8.24827 6.49236 8.33822 6.33532 8.49526C6.17828 8.6523 6.08833 8.86416 6.08441 9.08621C6.08049 9.30826 6.16292 9.52317 6.31432 9.68566C6.68575 10.0571 7.12671 10.3518 7.61202 10.5528C8.09734 10.7539 8.6175 10.8573 9.14282 10.8573C9.66812 10.8573 10.1883 10.7539 10.6736 10.5528C11.1589 10.3518 11.5999 10.0571 11.9713 9.68566L14.8284 6.82859C15.5785 6.07842 16 5.06098 16 4.0001C16 2.9392 15.5785 1.92177 14.8284 1.17161C14.0782 0.421432 13.0608 0 11.9999 0C10.939 0 9.92155 0.421432 9.17138 1.17161L7.74285 2.60014ZM2.383 13.617C2.17048 13.4046 2.00189 13.1526 1.88688 12.8752C1.77185 12.5977 1.71264 12.3002 1.71264 11.9999C1.71264 11.6995 1.77185 11.4021 1.88688 11.1246C2.00189 10.8471 2.17048 10.595 2.383 10.3828L5.24007 7.52572C5.45233 7.3132 5.70442 7.14461 5.98189 7.02959C6.25936 6.91457 6.55678 6.85536 6.85716 6.85536C7.15753 6.85536 7.45495 6.91457 7.73243 7.02959C8.0099 7.14461 8.26198 7.3132 8.47426 7.52572C8.63674 7.67712 8.85165 7.75954 9.0737 7.75562C9.29575 7.7517 9.50761 7.66175 9.66465 7.50471C9.82169 7.34767 9.91164 7.13581 9.91556 6.91376C9.91948 6.69171 9.83706 6.4768 9.68566 6.31432C9.31423 5.94285 8.87326 5.64818 8.38795 5.44715C7.90263 5.24611 7.38246 5.14263 6.85716 5.14263C6.33185 5.14263 5.81168 5.24611 5.32637 5.44715C4.84106 5.64818 4.4001 5.94285 4.02867 6.31432L1.17161 9.17138C0.421432 9.92155 0 10.939 0 11.9999C0 13.0608 0.421432 14.0782 1.17161 14.8284C1.92177 15.5785 2.9392 16 4.0001 16C5.06098 16 6.07842 15.5785 6.82859 14.8284L8.25713 13.3998C8.40853 13.2373 8.49095 13.0225 8.48703 12.8004C8.48311 12.5784 8.39316 12.3665 8.23612 12.2095C8.07907 12.0525 7.86722 11.9624 7.64517 11.9585C7.42311 11.9546 7.20821 12.037 7.04573 12.1884L5.6172 13.617C5.40492 13.8294 5.15283 13.9981 4.87537 14.1131C4.59789 14.2282 4.30047 14.2874 4.0001 14.2874C3.69972 14.2874 3.4023 14.2282 3.12482 14.1131C2.84735 13.9981 2.59527 13.8294 2.383 13.617Z" fill="currentColor"/>
                                    </svg>
                                )}
                            </div>
                            <h1 className="text-xl font-light">Upload {uploadType === "file" ? "File" : "Link"}</h1>
                        </div>
                        <div className="flex items-center">
                            <CloseButton onClick={closeUploadCard} />
                        </div>
                    </div>
                </header>
                <div className="flex flex-col gap-4 px-6 pb-6">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setUploadType("file")}
                            className={`bg-transparent px-4 py-2 rounded-full border border-black-100 dark:border-white-900 hover:bg-black-100 dark:hover:bg-white-900 hover:text-white-900 dark:hover:text-black-100 transition-colors duration-300
                                ${uploadType === "file" ? "bg-dark-100 dark:bg-white-900 text-white-900 dark:text-black-100" : ""}`}
                        >
                            Upload File
                        </button>
                        <button
                            onClick={() => setUploadType("link")}
                            className={`bg-transparent px-4 py-2 rounded-full border border-black-100 dark:border-white-900 hover:bg-black-100 dark:hover:bg-white-900 hover:text-white-900 dark:hover:text-black-100 transition-colors duration-300
                                ${uploadType === "link" ? "bg-dark-100 dark:bg-white-900 text-white-900 dark:text-black-100" : ""}`}
                        >
                            Upload Link
                        </button>
                    </div>

                    {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                    {successMessage && <p className="text-green-500">{successMessage}</p>}

                    {uploadType === "file" && (
                        <>
                        <div
                            className={`bg-none border-2 
                                font-light text-black-500 dark:text-white-900 
                                border-dashed rounded-md p-6 text-center 
                                transition-colors duration-300 cursor-pointer
                                ${isDragging ?
                                    'border-black-900 dark:border-white-900' :
                                    'border-black-500 dark:border-white-500'
                                }
                            `}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById("file-input")?.click()} // Trigger file input click
                        >
                            {file ? (
                                <div>
                                    <p>Selected file: {file.name}</p>
                                    <button onClick={(e) => {e.stopPropagation(); handleClearFile();}} className="mt-2 text-sm text-red-500">
                                        Clear File
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="font-light text-xl">Drag and Drop</p>
                                    <p className="font-light text-sm text-black-500 dark:text-white-500">or click to upload</p>
                                    <input 
                                        type="file" 
                                        onChange={handleFileChange} 
                                        className="hidden" 
                                        id="file-input"
                                    />
                                </div>
                            )}
                        </div>
                    </>
                    )}

                    {uploadType === "link" && (
                        <>
                            <div>
                                <input
                                    type="text"
                                    value={linkName}
                                    placeholder='Link Name'
                                    onChange={(e) => setLinkName(e.target.value)}
                                    className="w-full flex items-center
                                    bg-transparent hover:bg-black-100 hover:dark:bg-white-900
                                    border border-black-100 dark:border-white-900 rounded-full
                                    hover:text-white-900 hover:dark:text-black-100
                                    placeholder:text-black-500 placeholder:dark:text-white-500 placeholder:hover:text-white-900 placeholder:dark:hover:text-black-100
                                    px-3 py-1
                                    transition-colors duration-300 outline-none"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    value={linkUrl}
                                    placeholder="Link URL"
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="w-full flex items-center
                                    bg-transparent hover:bg-black-100 hover:dark:bg-white-900
                                    border border-black-100 dark:border-white-900 rounded-full
                                    placeholder:text-black-500 placeholder:dark:text-white-500 placeholder:hover:text-white-900 placeholder:dark:hover:text-black-100
                                    hover:text-white-900 hover:dark:text-black-100
                                    px-3 py-1
                                    transition-colors duration-300 outline-none"
                                />
                            </div>

                            {/* Tag Section */}
                            {/*}
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
                                            className=={`tag-box inline-block border rounded-md p-2 mr-2 mb-2 relative bg-gray-200 text-black cursor-pointer ${selectedTag && (selectedTag._id || selectedTag.id) === (tag._id || tag.id) ? "border-blue-500" : ""}`}
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
                            </div>*/}
                        </>
                    )}

                    {/* Topic Selection */}
                    
                    <div className="mb-4">
                        
                        <select
                            value={selectedOption || ""}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            className='w-full
                            flex justify-center items-center 
                            bg-transparent hover:bg-black-100 hover:dark:bg-white-900
                            border border-black-100 dark:border-white-900 rounded-full
                            p-2
                            hover:text-white-900 hover:dark:text-black-100
                            transition-colors duration-300 cursor-pointer'
                        >
                            <option className="text-black-100 dark:text-white-900" value="" disabled>Set Location</option>
                                {semesters.map((semester) => (
                                    semester.subjects.map((subject) => (
                                        subject.topics.map((topic) => (
                                            <option key={`${semester.id}/${subject.id}/${topic.id}`} value={`${semester.id}/${subject.id}/${topic.id}`}>
                                                {semester.name} / {subject.name} / {topic.name}
                                            </option>
                                        ))
                                    ))
                                ))}
                        </select>
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={loading || !selectedOption || (uploadType === "file" && !file) || (uploadType === "link" && (!linkName || !linkUrl))}
                        className="w-full
                            disabled:border-white-900 disabled:bg-white-900 disabled:dark:bg-black-100 bg-black-100 hover:bg-white-900 dark:bg-white-900 hover:dark:bg-black-100
                            border border-black-100 dark:border-white-900 rounded-full
                            disabled:text-black-100 disabled:dark:text-white-900 text-white-900 dark:text-black-100 hover:text-black-100 hover:dark:text-white-900
                            transition-colors duration-300
                            px-4 py-2 disabled:cursor-not-allowed cursor-pointer
                            "
                    >
                        {loading ? "Uploading..." : `Upload ${uploadType === "file" ? "File" : "Link"}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadFile;