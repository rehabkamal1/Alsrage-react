import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Card } from "react-bootstrap";
import { getEmployees, getSaudiOffices, getExternalOffices } from "../services/apiService";

const ReportFilters = ({ 
  config = {}, 
  filters = {}, 
  onChange, 
  onApply 
}) => {
  const [employees, setEmployees] = useState([]);
  const [saudiOffices, setSaudiOffices] = useState([]);
  const [externalOffices, setExternalOffices] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        if (config.showMarketer || config.showEmployee) {
          const empRes = await getEmployees();
          setEmployees(empRes.data?.data || []);
        }
        if (config.showSaudiOffice) {
          const saudiRes = await getSaudiOffices();
          setSaudiOffices(saudiRes.data?.data || []);
        }
        if (config.showExternalOffice) {
          const extRes = await getExternalOffices();
          setExternalOffices(extRes.data?.data || []);
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };
    fetchOptions();
  }, [config]);

  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    const cleared = Object.keys(filters).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {});
    onChange(cleared);
    if (onApply) onApply(cleared);
  };

  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Body>
        <Form>
          <Row className="g-3">
            {config.showDateRange && (
              <>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>من تاريخ</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.date_from || ""}
                      onChange={(e) => handleChange("date_from", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>إلى تاريخ</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.date_to || ""}
                      onChange={(e) => handleChange("date_to", e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </>
            )}

            {config.showMarketer && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>المسوق</Form.Label>
                  <Form.Select
                    value={filters.marketer_id || ""}
                    onChange={(e) => handleChange("marketer_id", e.target.value)}
                  >
                    <option value="">الكل</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            {config.showEmployee && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>المندوب</Form.Label>
                  <Form.Select
                    value={filters.employee_id || ""}
                    onChange={(e) => handleChange("employee_id", e.target.value)}
                  >
                    <option value="">الكل</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            {config.showSaudiOffice && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>المكتب الداخلي (السعودي)</Form.Label>
                  <Form.Select
                    value={filters.saudi_office_id || ""}
                    onChange={(e) => handleChange("saudi_office_id", e.target.value)}
                  >
                    <option value="">الكل</option>
                    {saudiOffices.map((office) => (
                      <option key={office.id} value={office.id}>
                        {office.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            {config.showExternalOffice && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>المكتب الخارجي</Form.Label>
                  <Form.Select
                    value={filters.external_office_id || ""}
                    onChange={(e) => handleChange("external_office_id", e.target.value)}
                  >
                    <option value="">الكل</option>
                    {externalOffices.map((office) => (
                      <option key={office.id} value={office.id}>
                        {office.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            <Col md={12} className="d-flex justify-content-end align-items-end mt-3">
              <Button variant="secondary" onClick={clearFilters} className="me-2">
                مسح الفلاتر
              </Button>
              <Button variant="primary" onClick={() => onApply && onApply(filters)}>
                تطبيق الفلاتر
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ReportFilters;
