"use client";

import { useState } from "react";
import Search from "../Search/Search";
import Notification from "./Notification";
import AccountInfo from "./AccountInfo";
import NavList from "./NavList";

interface NavigationProps {
    isExpanded: boolean;
    toggleNavigation: () => void;
}

export default function Navigation({ isExpanded, toggleNavigation }: NavigationProps) {
    const [isSearchVisible, setIsSearchVisible] = useState(false); 
    const [searchQuery, setSearchQuery] = useState<string>(""); // Search-Input
    const [searchResults, setSearchResults] = useState<any[]>([]); // Search-Output

    const toggleSearch = () => {
        setIsSearchVisible(true);
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        
        try {
            const response = await fetch('/api/documents/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    subjectTypeId: null, // optionally subjectTypeId can be set here
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch search results');
            }

            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Search error:", error);
        }
    };

    return (
        <>
            <nav className={`fixed top-0 left-0 h-screen ${isExpanded ? "w-64" : "w-12"}
                flex flex-col
                border-r transition-width duration-300 
                bg-white-800 dark:bg-black-200
                border-r-white-300 dark:border-r-black-700
                text-black-900 dark:text-white-100`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex m-2">
                        {isExpanded &&
                            <div className="h-8 w-8 rounded-md border border-white-500 dark:border-black-500 active:scale-95 cursor-pointer transition-transform duration-200">
                                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 20L20 16H8V20H16Z" fill="white"/>
                                    <path d="M8 8H16L20 4H8L4 8V20L8 16V8Z" fill="white"/>
                                </svg>
                            </div>
                        }
                        <button 
                            className="w-8 h-8 p-2 ml-auto
                                rounded-full
                                hover:bg-black-200 dark:hover:bg-black-700
                                flex justify-center items-center
                                active:scale-95 transition-all duration-200"
                            onClick={toggleNavigation}
                        >
                            <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.92308 1V16M2.23077 1H15.7692C16.449 1 17 1.51659 17 2.15385V14.8462C17 15.4834 16.449 16 15.7692 16H2.23077C1.55103 16 1 15.4834 1 14.8462V2.15385C1 1.51659 1.55103 1 2.23077 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                    {isExpanded && (
                        <div className="flex">
                            <button className="flex flex-1 m-2 p-2 rounded-full bg-white-700 hover:bg-white-600 dark:bg-black-300 dark:hover:bg-black-400 border border-white-500 dark:border-black-500 transition-colors duartion-500" onClick={toggleSearch}>
                                <div className="flex gap-2">
                                    <div className="flex justify-center items-center pl-1">
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17 17L12.3846 12.3846M14.3415 7.67077C14.3415 11.3549 11.3549 14.3415 7.67077 14.3415C3.98661 14.3415 1 11.3549 1 7.67077C1 3.9866 3.98661 0.999999 7.67077 0.999999C11.3549 0.999999 14.3415 3.9866 14.3415 7.67077Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div className="font-metropolis font-medium text-black-900 dark:text-white-100">
                                        <p>Search</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}
                    {isExpanded && (
                        <NavList isExpanded={isExpanded} />
                    )}
                    {isExpanded && (
                        <div className="mt-auto">
                            <div className="flex flex-col">
                                <Notification />
                                <div className="mb-2">
                                    <AccountInfo />
                                </div>
                            </div>
                        </div>
                    )}
                    
                </div>        
            </nav>

            {/* Search Popup */}
            {isSearchVisible && (
                <Search 
                    onClose={() => setIsSearchVisible(false)} 
                    onSearch={handleSearch} 
                    searchQuery={searchQuery}  // Übergibt den Suchbegriff
                    searchResults={searchResults} // Übergibt die Suchergebnisse
                />
            )}
        </>
    );
}