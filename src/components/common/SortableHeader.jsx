// components/common/SortableHeader.jsx

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "../../styles/SortableHeader.css";

const SortableHeader = ({
    column,
    index,
    columns,
    setColumns,
    title,
    sortKey,
    sortConfig,
    onRequestSort,
    className = "",
    style = {},
}) => {
    const isDragMode = !!column && !!column.id;

    if (isDragMode) {
        if (!column || !column.id) {
            return <th>...</th>;
        }

        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({ id: column.id });

        const dragStyle = {
            transform: CSS.Transform.toString(transform),
            transition,
            minWidth: column.width || "auto",
            width: column.width || "auto",
            cursor: "grab",
            backgroundColor: isDragging ? "#e3f2fd" : "transparent",
            ...(isDragging ? { boxShadow: "0 4px 12px rgba(0,0,0,0.15)" } : {}),
        };

        const isSorted = sortConfig && sortConfig.key === column.id;
        const direction = isSorted ? sortConfig.direction : null;

        const handleSort = (e) => {
            e.stopPropagation();
            if (!isDragging && onRequestSort) {
                onRequestSort(column.id);
            }
        };

        return (
            <th
                ref={setNodeRef}
                style={{ ...dragStyle, ...style }}
                className={`sortable-header ${isDragging ? "dragging" : ""} ${className}`}
                {...attributes}
                {...listeners}
                title="اسحب لترتيب الأعمدة | اضغط للفرز"
                onClick={handleSort}
            >
                <div className="d-flex align-items-center gap-1">
                    <span className="drag-handle" style={{ cursor: "grab" }}>
                        ⠿
                    </span>
                    <span>{column.label || "-"}</span>
                    <span className="sort-icon small opacity-75 ms-1">
                        {!isSorted && (
                            <i className="fa-solid fa-sort text-muted opacity-50"></i>
                        )}
                        {direction === "asc" && (
                            <i className="fa-solid fa-arrow-up-wide-short text-primary fw-bold"></i>
                        )}
                        {direction === "desc" && (
                            <i className="fa-solid fa-arrow-down-wide-short text-primary fw-bold"></i>
                        )}
                    </span>
                </div>
            </th>
        );
    }

    const isSorted = sortConfig && sortConfig.key === sortKey;
    const direction = isSorted ? sortConfig.direction : null;

    return (
        <th
            onClick={() => onRequestSort && onRequestSort(sortKey)}
            style={{ cursor: "pointer", userSelect: "none", ...style }}
            className={`sortable-header ${className}`}
            title="اضغط للفرز التنازلي / تصاعدي"
        >
            <div className="d-inline-flex align-items-center justify-content-center gap-1 w-100">
                <span>{title}</span>
                <span className="sort-icon small opacity-75 ms-1">
                    {!isSorted && (
                        <i className="fa-solid fa-sort text-muted opacity-50"></i>
                    )}
                    {direction === "asc" && (
                        <i className="fa-solid fa-arrow-up-wide-short text-primary fw-bold"></i>
                    )}
                    {direction === "desc" && (
                        <i className="fa-solid fa-arrow-down-wide-short text-primary fw-bold"></i>
                    )}
                </span>
            </div>
        </th>
    );
};

export default SortableHeader;
