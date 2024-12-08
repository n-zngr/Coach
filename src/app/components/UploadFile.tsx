"use client";

import { useState } from "react";

type Semester = {
    id: string;
    name: string;
    subjects: {
        id: string;
        name: string;
        topics: {
            id: string;
            name: string;
        }[];
    }[];
};

type UploadFileComponentProps = {
    semesters: Semester[];
    userId: string;
};

const UploadFileComponent = ({ semesters, userId }: UploadFileComponentProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedPath, setSelectedPath] = useState<string>('');
    const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [selectedTopicId, setSelectedTopicId] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState<string>('');

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleTopicSelect = (semesterId: string, subjectId: string, topicId: string, path: string) => {
        setSelectedSemesterId(semesterId);
        setSelectedSubjectId(subjectId);
        setSelectedTopicId(topicId);
        setSelectedPath(path);
        setIsDropdownOpen(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleFileUpload = async () => {
        if (!file || !selectedSemesterId || !selectedSubjectId || !selectedTopicId) {
            setUploadMessage('Please select a semester, subject, topic, and file before uploading.');
            return;
        }

        try {
            setIsUploading(true);
            const reader = new FileReader();

            reader.onload = async () => {
                const fileContent = reader.result?.toString().split(',')[1];
                const metadata = {
                    userId,
                    semesterId: selectedSemesterId,
                    subjectId: selectedSubjectId,
                    topicId: selectedTopicId,
                };

                const response = await fetch("/api/documents/upload", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileContent,
                        metadata,
                    }),
                });

                const result = await response.json();

                if (response.ok) {
                    setUploadMessage(result.message || 'File uploaded successfully!');
                } else {
                    setUploadMessage(result.message || 'Failed to upload file.');
                }

                setFile(null); // Reset file
            };

            reader.readAsDataURL(file);
        } catch (error) {
            setUploadMessage('Error uploading file.');
            console.error('File upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={toggleDropdown} 
                className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600"
            >
                Upload File
            </button>

            {selectedPath && (
                <div className="mt-2 text-gray-700">
                    <strong>Selected Path:</strong> {selectedPath}
                </div>
            )}

            {isDropdownOpen && (
                <div className="absolute top-full mt-2 w-64 bg-white border border-gray-300 rounded shadow-lg p-4 max-h-96 overflow-auto">
                    <h3 className="font-semibold mb-2">Select Semester, Subject & Topic</h3>
                    <ul className="space-y-2">
                        {semesters.map((semester) => (
                            <li key={semester.id}>
                                <div className="font-bold text-gray-900">{semester.name}</div>
                                <ul className="pl-4">
                                    {semester.subjects.map((subject) => (
                                        <li key={subject.id}>
                                            <div className="text-gray-800 font-semibold">{subject.name}</div>
                                            <ul className="pl-4">
                                                {subject.topics.map((topic) => (
                                                    <li key={topic.id}>
                                                        <button 
                                                            className="text-blue-500 underline text-sm"
                                                            onClick={() => handleTopicSelect(
                                                                semester.id, 
                                                                subject.id, 
                                                                topic.id, 
                                                                `${semester.name} > ${subject.name} > ${topic.name}`
                                                            )}
                                                        >
                                                            {topic.name}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {selectedPath && (
                <div className="mt-4">
                    <input 
                        type="file" 
                        onChange={handleFileChange} 
                        className="w-full p-2 border rounded mb-4"
                    />
                    <button 
                        onClick={handleFileUpload}
                        disabled={isUploading}
                        className={`w-full bg-green-500 text-white p-2 rounded ${isUploading ? 'opacity-50' : 'hover:bg-green-600'}`}
                    >
                        {isUploading ? 'Uploading...' : 'Submit File'}
                    </button>

                    {uploadMessage && (
                        <p className="mt-4 text-center text-gray-700">{uploadMessage}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default UploadFileComponent;