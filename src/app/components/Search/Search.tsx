"use client";

import { useState, useRef, useEffect } from "react";
import SearchFileItem from "./SearchFileItem";
import { toTitleCase } from "@/app/utils/stringUtils";
import CloseButton from "../Buttons/CloseButton";
import SearchLinkItem from "./SearchLinkItem";

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
            console.log(searchResults)
        }
    }

    // Validates whether the result is a subject
    const isSubject = (result: any) => result.type === 'subject';
    const isLink = (result: any) => result.hasOwnProperty('url');

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
        <div className="fixed min-w-full inset-0 bg-black-500 dark:bg-white-500 bg-opacity-10 dark:bg-opacity-5 backdrop-blur-[2px] flex justify-center items-center z-10">
            <div
                ref={searchRef}
                className="w-2/5 min-w-fit bg-white-900 dark:bg-black-100 rounded-3xl shadow-sm shadow-black-100 border border-black-900 dark:border-white-100 m-8"
            >
                <header className="flex items-center border-b border-white-100">
                    <div className="pl-4">
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 17L12.3846 12.3846M14.3415 7.67077C14.3415 11.3549 11.3549 14.3415 7.67077 14.3415C3.98661 14.3415 1 11.3549 1 7.67077C1 3.9866 3.98661 0.999999 7.67077 0.999999C11.3549 0.999999 14.3415 3.9866 14.3415 7.67077Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        className="pl-4 py-4 bg-white-900 dark:bg-black-100 w-full rounded-t-2xl outline-none text-xl font-light text-black-100 dark:text-white-900 placeholder:text-black-100 placeholder:dark:text-white-900"
                        value={query}
                        onChange={handleSearchChange}
                        onKeyDown={handleEnterPressed}
                        placeholder="Search documents, subjects, or tags..."
                        autoFocus
                    />

                    <div className="flex items-center pr-4">
                        <CloseButton onClick={onClose} />
                    </div>
                </header>
                <main className="flex flex-col p-8 gap-4 max-h-[60vh] overflow-y-auto"> {/* Added max-h and overflow-y */}
                    {searchResults.length > 0 ? (
                        <>
                            {searchResults.map((result, index) => (
                                <div key={result.id || result._id || index} className="flex flex-col gap-4">
                                    <h2 className="text-2xl py-4">
                                        {toTitleCase(result.metadata?.semesterName) ||
                                        toTitleCase(result.semesterName) ||
                                        "No semester"}
                                    </h2>
                                    {isSubject(result) ? (
                                        <div className="pb-8">
                                            {Array.isArray(result.files) && result.files.length > 0 && (
                                                <div className="flex flex-col gap-4 px-4">
                                                    {result.files.map((file: any) => (
                                                        <SearchFileItem key={file.id || file._id} file={file} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : isLink(result) ? (
                                        <SearchLinkItem link={result} />

                                        /* <> {/*}
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mt-1">
                                                {result.subjectName || "Unbekanntes Fach"}
                                            </h3>
                                            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-400 mt-1">
                                                {result.topicName || "Unbekanntes Thema"}
                                            </h4> */


                                            /*}
                                            <p className="text-gray-700 dark:text-gray-400 mt-1">
                                                <a href={result.url} target="_blank" rel="noopener noreferrer">
                                                {result.name} - {result.url}
                                                </a>
                                            </p>
                                            
                                            {result.metadata?.tags && result.metadata.tags.length > 0 && (
                                                <div className="mt-2">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Tags: </span>
                                                {result.metadata.tags.map((tag: any) => (
                                                    <span key={tag.id} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mr-2">
                                                    {tag.name}
                                                    </span>
                                                ))}
                                                </div>
                                            )} */
                                        /* </>*/
                                    ) : (
                                        <div className="pb-4">
                                            {/*<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mt-1">
                                                {result.metadata?.subjectName || "No subject"}
                                            </h3>*/}
                                            <SearchFileItem file={result} />
                                            
                                            {/*{result.metadata?.tags && result.metadata.tags.length > 0 && (
                                                <div className="mt-2">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Tags: </span>
                                                {result.metadata.tags.map((tag: any) => (
                                                    <span key={tag.id} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mr-2">
                                                    {tag.name}
                                                    </span>
                                                ))}
                                                </div>
                                            )}*/}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    ) : (
                        <p className="font-light pb-4 text-white-900">No results found.</p>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Search;