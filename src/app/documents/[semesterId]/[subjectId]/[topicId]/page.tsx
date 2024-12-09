"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import FileDisplay from "@/app/components/DisplayFiles";
import UploadFileComponent from "@/app/components/UploadFile";

const TopicPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const semesterId = params.semesterId as string;
    const subjectId = params.subjectId as string;
    const topicId = params.topicId as string;

    useEffect(() => {
        const checkTopicExistence = async () => {
            try {
                const storedUserId = localStorage.getItem('userId');

                if (!storedUserId) {
                    router.push('/login');
                    return;
                }

                setUserId(storedUserId);

                const authResponse = await fetch('/api/auth/verify', {
                    method: 'GET',
                    headers: { 'user-id': storedUserId }
                });

                if (authResponse.status === 401) {
                    router.push('/login');
                    return;
                }

                const authData = await authResponse.json();
                if (!authData.isLoggedIn) {
                    router.push('/login');
                    return;
                }

                const topicResponse = await fetch(`/api/documents/semesters/${semesterId}/${subjectId}/${topicId}`, {
                    method: 'GET',
                    headers: { 'user-id': storedUserId }
                });

                if (topicResponse.status === 404) {
                    router.push('/404');
                    return;
                }

            } catch (error) {
                console.error('Error during authentication or topic check: ', error);
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkTopicExistence();
    }, [semesterId, subjectId, topicId]);

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

    if (isLoading) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            </div>
        );
    }

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
            <h1 className='text-2xl font-semibold my-4'>Documents</h1>
            <FileDisplay topicId={params.topicId as string}/>
            <UploadFileComponent userId={userId!} semesterId={semesterId} subjectId={subjectId} topicId={topicId} />
        </div>
    );
};

export default TopicPage;