"use client";

import { useState, useEffect, useRef, useCallback, ChangeEvent } from "react";

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

const UploadFile: React.FC = () => {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [linkName, setLinkName] = useState<string>("");
    const [linkUrl, setLinkUrl] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showUploadCard, setShowUploadCard] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadType, setUploadType] = useState<"file" | "link">("file");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

    const uploadButtonRef = useRef<HTMLButtonElement | null>(null);

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
            } else if (uploadType === "link" && linkName && linkUrl && selectedOption) {
                const linkData = {
                    name: linkName,
                    url: linkUrl,
                    metadata: {
                        semesterId,
                        subjectId,
                        topicId,
                        tags: tags.map(tag => ({ name: tag.name }))
                    },
                };

                const response = await fetch('/api/documents/links/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(linkData),
                });

                if (!response.ok) {
                    throw new Error("Failed to upload link");
                }

                setSuccessMessage("Link uploaded successfully!");
                setLinkName("");
                setLinkUrl("");
                setTags([]); // Clear tags after successful link upload
            } else {
                setErrorMessage("Please fill out all required fields.");
                return;
            }

            setSelectedOption(null);
            setShowUploadCard(false);
        } catch (error) {
            console.error("Error during upload: ", error);
            setErrorMessage(uploadType === "file" ? "File upload failed." : "Link upload failed.");
        } finally {
            setLoading(false);
        }
    };

    const toggleUploadCard = () => {
        setShowUploadCard((prev) => !prev);
    };

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setTagInput(e.target.value);
    }, []);

    const handleAddTag = useCallback(async () => {
        const newTag = tagInput.trim();
        if (!newTag) return;
        setTags([...tags, { name: newTag }]);
        setTagInput("");
    }, [tags, tagInput]);

    const handleRenameTag = useCallback(async () => {
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
    }, [tags]);

    const selectTag = useCallback((tag: Tag) => {
        setSelectedTag(tag);
        setTagInput(tag.name);
    }, []);

    return (
        <div className="file-upload-container relative">
            <button
                onClick={toggleUploadCard}
                ref={uploadButtonRef}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Upload File
            </button>

            {showUploadCard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end">
                    <div className="h-full bg-white dark:bg-neutral-900 p-6 overflow-y-auto transition-transform duration-300 w-96">
                        <button className="text-red-500 mb-4" onClick={toggleUploadCard}>
                            Close [X]
                        </button>

                        <h2 className="text-xl font-semibold mb-4">Upload {uploadType === "file" ? "File" : "Link"}</h2>

                        <div className="mb-4 flex space-x-2">
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
                                                className={`tag-box inline-block border rounded-md p-2 mr-2 mb-2 relative bg-gray-200 text-black cursor-pointer ${selectedTag && (selectedTag._id || selectedTag.id) === (tag._id || tag.id) ? "border-blue-500" : ""}`}
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
                            </>
                        )}

                        {/* Topic Selection */}
                        {uploadType === "file" && (
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

                        {uploadType === "link" && (
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
            )}
        </div>
    );
};

export default UploadFile;