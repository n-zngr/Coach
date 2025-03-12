"use client";

import { useState, useEffect, useRef } from "react";

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

const UploadFile: React.FC = () => {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showUploadCard, setShowUploadCard] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

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
        if (!file || !selectedOption) {
            setErrorMessage("Please select a file and a topic to upload.");
            return;
        }

        const [semesterId, subjectId, topicId] = selectedOption.split("/");

        const formData = new FormData();
        formData.append('file', file);
        formData.append('semesterId', semesterId);
        formData.append('subjectId', subjectId);
        formData.append('topicId', topicId);

        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
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
            setSelectedOption(null);
            setShowUploadCard(false);
        } catch (error) {
            console.error("Error during file upload: ", error);
            setErrorMessage("File upload failed.");
        } finally {
            setLoading(false);
        }
    };

    const toggleUploadCard = () => {
        setShowUploadCard((prev) => !prev);
    };

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

                        <h2 className="text-xl font-semibold mb-4">Upload File</h2>

                        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                        {successMessage && <p className="text-green-500">{successMessage}</p>}

                        {/* Drag-and-Drop Area */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed p-6 text-center ${
                                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                            }`}
                        >
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <p className="text-black">{file.name}</p>
                                    <button
                                        onClick={handleClearFile}
                                        className="text-red-500 mt-2 hover:text-red-700"
                                    >
                                        Clear File
                                    </button>
                                </div>
                            ) : (
                                <p className="text-gray-500">
                                    Drag & Drop your file here or{" "}
                                    <label htmlFor="file-upload" className="text-blue-500 cursor-pointer">
                                        browse
                                    </label>
                                </p>
                            )}
                            <input
                                id="file-upload"
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        {/* Semester/Subject/Topic Selection */}
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2 text-black">Select Semester, Subject, and Topic</h3>
                            <select
                                onChange={(e) => setSelectedOption(e.target.value)}
                                value={selectedOption || ""}
                                className="w-full border border-gray-300 rounded text-black p-2 mb-4"
                            >
                                <option value="" disabled>
                                    Select Semester / Subject / Topic
                                </option>
                                {semesters.map((semester) =>
                                    semester.subjects.map((subject) =>
                                        subject.topics.map((topic) => (
                                            <option
                                                key={`${semester.id}/${subject.id}/${topic.id}`}
                                                value={`${semester.id}/${subject.id}/${topic.id}`}
                                            >
                                                {semester.name} / {subject.name} / {topic.name}
                                            </option>
                                        ))
                                    )
                                )}
                            </select>
                        </div>

                        {/* Upload Button */}
                        <button
                            onClick={handleUpload}
                            disabled={loading || !file || !selectedOption}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                        >
                            {loading ? "Uploading..." : "Upload File"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadFile;