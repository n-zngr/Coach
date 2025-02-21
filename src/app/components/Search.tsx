import { useState } from "react";

interface SearchProps {
    onClose: () => void;
    onSearch: (searchQuery: string) => void;
    searchQuery: string;
    searchResults: any[];  // Passe den Typ nach Bedarf an
}

const Search: React.FC<SearchProps> = ({ onClose, onSearch, searchQuery, searchResults }) => {
    const [query, setQuery] = useState(searchQuery);  // `query` State für das Eingabefeld

    // Handler, um den Wert im State zu aktualisieren
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Input value changed to:", e.target.value); // Zum Debuggen
        setQuery(e.target.value);  // Hier wird der State korrekt aktualisiert
    };

    // Wenn der Suchbutton gedrückt wird oder Enter gedrückt wird
    const handleSearch = () => {
        console.log("Searching for:", query);  // Zum Debuggen
        onSearch(query);  // Übergibt den aktuellen Suchbegriff zur Suchfunktion
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Search</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400">Close</button>
                </div>

                {/* Eingabefeld für die Suche */}
                <input
                    type="text"
                    className="mt-4 p-2 w-full rounded border border-gray-300 dark:border-gray-600"
                    value={query}  // Bindung des Wertes an den `query` State
                    onChange={handleSearchChange}  // Handler für die Eingabefeldänderung
                    placeholder="Search documents..."
                    autoFocus  // Optional: Der Fokus wird automatisch auf das Eingabefeld gesetzt, wenn es angezeigt wird
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
