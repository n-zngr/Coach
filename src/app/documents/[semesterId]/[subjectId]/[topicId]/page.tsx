"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toTitleCase } from "@/app/utils/stringUtils";

import DisplayFiles from '@/app/components/DisplayFiles';
import RecentFiles from '@/app/components/Documents/RecentFiles';
import UploadFile from '@/app/components/UploadFile';
import Navigation from "@/app/components/Navigation/Navigation";
import FileView, { AppFile } from "@/app/components/FileView";
import LinkView, {AppLink} from "@/app/components/LinkView";
import Topbar from "@/app/components/Documents/Topbar";
import AddButton from "@/app/components/Buttons/AddButton";

type Topic = {
    id: string;
    name: string;
};

const TopicPage = () => {
    const [topic, setTopic] = useState<Topic | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);
    const [selectedFile, setSelectedFile] = useState<AppFile | null>(null);
    const [selectedLink, setSelectedLink] = useState<AppLink | null>(null);
    const [semesterName, setSemesterName] = useState<string | undefined>(undefined);
    const [subjectName, setSubjectName] = useState<string | undefined>(undefined);
    const [topicName, setTopicName] = useState<string | undefined>(undefined);
    const [triggerUpload, setTriggerUpload] = useState(false);
    const params = useParams();
    const router = useRouter();
    const semesterId = params?.semesterId as string;
    const subjectId = params?.subjectId as string;
    const topicId = params?.topicId as string;


    const fetchTopic = async () => {
        try {
            const response = await fetch(`/api/documents/semesters/${semesterId}/${subjectId}/${topicId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();

                if (data.semesterName) {
                    setSemesterName(data.semesterName);
                } else {
                    console.warn('Could not find a semester name')
                }

                if (data.subjectName) {
                    setSubjectName(data.subjectName);
                } else {
                    console.warn('Could not find a semester name')
                }

                if (data.topic.name) {
                    setTopicName(data.topic.name);
                } else {
                    console.warn('Could not find topic name')
                }

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

    useEffect(() => {
    const authenticateUser = async () => {
        try {
        const response = await fetch('/api/auth', {
        method: 'GET',
        credentials: 'include'
        });

        if (!response.ok) {
        router.push('/login');
        return;
        }

        if (semesterId && subjectId && topicId) {
        await fetchTopic();
        }
    }   catch {
        router.push('/login');
    }
  };

    authenticateUser();
    }, [semesterId, subjectId, topicId, router]);

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
            {selectedLink && <LinkView link={selectedLink} onClose={handleCloseLinkView} />}
            {triggerUpload && (
                <UploadFile triggerUpload={triggerUpload} setTriggerUpload={setTriggerUpload} />
            )}
            <div className={`flex-1 transition-all duration-200
                    ${isExpanded ? "pl-64" : "pl-12"}
                    ${selectedFile || triggerUpload || selectedLink ? "pr-96" : ""}
                `}
            >
                <Topbar path={`${toTitleCase(semesterName)} / ${toTitleCase(subjectName)} / ${toTitleCase(topicName)}`} />

                <div className='p-12 pt-[7.5rem]'>
                    <header className="border-b border-black-500 dark:border-white-500 mb-8">
                        <div className="flex justify-between">
                            <h1 className="font-base text-xl self-end pb-1">{topic ? topic.name : "Topic"}</h1>
                            <AddButton onTriggerUpload={() => setTriggerUpload(true)} itemType='none' />
                        </div>
                    </header>
                    <h1 className="text-2xl font-bold mb-4">{topic ? topic.name : "Unknown Topic"}</h1>
                    
                    
                    <h1 className='text-2xl font-semibold my-4'>Documents</h1>
                    <RecentFiles />
                    <DisplayFiles onFileClick={handleFileClick} onLinkClick={handleLinkClick} />
                </div>
            </div>
        </div>
    );
};

export default TopicPage;