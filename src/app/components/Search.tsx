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

    // Hilfsfunktion, um zu prüfen, ob ein Resultat vom Typ 'subject' ist
    const isSubject = (result: any) => result.type === 'subject';

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
                    placeholder="Search documents or subjects..."
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
                        {searchResults.map((result, index) => (
                            <li key={result.id || result._id || index} className="flex justify-between items-center">
                                {/* Wenn das Ergebnis ein Subject ist, zeigen wir die zugehörigen Dateien an */}
                                {isSubject(result) ? (
                                    <div>
                                        <span className="font-semibold">📚 {result.name} (Semester: {result.semesterName})</span>
                                        {/* Zeige die Dateien, die diesem Subject zugeordnet sind */}
                                        {result.files && result.files.length > 0 ? (
                                            <ul className="ml-4 space-y-2">
                                                {result.files.map((file: any) => (
                                                    <li key={file.id || file._id} className="flex justify-between items-center">
                                                        <span>📄 {file.filename} ({file.metadata?.folderName || "No folder"})</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="ml-4 text-gray-500">No files in this subject</p>
                                        )}
                                    </div>
                                ) : (
                                    <span>📄 {result.filename} ({result.metadata?.folderName || "No folder"})</span>
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
