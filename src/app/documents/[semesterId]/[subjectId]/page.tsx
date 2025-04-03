"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toTitleCase } from "@/app/utils/stringUtils";

import DisplayFiles from '@/app/components/Documents/DisplayFiles';
import RecentFiles from '@/app/components/Documents/RecentFiles';
import UploadFile from '@/app/components/UploadFile';
import Navigation from "@/app/components/Navigation/Navigation";
import FileView, { AppFile } from "@/app/components/FileView";
import Topbar from "@/app/components/Documents/Topbar";
import LinkView, { AppLink } from '@/app/components/LinkView';
import FolderList from "@/app/components/Documents/FolderList";


type Topic = {
    id: string;
    name: string;
};

const SubjectPage = () => {
    const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
    // const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);
    // const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
    // const [editingTopicName, setEditingTopicName] = useState("");
    const [selectedFile, setSelectedFile] = useState<AppFile | null>(null);
    const [selectedLink, setSelectedLink] = useState<AppLink | null>(null);
    const [semesterName, setSemesterName] = useState<string | undefined>(undefined);
    const [subjectName, setSubjectName] = useState<string | undefined>(undefined);
    const [triggerUpload, setTriggerUpload] = useState(false);
    const params = useParams();
    const router = useRouter();
    const semesterId = params?.semesterId as string;
    const subjectId = params?.subjectId as string;

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await fetch(`/api/documents/semesters/${semesterId}/${subjectId}`, {
                    method: 'GET',
                    credentials: 'include'
                });
    
                if (response.ok) {
                    const data = await response.json();
    
                    if (data.subjectName) {
                        setSubjectName(data.subjectName);
                    } else {
                        console.warn('Could not find subject name')
                    }
    
                    if (data.semesterName) {
                        setSemesterName(data.semesterName);
                    } else {
                        console.warn('Could not find semester name');
                    }
    
                    if (Array.isArray(data.topics)) {
                        const formattedData: Topic[] = data.topics.map((topic: any) => ({
                            id: topic.id,
                            name: topic.name
                        }))
                        setTopics(formattedData);
                    } else {
                        console.error('Failed to fetch subjects');
                        setTopics([]);
                    }
                } else if (response.status === 404) {
                    console.error(`Invalid subject page: ${subjectId}`);
                    router.back();
                }
            } catch (error) {
                console.error("Error fetching topics:", error);
                setTopics([]);
            } finally {
                setIsLoading(false);
            }
        };

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

                if (semesterId && subjectId) {
                    fetchTopics();
                }
            } catch (error) {
                console.error('Error authenticating user:', error);
                router.push('/login');
            }
        }

        authenticateUser();
    }, [semesterId, subjectId, router])

    const handleSubmit = async (name: string) => {
        if (!name) return;
    
        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}/${subjectId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ name: name.toLowerCase() }),
            });
    
            if (response.ok) {
                const newTopic = await response.json();
                setTopics((prev) => [...prev, newTopic]);
            } else {
                console.error("Failed to add topic");
            }
        } catch (error) {
            console.error("Error adding topic:", error);
        }
    };

    const handleDeleteTopic = async (topicId: string) => {
        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}/${subjectId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ topicId }),
            });

            if (response.ok) {
                setTopics((prev) => prev.filter((topic) => topic.id !== topicId));
            } else {
                console.error("Failed to delete topic");
            }
        } catch (error) {
            console.error("Error deleting topic:", error);
        }
    };

    const handleRenameTopic = async (topicId: string, newName: string) => {
        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}/${subjectId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ topicId, name: newName }),
            });

            if (response.ok) {
                setTopics((prev) =>
                    prev.map((topic) =>
                        topic.id === topicId ? { ...topic, name: newName } : topic
                    )
                );
            } else {
                console.error("Failed to update topic");
            }
        } catch (error) {
            console.error("Error updating topic:", error);
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

    const handleLinkClick = (link: AppLink) => {
        setSelectedLink(link);
    };
    
    const handleCloseLinkView = () => {
        setSelectedLink(null);
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
            {triggerUpload && (
                <UploadFile triggerUpload={triggerUpload} setTriggerUpload={setTriggerUpload} />
            )}
            {selectedLink && <LinkView link={selectedLink} onClose={handleCloseLinkView} />}
            <div className={`flex-1 transition-all duration-200
                    ${isExpanded ? "pl-64" : "pl-12"}
                    ${selectedFile || triggerUpload || selectedFile ? "pr-96" : ""}
                `}
            >
                <Topbar path={`${toTitleCase(semesterName)} / ${toTitleCase(subjectName)}`} />
                <div className='flex flex-col gap-12 p-12 pt-[7.5rem]'>
                    <FolderList
                        items={topics}
                        basePath={`/documents/${semesterId}/${subjectId}`}
                        onRename={handleRenameTopic}
                        onDelete={handleDeleteTopic}
                        onAddItem={handleSubmit}
                        onTriggerUpload={() => setTriggerUpload(true)}
                        itemType='topics'
                    >
                        {toTitleCase(subjectName) || 'Subject'} Topics
                    </FolderList>
                    <RecentFiles onFileClick={handleFileClick} />
                    <DisplayFiles onFileClick={handleFileClick} onLinkClick={handleLinkClick} />
                </div>
            </div>
        </div>
    );
};

export default SubjectPage;