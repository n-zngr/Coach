"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navigation() {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleNavigation = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <nav 
            className={`h-full ${isExpanded ? 'w-64' : 'w-12'} 
            border-r transition-width duration-300 
            bg-white dark:bg-gray-900 
            border-r-gray-200 dark:border-r-gray-700
            text-gray-900 dark:text-gray-100`}
        > 
            <div className="flex flex-col justify-between h-full">
                {/* Navigation Toggle Button */}
                <div className="flex flex-col">
                    <button 
                        className="w-8 h-8 m-2 p-2 
                        bg-gray-100 dark:bg-gray-800 
                        border rounded-lg border-gray-300 dark:border-gray-700 
                        hover:bg-gray-200 dark:hover:bg-gray-700 
                        flex justify-center items-center transition-all"
                        onClick={toggleNavigation}
                    >
                        <svg 
                            width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-0' : 'rotate-180'}`}>
                            <path fillRule="evenodd" clipRule="evenodd" d="M8.64422 0.323939C9.10971 0.764208 9.11973 1.48776 8.6666 1.94004L2.59522 8L8.6666 14.06C9.11973 14.5122 9.10971 15.2358 8.64422 15.6761C8.17874 16.1163 7.43405 16.1066 6.98093 15.6543L0.525069 9.2106C0.363028 9.05697 0.233305 8.87403 0.143276 8.67197C0.0487652 8.45985 0 8.23116 0 8C0 7.76884 0.0487652 7.54015 0.143276 7.32803C0.233305 7.12597 0.363028 6.94303 0.525069 6.7894L6.98093 0.345679C7.43405 -0.106597 8.17874 -0.116331 8.64422 0.323939Z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>

                    {/* Navigation Links */}
                    {isExpanded && (
                        <ul className="mt-4 space-y-4">
                            <li>
                                <Link 
                                    href="/documents" 
                                    className="block p-3 rounded-md 
                                    hover:bg-gray-200 dark:hover:bg-gray-700 
                                    font-semibold text-gray-900 dark:text-gray-100 
                                    transition-all"
                                >
                                    Documents
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>

                {/* Bottom Section for Login/Signup Links */}
                {isExpanded && (
                    <div className="flex flex-col mt-8">
                        <a 
                            href="/signup" 
                            className="block p-3 rounded-md 
                            hover:bg-blue-100 dark:hover:bg-blue-800 
                            font-semibold text-blue-600 dark:text-blue-400 
                            transition-all"
                        >
                            Signup
                        </a>
                        <a 
                            href="/login" 
                            className="block p-3 rounded-md 
                            hover:bg-blue-100 dark:hover:bg-blue-800 
                            font-semibold text-blue-600 dark:text-blue-400 
                            transition-all"
                        >
                            Login
                        </a>
                    </div>
                )}
            </div>
        </nav>
    );
};