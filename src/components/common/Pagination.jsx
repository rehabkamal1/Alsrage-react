import React from "react";
import { Pagination } from "react-bootstrap";

const PaginationComponent = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}) => {
  const pageCount = Math.max(0, Math.floor(Number(totalPages) || 0));

  if (pageCount <= 1 && totalItems === undefined) return null;

  const activePage = Math.min(
    Math.max(1, Number(currentPage) || 1),
    Math.max(pageCount, 1),
  );

  const startItem = totalItems > 0 ? (activePage - 1) * (pageSize || 0) + 1 : 0;
  const endItem = pageSize
    ? Math.min(activePage * pageSize, totalItems ?? activePage * pageSize)
    : totalItems;

  let visiblePages;

  if (pageCount <= 7) {
    visiblePages = Array.from({ length: pageCount }, (_, index) => index + 1);
  } else if (activePage <= 5) {
    visiblePages = [1, 2, 3, 4, 5, "ellipsis", pageCount];
  } else if (activePage >= pageCount - 4) {
    visiblePages = [
      1,
      "ellipsis",
      pageCount - 4,
      pageCount - 3,
      pageCount - 2,
      pageCount - 1,
      pageCount,
    ];
  } else {
    visiblePages = [
      1,
      "ellipsis",
      activePage - 1,
      activePage,
      activePage + 1,
      "ellipsis",
      pageCount,
    ];
  }

  const paginationItems = visiblePages.map((page, index) =>
    page === "ellipsis" ? (
      <Pagination.Ellipsis key={`ellipsis-${index}`} disabled />
    ) : (
      <Pagination.Item
        key={page}
        active={page === activePage}
        onClick={() => onPageChange(page)}
      >
        {page}
      </Pagination.Item>
    ),
  );

  return (
    <div className="d-flex flex-column align-items-center py-3 border-top gap-2">
      <Pagination className="mb-0" dir="rtl">
        <Pagination.Prev
          onClick={() => onPageChange(activePage - 1)}
          disabled={activePage === 1}
        />
        {paginationItems}
        <Pagination.Next
          onClick={() => onPageChange(activePage + 1)}
          disabled={activePage === pageCount}
        />
      </Pagination>

      {totalItems !== undefined && (
        <div className="text-muted small mt-2">
          عرض {startItem} - {endItem} من {totalItems} نتيجة
        </div>
      )}
    </div>
  );
};

export default PaginationComponent;
