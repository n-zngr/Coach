import { arrayMove } from "@dnd-kit/sortable";

export type TaskStatus = "planned" | "in progress" | "complete";

export interface Task {
    _id: string;
    date: string;
    status: TaskStatus;
    taskName: string;
}

/**
 * Returns the status of the task with id activeId.
 */
export function getSourceColumn(
    tasks: Task[],
    activeId: string
): TaskStatus | null {
    const task = tasks.find((t) => t._id === activeId);
    return task ? task.status : null;
}

/**
 * Maps a droppable container id (from dnd-kit) to a TaskStatus.
 * Here we assume that your droppable container ids are "planned", "inProgress", or "complete".
 * We map "inProgress" to "in progress" for our data.
 */
export function getDestinationColumn(overId: string): TaskStatus {
    if (overId === "planned") return "planned";
    if (overId === "inProgress") return "in progress";
    return "complete";
}

/**
 * Updates the status of the task with id activeId to newStatus.
 */
export function updateTaskStatus(
    tasks: Task[],
    activeId: string,
    newStatus: TaskStatus
): Task[] {
    return tasks.map((task) =>
        task._id === activeId ? { ...task, status: newStatus } : task
    );
}

/**
 * Reorders tasks within the same column.
 */
export function reorderTasks(
    tasks: Task[],
    activeId: string,
    overId: string
): Task[] {
    const oldIndex = tasks.findIndex((task) => task._id === activeId);
    const newIndex = tasks.findIndex((task) => task._id === overId);
    if (oldIndex === -1 || newIndex === -1) return tasks;
    return arrayMove(tasks, oldIndex, newIndex);
}
