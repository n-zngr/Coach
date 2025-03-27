"use client";

import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  fetchFilesFromApi,
  buildNewTaskPayload,
  buildEditTaskPayload,
  DocumentFile,
} from "@/app/api/todoview/route";
import FileView from "@/app/components/FileView"; // Ensure casing matches your file system

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
  date: string; // current date (YYYY-MM-DD)
  onTaskAdded: () => void; // callback to refresh tasks in parent
  editTask?: Task | null; // if provided, modal is in edit mode
}

const TodoView: React.FC<TodoViewProps> = ({
  isVisible,
  onClose,
  date,
  onTaskAdded,
  editTask,
}) => {
  const router = useRouter();
  const [taskName, setTaskName] = useState<string>("");
  const [fileOption, setFileOption] = useState<"existing" | "new">("existing");
  const [selectedFile, setSelectedFile] = useState<DocumentFile | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFileView, setShowFileView] = useState<boolean>(false);

  // Prefill form fields in edit mode.
  useEffect(() => {
    if (editTask) {
      setTaskName(editTask.taskName);
      if (editTask.file && editTask.file.fileId) {
        // Assuming editTask.file is a DocumentFile-like object.
        setSelectedFile(editTask.file);
      } else {
        setSelectedFile(null);
      }
    } else {
      setTaskName("");
      setSelectedFile(null);
      setNewFile(null);
      setSearchTerm("");
    }
  }, [editTask]);

  // Fetch files for linking.
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

  // Handle file selection from search results.
  const handleFileSelect = useCallback((file: DocumentFile) => {
    setSelectedFile(file);
    setSearchTerm(file.filename);
  }, []);

  //Remove task
  const handleRemoveTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/calendar`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: taskId }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to remove task:", res.status, errorText);
      } else {
        console.log("Task removed successfully");
        onClose();       // close the TodoView modal
        onTaskAdded();   // refresh the task list in the parent component
      }
    } catch (error) {
      console.error("Error removing task:", error);
    }
  };

  // Open the FileView modal.
  const handleViewFile = () => {
    if (selectedFile) {
      setShowFileView(true);
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let payload;
    if (editTask) {
      payload = buildEditTaskPayload(
        editTask._id,
        taskName,
        editTask.status,
        fileOption,
        selectedFile?._id ?? "",
        newFile
      );
    } else {
      payload = buildNewTaskPayload(
        taskName,
        date,
        fileOption,
        selectedFile?._id ?? "",
        newFile
      );
    }

    console.log("Payload:", payload);

    try {
      const res = await fetch("/api/calendar", {
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

    // Reset form state.
    setTaskName("");
    setSelectedFile(null);
    setNewFile(null);
    setSearchTerm("");
  };

  if (!isVisible) return null;

  // Filter files based on the search term.
  const filteredFiles =
    searchTerm && !selectedFile
      ? files
          .filter((file) =>
            (file.filename || "").toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* TodoView Modal */}
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
          overflow: "auto",
        }}
      >
        <button onClick={onClose} style={{ marginBottom: "20px" }}>
          Close
        </button>
        <h2>{editTask ? "Edit Task" : "New Task"}</h2>
        <form onSubmit={handleTaskSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="taskName" style={{ display: "block", marginBottom: "5px" }}>
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
                  setSelectedFile(null);
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
                onChange={() => {
                  setFileOption("new");
                  setSelectedFile(null);
                }}
              />{" "}
              Upload new document
            </label>
          </div>
          {fileOption === "existing" && (
            <div style={{ marginBottom: "15px", position: "relative" }}>
              <label htmlFor="documentSearch" style={{ display: "block", marginBottom: "5px" }}>
                Search Document:
              </label>
              <input
                type="text"
                id="documentSearch"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedFile(null);
                }}
                style={{ width: "100%", padding: "8px" }}
              />
              {filteredFiles.length > 0 && (
                <ul
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
                      style={{ padding: "8px", cursor: "pointer" }}
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
              <label htmlFor="newFile" style={{ display: "block", marginBottom: "5px" }}>
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
          <button
            type="button"
            onClick={() => editTask && handleRemoveTask(editTask._id)}
            style={{ padding: "10px 15px" }}
          >
          Remove Task
          </button>
        </form>

        {/* Display file name and a button to view the attached file */}
        {selectedFile && (
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>{selectedFile.filename}</span>
            <button
              onClick={handleViewFile}
              style={{
                padding: "6px 10px",
                backgroundColor: "blue",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              View Attached File
            </button>
          </div>
        )}
      </div>

      {/* Modal overlay for FileView */}
      {showFileView && selectedFile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 2000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              color: "#000",
              padding: "20px",
              borderRadius: "8px",
              position: "relative",
              width: "80%",
              maxWidth: "800px",
              maxHeight: "80%",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setShowFileView(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                padding: "4px 8px",
                backgroundColor: "red",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
            {/* Pass the selected file to FileView by casting it as any */}
            <FileView
              file={selectedFile as any}
              onClose={() => setShowFileView(false)}
              onRename={(fileId, newFilename) => {
                console.log("Rename file", fileId, newFilename);
              }}
              onDelete={(fileId) => {
                console.log("Delete file", fileId);
              }}
              onDownload={(fileId, filename) => {
                console.log("Download file", fileId, filename);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TodoView;
