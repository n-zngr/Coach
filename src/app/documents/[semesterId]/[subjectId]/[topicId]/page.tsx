"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const TopicPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const params = useParams();
    const router = useRouter();
    const semesterId = params.semesterId as string;
    const subjectId = params.subjectId as string;
    const topicId = params.topicId as string;

    const verifyLogin = async () => {
        const userIdFromStorage = localStorage.getItem("userId");

        if (!userIdFromStorage) {
            router.push("/login");
            return false;
        }

        setUserId(userIdFromStorage);

        try {
            const response = await fetch("/api/auth/verify", {
                headers: {
                    "user-id": userIdFromStorage,
                },
            });

            if (!response.ok) {
                router.push("/login");
                return false;
            }

            return true;
        } catch (error) {
            console.error("Error verifying login:", error);
            router.push("/login");
            return false;
        }
    };

    useEffect(() => {
        const initializePage = async () => {
            await verifyLogin();
        };

        initializePage();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleFileUpload = async () => {
        if (!file || !userId || !semesterId || !subjectId || !topicId) {
            console.error("Missing required data for upload");
            return;
        }

        setUploading(true);
        const reader = new FileReader();

        reader.onload = async () => {
            const base64Content = reader.result?.toString().split(",")[1];

            if (!base64Content) {
                console.error("Failed to encode file");
                setUploading(false);
                return;
            }

            try {
                const response = await fetch("/api/documents/upload", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileContent: base64Content,
                        metadata: {
                            userId,
                            semesterId,
                            subjectId,
                            topicId,
                        },
                    }),
                });

                if (response.ok) {
                    console.log("File uploaded successfully");
                } else {
                    console.error("Failed to upload file");
                }
            } catch (error) {
                console.error("Error uploading file:", error);
            } finally {
                setUploading(false);
            }
        };

        reader.readAsDataURL(file);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Topic</h1>
            <p className="mb-4">Upload files specific to this topic.</p>

            <div>
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="mb-4 border p-2 w-full"
                />
                <button
                    onClick={handleFileUpload}
                    disabled={uploading}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    {uploading ? "Uploading..." : "Upload File"}
                </button>
            </div>
        </div>
    );
};

export default TopicPage;