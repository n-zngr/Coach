"use client";

import { useState } from "react";
import LogoutButton from "./LogOut";
import Link from "next/link";
import Search from "./Search"; 

interface NavigationProps {
    isExpanded: boolean;
    toggleNavigation: () => void;
}

export default function Navigation({ isExpanded, toggleNavigation }: NavigationProps) {
    const [isSearchVisible, setIsSearchVisible] = useState(false); 

    const toggleSearch = () => {
        setIsSearchVisible(true);
    };

    return (
        <>
            <nav 
                className={`fixed top-0 left-0 h-screen ${isExpanded ? "w-64" : "w-12"}  
                border-r transition-width duration-300 
                bg-white dark:bg-gray-900
                border-r-gray-200 dark:border-r-gray-700
                text-gray-900 dark:text-gray-100`}
            > 
                <div className="flex flex-col justify-between h-full">
                    <div className="flex flex-col">
                        {/* Navigation Toggle Button */}
                        <button 
                            className="w-8 h-8 m-2 p-2 
                            bg-gray-100 dark:bg-gray-800 
                            border rounded-lg border-gray-300 dark:border-gray-700 
                            hover:bg-gray-200 dark:hover:bg-gray-700 
                            flex justify-center items-center transition-all"
                            onClick={toggleNavigation}
                        >
                            <img 
                                src="/icon-arrow.svg" 
                                alt="Toggle Navigation" 
                                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-0' : 'rotate-180'}`} 
                            />
                        </button>

                        {/* Navigations-Links */}
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
                                <li>
                                    <button
                                        className="block w-full p-3 rounded-md 
                                        hover:bg-gray-200 dark:hover:bg-gray-700 
                                        font-semibold text-gray-900 dark:text-gray-100 
                                        transition-all text-left"  
                                        onClick={toggleSearch}
                                    >
                                        Search
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>

                    {/* Login / Signup / Logout */}
                    {isExpanded && (
                        <div className="flex flex-col mt-8">
                            <Link 
                                href="/signup" 
                                className="block p-3 rounded-md 
                                hover:bg-blue-100 dark:hover:bg-blue-800 
                                font-semibold text-blue-600 dark:text-blue-400 
                                transition-all"
                            >
                                Signup
                            </Link>

                            <LogoutButton/>

                            <Link 
                                href="/login" 
                                className="block p-3 rounded-md 
                                hover:bg-blue-100 dark:hover:bg-blue-800 
                                font-semibold text-blue-600 dark:text-blue-400 
                                transition-all"
                            >
                                Login
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Search Popup */}
            {isSearchVisible && <Search onClose={() => setIsSearchVisible(false)} />}
        </>
    );
}
