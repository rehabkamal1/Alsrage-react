import React from "react";
import { Form, InputGroup, Button, Spinner } from "react-bootstrap";

const OrderSearchBar = ({
  searchQuery,
  onSearch,
  onClear,
  loading,
  filters,
  onFilterChange,
  statusOptions = [],
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="ابحث برقم الطلب أو اسم العميل أو رقم الهاتف..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="rounded-3"
        />
        {searchQuery && (
          <Button
            variant="outline-secondary"
            onClick={onClear}
            className="rounded-3"
          >
            مسح
          </Button>
        )}
        <Button
          type="submit"
          variant="dark"
          disabled={loading}
          className="rounded-3"
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-1"
              />
              جاري البحث...
            </>
          ) : (
            "بحث"
          )}
        </Button>
      </InputGroup>
      <div className="d-flex gap-2 mt-2 flex-wrap">
        <Form.Select
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          style={{ maxWidth: "180px" }}
        >
          <option value="">كل الحالات</option>
          {statusOptions.map((status) => (
            <option key={status.key || status.id} value={status.key}>
              {status.label}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          value={filters.sort_by}
          onChange={(e) => onFilterChange("sort_by", e.target.value)}
          style={{ maxWidth: "180px" }}
        >
          <option value="id">ترتيب حسب رقم الطلب</option>
          <option value="created_at">ترتيب حسب التاريخ</option>
          <option value="status">ترتيب حسب الحالة</option>
        </Form.Select>
        <Form.Select
          value={filters.sort_dir}
          onChange={(e) => onFilterChange("sort_dir", e.target.value)}
          style={{ maxWidth: "180px" }}
        >
          <option value="desc">تنازلي</option>
          <option value="asc">تصاعدي</option>
        </Form.Select>
      </div>
    </Form>
  );
};

export default OrderSearchBar;
