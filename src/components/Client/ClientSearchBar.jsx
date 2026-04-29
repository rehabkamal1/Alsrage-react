import React from "react";
import { Form, InputGroup, Button, Spinner } from "react-bootstrap";

const ClientSearchBar = ({
  searchQuery,
  onSearch,
  onClear,
  loading,
  filters,
  onFilterChange,
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
          placeholder="ابحث باسم العميل أو رقم الهاتف..."
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
          value={filters.client_type}
          onChange={(e) => onFilterChange("client_type", e.target.value)}
          style={{ maxWidth: "180px" }}
        >
          <option value="">كل الأنواع</option>
          <option value="عميل فردي">عميل فردي</option>
          <option value="مكتب خدمات">مكتب خدمات</option>
        </Form.Select>
        <Form.Select
          value={filters.sort_by}
          onChange={(e) => onFilterChange("sort_by", e.target.value)}
          style={{ maxWidth: "180px" }}
        >
          <option value="created_at">ترتيب حسب تاريخ الإضافة</option>
          <option value="name">ترتيب حسب الاسم</option>
          <option value="phone">ترتيب حسب الهاتف</option>
        </Form.Select>
        <Form.Select
          value={filters.sort_dir}
          onChange={(e) => onFilterChange("sort_dir", e.target.value)}
          style={{ maxWidth: "180px" }}
        >
          <option value="desc">الأحدث/تنازلي</option>
          <option value="asc">الأقدم/تصاعدي</option>
        </Form.Select>
      </div>
    </Form>
  );
};

export default ClientSearchBar;
