"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Navigation from '@/app/components/Navigation/Navigation';
import DisplayFiles from '@/app/components/DisplayFiles';
import RecentFiles from '@/app/components/RecentFiles';
import UploadFile from '@/app/components/UploadFile';
import FileView from '@/app/components/FileView';
import { AppFile } from '@/app/components/FileView';
import Topbar from '../components/Documents/Topbar';
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
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);
    const [renamingSemesterId, setRenamingSemesterId] = useState<string | null>(null);
    const [renamingSemesterName, setRenamingSemesterName] = useState('');
    const [selectedFile, setSelectedFile] = useState<AppFile | null>(null);
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

    const handleSubmit = async () => {
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
                setName('');
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
            <div className={`flex-1 transition-all duration-200
                    ${isExpanded ? "pl-64" : "pl-12"}
                    ${selectedFile ? "pr-96" : ""}
                `}
            >
                <Topbar />
                <div className='p-12 pt-[7.5rem]'>
                    <main>
                        <FolderList items={semesters} basePath='/documents' onRename={handleRenameSemester} onDelete={handleDeleteSemester}/>
                    </main>
                    
                    <h1 className="text-2xl font-bold mb-4">Manage Semesters</h1>
                    <div className="mb-4">
                        <input
                            type="text"
                            className="border rounded p-2 w-full"
                            placeholder="Semester Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                            onClick={handleSubmit}
                        >
                            Add Semester
                        </button>
                    </div>
                    {/*}
                    <h2 className="text-xl font-semibold mb-2">Semesters</h2>
                    <ul className="flex flex-wrap gap-4 mb-4">
                        {semesters.map((semester) => (
                            <div key={semester.id} className="
                                flex flex-1 gap-4 p-4
                                bg-white dark:bg-neutral-950
                                border border-rounded rounded-lg border-neutral-200 dark:border-neutral-800
                                hover:bg-neutral-100 hover:dark:bg-neutral-900
                                transition-colors duration-300
                            ">
                                {/* Clickable Area (SVG and Semester Name) */}
                                {/*}
                                <a href={`/documents/${semester.id}`} className="flex flex-1 gap-4">
                                    {/* SVG Icon */}
                                    {/*}
                                    <div className='flex justify-center'>
                                        <svg className='w-12 h-12' width="19" height="16" viewBox="0 0 19 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M0.794996 0.781049C1.30402 0.280952 1.99441 0 2.71429 0H7.54571C7.80668 0 8.04453 0.147036 8.15746 0.378179L9.92698 4H16.2857C17.0056 4 17.696 4.28095 18.205 4.78105C18.714 5.28115 19 5.95942 19 6.66667V13.3333C19 14.0406 18.714 14.7189 18.205 15.219C17.696 15.719 17.0056 16 16.2857 16H2.71429C1.99441 16 1.30402 15.719 0.794996 15.219C0.285968 14.7189 0 14.0406 0 13.3333V2.66667C0 1.95942 0.285969 1.28115 0.794996 0.781049ZM2.71429 1.33333C2.35435 1.33333 2.00915 1.47381 1.75464 1.72386C1.50013 1.97391 1.35714 2.31304 1.35714 2.66667V13.3333C1.35714 13.687 1.50013 14.0261 1.75464 14.2761C2.00915 14.5262 2.35435 14.6667 2.71429 14.6667H16.2857C16.6457 14.6667 16.9908 14.5262 17.2454 14.2761C17.4999 14.0261 17.6429 13.687 17.6429 13.3333V6.66667C17.6429 6.31304 17.4999 5.97391 17.2454 5.72386C16.9908 5.47381 16.6457 5.33333 16.2857 5.33333H9.5C9.23903 5.33333 9.00118 5.1863 8.88825 4.95515L7.11873 1.33333H2.71429Z"/>
                                        </svg>
                                    </div>

                                    {/* Semester Name (Non-Editable) */}
                                    {/*}
                                    {renamingSemesterId !== semester.id && (
                                        <div className='flex flex-col flex-1'>
                                            <p className='font-bold capitalize'>{semester.name}</p>
                                        </div>
                                    )}
                                </a>

                                {/* Input Field (Outside the <a> tag) */}{/*}
                                {renamingSemesterId === semester.id && (
                                    <div className='flex flex-col flex-1'>
                                        <input
                                            type="text"
                                            value={renamingSemesterName}
                                            onChange={(e) => setRenamingSemesterName(e.target.value)}
                                            className="border rounded p-1"
                                        />
                                    </div>
                                )}

                                {/* Buttons (Outside the <a> tag) */}{/*}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDeleteSemester(semester.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                    {renamingSemesterId === semester.id ? (
                                        <button
                                            onClick={() => handleRenameSemester(semester.id, renamingSemesterName)}
                                            className="bg-green-500 text-white px-2 py-1 rounded"
                                        >
                                            Save
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setRenamingSemesterId(semester.id);
                                                setRenamingSemesterName(semester.name);
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
                    {*/}
                    <UploadFile />
                    <RecentFiles />
                    <h1 className='text-2xl font-semibold my-4'>Documents</h1>
                    <DisplayFiles onFileClick={handleFileClick} />
                </div>
            </div>
        </div>
    );
};