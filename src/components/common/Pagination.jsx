import React from "react";

const PaginationComponent = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}) => {
  const pageCount = Math.max(0, Math.floor(Number(totalPages) || 0));
  if (pageCount <= 1 && totalItems === undefined) {
    return null;
  }

  const activePage = Math.min(
    Math.max(1, Number(currentPage) || 1),
    Math.max(pageCount, 1),
  );
  const startItem = totalItems > 0 ? (activePage - 1) * (pageSize || 0) + 1 : 0;
  const endItem = pageSize
    ? Math.min(activePage * pageSize, totalItems ?? activePage * pageSize)
    : totalItems;

  return (
    <div className="pagination-container mt-3 px-3 py-3" dir="rtl">
      <nav className="pagination-controls" aria-label="التنقل بين الصفحات">
        <button
          type="button"
          className="pagination-step"
          onClick={() => onPageChange(activePage - 1)}
          disabled={activePage === 1}
          aria-label="السابق"
        >
          السابق
        </button>
        <span className="pagination-current" aria-live="polite">
          {activePage} / {Math.max(pageCount, 1)}
        </span>
        <button
          type="button"
          className="pagination-step"
          onClick={() => onPageChange(activePage + 1)}
          disabled={activePage === pageCount}
          aria-label="التالي"
        >
          التالي
        </button>
      </nav>
      {totalItems !== undefined && (
        <div className="pagination-summary" aria-live="polite">
          عرض {startItem} - {endItem} من {totalItems} نتائج
        </div>
      )}
    </div>
  );
};

export default PaginationComponent;
