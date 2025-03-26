"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import DisplayFiles from '@/app/components/DisplayFiles';
import RecentFiles from '@/app/components/RecentFiles';
import UploadFile from '@/app/components/UploadFile';
import Navigation from "@/app/components/Navigation/Navigation";
import FileView, { AppFile } from "@/app/components/FileView";

type Topic = {
    id: string;
    name: string;
};

const TopicPage = () => {
    const [topic, setTopic] = useState<Topic | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);
    const [selectedFile, setSelectedFile] = useState<AppFile | null>(null);
    const params = useParams();
    const router = useRouter();
    const semesterId = params?.semesterId as string;
    const subjectId = params?.subjectId as string;
    const topicId = params?.topicId as string;

    useEffect(() => {
        const authenticateUser = async () => {
            try {
                const response = await fetch('/api/auth', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!response.ok) {
                    console.warn('User not authenticated, redirecting to /login');
                    router.push('/login');
                    return;
                }

                if (semesterId && subjectId && topicId) {
                    fetchTopic();
                }
            } catch (error) {
                console.error('Error authenticating user:', error);
                router.push('/login');
            }
        }

        authenticateUser();
    }, [semesterId, subjectId, topicId]);

    const fetchTopic = async () => {
        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}/${subjectId}/${topicId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setTopic({ id: data.id, name: data.name });
            } else if (response.status === 404) {
                console.error(`Invalid topic page: ${topicId}`);
                router.back();
            }
        } catch (error) {
            console.error("Error fetching topic:", error);
            setTopic(null);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleNavigation = () => {
        setIsExpanded(!isExpanded);
    }

    const handleFileClick = (file: AppFile) => {
        setSelectedFile(file);
    };

    const handleCloseFileView = () => {
        setSelectedFile(null);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            </div>
        );
    }

    return (
        <div>
            <Navigation isExpanded={isExpanded} toggleNavigation={toggleNavigation} />
            {selectedFile && (
                <FileView file={selectedFile} onClose={handleCloseFileView} />
            )}
            <div className={`flex-1 p-16 transition-all duration-300
                    ${isExpanded ? "ml-64" : "ml-12"}
                    ${selectedFile ? "mr-96" : ""}
                `}
            >
                <h1 className="text-2xl font-bold mb-4">{topic ? topic.name : "Unknown Topic"}</h1>
                
                <UploadFile />
                
                <h1 className='text-2xl font-semibold my-4'>Documents</h1>
                <RecentFiles />
                <DisplayFiles onFileClick={handleFileClick} />
            </div>
        </div>
    );
};

export default TopicPage;