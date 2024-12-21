"use client";

import { useState } from 'react';
import Navigation from '@/app/components/Navigation';

export default function Home() {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleNavigation = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="flex h-screen">
            <Navigation isExpanded={isExpanded} toggleNavigation={toggleNavigation} />
            <div className={`flex-1 p-16 transition-all duration-300 ${
                    isExpanded ? "ml-64" : "ml-12"
                }`}>
                <h1 className="text-3xl font-bold">Coach Proof of Concept</h1>
                <p className="mt-4 text-lg">Use the navigation bar to access different sections of the application.</p>
            </div>
        </div>
    );
}
