import { useState } from "react";

interface SearchProps {
    onClose: () => void;
    onSearch: (searchQuery: string) => void;
    searchQuery: string;
    searchResults: any[];  // Hier könnte der Typ weiter angepasst werden
}

const Search: React.FC<SearchProps> = ({ onClose, onSearch, searchQuery, searchResults }) => {
    const [query, setQuery] = useState(searchQuery);

    // Handler für die Eingabewertänderung
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);  // Setzt den aktuellen Wert des Suchfeldes
    };

    const handleSearch = () => {
        console.log("Searching for:", query);
        onSearch(query);
    };

    return (
        <div className="fixed inset-0 bg-black-100 backdrop-blur-[2px] bg-opacity-25 flex justify-center items-center z-10 transition-all duration-500">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Search</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400">Close</button>
                </div>

                {/* Eingabefeld für die Suche */}
                <input
                    type="text"
                    className="mt-4 p-2 w-full rounded border border-gray-300 dark:border-gray-600"
                    value={query}
                    onChange={handleSearchChange}
                    placeholder="Search documents, folders, subjects, or semesters..."
                    autoFocus
                />

                {/* Suchbutton */}
                <button 
                    onClick={handleSearch} 
                    className="mt-4 w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Search
                </button>

                {/* Ergebnisse anzeigen */}
                {searchResults.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                        {searchResults.map((result) => (
                            <li key={result._id} className="flex justify-between items-center">
                                <span>{result.filename}</span>
                                {result.metadata?.folderName && <span>({result.metadata.folderName})</span>}
                                {/* Hier werden die Namen anstelle der IDs angezeigt */}
                                {result.metadata?.subjectName && <span> - Subject: {result.metadata.subjectName}</span>}
                                {result.metadata?.semesterName && <span> - Semester: {result.metadata.semesterName}</span>}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No results found</p>
                )}
            </div>
        </div>
    );
};

export default Search;
