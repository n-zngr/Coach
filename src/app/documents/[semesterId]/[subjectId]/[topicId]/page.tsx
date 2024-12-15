"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import FileDisplay from "@/app/components/DisplayFiles";
import RecentFiles from "@/app/components/RecentFiles";
import UploadFile from "@/app/components/UploadFile";

const TopicPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const params = useParams();

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
            } catch (error) {
                console.error('Error authenticating user:', error);
                router.push('/login');
            }
        }

        authenticateUser();
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Implement topic name here</h1>

            <UploadFile />
            <h1 className='text-2xl font-semibold my-4'>Documents</h1>
            <FileDisplay />
            <h1 className='text-2xl font-semibold my-4'>Recent Documents</h1>
            <RecentFiles />
        </div>
    );
};

export default TopicPage;