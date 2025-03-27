"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import DisplayFiles from '@/app/components/DisplayFiles';
import RecentFiles from '@/app/components/RecentFiles';
import UploadFile from '@/app/components/UploadFile';
import Navigation from "@/app/components/Navigation/Navigation";
import FileView, { AppFile } from "@/app/components/FileView";
import Topbar from "@/app/components/Documents/Topbar";

type Topic = {
    id: string;
    name: string;
};

/*type Subject = {
    id: string;
    name: string;
    topics: Topic[];
};*/

const SubjectPage = () => {
    const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);
    const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
    const [editingTopicName, setEditingTopicName] = useState("");
    const [selectedFile, setSelectedFile] = useState<AppFile | null>(null);
    const [semesterName, setSemesterName] = useState<string | undefined>(undefined);
    const [subjectName, setSubjectName] = useState<string | undefined>(undefined);
    const params = useParams();
    const router = useRouter();
    const semesterId = params?.semesterId as string;
    const subjectId = params?.subjectId as string;

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

                if (semesterId && subjectId) {
                    fetchTopics();
                }
            } catch (error) {
                console.error('Error authenticating user:', error);
                router.push('/login');
            }
        }

        authenticateUser();
    }, [semesterId, subjectId]);

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

    const handleSubmit = async () => {
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
                setName('');
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

    const handleEditTopic = async (topicId: string, newName: string) => {
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
                setEditingTopicId(null);
                setEditingTopicName('');
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
            <div className={`flex-1 transition-all duration-300
                    ${isExpanded ? "ml-64" : "ml-12"} 
                    ${selectedFile ? "mr-96" : ""}
                `}
            >
                <Topbar path={`${semesterName} / ${subjectName}`} />
                <div className='p-12 pt-[7.5rem]'>
                    <h1 className="text-2xl font-bold mb-4">Manage Topics</h1>
                    <div className="mb-4">
                        <input
                            type="text"
                            className="border rounded p-2 w-full"
                            placeholder="Topic Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                            onClick={handleSubmit}
                        >
                            Add Topic
                        </button>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Topics</h2>
                    <ul className="flex flex-wrap gap-4 mb-4">
                        {topics.map((topic) => (
                            <div key={topic.id} className="
                                flex flex-1 gap-4 p-4
                                bg-white dark:bg-neutral-950
                                border border-rounded rounded-lg border-neutral-200 dark:border-neutral-800
                                hover:bg-neutral-100 hover:dark:bg-neutral-900
                                transition-colors duration-300
                            ">
                                {/* Conditionally render the link or the input field */}
                                {editingTopicId !== topic.id ? (
                                    <a href={`/documents/${semesterId}/${subjectId}/${topic.id}`} className="flex flex-1 gap-4">
                                        <div className='flex justify-center'>
                                            <svg className='w-12 h-12' width="19" height="16" viewBox="0 0 19 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M0.794996 0.781049C1.30402 0.280952 1.99441 0 2.71429 0H7.54571C7.80668 0 8.04453 0.147036 8.15746 0.378179L9.92698 4H16.2857C17.0056 4 17.696 4.28095 18.205 4.78105C18.714 5.28115 19 5.95942 19 6.66667V13.3333C19 14.0406 18.714 14.7189 18.205 15.219C17.696 15.719 17.0056 16 16.2857 16H2.71429C1.99441 16 1.30402 15.719 0.794996 15.219C0.285968 14.7189 0 14.0406 0 13.3333V2.66667C0 1.95942 0.285969 1.28115 0.794996 0.781049ZM2.71429 1.33333C2.35435 1.33333 2.00915 1.47381 1.75464 1.72386C1.50013 1.97391 1.35714 2.31304 1.35714 2.66667V13.3333C1.35714 13.687 1.50013 14.0261 1.75464 14.2761C2.00915 14.5262 2.35435 14.6667 2.71429 14.6667H16.2857C16.6457 14.6667 16.9908 14.5262 17.2454 14.2761C17.4999 14.0261 17.6429 13.687 17.6429 13.3333V6.66667C17.6429 6.31304 17.4999 5.97391 17.2454 5.72386C16.9908 5.47381 16.6457 5.33333 16.2857 5.33333H9.5C9.23903 5.33333 9.00118 5.1863 8.88825 4.95515L7.11873 1.33333H2.71429Z"/>
                                            </svg>
                                        </div>
                                        <div className='flex flex-col flex-1'>
                                            <p className='font-bold capitalize'>{topic.name}</p>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="flex flex-1 gap-4">
                                        <div className='flex justify-center'>
                                            <svg className='w-12 h-12' width="19" height="16" viewBox="0 0 19 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M0.794996 0.781049C1.30402 0.280952 1.99441 0 2.71429 0H7.54571C7.80668 0 8.04453 0.147036 8.15746 0.378179L9.92698 4H16.2857C17.0056 4 17.696 4.28095 18.205 4.78105C18.714 5.28115 19 5.95942 19 6.66667V13.3333C19 14.0406 18.714 14.7189 18.205 15.219C17.696 15.719 17.0056 16 16.2857 16H2.71429C1.99441 16 1.30402 15.719 0.794996 15.219C0.285968 14.7189 0 14.0406 0 13.3333V2.66667C0 1.95942 0.285969 1.28115 0.794996 0.781049ZM2.71429 1.33333C2.35435 1.33333 2.00915 1.47381 1.75464 1.72386C1.50013 1.97391 1.35714 2.31304 1.35714 2.66667V13.3333C1.35714 13.687 1.50013 14.0261 1.75464 14.2761C2.00915 14.5262 2.35435 14.6667 2.71429 14.6667H16.2857C16.6457 14.6667 16.9908 14.5262 17.2454 14.2761C17.4999 14.0261 17.6429 13.687 17.6429 13.3333V6.66667C17.6429 6.31304 17.4999 5.97391 17.2454 5.72386C16.9908 5.47381 16.6457 5.33333 16.2857 5.33333H9.5C9.23903 5.33333 9.00118 5.1863 8.88825 4.95515L7.11873 1.33333H2.71429Z"/>
                                            </svg>
                                        </div>
                                        <div className='flex flex-col flex-1'>
                                            <input
                                                type="text"
                                                value={editingTopicName}
                                                onChange={(e) => setEditingTopicName(e.target.value)}
                                                className="border rounded p-1"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Buttons (Outside the <a> tag) */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDeleteTopic(topic.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                    {editingTopicId === topic.id ? (
                                        <button
                                            onClick={() => handleEditTopic(topic.id, editingTopicName)}
                                            className="bg-green-500 text-white px-2 py-1 rounded"
                                        >
                                            Save
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditingTopicId(topic.id);
                                                setEditingTopicName(topic.name);
                                            }}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </ul>
                    <UploadFile />
                    <h1 className='text-2xl font-semibold my-4'>Documents</h1>
                    <RecentFiles />
                    <DisplayFiles onFileClick={handleFileClick} />
                </div>
            </div>
        </div>
    );
};

export default SubjectPage;