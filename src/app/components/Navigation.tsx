"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navigation() {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleNavigation = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <nav className={`bg-gray-500 text-white h-full ${isExpanded ? 'w-64' : 'w-16'} transition-width duration-300`}> 
            <button 
                className="m-2 p-2 bg-gray-500 border rounded border-gray-600 hover:bg-gray-400" 
                onClick={toggleNavigation}
            >
                <img 
                    src="/icon-arrow.svg" 
                    alt="Toggle Navigation" 
                    className={`w-4 h-4 mr-2 transform ${isExpanded ? 'rotate-0' : 'rotate-180'}`} 
                />
            </button>
            {isExpanded && (
                <ul className="mt-4 space-y-2">
                    <li>
                        <Link href="/documents" className="block p-2 hover:bg-gray-400 font-bold">
                            Documents
                        </Link>
                    </li>
                </ul>
            )}
        </nav>
    );
};