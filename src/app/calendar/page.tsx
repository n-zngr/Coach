"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";

interface Task {
    _id: string;
    date: string; // expected format: "YYYY-MM-DD"
    status: "planned" | "in progress" | "complete";
}

export default function CalendarPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
  
    // Fetch tasks from the /api/todos endpoint
    useEffect(() => {
        async function fetchTasks() {
            try {
                const res = await fetch("/api/todos");
                if (!res.ok) {
                    console.error("Failed to fetch tasks");
                    return;
                }
                const data: Task[] = await res.json();
                console.log("Fetched tasks:", data);
                setTasks(data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        }
        fetchTasks();
    }, []);
  
    // When a date is clicked, redirect to the todos page for that date
    const handleDateClick = (arg: DateClickArg) => {
        const dateStr = arg.date.toISOString().split("T")[0];
        router.push(`/todos/${dateStr}`);
    };
  
    // Render day cell content with day number and colored dots.
    // Filter tasks client-side based on the cell date.
    const renderDayCellContent = (arg: { date: Date }) => {
        const dayNumber = arg.date.getDate();
        const dayString = arg.date.toISOString().split("T")[0];
        const tasksForDay = tasks.filter((task) => task.date === dayString);
        const plannedCount = tasksForDay.filter((t) => t.status === "planned").length;
        const inProgressCount = tasksForDay.filter((t) => t.status === "in progress").length;
        const completeCount = tasksForDay.filter((t) => t.status === "complete").length;
    
        return (
            <div>
                <div style={{ fontWeight: "bold", textAlign: "center" }}>
                    {dayNumber}
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "2px",
                        marginTop: "2px",
                    }}
                >
                    {plannedCount > 0 && (
                        <span
                            style={{
                                width: "8px",
                                height: "8px",
                                backgroundColor: "red",
                                borderRadius: "50%",
                            }}
                            title={`${plannedCount} planned task${plannedCount > 1 ? "s" : ""}`}
                        />
                    )}
                    {inProgressCount > 0 && (
                        <span
                            style={{
                                width: "8px",
                                height: "8px",
                                backgroundColor: "orange",
                                borderRadius: "50%",
                            }}
                            title={`${inProgressCount} task${inProgressCount > 1 ? "s" : ""} in progress`}
                        />
                    )}
                    {completeCount > 0 && (
                        <span
                            style={{
                                width: "8px",
                                height: "8px",
                                backgroundColor: "green",
                                borderRadius: "50%",
                            }}
                            title={`${completeCount} completed task${completeCount > 1 ? "s" : ""}`}
                        />
                    )}
                </div>
            </div>
        );
    };
  
    return (
        <div style={{ padding: "20px" }}>
            <h1>My Calendar</h1>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                dateClick={handleDateClick}
                dayCellContent={renderDayCellContent}
            />
        </div>
    );
}