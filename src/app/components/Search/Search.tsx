"use client";

import { useState, useRef, useEffect } from "react";
import SearchFileItem from "./SearchFileItem";

interface SearchProps {
    onClose: () => void;
    onSearch: (searchQuery: string) => void;
    searchQuery: string;
    searchResults: any[];
}

const Search: React.FC<SearchProps> = ({ onClose, onSearch, searchQuery, searchResults }) => {
    const [query, setQuery] = useState(searchQuery);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const closeButtonClicked = useRef<boolean>(false);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = event.target.value;
        setQuery(newQuery);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (newQuery.trim() !== '') {
            searchTimeout.current = setTimeout(() => {
                onSearch(newQuery);
            }, 500);
        } else {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        }
    };

    const handleEnterPressed = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
            if (query.trim() !== '') {
                onSearch(query);
            }
        }
    }

    // Validates whether the result is a subject
    const isSubject = (result: any) => result.type === 'subject';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        const handleESCPressed = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleESCPressed);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleESCPressed);
        }
    }, [onClose])

    return (
        <div className="fixed inset-0 bg-black-500 dark:bg-white-500 bg-opacity-10 dark:bg-opacity-10 backdrop-blur-[2px] flex justify-center items-center z-10 transition-all duration-200">
            <div ref={searchRef} className="bg-white-900 dark:bg-black-100 rounded-3xl w-full max-w-md">
                <div className="flex items-center border-b border-gray-500">
                    <div className="pl-4">
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 17L12.3846 12.3846M14.3415 7.67077C14.3415 11.3549 11.3549 14.3415 7.67077 14.3415C3.98661 14.3415 1 11.3549 1 7.67077C1 3.9866 3.98661 0.999999 7.67077 0.999999C11.3549 0.999999 14.3415 3.9866 14.3415 7.67077Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        className="pl-4 py-4 bg-white-900 dark:bg-black-100 w-full rounded-t-2xl outline-none text-xl dark:text-white-900 placeholder:text-white-900"
                        value={query}
                        onChange={handleSearchChange}
                        onKeyDown={handleEnterPressed}
                        placeholder="Search"
                        autoFocus
                    />

                    <div className="flex items-center pr-4">
                        <button
                            className="w-8 h-8 flex rounded-full justify-center items-center bg-white-500 hover:bg-white-600 dark:bg-black-500 dark:hover:bg-black-600 active:scale-95 transition-all duration-200"
                            
                            onClick={onClose}
                        >
                            <svg width="10" height="10" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 1L1 17M1 1L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="flex flex-col p-4">                    
                    <div className="flex flex-col">
                        {searchResults.length > 0 ? (
                            <ul>
                                {searchResults.map((result, index) => (
                                <li key={result.id || result._id || index} className="flex flex-col gap-4">
                                    <h2 className="text-2xl">
                                        {result.metadata?.semesterName || result.semesterName || "No semester"}
                                    </h2>
                                    {isSubject(result) ? (
                                        <>
                                            {Array.isArray(result.files) && result.files.length > 0 && (
                                            <div className="flex flex-col gap-4">
                                                {result.files.map((file: any) => (
                                                <SearchFileItem key={file.id || file._id} file={file} /> // Use FileItem component
                                                ))}
                                            </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <SearchFileItem file={result} /> {/* Use FileItem component for single file */}
                                        </>
                                    )}
                                </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="pb-4 text-gray-500">No results found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;