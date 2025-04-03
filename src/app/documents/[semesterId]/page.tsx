"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import { toTitleCase } from "@/app/utils/stringUtils";

import DisplayFiles from "@/app/components/Documents/DisplayFiles";
import RecentFiles from "@/app/components/Documents/RecentFiles";
import UploadFile from '@/app/components/UploadFile';
// import IcsUploader from '@/app/components/IcsUploader';
import Navigation from '@/app/components/Navigation/Navigation';
import FileView, { AppFile } from "@/app/components/FileView";
import Topbar from "@/app/components/Documents/Topbar";
import LinkView, { AppLink } from '@/app/components/LinkView';
import FolderList from "@/app/components/Documents/FolderList";


type Topic = {
    id: string;
    name: string;
};

type Subject = {
    id: string;
    name: string;
    topics: Topic[];
};

export default function SemesterPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    // const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);
    const [, setRenamingSubjectId] = useState<string | null>(null);
    const [, setRenamingSubjectName] = useState('');
    const [selectedFile, setSelectedFile] = useState<AppFile | null>(null);
    const [selectedLink, setSelectedLink] = useState<AppLink | null>(null);
    const [semesterName, setSemesterName] = useState<string | undefined>(undefined);
    const [triggerUpload, setTriggerUpload] = useState(false);
    const params = useParams();
    const router = useRouter();
    const semesterId = params?.semesterId;
    
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

                if (semesterId) {
                    await fetchSubjects() as any; // Hotfix to avoid error, research
                }
            } catch (error) {
                console.error('Error authenticating user:', error);
                router.push('/login');
            }
        }

        authenticateUser();
    }, [semesterId, router]);

    const fetchSubjects = async () => {
        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.name) {
                    setSemesterName(data.name);
                } else {
                    console.warn("No semester name found in API response.");
                }
                
                if (Array.isArray(data.subjects)) {
                    const formattedData: Subject[] = data.subjects.map((subject: any) => ({
                        id: subject.id,
                        name: subject.name,
                        topics: (subject.topics || []).map((topic: any) => ({
                            id: topic.id,
                            name: topic.name
                        }))
                    }));
                    setSubjects(formattedData);
                } else {
                    console.error('Failed to fetch subjects');
                    setSubjects([]);
                }
            } else if (response.status === 404) {
                console.error(`Invalid subject page: ${semesterId}`);
                router.back();
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setSubjects([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (name: string) => {
        if (!name) return;

        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: name.toLowerCase() })
            });

            if (response.ok) {
                const newSubject = await response.json();
                setSubjects((prev) => [...prev, newSubject]);
            } else {
                console.error('Failed to add subject');
            }
        } catch (error) {
            console.error('Error adding subject', error);
        }
    };

    const handleDeleteSubject = async (subjectId: string) => {
        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}`, {
                method: "DELETE",
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ subjectId })
            });

            if (response.ok) {
                setSubjects((prev) => prev.filter((subject) => subject.id !== subjectId));
            } else {
                console.error('Failed to delete subject');
            }
        } catch (error) {
            console.error('Error deleting subject', error);
        }
    };

    const handleRenameSubject = async (subjectId: string, newName: string) => {
        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}`, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ subjectId, name: newName })
            });

            if (response.ok) {
                setSubjects((prev) =>
                    prev.map((subject) =>
                        subject.id === subjectId ? { ...subject, name: newName } : subject
                    )
                );
                setRenamingSubjectId(null);
                setRenamingSubjectName('');
            } else {
                console.error('Failed to update subject');
            }
        } catch (error) {
            console.error('Error updating subject', error);
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
                    ${selectedFile || triggerUpload ? "pr-96" : ""}
                `}
            >
                <Topbar path={toTitleCase(semesterName)} />
                <div className='flex flex-col gap-12 p-12 pt-[7.5rem]'>
                    <FolderList
                        items={subjects}
                        basePath={`/documents/${semesterId}`}
                        onRename={handleRenameSubject}
                        onDelete={handleDeleteSubject}
                        onAddItem={handleSubmit}
                        onUploadSuccess={fetchSubjects}
                        onTriggerUpload={() => setTriggerUpload(true)}
                        itemType="subjects"
                    >
                        {toTitleCase(semesterName) || 'Semester'} Subjects
                    </FolderList>
                    <RecentFiles onFileClick={handleFileClick} />
                    <DisplayFiles onFileClick={handleFileClick} onLinkClick={handleLinkClick} />
                </div>
            </div>
        </div>
    );
}