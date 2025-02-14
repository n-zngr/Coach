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

const FileUpload: React.FC = () => {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showUploadCard, setShowUploadCard] = useState(false);

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

    const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(e.target.value);
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
        setShowUploadCard(prevState => !prevState);
    };

    return (
        <div className="file-upload-container relative">
            <h2 className="text-xl font-semibold mb-4">Upload File</h2>

            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {successMessage && <p className="text-green-500">{successMessage}</p>}

            <button 
                onClick={toggleUploadCard} 
                ref={uploadButtonRef} 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Upload File
            </button>

            {showUploadCard && (
                <div 
                    className="absolute mt-2 bg-white shadow-lg border rounded p-4" 
                    style={{ top: uploadButtonRef.current?.offsetHeight || 0 }}
                >
                    <h3 className="text-lg font-semibold mb-2 text-black">Select Semester, Subject, and Topic</h3>

                    <select 
                        onChange={handleDropdownChange} 
                        value=""
                        className="w-full border border-gray-300 rounded text-black p-2 mb-4"
                    >
                        {semesters.map(semester => 
                            semester.subjects.map(subject => 
                                subject.topics.map(topic => (
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

                    <input 
                        type="file" 
                        onChange={handleFileChange} 
                        className="w-full mb-4 text-black" 
                    />

                    <button 
                        onClick={handleUpload} 
                        disabled={loading} 
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        {loading ? "Uploading..." : "Upload File"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
