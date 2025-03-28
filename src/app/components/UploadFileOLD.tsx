/*
"use client";

import { useState, useEffect } from "react";

type Topic = {
    id: string;
    name: string;
};

type Subject = {
    id: string;
    name: string;
    topics: Topic[];
};

type Semester = {
    id: string;
    name: string;
    subjects: Subject[];
};

type UploadFileComponentProps = {
    userId: string;
    semesterId?: string;
    subjectId?: string;
    topicId?: string;
};

const UploadFileComponent = ({ userId, semesterId, subjectId, topicId }: UploadFileComponentProps) => {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, [userId, semesterId, subjectId, topicId]);

    const fetchData = async () => {
        if (!userId) return;

        try {
            if (!semesterId) {
                const response = await fetch("/api/documents/semesters", {
                    headers: { "user-id": userId },
                });
                const data = await response.json();
                setSemesters(data);
            } else if (!subjectId) {
                const response = await fetch(`/api/documents/semesters/${semesterId}`, {
                    headers: { "user-id": userId },
                });
                const data = await response.json();
                setSelectedSemester(data);
            } else if (!topicId) {
                const response = await fetch(`/api/documents/semesters/${semesterId}/${subjectId}`, {
                    headers: { "user-id": userId },
                });
                const data = await response.json();
                setSelectedSubject(data);
            } else {
                const response = await fetch(`/api/documents/semesters/${semesterId}/${subjectId}/${topicId}`, {
                    headers: { "user-id": userId },
                });
                const data = await response.json();
                setSelectedTopic(data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleFileUpload = async () => {
        if (!file || !userId || !semesterId || !subjectId || !topicId) {
            setUploadMessage('Please select all required fields and a file before uploading.');
            return;
        }

        try {
            setIsUploading(true);
            const reader = new FileReader();

            reader.onload = async () => {
                const fileContent = reader.result?.toString().split(',')[1];
                const metadata = {
                    userId,
                    semesterId,
                    subjectId,
                    topicId,
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

                setFile(null);
            };

            reader.readAsDataURL(file);
        } catch (error) {
            setUploadMessage('Error uploading file.');
            console.error('File upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const renderSelectionDropdowns = () => {
        if (!semesterId) {
            return (
                <select onChange={(e) => setSelectedSemester(semesters.find(s => s.id === e.target.value) || null)}>
                    <option value="">Select Semester</option>
                    {semesters.map(semester => (
                        <option key={semester.id} value={semester.id}>{semester.name}</option>
                    ))}
                </select>
            );
        }

        if (!subjectId && selectedSemester) {
            return (
                <select onChange={(e) => setSelectedSubject(selectedSemester.subjects.find(s => s.id === e.target.value) || null)}>
                    <option value="">Select Subject</option>
                    {selectedSemester.subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                </select>
            );
        }

        if (!topicId && selectedSubject) {
            return (
                <select onChange={(e) => setSelectedTopic(selectedSubject.topics.find(t => t.id === e.target.value) || null)}>
                    <option value="">Select Topic</option>
                    {selectedSubject.topics.map(topic => (
                        <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                </select>
            );
        }

        return null;
    };

    return (
        <div className="relative">
            <h2 className="text-xl font-semibold mb-4">Upload File</h2>
            
            {renderSelectionDropdowns()}

            <input 
                type="file" 
                onChange={handleFileChange} 
                className="w-full p-2 border rounded mb-4 mt-4"
            />
            
            <button 
                onClick={handleFileUpload}
                disabled={isUploading || !file || !semesterId || !subjectId || !topicId}
                className={`w-full bg-green-500 text-white p-2 rounded ${isUploading || !file || !semesterId || !subjectId || !topicId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
            >
                {isUploading ? 'Uploading...' : 'Submit File'}
            </button>

            {uploadMessage && (
                <p className="mt-4 text-center text-gray-700">{uploadMessage}</p>
            )}
        </div>
    );
};

export default UploadFileComponent;
*/