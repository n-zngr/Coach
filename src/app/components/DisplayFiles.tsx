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
            <ul className="list-disc pl-5">
                {files.map((file) => (
                    <li key={file._id} className="mb-4 p-2 border rounded-lg shadow-sm bg-gray-100">
                        <p>
                            <strong>Filename:</strong> {file.filename}
                        </p>
                        <p>
                            <strong>Uploaded on:</strong> {new Date(file.uploadDate).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>Size:</strong> {(file.length / 1024).toFixed(2)} KB
                        </p>
                        <p>
                            <strong>Path:</strong> 
                            <span className="text-sm text-gray-600">
                                /{file.metadata.userId} 
                                {file.metadata.semesterId ? ` / ${file.metadata.semesterId}` : ""} 
                                {file.metadata.subjectId ? ` / ${file.metadata.subjectId}` : ""} 
                                {file.metadata.topicId ? ` / ${file.metadata.topicId}` : ""}
                            </span>
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DisplayFiles;
