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

interface LinkUploadProps {
    onClose: () => void;
}

const Linkupload: React.FC<LinkUploadProps> = ({ onClose }) => {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [linkName, setLinkName] = useState<string>("");
    const [linkUrl, setLinkUrl] = useState<string>("");
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

    const handleUpload = async () => {
        if (!linkName || !linkUrl || !selectedOption) {
            setErrorMessage("Please fill out all fields and select a topic.");
            return;
        }

        const [semesterId, subjectId, topicId] = selectedOption.split("/");

        const linkData = {
            name: linkName,
            url: linkUrl,
            metadata: {
                semesterId,
                subjectId,
                topicId,
            },
        };

        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const response = await fetch('/api/documents/links/upload', {
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
            setSelectedOption(null);
            onClose(); // Close the panel after successful upload
        } catch (error) {
            console.error("Error during link upload: ", error);
            setErrorMessage("Link upload failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="link-upload-container">
            <h2 className="text-xl font-semibold mb-4">Upload Link</h2>

            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {successMessage && <p className="text-green-500">{successMessage}</p>}

            {/* Link Name Input */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Link Name</label>
                <input
                    type="text"
                    value={linkName}
                    onChange={(e) => setLinkName(e.target.value)}
                    className="w-full border border-gray-300 rounded text-black p-2"
                    placeholder="Enter link name"
                />
            </div>

            {/* Link URL Input */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Link URL</label>
                <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded text-black p-2"
                    placeholder="Enter link URL"
                />
            </div>

            {/* Semester/Subject/Topic Selection */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Semester, Subject, and Topic</label>
                <select
                    onChange={(e) => setSelectedOption(e.target.value)}
                    value={selectedOption || ""}
                    className="w-full border border-gray-300 rounded text-black p-2"
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
                disabled={loading || !linkName || !linkUrl || !selectedOption}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
            >
                {loading ? "Uploading..." : "Upload Link"}
            </button>
        </div>
    );
};

export default Linkupload;