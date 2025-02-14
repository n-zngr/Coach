"use client";

import React, { useEffect } from "react";

interface FileType {
  id: string;
  name: string;
  // Weitere Dateieigenschaften können ergänzt werden
}

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const Search: React.FC<SearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<FileType[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/documents/search?query=${encodeURIComponent(query)}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        } else {
          console.error("Fehler beim Abrufen der Suchergebnisse");
        }
      } catch (error) {
        console.error("Fehler bei der Suche:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-11/12 md:w-1/2 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Search Files</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-lg font-bold"
          >
            ×
          </button>
        </div>
        <input
          type="text"
          className="border rounded p-2 w-full mb-4"
          placeholder="Type to search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {results.map((file) => (
              <li
                key={file.id}
                className="p-2 border-b border-gray-200 dark:border-neutral-700"
              >
                {file.name}
              </li>
            ))}
            {query && results.length === 0 && !isLoading && (
              <li className="text-gray-500">No results found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Search;
