"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface File {
    _id: string;
    filename: string;
    uploadDate: string;
    length: number;
    metadata: {
        userId: string;
        semesterId?: string;
        subjectId?: string;
        topicId?: string;
    };
}

const DisplayFiles: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);

    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter(Boolean);

    const semesterId = pathSegments[1] || null;
    const subjectId = pathSegments[2] || null;
    const topicId = pathSegments[3] || null;

    useEffect(() => {
        const fetchFiles = async () => {
            setLoading(true);

            try {
                console.log("Requesting files with:", { semesterId, subjectId, topicId }); // Log for debugging

                const response = await fetch(`/api/documents/files`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'semesterId': semesterId ?? '',
                        'subjectId': subjectId ?? '',
                        'topicId': topicId ?? '',
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch files");
                }

                const data = await response.json();
                console.log("Files received: ", data); // Log for debugging
                setFiles(data);
            } catch (error: any) {
                console.error("Error fetching files: ", error);
            } finally {
                setLoading(false);
            }
        };

        console.log("Path data - SemesterId:", semesterId, "SubjectId:", subjectId, "TopicId:", topicId); // Log for debugging
        fetchFiles();
    }, [semesterId, subjectId, topicId]);

    if (loading) {
        return <p>Loading files...</p>;
    }

    if (files.length === 0) {
        return <p>No files found for the selected filters.</p>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Files</h2>
            <ul className="space-y-4">
                {files.map((file) => (
                    <li key={file._id} className="flex items-center p-2 border rounded-lg shadow-sm bg-gray-100">
                        <img 
                            src="/icon-document.svg" 
                            alt="Document Icon" 
                            className="w-6 h-6 mr-3"
                        />
                        <span className="text-lg font-medium flex-1">{file.filename}</span>
                        <button 
                            className="text-white bg-blue-500 hover:bg-blue-700 font-medium py-1 px-2 rounded mr-2"
                        >
                            Rename
                        </button>
                        <button 
                            className="text-white bg-red-500 hover:bg-red-700 font-medium py-1 px-2 rounded"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DisplayFiles;
