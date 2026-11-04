import React from "react";
import { Pagination } from "react-bootstrap";

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
  const pageCount = Math.max(0, Math.floor(Number(totalPages) || 0));
  if (pageCount <= 1) return null;

  const activePage = Math.min(Math.max(1, currentPage), pageCount);
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
    <div className="d-flex justify-content-center py-3 border-top">
      <Pagination className="mb-0">
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
    </div>
  );
};

export default PaginationComponent;
