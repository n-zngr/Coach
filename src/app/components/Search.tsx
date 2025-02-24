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

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
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
                    placeholder="Search documents, subjects, or semesters..."
                    autoFocus
                />

                <button 
                    onClick={handleSearch} 
                    className="mt-4 w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Search
                </button>

                {searchResults.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                        {searchResults.map((result) => (
                            <li key={result.id || result._id} className="flex justify-between items-center">
                                {result.type === "subject" ? (
                                    <span>📚 {result.name} (Semester: {result.semesterName})</span>
                                ) : (
                                    <span>📄 {result.filename} ({result.metadata.folderName})</span>
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
