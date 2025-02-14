"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Navigation from "@/app/components/Navigation";
import DisplayFiles from "@/app/components/DisplayFiles";
import RecentFiles from "@/app/components/RecentFiles";
import UploadFile from "@/app/components/UploadFile";
import Search from "@/app/components/search"; // search.tsx befindet sich jetzt in app/components

type Topic = {
  id: string;
  name: string;
};

type Subject = {
  id: string;
  name: string;
  topics: Topic[];
};

type Semester = {
  id: string;
  name: string;
  subjects: Subject[];
};

export default function Documents() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const response = await fetch("/api/auth", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          console.warn("User not authenticated, redirecting to /login");
          router.push("/login");
          return;
        }

        await fetchSemesters();
      } catch (error) {
        console.error("Error authenticating user:", error);
        router.push("/login");
      }
    };

    authenticateUser();
  }, []);

  const fetchSemesters = async () => {
    try {
      const response = await fetch("/api/documents/semesters", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();

        if (Array.isArray(data)) {
          const formattedData: Semester[] = data.map((semester: any) => ({
            id: semester.id,
            name: semester.name,
            subjects: semester.subjects.map((subject: any) => ({
              id: subject.id,
              name: subject.name,
              topics: subject.topics.map((topic: any) => ({
                id: topic.id,
                name: topic.name,
              })),
            })),
          }));
          setSemesters(formattedData);
        } else {
          console.error("Invalid data format for semesters:", data);
          setSemesters([]);
        }
      } else {
        console.error("Failed to fetch semesters");
        setSemesters([]);
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
      setSemesters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name) return;

    try {
      const response = await fetch("/api/documents/semesters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: name.toLowerCase() }),
      });

      if (response.ok) {
        const newSemester = await response.json();
        setSemesters((prev) => [...prev, newSemester]);
        setName("");
      } else {
        console.error("Failed to add semester");
      }
    } catch (error) {
      console.error("Error adding semester:", error);
    }
  };

  const toggleNavigation = () => {
    setIsExpanded(!isExpanded);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Navigation mit Search-Callback */}
      <Navigation
        isExpanded={isExpanded}
        toggleNavigation={toggleNavigation}
        onSearchOpen={() => setIsSearchOpen(true)}
      />

      <div
        className={`flex-1 p-16 transition-all duration-300 ${
          isExpanded ? "ml-64" : "ml-12"
        }`}
      >
        <h1 className="text-2xl font-bold mb-4">Manage Semesters</h1>
        <div className="mb-4">
          <input
            type="text"
            className="border rounded text-black p-2 w-full"
            placeholder="Semester Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            onClick={handleSubmit}
          >
            Add Semester
          </button>
        </div>
        <h2 className="text-xl font-semibold mb-2">Semesters</h2>
        <ul className="flex flex-wrap gap-4 mb-4">
          {semesters.map((semester) => (
            <a
              key={semester.id}
              href={`/documents/${semester.id}`}
              className="
                flex flex-1 gap-4 p-4
                bg-white dark:bg-neutral-950
                border border-rounded rounded-lg border-neutral-200 dark:border-neutral-800
                hover:bg-neutral-100 hover:dark:bg-neutral-900
                transition-colors duration-300
              "
            >
              <div className="flex justify-center">
                <svg
                  className="w-12 h-12"
                  width="19"
                  height="16"
                  viewBox="0 0 19 16"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.79 0.78C1.30 0.28 1.99 0 2.71 0H7.55c0.26 0 0.49 0.15 0.61 0.38L9.93 4h6.35c0.72 0 1.41 0.28 1.92 0.78 0.51 0.5 0.79 1.18 0.79 1.89v6.67c0 0.71-0.28 1.39-0.79 1.89-0.51 0.5-1.20 0.78-1.92 0.78H2.71c-0.72 0-1.41-0.28-1.92-0.78C0.29 14.06 0 13.38 0 12.67V2.67C0 1.96 0.29 1.28 0.79 0.78zM2.71 1.33c0.36 0 0.71 0.14 0.97 0.39 0.26 0.25 0.41 0.59 0.41 0.94v10.67c0 0.35-0.15 0.69-0.41 0.94-0.26 0.25-0.61 0.39-0.97 0.39H2.71z"
                  />
                </svg>
              </div>
              <div className="flex">
                <p className="font-bold capitalize">{semester.name}</p>
              </div>
            </a>
          ))}
        </ul>

        <UploadFile />
        <RecentFiles />
        <h1 className="text-2xl font-semibold my-4">Documents</h1>
        <DisplayFiles />
      </div>

      {/* Search Modal */}
      <Search isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
