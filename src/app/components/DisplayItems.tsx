/*
// For future refactoring. This component is responsible for displaying files and links in a unified manner. Can be further implemented if needed with other types. 

"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

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

interface Link {
  _id: string;
  title: string;
  url: string;
  createdAt: string;
  metadata: {
    userId: string;
    semesterId?: string;
    subjectId?: string;
    topicId?: string;
  };
}

interface UnifiedItem {
  type: "file" | "link";
  id: string;
  title: string;
  createdAt: string;
  raw: File | Link;
}

interface DisplayItemsProps {
  onFileClick: (file: File) => void;
  onLinkClick: (link: Link) => void;
}

const DisplayItems: React.FC<DisplayItemsProps> = ({ onFileClick, onLinkClick }) => {
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<string>("");
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [subjectTypes, setSubjectTypes] = useState<{ id: string; name: string }[]>([]);
  const [selectedSubjectType, setSelectedSubjectType] = useState<string | null>(null);

  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const semesterId = pathSegments[1] || null;
  const subjectId = pathSegments[2] || null;
  const topicId = pathSegments[3] || null;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fileRes, linkRes] = await Promise.all([
        fetch("/api/documents/files", {
          method: "GET",
          credentials: "include",
          headers: {
            semesterId: semesterId ?? "",
            subjectId: subjectId ?? "",
            topicId: topicId ?? "",
          },
        }),
        fetch("/api/documents/links", {
          method: "GET",
          credentials: "include",
          headers: {
            semesterId: semesterId ?? "",
            subjectId: subjectId ?? "",
            topicId: topicId ?? "",
          },
        }),
      ]);

      if (!fileRes.ok || !linkRes.ok) throw new Error("Failed to fetch data");

      const [files, links] = await Promise.all([fileRes.json(), linkRes.json()]);

      const combined: UnifiedItem[] = [
        ...files.map((file: File) => ({
          type: "file",
          id: file._id,
          title: file.filename,
          createdAt: file.uploadDate,
          raw: file,
        })),
        ...links.map((link: Link) => ({
          type: "link",
          id: link._id,
          title: link.title,
          createdAt: link.createdAt,
          raw: link,
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setItems(combined);
    } catch (error) {
      console.error("Error fetching files or links: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSubjectTypes = async () => {
      try {
        const response = await fetch('/api/documents/subjectTypes', { method: 'GET', credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch subject types');
        const data = await response.json();
        setSubjectTypes(data);
      } catch (error) {
        console.error('Error fetching subject types:', error);
      }
    };
    fetchSubjectTypes();
    fetchData();
  }, [semesterId, subjectId, topicId]);

  const handleSearch = async () => {
    if (!query.trim() && !selectedSubjectType) {
      resetSearch();
      return;
    }
    setLoading(true);
    setSearchActive(true);
    try {
      const response = await fetch('/api/documents/search', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, subjectTypeId: selectedSubjectType }),
      });
      if (!response.ok) throw new Error('Failed to fetch search results');
      const data = await response.json();
      const searchResults: UnifiedItem[] = data.map((file: File) => ({
        type: 'file',
        id: file._id,
        title: file.filename,
        createdAt: file.uploadDate,
        raw: file
      }));
      setItems(searchResults);
    } catch (error) {
      console.error('Error searching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setQuery('');
    setSearchActive(false);
    fetchData();
  };

  if (loading) return <p>Loading items...</p>;
  if (items.length === 0) return <p>No files or links found.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Files & Links</h2>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for files..."
          className="w-full p-2 border text-black border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="py-2 px-4 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-100 hover:dark:bg-neutral-900 rounded-lg font-bold text-black dark:text-white transition-colors duration-300"
        >
          Search
        </button>
        <select
          value={selectedSubjectType || ''}
          onChange={(e) => setSelectedSubjectType(e.target.value || null)}
          className="p-2 border rounded-lg text-black"
        >
          <option value="">All Subject Types</option>
          {subjectTypes.map((type) => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
        {searchActive && (
          <button
            onClick={resetSearch}
            className="bg-neutral-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-neutral-600 transition-colors duration-300"
          >
            Reset
          </button>
        )}
      </div>
      <ul className="flex flex-col space-y-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() =>
              item.type === "file"
                ? onFileClick(item.raw as File)
                : onLinkClick(item.raw as Link)
            }
            className="group flex items-center text-left p-4 gap-4 border border-rounded rounded-lg border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 hover:dark:bg-neutral-900 cursor-pointer transition-colors duration-300"
          >
            <div className="flex justify-center w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800">
              {item.type === "file" ? (
                <svg className="self-center h-6 w-6" viewBox="0 0 13 16" fill="currentColor">
                  <path d="M1.625 1.14A.714.714 0 0 0 1.08 1.71v12.57c0 .16.06.31.17.42.1.11.25.17.38.17h9.75c.14 0 .28-.06.38-.17.1-.11.17-.26.17-.42V6.86H7.04a.71.71 0 0 1-.54-.57V1.14H1.62Zm5.96.81 3.57 3.76H7.58V1.95Zm-7.06-1.45A1.61 1.61 0 0 1 1.62 0h5.42c.14 0 .28.06.38.17l5.42 5.71c.1.11.17.26.17.42v8c0 .45-.17.88-.48 1.2-.3.32-.72.5-1.15.5H1.62c-.42 0-.84-.18-1.15-.5A1.71 1.71 0 0 1 0 14.28V1.71c0-.45.17-.88.48-1.2Z" />
                </svg>
              ) : (
                <svg className="self-center h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 1-7.07 0 5 5 0 0 1 0-7.07l1.41-1.41" />
                  <path d="M14 11a5 5 0 0 0 0-7.07 5  5 0 0 0-7.07 0L5.5 5.5" />
                </svg>
              )}
            </div>
            <span className="text-lg font-medium flex-1">{item.title}</span>
            <div className="flex justify-self-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg font-bold text-black dark:text-white">
                <p>{item.type === "file" ? "View File" : "View Link"}</p>
              </div>
            </div>
          </button>
        ))}
      </ul>
    </div>
  );
};

export default DisplayItems;
*/