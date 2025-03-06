"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import TodoView from "@/app/components/TodoView";
import {
    DndContext,
    DragEndEvent,
    closestCenter,
    useDroppable,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import SortableItem from "@/app/components/SortableItem";
import {
    getSourceColumn,
    getDestinationColumn,
    updateTaskStatus,
    reorderTasks,
    Task as LogicTask,
    TaskStatus,
} from "@/app/api/todos/logic";
import { format } from "date-fns";
import { enUS } from "date-fns/locale/en-US";

// Alias our Task type for convenience
type Task = LogicTask;

interface Column {
    id: "planned" | "inProgress" | "complete";
    label: string;
}

// Single DroppableContainer component using dnd-kit
function DroppableContainer({
    id,
    children,
}: {
    id: string;
    children: React.ReactNode;
}) {
    const { setNodeRef } = useDroppable({ id, data: { containerId: id } });
    return <div ref={setNodeRef} id={id}>{children}</div>;
}

export default function TodoPage() {
    const { date } = useParams();
    if (!date || Array.isArray(date)) return <div>Invalid date parameter.</div>;

    const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTaskPanel, setShowTaskPanel] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    async function fetchTasks() {
        try {
            const res = await fetch("/api/todos");
            if (!res.ok) {
                const errorText = await res.text();
                console.error("Failed to fetch tasks:", res.status, errorText);
                return;
            }
            const data: Task[] = await res.json();
            // Filter tasks for the current date
            const filteredTasks = data.filter((task) => task.date === date);
            setTasks(filteredTasks);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTasks();
    }, [date]);

    // Separate tasks by status
    const plannedTasks = tasks.filter((t) => t.status === "planned");
    const inProgressTasks = tasks.filter((t) => t.status === "in progress");
    const completeTasks = tasks.filter((t) => t.status === "complete");

    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id.toString();
        const overId = over.id.toString();

        // Get container ids from sortable data
        const activeContainer = active.data.current?.sortable?.containerId as string;
        const overContainer = over.data.current?.containerId as string;

        if (!activeContainer || !overContainer) return;

        if (activeContainer !== overContainer) {
            let destinationStatus: TaskStatus;
            if (overContainer === "planned") destinationStatus = "planned";
            else if (overContainer === "inProgress") destinationStatus = "in progress";
            else destinationStatus = "complete";

            const updatedTasks = updateTaskStatus(tasks, activeId, destinationStatus);
            setTasks(updatedTasks);
            try {
                const res = await fetch("/api/todos", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: activeId, status: destinationStatus }),
                });
                if (!res.ok) {
                    console.error("Failed to update task status");
                } else {
                    console.log("Task updated successfully");
                }
            } catch (error) {
                console.error("Error updating task:", error);
            }
        } else {
            // Reordering within the same container:
            let columnTasks: Task[];
            if (activeContainer === "planned") columnTasks = plannedTasks;
            else if (activeContainer === "inProgress") columnTasks = inProgressTasks;
            else columnTasks = completeTasks;

            const newColumnOrder = reorderTasks(columnTasks, activeId, overId);
            const otherTasks = tasks.filter((t) => t.status !== activeContainer);
            setTasks([...otherTasks, ...newColumnOrder]);
        }
    };

    // Handler for clicking a task to edit it
    const handleTaskClick = (taskId: string) => {
        const task = tasks.find((t) => t._id === taskId);
        if (task) {
            setEditingTask(task);
            setShowTaskPanel(true);
        }
    };

    const parsedDate = new Date(date);
    const formattedDate = format(parsedDate, "EEEE, MMMM d, yyyy", { locale: enUS });


    const columns: Column[] = [
        { id: "planned", label: "Planned" },
        { id: "inProgress", label: "In Progress" },
        { id: "complete", label: "Complete" },
    ];

    return (
        <div style={{ padding: "20px", position: "relative" }}>
            <h1>To Do - {formattedDate}</h1>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button
                    onClick={() => {
                        setEditingTask(null);
                        setShowTaskPanel(true);
                    }}
                >
                    Add New Task
                </button>
                <button onClick={() => alert("Remove Task clicked")}>Remove Task</button>
            </div>

            <TodoView
                isVisible={showTaskPanel}
                onClose={() => {
                    setShowTaskPanel(false);
                    setEditingTask(null);
                }}
                date={date}
                onTaskAdded={fetchTasks}
                editTask={editingTask}
            />

            {loading ? (
                <p>Loading tasks...</p>
            ) : (
                <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <div style={{ display: "flex", gap: "20px" }}>
                        {columns.map((column) => {
                            let items: Task[];
                            if (column.id === "planned") items = plannedTasks;
                            else if (column.id === "inProgress") items = inProgressTasks;
                            else items = completeTasks;

                            return (
                                <DroppableContainer key={column.id} id={column.id}>
                                    <div
                                        style={{
                                            flex: 1,
                                            padding: "10px",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                            minHeight: "200px",
                                        }}
                                    >
                                        <h2>{column.label}</h2>
                                        <SortableContext
                                            items={items.map((t) => t._id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {items.map((task) => (
                                                <SortableItem
                                                    key={task._id}
                                                    id={task._id}
                                                    taskName={task.taskName}
                                                    containerId={column.id}
                                                    onClick={handleTaskClick}
                                                />
                                            ))}
                                        </SortableContext>
                                    </div>
                                </DroppableContainer>
                            );
                        })}
                    </div>
                </DndContext>
            )}

            <div style={{ marginTop: "20px" }}>
                <Link href="/calendar">Back to Calendar</Link>
            </div>
        </div>
    );
}