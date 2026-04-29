import React from "react";
import { Form, InputGroup, Button, Spinner, Row, Col } from "react-bootstrap";
import Select from "react-select";

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
            <Select
              options={[
                { value: "", label: "الكل" },
                { value: "receipt", label: "مقبوضات" },
                { value: "payment", label: "مصروفات" },
              ]}
              value={
                filters.type === "receipt"
                  ? { value: "receipt", label: "مقبوضات" }
                  : filters.type === "payment"
                  ? { value: "payment", label: "مصروفات" }
                  : { value: "", label: "الكل" }
              }
              onChange={(opt) => onFilterChange("type", opt ? opt.value : "")}
              placeholder="النوع"
              isRtl
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label className="small text-secondary">
              طريقة الدفع
            </Form.Label>
            <Select
              options={[
                { value: "", label: "الكل" },
                ...paymentMethods.map((m) => ({ value: m.value, label: m.label })),
              ]}
              value={
                paymentMethods.find((m) => m.value === filters.payment_method)
                  ? {
                      value: filters.payment_method,
                      label: paymentMethods.find((m) => m.value === filters.payment_method).label,
                    }
                  : { value: "", label: "الكل" }
              }
              onChange={(opt) => onFilterChange("payment_method", opt ? opt.value : "")}
              placeholder="طريقة الدفع"
              isRtl
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label className="small text-secondary">
              حالة الحوالة
            </Form.Label>
            <Select
              options={[
                { value: "", label: "الكل" },
                ...transferStatuses.map((s) => ({ value: s.value, label: s.label })),
              ]}
              value={
                transferStatuses.find((s) => s.value === filters.status)
                  ? {
                      value: filters.status,
                      label: transferStatuses.find((s) => s.value === filters.status).label,
                    }
                  : { value: "", label: "الكل" }
              }
              onChange={(opt) => onFilterChange("status", opt ? opt.value : "")}
              placeholder="حالة الحوالة"
              isRtl
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label className="small text-secondary">
              درجة الأهمية
            </Form.Label>
            <Select
              options={[
                { value: "", label: "الكل" },
                ...priorityLevels.map((l) => ({ value: l.value, label: l.label })),
              ]}
              value={
                priorityLevels.find((l) => l.value === filters.priority_level)
                  ? {
                      value: filters.priority_level,
                      label: priorityLevels.find((l) => l.value === filters.priority_level).label,
                    }
                  : { value: "", label: "الكل" }
              }
              onChange={(opt) => onFilterChange("priority_level", opt ? opt.value : "")}
              placeholder="درجة الأهمية"
              isRtl
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label className="small text-secondary">ترتيب حسب</Form.Label>
            <Select
              options={[
                { value: "id", label: "رقم الحوالة" },
                { value: "amount", label: "المبلغ" },
                { value: "transfer_date", label: "تاريخ الحوالة" },
                { value: "created_at", label: "تاريخ الإنشاء" },
              ]}
              value={{
                value: sortField,
                label:
                  sortField === "id"
                    ? "رقم الحوالة"
                    : sortField === "amount"
                    ? "المبلغ"
                    : sortField === "transfer_date"
                    ? "تاريخ الحوالة"
                    : "تاريخ الإنشاء",
              }}
              onChange={(opt) => onSortChange(opt ? opt.value : "id", sortDirection)}
              isRtl
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label className="small text-secondary">الاتجاه</Form.Label>
            <Select
              options={[
                { value: "desc", label: "تنازلي" },
                { value: "asc", label: "تصاعدي" },
              ]}
              value={{
                value: sortDirection,
                label: sortDirection === "desc" ? "تنازلي" : "تصاعدي",
              }}
              onChange={(opt) => onSortChange(sortField, opt ? opt.value : "desc")}
              isRtl
            />
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
