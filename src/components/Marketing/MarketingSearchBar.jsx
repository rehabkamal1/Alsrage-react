import { Form, InputGroup, Button, Spinner, Row, Col } from "react-bootstrap";
import Select from "react-select";

const MarketingSearchBar = ({
  searchQuery,
  onSearch,
  onClear,
  loading,
  filters,
  onFilterChange,
  sortField,
  sortDirection,
  onSortChange,
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
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small text-secondary">النوع</Form.Label>
            <Select
              options={[
                { value: "", label: "الكل" },
                ...(types || []).map((t) => ({
                  value: t.value,
                  label: t.label,
                })),
              ]}
              value={
                types?.find((t) => t.value === filters.type)
                  ? {
                      value: filters.type,
                      label: types.find((t) => t.value === filters.type).label,
                    }
                  : { value: "", label: "الكل" }
              }
              onChange={(opt) => onFilterChange("type", opt ? opt.value : "")}
              isRtl
            />
          </Form.Group>
        </Col>
        <Col md={4}>
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
                label:
                  sortField === "id"
                    ? "رقم المعرف"
                    : sortField === "name"
                      ? "الاسم"
                      : sortField === "contact_date"
                        ? "تاريخ التواصل"
                        : "تاريخ الإنشاء",
              }}
              onChange={(opt) =>
                onSortChange(opt ? opt.value : "id", sortDirection)
              }
              isRtl
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small text-secondary">
              اتجاه الترتيب
            </Form.Label>
            <Select
              options={[
                { value: "desc", label: "تنازلي" },
                { value: "asc", label: "تصاعدي" },
              ]}
              value={{
                value: sortDirection,
                label: sortDirection === "desc" ? "تنازلي" : "تصاعدي",
              }}
              onChange={(opt) =>
                onSortChange(sortField, opt ? opt.value : "desc")
              }
              isRtl
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default MarketingSearchBar;
