import { useState } from "react";

interface SearchProps {
    onClose: () => void;
    onSearch: (searchQuery: string) => void;
    searchQuery: string;
    searchResults: any[];
}

const Search: React.FC<SearchProps> = ({ onClose, onSearch, searchQuery, searchResults }) => {
    const [query, setQuery] = useState(searchQuery);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleSearch = () => {
        console.log("Searching for:", query);
        onSearch(query);
    };

    const isSubject = (result: any) => result.type === 'subject';
    const isLink = (result: any) => result.hasOwnProperty('url');

    return (
        <div className="fixed inset-0 bg-black-100 backdrop-blur-[2px] bg-opacity-25 flex justify-center items-center z-10 transition-all duration-500">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Search</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400">Close</button>
                </div>

                <input
                    type="text"
                    className="mt-4 p-2 w-full rounded border border-gray-300 dark:border-gray-600"
                    value={query}
                    onChange={handleSearchChange}
                    placeholder="Search documents, subjects, or tags..."
                    autoFocus
                />

                <button
                    onClick={handleSearch}
                    className="mt-4 w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Search
                </button>

                {searchResults.length > 0 ? (
                    <ul className="mt-4 space-y-4">
                        {searchResults.map((result, index) => (
                            <li key={result.id || result._id || index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                {/* Semester als größte Überschrift */}
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {result.metadata?.semesterName || result.semesterName || "No semester"}
                                </h2>

                                {isSubject(result) ? (
                                    <>
                                        {/* Fach als mittlere Überschrift */}
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mt-1">
                                            {result.name}
                                        </h3>
                                        {Array.isArray(result.files) && result.files.length > 0 && (
                                            <ul className="ml-4 space-y-2 mt-2">
                                                {result.files.map((file: any) => (
                                                    <li key={file.id || file._id} className="text-gray-700 dark:text-gray-400">
                                                        {file.filename}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                ) : isLink(result) ? (
                                    <>
                                        {/* Fach als mittlere Überschrift */}
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mt-1">
                                            {result.subjectName || "Unbekanntes Fach"}
                                        </h3>
                                        {/* Thema als kleinere Überschrift */}
                                        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-400 mt-1">
                                            {result.topicName || "Unbekanntes Thema"}
                                        </h4>
                                        {/* Link-Name und URL anzeigen */}
                                        <p className="text-gray-700 dark:text-gray-400 mt-1">
                                            <a href={result.url} target="_blank" rel="noopener noreferrer">
                                                {result.name} - {result.url}
                                            </a>
                                        </p>
                                        {/* Tags anzeigen, falls vorhanden */}
                                        {result.metadata?.tags && result.metadata.tags.length > 0 && (
                                            <div className="mt-2">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Tags: </span>
                                                {result.metadata.tags.map((tag: any) => (
                                                    <span key={tag.id} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mr-2">
                                                        {tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {/* Fach als mittlere Überschrift */}
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mt-1">
                                            {result.metadata?.subjectName || "No subject"}
                                        </h3>
                                        <p className="text-gray-700 dark:text-gray-400 mt-1">
                                            {result.filename}
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
                                        )}
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-4 text-gray-500">No results found</p>
                )}
            </div>
        </div>
    );
};

export default Search;