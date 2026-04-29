import { Form, InputGroup, Button, Spinner, Row, Col } from "react-bootstrap";
import Select from "react-select";

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
            <Select
              options={[{ value: "", label: "الكل" }, ...types.map(t => ({ value: t.value, label: t.label }))]}
              value={types.find(t => t.value === filters.type) ? { value: filters.type, label: types.find(t => t.value === filters.type).label } : { value: "", label: "الكل" }}
              onChange={(opt) => onFilterChange("type", opt ? opt.value : "")}
              isRtl
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small text-secondary">الحالة</Form.Label>
            <Select
              options={[{ value: "", label: "الكل" }, ...statuses.map(s => ({ value: s.key, label: s.label }))]}
              value={statuses.find(s => s.key === filters.status) ? { value: filters.status, label: statuses.find(s => s.key === filters.status).label } : { value: "", label: "الكل" }}
              onChange={(opt) => onFilterChange("status", opt ? opt.value : "")}
              isRtl
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small text-secondary">
              درجة الأهمية
            </Form.Label>
            <Select
              options={[{ value: "", label: "الكل" }, ...priorityLevels.map(l => ({ value: l.key, label: l.label }))]}
              value={priorityLevels.find(l => l.key === filters.priority_level) ? { value: filters.priority_level, label: priorityLevels.find(l => l.key === filters.priority_level).label } : { value: "", label: "الكل" }}
              onChange={(opt) => onFilterChange("priority_level", opt ? opt.value : "")}
              isRtl
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small text-secondary">ترتيب حسب</Form.Label>
            <Select
              options={[
                { value: "id", label: "رقم المعرف" },
                { value: "name", label: "الاسم" },
                { value: "contact_date", label: "تاريخ التواصل" },
                { value: "created_at", label: "تاريخ الإنشاء" },
              ]}
              value={{
                value: sortField,
                label: sortField === "id" ? "رقم المعرف" : sortField === "name" ? "الاسم" : sortField === "contact_date" ? "تاريخ التواصل" : "تاريخ الإنشاء"
              }}
              onChange={(opt) => onSortChange(opt ? opt.value : "id", sortDirection)}
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

export default MarketingSearchBar;
