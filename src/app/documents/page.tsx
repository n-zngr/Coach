"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Navigation from '@/app/components/Navigation/Navigation';
import DisplayFiles from '@/app/components/Documents/DisplayFiles';
import RecentFiles from '@/app/components/Documents/RecentFiles';
import UploadFile from '@/app/components/UploadFile';
import FileView from '@/app/components/FileView';
import { AppFile } from '@/app/components/FileView';
import Topbar from '../components/Documents/Topbar';
import LinkView, { AppLink } from '@/app/components/LinkView';
import FolderList from '../components/Documents/FolderList';

type Topic = {
    id: string;
    name: string;
};

type Subject = {
    id: string;
    name: string;
    topics: Topic[];
};

type Semester = {
    id: string;
    name: string;
    subjects: Subject[];
};

export default function Documents() {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);
    const [, setRenamingSemesterId] = useState<string | null>(null);
    const [, setRenamingSemesterName] = useState('');
    const [selectedFile, setSelectedFile] = useState<AppFile | null>(null);
    const [selectedLink, setSelectedLink] = useState<AppLink | null>(null);
    const [triggerUpload, setTriggerUpload] = useState(false);
    const router = useRouter();

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

                await fetchSemesters();
            } catch (error) {
                console.error('Error authenticating user:', error);
                router.push('/login');
            }
        }

        authenticateUser();
    }, [router]);
    
    const fetchSemesters = async () => {
        try {
            const response = await fetch('/api/documents/semesters', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();

                if (Array.isArray(data)) {
                    const formattedData: Semester[] = data.map((semester: any) => ({
                        id: semester.id,
                        name: semester.name,
                        subjects: semester.subjects.map((subject: any) => ({
                            id: subject.id,
                            name: subject.name,
                            topics: subject.topics.map((topic: any) => ({
                                id: topic.id,
                                name: topic.name
                            }))
                        }))
                    }));
                    setSemesters(formattedData);
                } else {
                    console.error('Invalid data format for semesters:', data);
                    setSemesters([]);
                }
            } else {
                console.error('Failed to fetch semesters');
                setSemesters([]);
            }
        } catch (error) {
            console.error('Error fetching semesters:', error);
            setSemesters([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (name: string) => {
        if (!name) return;
    
        try {
            const response = await fetch('/api/documents/semesters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ name: name.toLowerCase() }),
            });
    
            if (response.ok) {
                const newSemester = await response.json();
                setSemesters((prev) => [...prev, newSemester]);
            } else {
                console.error('Failed to add semester');
            }
        } catch (error) {
            console.error('Error adding semester:', error);
        }
    };
    
    const handleDeleteSemester = async (semesterId: string) => {
        try {
            const response = await fetch('/api/documents/semesters', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ semesterId }),
            });

            if (response.ok) {
                setSemesters((prev) => prev.filter((semester) => semester.id !== semesterId));
            } else {
                console.error('Failed to delete semester');
            }
        } catch (error) {
            console.error('Error deleting semester:', error);
        }
    };

    const handleRenameSemester = async (semesterId: string, newName: string) => {
        try {
            const response = await fetch('/api/documents/semesters', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ semesterId, name: newName }),
            });

            if (response.ok) {
                setSemesters((prev) =>
                    prev.map((semester) =>
                        semester.id === semesterId ? { ...semester, name: newName } : semester
                    )
                );
                setRenamingSemesterId(null);
                setRenamingSemesterName('');
            } else {
                console.error('Failed to update semester');
            }
        } catch (error) {
            console.error('Error updating semester:', error);
        }
    };

    const toggleNavigation = () => {
        setIsExpanded(!isExpanded);
    };

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
        <div className="flex h-screen">
            <Navigation isExpanded={isExpanded} toggleNavigation={toggleNavigation} />
            {selectedFile && (
                <FileView file={selectedFile} onClose={handleCloseFileView} />
            )}
            {triggerUpload && (
                <UploadFile triggerUpload={triggerUpload} setTriggerUpload={setTriggerUpload} />
            )}
            {selectedLink && (
                <LinkView link={selectedLink} onClose={handleCloseLinkView} />
            )}
            <div className={`flex-1 transition-all duration-200
                    ${isExpanded ? "pl-64" : "pl-12"}
                    ${selectedFile || triggerUpload || selectedLink ? "pr-96" : ""}
                `}
            >
                <Topbar />
                <div className='flex flex-col gap-12 p-12 pt-[7.5rem]'>
                    <FolderList
                        items={semesters}
                        basePath='/documents'
                        onRename={handleRenameSemester}
                        onDelete={handleDeleteSemester}
                        onAddItem={handleSubmit}
                        onUploadSuccess={fetchSemesters}
                        onTriggerUpload={() => setTriggerUpload(true)}
                        itemType='semesters'
                    >
                        All Semesters
                    </FolderList>
                    <RecentFiles onFileClick={handleFileClick} />
                    <DisplayFiles onFileClick={handleFileClick} onLinkClick={handleLinkClick} />
                </div>
            </div>
        </div>
    );
};
