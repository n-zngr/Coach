// src/app/api/todoview/functions.ts
export interface DocumentFile {
    id?: string;
    _id?: string;
    filename: string;
}

/**
 * Fetches files from the given endpoint.
 */
export async function fetchFilesFromApi(endpoint: string): Promise<DocumentFile[]> {
    const res = await fetch(endpoint);
    if (!res.ok) {
        throw new Error("Failed to fetch files");
    }
    const data: DocumentFile[] = await res.json();
    return data;
}

/**
 * Builds payload for creating a new task.
 */
export function buildNewTaskPayload(
    taskName: string,
    date: string,
    fileOption: "existing" | "new",
    selectedFile: string,
    newFile: File | null
): any {
    return {
        taskName,
        date,
        status: "planned",
        file:
            fileOption === "existing" && selectedFile
                ? { fileId: selectedFile }
                : fileOption === "new" && newFile
                ? { fileName: newFile.name }
                : null,
    };
}

/**
 * Builds payload for editing an existing task.
 */
export function buildEditTaskPayload(
    taskId: string,
    taskName: string,
    currentStatus: string,
    fileOption: "existing" | "new",
    selectedFile: string,
    newFile: File | null
): any {
    return {
        id: taskId,
        taskName,
        status: currentStatus,
        file:
            fileOption === "existing" && selectedFile
                ? { fileId: selectedFile }
                : fileOption === "new" && newFile
                ? { fileName: newFile.name }
                : null,
    };
}