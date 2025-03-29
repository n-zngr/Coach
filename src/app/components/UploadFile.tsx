"use client";

import { useState, useEffect } from "react"; // useCallback, ChangeEvent, useRef

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
                        <div className="flex">
                            <h1 className="text-xl font-light">Upload {uploadType === "file" ? "File" : "Link"}</h1>
                        </div>
                        <div className="flex items-center">
                            <button className="text-red-500" onClick={closeUploadCard}>
                                Close [X]
                            </button>
                        </div>
                    </div>
                </header>
                <div className="flex flex-col gap-4 px-6 pb-6">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setUploadType("file")}
                            className={`px-4 py-2 rounded ${uploadType === "file" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
                        >
                            Upload File
                        </button>
                        <button
                            onClick={() => setUploadType("link")}
                            className={`px-4 py-2 rounded ${uploadType === "link" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
                        >
                            Upload Link
                        </button>
                    </div>

                    {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                    {successMessage && <p className="text-green-500">{successMessage}</p>}

                    {uploadType === "file" && (
                        <>
                            <div
                                className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${isDragging ? 'border-blue-500' : 'border-gray-400'}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {file ? (
                                    <div>
                                        <p>Selected file: {file.name}</p>
                                        <button onClick={handleClearFile} className="mt-2 text-sm text-red-500">
                                            Clear File
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <p>Drag and drop a file here or click to select a file.</p>
                                        <input type="file" onChange={handleFileChange} className="hidden" id="file-input" />
                                        <label htmlFor="file-input" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded inline-block cursor-pointer">
                                            Select File
                                        </label>
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {uploadType === "link" && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Link Name</label>
                                <input
                                    type="text"
                                    value={linkName}
                                    onChange={(e) => setLinkName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Link URL</label>
                                <input
                                    type="text"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                    {(uploadType === "file" || uploadType === "link") && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Select Topic</label>
                                <select
                                    value={selectedOption || ""}
                                    onChange={(e) => setSelectedOption(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="" disabled>Select a topic</option>
                                    {semesters.map((semester) => (
                                        semester.subjects.map((subject) => (
                                            subject.topics.map((topic) => (
                                                <option key={`${semester.id}/${subject.id}/${topic.id}`} value={`${semester.id}/${subject.id}/${topic.id}`}>
                                                    {semester.name} - {subject.name} - {topic.name}
                                                </option>
                                            ))
                                        ))
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={loading || !selectedOption || (uploadType === "file" && !file) || (uploadType === "link" && (!linkName || !linkUrl))}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                    >
                        {loading ? "Uploading..." : `Upload ${uploadType === "file" ? "File" : "Link"}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadFile;