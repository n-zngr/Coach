"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
    id: string;
    taskName: string;
    containerId: string;
    onClick?: (id: string) => void;
}

export default function SortableItem({ id, taskName, containerId, onClick }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        data: { sortable: { containerId } },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: "8px",
        marginBottom: "8px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: isDragging ? "#ddd" : "#fff",
        cursor: "grab",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick && onClick(id)}
        >
            {taskName}
        </div>
    );
}