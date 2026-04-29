import React from "react";
import { Form, InputGroup, Button, Spinner, Row, Col } from "react-bootstrap";

const MarketingSearchBar = ({
  searchQuery,
  onSearch,
  onClear,
  loading,
  statuses,
  priorityLevels,
  filters,
  onFilterChange,
  sortField,
  sortDirection,
  onSortChange,
  filterFromDate,
  filterToDate,
  setFilterFromDate,
  setFilterToDate,
  onDateFilter,
  types,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <InputGroup className="mb-3">
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

      <Row className="g-2 align-items-end">
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small text-secondary">النوع</Form.Label>
            <Form.Select
              value={filters.type || ""}
              onChange={(e) => onFilterChange("type", e.target.value)}
            >
              <option value="">الكل</option>
              {types.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small text-secondary">الحالة</Form.Label>
            <Form.Select
              value={filters.status || ""}
              onChange={(e) => onFilterChange("status", e.target.value)}
            >
              <option value="">الكل</option>
              {statuses.map((status) => (
                <option key={status.key} value={status.key}>
                  {status.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small text-secondary">
              درجة الأهمية
            </Form.Label>
            <Form.Select
              value={filters.priority_level || ""}
              onChange={(e) => onFilterChange("priority_level", e.target.value)}
            >
              <option value="">الكل</option>
              {priorityLevels.map((level) => (
                <option key={level.key} value={level.key}>
                  {level.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small text-secondary">ترتيب حسب</Form.Label>
            <Form.Select
              value={sortField}
              onChange={(e) => onSortChange(e.target.value, sortDirection)}
            >
              <option value="id">رقم المعرف</option>
              <option value="name">الاسم</option>
              <option value="contact_date">تاريخ التواصل</option>
              <option value="created_at">تاريخ الإنشاء</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-3 g-2 align-items-end">
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small text-secondary">من تاريخ</Form.Label>
            <Form.Control
              type="date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
              className="rounded-3"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small text-secondary">إلى تاريخ</Form.Label>
            <Form.Control
              type="date"
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
              className="rounded-3"
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Button
            variant="secondary"
            onClick={onDateFilter}
            className="w-100 rounded-3"
          >
            تطبيق التاريخ
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default MarketingSearchBar;
