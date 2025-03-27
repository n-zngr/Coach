"use client";

import React, { useState, useEffect } from "react";

export interface ExamViewProps {
    isVisible: boolean;
    onClose: () => void;
    onExamSaved: () => void;
    examDate: string; // Expected format: "YYYY-MM-DD"
    examId?: string;  // Provided if editing an exam
    examName?: string; // Provided if editing an exam
}

const ExamView: React.FC<ExamViewProps> = ({
    isVisible,
    onClose,
    onExamSaved,
    examDate,
    examId,
    examName: initialExamName,
}) => {
    const [examName, setExamName] = useState<string>(initialExamName || "");

    // This useEffect ensures the field is prefilled when editing an exam.
    useEffect(() => {
        setExamName(initialExamName || "");
    }, [initialExamName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            examName,
            date: examDate,
            ...(examId && { id: examId }),
        };

        try {
            let res;
            if (examId) {
                res = await fetch("/api/exam", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetch("/api/exam", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }
            if (!res.ok) {
                const errorText = await res.text();
                console.error("Failed to save exam:", res.status, errorText);
            } else {
                console.log("Exam saved successfully");
                onExamSaved();
                onClose();
            }
        } catch (error) {
            console.error("Error saving exam:", error);
        }
    };

    const handleRemoveExam = async (examId: string) => {
        try {
          const res = await fetch(`/api/exam`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ id: examId }),
          });
          if (!res.ok) {
            const errorText = await res.text();
            console.error("Failed to remove exam:", res.status, errorText);
          } else {
            console.log("Exam removed successfully");
            onClose();
            onExamSaved(); // Refresh the exam list or perform any other action
            
          }
        } catch (error) {
          console.error("Error removing exam:", error);
        }
      };

    if (!isVisible) return null;

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 998,
                }}
            />
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    width: "50%",
                    height: "100%",
                    backgroundColor: "black",
                    color: "#fff",
                    zIndex: 999,
                    padding: "20px",
                    transition: "transform 0.3s ease-in-out",
                    transform: isVisible ? "translateX(0)" : "translateX(100%)",
                }}
            >
                <button onClick={onClose} style={{ marginBottom: "20px" }}>
                    Close
                </button>
                <h2>{examId ? "Edit Exam" : "Add Exam"}</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "15px" }}>
                        <label htmlFor="examName" style={{ display: "block", marginBottom: "5px" }}>
                            Exam Name:
                        </label>
                        <input
                            type="text"
                            id="examName"
                            value={examName}
                            onChange={(e) => setExamName(e.target.value)}
                            placeholder="Enter exam name"
                            style={{ width: "100%", padding: "8px" }}
                            required
                        />
                    </div>
                    <button type="submit" style={{ padding: "10px 15px" }}>
                        Save Exam
                    </button>
                    <button onClick={() => examId && handleRemoveExam(examId)} style={{ padding: "10px 15px", marginLeft: "10px" }}>
                        Remove Exam
                    </button>
                </form>
            </div>
        </>
    );
};

export default ExamView;
