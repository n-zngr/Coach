"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    fetchFilesFromApi,
    buildNewTaskPayload,
    buildEditTaskPayload,
    DocumentFile,
} from "@/app/api/todoview/functions";

export interface Task {
    _id: string;
    date: string;
    status: "planned" | "in progress" | "complete";
    taskName: string;
    file?: any;
}

export interface TodoViewProps {
    isVisible: boolean;
    onClose: () => void;
    date: string; // The current date (YYYY-MM-DD) for the task
    onTaskAdded: () => void; // Callback to refresh tasks in parent
    editTask?: Task | null; // If provided, the modal is in edit mode
}

const TodoView: React.FC<TodoViewProps> = ({
    isVisible,
    onClose,
    date,
    onTaskAdded,
    editTask,
}) => {
    const [taskName, setTaskName] = useState<string>("");
    const [fileOption, setFileOption] = useState<"existing" | "new">("existing");
    const [selectedFile, setSelectedFile] = useState<string>(""); // stores selected document id
    const [newFile, setNewFile] = useState<File | null>(null);
    // Files fetched from the database for the current user.
    const [files, setFiles] = useState<DocumentFile[]>([]);
    // Search term for filtering files
    const [searchTerm, setSearchTerm] = useState<string>("");

    // When in edit mode, prefill the form fields.
    useEffect(() => {
        if (editTask) {
            setTaskName(editTask.taskName);
            if (editTask.file && editTask.file.fileId) {
                setSelectedFile(editTask.file.fileId.toString());
            } else {
                setSelectedFile("");
            }
        } else {
            setTaskName("");
            setSelectedFile("");
            setNewFile(null);
            setSearchTerm("");
        }
    }, [editTask]);

    // Fetch documents using the helper function.
    useEffect(() => {
        async function fetchFiles() {
            try {
                const data = await fetchFilesFromApi("/api/documents/files");
                console.log("Fetched documents:", data);
                setFiles(data);
            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        }
        if (fileOption === "existing") {
            fetchFiles();
        }
    }, [fileOption]);

    // Separate function to handle file selection.
    const handleFileSelect = useCallback((file: DocumentFile) => {
        const fileId = file.id || file._id;
        if (fileId) {
            setSelectedFile(fileId.toString());
        } else {
            setSelectedFile("");
        }
        setSearchTerm(file.filename);
    }, []);

    const handleTaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let payload;
        if (editTask) {
            payload = buildEditTaskPayload(
                editTask._id,
                taskName,
                editTask.status,
                fileOption,
                selectedFile,
                newFile
            );
        } else {
            payload = buildNewTaskPayload(
                taskName,
                date,
                fileOption,
                selectedFile,
                newFile
            );
        }

        console.log("Payload:", payload);

        try {
            const res = await fetch("/api/todos", {
                method: editTask ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errorText = await res.text();
                console.error(
                    editTask ? "Failed to update task:" : "Failed to create task:",
                    res.status,
                    errorText
                );
            } else {
                console.log(
                    editTask ? "Task updated successfully" : "Task created successfully"
                );
                onClose();
                onTaskAdded();
            }
        } catch (error) {
            console.error(
                editTask ? "Error updating task:" : "Error creating task:",
                error
            );
        }

        // Reset form state
        setTaskName("");
        setSelectedFile("");
        setNewFile(null);
        setSearchTerm("");
    };

    if (!isVisible) return null;

    // Filter files based on the search term; only show list if searchTerm is non-empty and no file is selected.
    const filteredFiles =
        searchTerm && !selectedFile
            ? files
                  .filter((file) =>
                      file.filename?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .slice(0, 3)
            : [];

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 999,
                }}
            />
            {/* Modal */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    width: "50%",
                    height: "100%",
                    backgroundColor: "black",
                    color: "#fff",
                    boxShadow: "-2px 0 8px rgba(0,0,0,0.3)",
                    zIndex: 1000,
                    padding: "20px",
                    transition: "transform 0.3s ease-in-out",
                    transform: isVisible ? "translateX(0)" : "translateX(100%)",
                }}
            >
                <button onClick={onClose} style={{ marginBottom: "20px" }}>
                    Close
                </button>
                <h2>{editTask ? "Edit Task" : "New Task"}</h2>
                <form onSubmit={handleTaskSubmit}>
                    <div style={{ marginBottom: "15px" }}>
                        <label
                            htmlFor="taskName"
                            style={{ display: "block", marginBottom: "5px" }}
                        >
                            Task Name:
                        </label>
                        <input
                            type="text"
                            id="taskName"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            placeholder="Enter task name"
                            style={{ width: "100%", padding: "8px" }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <p>Link Document (optional):</p>
                        <label style={{ marginRight: "10px" }}>
                            <input
                                type="radio"
                                name="fileOption"
                                value="existing"
                                checked={fileOption === "existing"}
                                onChange={() => {
                                    setFileOption("existing");
                                    setSelectedFile("");
                                    setSearchTerm("");
                                }}
                            />{" "}
                            Link existing document
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="fileOption"
                                value="new"
                                checked={fileOption === "new"}
                                onChange={() => setFileOption("new")}
                            />{" "}
                            Upload new document
                        </label>
                    </div>
                    {fileOption === "existing" && (
                        <div style={{ marginBottom: "15px", position: "relative" }}>
                            <label
                                htmlFor="documentSearch"
                                style={{ display: "block", marginBottom: "5px" }}
                            >
                                Search Document:
                            </label>
                            <input
                                type="text"
                                id="documentSearch"
                                placeholder="Type to search..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    // Clear selection if search term changes
                                    setSelectedFile("");
                                }}
                                style={{ width: "100%", padding: "8px" }}
                            />
                            {filteredFiles.length > 0 && (
                                <ul
                                    key="fileSearchResults"
                                    style={{
                                        listStyle: "none",
                                        padding: 0,
                                        margin: 0,
                                        position: "absolute",
                                        backgroundColor: "#fff",
                                        color: "#000",
                                        width: "100%",
                                        border: "1px solid #ccc",
                                        zIndex: 1001,
                                        maxHeight: "150px",
                                        overflowY: "auto",
                                    }}
                                >
                                    {filteredFiles.map((file) => (
                                        <li
                                            key={file.id || file._id}
                                            onClick={() => handleFileSelect(file)}
                                            style={{
                                                padding: "8px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {file.filename}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                    {fileOption === "new" && (
                        <div style={{ marginBottom: "15px" }}>
                            <label
                                htmlFor="newFile"
                                style={{ display: "block", marginBottom: "5px" }}
                            >
                                Upload Document:
                            </label>
                            <input
                                type="file"
                                id="newFile"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setNewFile(e.target.files[0]);
                                    }
                                }}
                            />
                        </div>
                    )}
                    <button type="submit" style={{ padding: "10px 15px" }}>
                        Save Task
                    </button>
                </form>
            </div>
        </>
    );
};

export default TodoView;