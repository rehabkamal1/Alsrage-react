import React from "react";

const SortableHeader = ({
  title,
  sortKey,
  sortConfig,
  onRequestSort,
  className = "",
  style = {},
}) => {
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
          {!isSorted && <i className="fa-solid fa-sort text-muted opacity-50"></i>}
          {direction === "asc" && <i className="fa-solid fa-arrow-up-wide-short text-primary fw-bold"></i>}
          {direction === "desc" && <i className="fa-solid fa-arrow-down-wide-short text-primary fw-bold"></i>}
        </span>
      </div>
    </th>
  );
};

export default SortableHeader;
