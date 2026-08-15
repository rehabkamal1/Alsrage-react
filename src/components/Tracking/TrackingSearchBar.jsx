import { Form, InputGroup, Button, Spinner, Row, Col } from "react-bootstrap";
import Select from "react-select";

const TrackingSearchBar = ({
  searchQuery,
  onSearch,
  onClear,
  loading,
  priorityLevels = [],
  passportStatuses = [],
  transferStatuses = [],
  serviceTypes = [],
  saudiOffices = [],
  externalOffices = [],
  clients = [],
  filters = {},
  onFilterChange,
  sortField,
  sortDirection,
  onSortChange,
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
          placeholder="ابحث برقم الطلب أو رقم التأشيرة أو رقم الكفيل أو رقم الجواز أو اسم صاحب التأشيرة..."
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

      <Row className="g-2 align-items-end mb-2">
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small text-secondary">
              حالة ترشيح الجواز
            </Form.Label>
            <Select
              options={[{ value: "", label: "الكل" }, ...passportStatuses.map(s => ({ value: s.value, label: s.label }))]}
              value={passportStatuses.find(s => s.value === filters.passport_status) ? { value: filters.passport_status, label: passportStatuses.find(s => s.value === filters.passport_status).label } : { value: "", label: "الكل" }}
              onChange={(opt) => onFilterChange("passport_status", opt ? opt.value : "")}
              isRtl
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small text-secondary">
              حالة التحويل
            </Form.Label>
            <Select
              options={[{ value: "", label: "الكل" }, ...transferStatuses.map(s => ({ value: s.value, label: s.label }))]}
              value={transferStatuses.find(s => s.value === filters.transfer_status) ? { value: filters.transfer_status, label: transferStatuses.find(s => s.value === filters.transfer_status).label } : { value: "", label: "الكل" }}
              onChange={(opt) => onFilterChange("transfer_status", opt ? opt.value : "")}
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
              options={[{ value: "", label: "الكل" }, ...priorityLevels.map(l => ({ value: l.value, label: l.label }))]}
              value={priorityLevels.find(l => l.value === filters.priority_level) ? { value: filters.priority_level, label: priorityLevels.find(l => l.value === filters.priority_level).label } : { value: "", label: "الكل" }}
              onChange={(opt) => onFilterChange("priority_level", opt ? opt.value : "")}
              isRtl
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small text-secondary">نوع الخدمة</Form.Label>
            <Select
              options={[{ value: "", label: "الكل" }, ...serviceTypes.map(t => ({ value: t.key || t.label, label: t.label }))]}
              value={serviceTypes.find(t => (t.key || t.label) === filters.service_type) ? { value: filters.service_type, label: serviceTypes.find(t => (t.key || t.label) === filters.service_type).label } : { value: "", label: "الكل" }}
              onChange={(opt) => onFilterChange("service_type", opt ? opt.value : "")}
              isRtl
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-2 align-items-end mb-2">
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small text-secondary">المكتب السعودي</Form.Label>
            <Select
              options={[{ value: "", label: "الكل" }, ...saudiOffices.map(o => ({ value: o.id, label: o.name }))]}
              value={saudiOffices.find(o => o.id === parseInt(filters.saudi_office_id)) ? { value: filters.saudi_office_id, label: saudiOffices.find(o => o.id === parseInt(filters.saudi_office_id)).name } : { value: "", label: "الكل" }}
              onChange={(opt) => onFilterChange("saudi_office_id", opt ? opt.value : "")}
              isRtl
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small text-secondary">المكتب الخارجي</Form.Label>
            <Select
              options={[{ value: "", label: "الكل" }, ...externalOffices.map(o => ({ value: o.id, label: o.name }))]}
              value={externalOffices.find(o => o.id === parseInt(filters.external_office_id)) ? { value: filters.external_office_id, label: externalOffices.find(o => o.id === parseInt(filters.external_office_id)).name } : { value: "", label: "الكل" }}
              onChange={(opt) => onFilterChange("external_office_id", opt ? opt.value : "")}
              isRtl
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small text-secondary">المندوب</Form.Label>
            <Select
              options={[{ value: "", label: "الكل" }, ...clients.map(c => ({ value: c.id, label: c.name }))]}
              value={clients.find(c => c.id === parseInt(filters.client_id)) ? { value: filters.client_id, label: clients.find(c => c.id === parseInt(filters.client_id)).name } : { value: "", label: "الكل" }}
              onChange={(opt) => onFilterChange("client_id", opt ? opt.value : "")}
              isRtl
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small text-secondary">ترتيب حسب</Form.Label>
            <Select
              options={[
                { value: "id", label: "رقم الطلب" },
                { value: "last_action_date", label: "تاريخ آخر إجراء" },
                { value: "priority_level", label: "درجة الأهمية" },
                { value: "created_at", label: "تاريخ الإنشاء" },
              ]}
              value={{
                value: sortField,
                label: sortField === "id" ? "رقم الطلب" : sortField === "last_action_date" ? "تاريخ آخر إجراء" : sortField === "priority_level" ? "درجة الأهمية" : "تاريخ الإنشاء"
              }}
              onChange={(opt) => onSortChange(opt ? opt.value : "id", sortDirection)}
              isRtl
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default TrackingSearchBar;
