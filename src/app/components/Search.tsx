import { useState } from "react";

const Search = () => {
    const [query, setQuery] = useState("");

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        console.log("Searching for:", query); // Hier kannst du die Suche nach Dokumenten oder etwas anderem integrieren
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md mt-4">
            <form onSubmit={handleSearch} className="flex items-center">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="p-2 rounded-l-md border border-gray-300 dark:border-gray-700 w-full"
                    placeholder="Search for documents..."
                />
                <button
                    type="submit"
                    className="p-2 bg-blue-500 text-white rounded-r-md"
                >
                    Search
                </button>
            </form>
        </div>
    );
};

export default Search;
