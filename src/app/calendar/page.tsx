"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { format } from "date-fns";
import { enUS } from "date-fns/locale/en-US";

interface Task {
    _id: string;
    date: string; // expected format: "YYYY-MM-DD"
    status: "planned" | "in progress" | "complete";
}

interface ExamTask {
    _id: string;
    date: string; // expected format: "YYYY-MM-DD"
    examName: string;
}

export default function CalendarPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [examTasks, setExamTasks] = useState<ExamTask[]>([]);
  
    // Fetch tasks from /api/calendar endpoint
    useEffect(() => {
        async function fetchTasks() {
            try {
                const res = await fetch("/api/calendar");
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
  
    // Fetch exam tasks from /api/exam endpoint
    useEffect(() => {
        async function fetchExamTasks() {
            try {
                const res = await fetch("/api/exam");
                if (!res.ok) {
                    console.error("Failed to fetch exams");
                    return;
                }
                const data: ExamTask[] = await res.json();
                console.log("Fetched exam tasks:", data);
                setExamTasks(data);
            } catch (error) {
                console.error("Error fetching exams:", error);
            }
        }
        fetchExamTasks();
    }, []);
  
    // When a date is clicked, redirect to calendar/[date]/page.tsx
    const handleDateClick = (arg: DateClickArg) => {
        const dateStr = arg.date.toISOString().split("T")[0];
        router.push(`/calendar/${dateStr}`);
    };
  
    // Render day cell content with day number, colored dots for tasks,
    // and a blue square if there's at least one exam.
    const renderDayCellContent = (arg: { date: Date }) => {
        const dayNumber = arg.date.getDate();
        const dayString = arg.date.toISOString().split("T")[0];
  
        const tasksForDay = tasks.filter(task => task.date === dayString);
        const plannedCount = tasksForDay.filter(t => t.status === "planned").length;
        const inProgressCount = tasksForDay.filter(t => t.status === "in progress").length;
        const completeCount = tasksForDay.filter(t => t.status === "complete").length;
  
        const examsForDay = examTasks.filter(exam => exam.date === dayString);
  
        return (
            <div>
                <div style={{ fontWeight: "bold", textAlign: "center" }}>{dayNumber}</div>
                <div style={{ display: "flex", justifyContent: "center", gap: "2px", marginTop: "2px" }}>
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
                    {examsForDay.length > 0 && (
                        <span
                            style={{
                                width: "8px",
                                height: "8px",
                                backgroundColor: "blue",
                            }}
                            title={`${examsForDay.length} exam${examsForDay.length > 1 ? "s" : ""}`}
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