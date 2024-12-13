"use client";

import { useState, useEffect } from "react";

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
        } catch (error) {
            console.error("Error during file upload: ", error);
            setErrorMessage("File upload failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="file-upload-container">
            <h2 className="text-xl font-semibold mb-4">Upload File</h2>

            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {successMessage && <p className="text-green-500">{successMessage}</p>}

            <input type="file" onChange={handleFileChange} />

            <select onChange={handleDropdownChange} value={selectedOption || ''}>
                <option value="">Select Semester / Subject / Topic</option>
                {semesters.map(semester =>
                    semester.subjects.map(subject =>
                        subject.topics.map(topic => (
                            <option 
                                key={topic.id} 
                                value={`${semester.id}/${subject.id}/${topic.id}`}
                            >
                                {semester.name} / {subject.name} / {topic.name}
                            </option>
                        ))
                    )
                )}
            </select>

            <button onClick={handleUpload} disabled={loading}>
                {loading ? "Uploading..." : "Upload File"}
            </button>
        </div>
    );
};

export default FileUpload;