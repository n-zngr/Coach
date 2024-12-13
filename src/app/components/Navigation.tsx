"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navigation() {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleNavigation = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <nav className={`bg-gray-800 text-white h-full ${isExpanded ? 'w-64' : 'w-16'} transition-width duration-300`}> 
            <button 
                className="p-2 bg-gray-700 hover:bg-gray-600 w-full text-left" 
                onClick={toggleNavigation}
            >
                {isExpanded ? 'Collapse' : 'Expand'}
            </button>
            {isExpanded && (
                <ul className="mt-4 space-y-2">
                    <li>
                        <Link href="/documents" className="block p-2 hover:bg-gray-700 rounded">
                            Documents
                        </Link>
                    </li>
                </ul>
            )}
        </nav>
    );
};