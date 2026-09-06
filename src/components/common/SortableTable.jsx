// components/common/SortableTable.jsx

import React, { useState } from "react";
import { Table } from "react-bootstrap";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableHeader from "./SortableHeader";
import useSortableData from "../../hooks/useSortableData";
import "../../styles/SortableTable.css";

const SortableTable = ({
    data,
    columns,
    storageKey,
    renderCell,
    emptyMessage = "لا توجد بيانات",
    tableClassName = "",
    rowClassName = "",
    onRowClick,
    sortConfig,
    onRequestSort,
}) => {
    const internalSorting = useSortableData(data);
    const isControlled = Boolean(sortConfig && onRequestSort);
    const displayedData = isControlled ? data : internalSorting.items;
    const activeSortConfig = isControlled
        ? sortConfig
        : internalSorting.sortConfig;
    const handleRequestSort = isControlled
        ? onRequestSort
        : internalSorting.requestSort;

    const [currentColumns, setCurrentColumns] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const allColumnIds = columns.map((c) => c.id);
                const existingIds = parsed.map((c) => c.id);
                const missingIds = allColumnIds.filter(
                    (id) => !existingIds.includes(id),
                );
                const missingColumns = columns.filter((c) =>
                    missingIds.includes(c.id),
                );
                return [...parsed, ...missingColumns];
            } catch {
                return columns;
            }
        }
        return columns;
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = currentColumns.findIndex(
                (col) => col.id === active.id,
            );
            const newIndex = currentColumns.findIndex(
                (col) => col.id === over.id,
            );

            if (oldIndex !== -1 && newIndex !== -1) {
                const newColumns = arrayMove(
                    currentColumns,
                    oldIndex,
                    newIndex,
                );
                setCurrentColumns(newColumns);
                localStorage.setItem(storageKey, JSON.stringify(newColumns));
            }
        }
    };

    const columnIds = currentColumns.map((col) => col.id);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="table-responsive">
                <Table hover className={`mb-0 align-middle ${tableClassName}`}>
                    <thead className="table-light">
                        <tr>
                            <SortableContext
                                items={columnIds}
                                strategy={horizontalListSortingStrategy}
                            >
                                {currentColumns.map((column, index) => (
                                    <SortableHeader
                                        key={column.id}
                                        column={column}
                                        index={index}
                                        columns={currentColumns}
                                        setColumns={setCurrentColumns}
                                        sortConfig={activeSortConfig}
                                        onRequestSort={handleRequestSort}
                                    />
                                ))}
                            </SortableContext>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedData && displayedData.length > 0 ? (
                            displayedData.map((item, index) => (
                                <tr
                                    key={item.id || index}
                                    className={rowClassName}
                                    onClick={() => onRowClick?.(item)}
                                    style={{
                                        cursor: onRowClick
                                            ? "pointer"
                                            : "default",
                                    }}
                                >
                                    {currentColumns.map((column) => {
                                        const cell = renderCell(
                                            item,
                                            column.id,
                                            index,
                                        );
                                        return React.isValidElement(cell)
                                            ? React.cloneElement(cell, {
                                                  key: column.id,
                                              })
                                            : cell;
                                    })}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={currentColumns.length}
                                    className="text-center py-5 text-muted"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </DndContext>
    );
};

export default SortableTable;
