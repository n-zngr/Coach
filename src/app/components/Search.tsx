"use client";

import { useState } from "react";

interface SearchProps {
    onClose: () => void;
}

export default function Search({ onClose }: SearchProps) {
    const [query, setQuery] = useState("");

    const handleSearch = () => {
        console.log("Searching for:", query);
        // Hier kannst du die Suchlogik hinzufügen
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 relative">
                {/* Schließen-Button */}
                <button 
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={onClose}
                >
                    ✖
                </button>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Search
                </h2>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="Enter search query..."
                />

                <button
                    onClick={handleSearch}
                    className="mt-4 w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
                >
                    Search
                </button>
            </div>
        </div>
    );
}
