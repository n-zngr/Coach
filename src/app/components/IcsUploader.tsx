"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { parseIcsFile } from "@/app/utils/ParseIcs";

interface IcsUploaderProps {
    onUploadSuccess: () => void; // Callback function to trigger after successful upload
}

export default function IcsUploader({ onUploadSuccess }: IcsUploaderProps) {
    const params = useParams();
    const semesterId = params?.semesterId;
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select an ICS file.");
            return;
        }
    
        if (!semesterId) {
            alert("Semester ID is required.");
            return;
        }
    
        setLoading(true);
        setMessage(null);
    
        const reader = new FileReader();
        reader.onload = async (event) => {
            if (!event.target?.result) {
                setLoading(false);
                setMessage("Error reading the file.");
                return;
            }
    
            const fileContent = event.target.result as string;
            const filteredSubjects = parseIcsFile(fileContent);
    
            console.log("Filtered Subjects:", filteredSubjects);
    
            if (filteredSubjects.length === 0) {
                setLoading(false);
                setMessage("No valid subjects found in the ICS file.");
                return;
            }
    
            try {
                // Send all subjects in a single POST request to the batch endpoint
                const response = await fetch(`/api/documents/semesters/${semesterId}/batch`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ subjects: filteredSubjects }), // Send subjects as an array
                    credentials: "include",
                });
    
                if (response.ok) {
                    setMessage("Subjects successfully added!");
                    onUploadSuccess(); // Trigger the callback to refresh subjects
                } else {
                    const errorData = await response.json();
                    console.error("Error adding subjects:", errorData);
                    setMessage("Error adding subjects.");
                }
            } catch (error) {
                console.error("Error adding subjects:", error);
                setMessage("Error adding subjects.");
            }
    
            setLoading(false);
        };
    
        reader.readAsText(file);
    };

    return (
        <div className="p-4 border rounded-lg shadow-md w-80">
            <input
                type="file"
                accept=".ics"
                onChange={handleFileChange}
                className="mb-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            <button
                onClick={handleUpload}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full disabled:bg-gray-400"
                disabled={loading}
            >
                {loading ? "Processing..." : "Upload & Add Subjects"}
            </button>
            {message && <p className="mt-2 text-center text-sm">{message}</p>}
        </div>
    );
}