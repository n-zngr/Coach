"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'
import Navigation from '@/app/components/Navigation/Navigation';

export default function Home() {
    const [isExpanded, setIsExpanded] = useState(true);
    const router = useRouter();

    const toggleNavigation = () => {
        setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        router.push('/documents');
    }, [router])

    return (
        <div className="flex h-screen">
            <Navigation isExpanded={isExpanded} toggleNavigation={toggleNavigation} />
            <div className={`flex-1 p-16 transition-all duration-300 ${
                    isExpanded ? "ml-64" : "ml-12"
                }`}>
                <h1 className="text-3xl font-bold">Redirecting to documents...</h1>
            </div>
        </div>
    );
}
