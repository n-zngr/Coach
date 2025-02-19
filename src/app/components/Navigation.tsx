"use client";

import { useState, useEffect } from "react";
import LogoutButton from "./LogOut";
import Link from "next/link";
import Search from "./Search"; // Import der Search Komponente
import { useRouter } from "next/navigation";

interface NavigationProps {
    isExpanded: boolean;
    toggleNavigation: () => void;
}

export default function Navigation({ isExpanded, toggleNavigation }: NavigationProps) {
    const [isSearchVisible, setIsSearchVisible] = useState(false); // Zustand, um die Sichtbarkeit der Suchleiste zu steuern
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Zustand für Authentifizierung
    const router = useRouter();

    useEffect(() => {
        // Prüfen, ob das userId-Cookie gesetzt ist, um die Authentifizierung zu prüfen
        const checkAuthentication = () => {
            const userId = document.cookie
                .split('; ')
                .find(row => row.startsWith('userId='))
                ?.split('=')[1];

            if (userId) {
                setIsAuthenticated(true); // Benutzer ist authentifiziert
            } else {
                setIsAuthenticated(false); // Benutzer ist nicht authentifiziert
            }
        };

        checkAuthentication(); // Authentifizierung bei Initialisierung prüfen
    }, []);

    const toggleSearch = () => {
        // Nur wenn der Benutzer authentifiziert ist, die Suche anzeigen
        if (isAuthenticated) {
            setIsSearchVisible(!isSearchVisible); // Umschalten der Sichtbarkeit der Suchleiste
        } else {
            alert("Please log in to use the search functionality.");
            router.push("/login"); // Umleitung zur Login-Seite, wenn nicht authentifiziert
        }
    };

    return (
        <nav 
            className={`fixed top-0 left-0 h-screen ${isExpanded ? "w-64" : "w-12"}  
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
                        <img 
                            src="/icon-arrow.svg" 
                            alt="Toggle Navigation" 
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-0' : 'rotate-180'}`} 
                        />
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
                            <li>
                                {/* Search Button */}
                                <button
                                    className="block w-full p-3 rounded-md 
                                    hover:bg-gray-200 dark:hover:bg-gray-700 
                                    font-semibold text-gray-900 dark:text-gray-100 
                                    transition-all text-left"  // text-left für linksbündigen Text
                                    onClick={toggleSearch}
                                >
                                    Search
                                </button>
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

                        <LogoutButton/>

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

            {/* Zeigt die Suchleiste an, wenn isSearchVisible true ist */}
            {isSearchVisible && <Search />}
        </nav>
    );
}
