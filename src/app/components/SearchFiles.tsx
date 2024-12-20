"use client";

import React, { useState, useEffect } from 'react';

interface File {
    _id: string;
    filename: string;
    uploadDate: string;
    length: number;
    metadata: {
        userId: string;
        semesterId?: string;
        subjectId?: string;
        topicId?: string;
    };
}

const SearchFiles: React.FC = () => {
    const [query, setQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<File[]>([]);
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim() !== '') {
            setIsLoading(true);

            try {
                const response = await fetch('/api/documents/search', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch search results');
                }

                const data = await response.json();
                setSearchResults(data.slice(0, 6));
                setDropdownVisible(true);
            } catch (error) {
                console.error('Error searching files:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        if (value.trim() === '') {
            setDropdownVisible(false);
            setSearchResults([]);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.search-container')) {
                setDropdownVisible(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);
    
    return (
        <div className="relative search-container">
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleSearch}
                placeholder="Search for files..."
                className="w-full p-2 border text-black border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        
            {dropdownVisible && searchResults.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoading ? (
                        <li className="p-2 text-center text-gray-500">Loading...</li>
                    ) : (
                        searchResults.map((file) => (
                            <li
                                key={file._id}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                            >
                                {file.filename}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

export default SearchFiles;