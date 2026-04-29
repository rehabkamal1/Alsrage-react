import React from "react";
import { Form, InputGroup, Button, Spinner, Row, Col } from "react-bootstrap";

const FinanceSearchBar = ({
  searchQuery,
  onSearch,
  onClear,
  loading,
  paymentMethods,
  transferStatuses,
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
          placeholder="ابحث برقم الطلب أو رقم الحوالة أو اسم العميل..."
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
        <Col md={2}>
          <Form.Group>
            <Form.Label className="small text-secondary">النوع</Form.Label>
            <Form.Select
              value={filters.type || ""}
              onChange={(e) => onFilterChange("type", e.target.value)}
            >
              <option value="">الكل</option>
              <option value="receipt">مقبوضات</option>
              <option value="payment">مصروفات</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label className="small text-secondary">
              طريقة الدفع
            </Form.Label>
            <Form.Select
              value={filters.payment_method || ""}
              onChange={(e) => onFilterChange("payment_method", e.target.value)}
            >
              <option value="">الكل</option>
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label className="small text-secondary">
              حالة الحوالة
            </Form.Label>
            <Form.Select
              value={filters.status || ""}
              onChange={(e) => onFilterChange("status", e.target.value)}
            >
              <option value="">الكل</option>
              {transferStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
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
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label className="small text-secondary">ترتيب حسب</Form.Label>
            <Form.Select
              value={sortField}
              onChange={(e) => onSortChange(e.target.value, sortDirection)}
            >
              <option value="id">رقم الحوالة</option>
              <option value="amount">المبلغ</option>
              <option value="transfer_date">تاريخ الحوالة</option>
              <option value="created_at">تاريخ الإنشاء</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label className="small text-secondary">الاتجاه</Form.Label>
            <Form.Select
              value={sortDirection}
              onChange={(e) => onSortChange(sortField, e.target.value)}
            >
              <option value="desc">تنازلي</option>
              <option value="asc">تصاعدي</option>
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

export default FinanceSearchBar;
