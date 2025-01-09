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
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
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
        const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedOptions(selectedValues);
    };

    const handleUpload = async () => {
        if (!file || selectedOptions.length === 0) {
            setErrorMessage("Please select a file and at least one topic to upload.");
            return;
        }

        const semesterIds: string[] = [];
        const subjectIds: string[] = [];
        const topicIds: string[] = [];

        selectedOptions.forEach(option => {
            const [semesterId, subjectId, topicId] = option.split("/");
            if (semesterId && !semesterIds.includes(semesterId)) semesterIds.push(semesterId);
            if (subjectId && !subjectIds.includes(subjectId)) subjectIds.push(subjectId);
            if (topicId && !topicIds.includes(topicId)) topicIds.push(topicId);
        });

        const formData = new FormData();
        formData.append('file', file);
        semesterIds.forEach(id => formData.append('semesterIds', id));
        subjectIds.forEach(id => formData.append('subjectIds', id));
        topicIds.forEach(id => formData.append('topicIds', id));

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
            setSelectedOptions([]);
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
                        value={selectedOptions}
                        multiple 
                        className="w-full border border-gray-300 rounded p-2 mb-4"
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
                        className="w-full mb-4" 
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
