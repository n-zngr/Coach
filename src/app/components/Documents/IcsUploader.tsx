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
        <div className="flex bg-transparent
            focus:outline-none
            focus:border-black-900 focus:dark:border-white-900
            gap-4
            font-light text-lg placeholder:text-black-500 placeholder:dark:text-white-500">
            <input
                type="file"
                accept=".ics"
                onChange={handleFileChange}
                className="w-full
                bg-transparent
                border-b border-black-500 dark:border-white-500 focus:outline-none
                focus:border-black-900 focus:dark:border-white-900
                placeholder:text-black-500 placeholder:dark:text-white-500"
            />
            <button
                onClick={handleUpload}
                className="bg-none hover:bg-black-100 hover:dark:bg-white-900
                    border border-black-100 dark:border-white-900 rounded-full
                    font-light text-black-100 dark:text-white-900 hover:text-white-900 hover:dark:text-black-100
                    py-1 px-3
                    transition-colors duration-200 cursor-pointer text-nowrap"
                disabled={loading}
            >
                {loading ? "Processing..." : "Import Subjects"}
            </button>
            {message && <p className="mt-2 text-center text-sm">{message}</p>}
        </div>
    );
}