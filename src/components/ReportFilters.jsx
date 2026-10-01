import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Card } from "react-bootstrap";
import { getEmployees, getSaudiOffices, getExternalOffices, getSettingsOrderStatuses, getClients } from "../services/apiService";

const ReportFilters = ({ 
  config = {}, 
  filters = {}, 
  onChange, 
  onApply,
  onFilter,
  statuses: propStatuses,
  employees: propEmployees,
  clients: propClients,
  saudiOffices: propSaudiOffices,
  externalOffices: propExternalOffices,
}) => {
  const [employees, setEmployees] = useState(propEmployees || []);
  const [clients, setClients] = useState(propClients || []);
  const [saudiOffices, setSaudiOffices] = useState(propSaudiOffices || []);
  const [externalOffices, setExternalOffices] = useState(propExternalOffices || []);
  const [statuses, setStatuses] = useState(propStatuses || []);

  useEffect(() => {
    if (propEmployees) setEmployees(propEmployees);
    if (propClients) setClients(propClients);
    if (propSaudiOffices) setSaudiOffices(propSaudiOffices);
    if (propExternalOffices) setExternalOffices(propExternalOffices);
    if (propStatuses) setStatuses(propStatuses);
  }, [propEmployees, propClients, propSaudiOffices, propExternalOffices, propStatuses]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        if ((config.showMarketer || config.showEmployee) && (!propEmployees || propEmployees.length === 0)) {
          const empRes = await getEmployees();
          setEmployees(empRes.data?.data || empRes.data || []);
        }
        if ((config.showClient || config.showDelegate) && (!propClients || propClients.length === 0)) {
          const clientRes = await getClients({ per_page: 500 });
          setClients(clientRes.data?.data || clientRes.data || []);
        }
        if (config.showSaudiOffice && (!propSaudiOffices || propSaudiOffices.length === 0)) {
          const saudiRes = await getSaudiOffices();
          setSaudiOffices(saudiRes.data?.data || saudiRes.data || []);
        }
        if (config.showExternalOffice && (!propExternalOffices || propExternalOffices.length === 0)) {
          const extRes = await getExternalOffices();
          setExternalOffices(extRes.data?.data || extRes.data || []);
        }
        if (config.showStatus && (!propStatuses || propStatuses.length === 0)) {
          const statusRes = await getSettingsOrderStatuses();
          setStatuses(statusRes.data?.data || statusRes.data || []);
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };
    fetchOptions();
  }, [config]);

  const handleChange = (field, value) => {
    const updated = { ...filters, [field]: value };
    if (onChange) onChange(updated);
    if (onFilter) onFilter(updated);
  };

  const clearFilters = () => {
    const cleared = Object.keys(filters).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {});
    if (onChange) onChange(cleared);
    if (onFilter) onFilter(cleared);
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
                  <Form.Label>{config.marketerLabel || "المسوق"}</Form.Label>
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
                  <Form.Label>{config.employeeLabel || "المسوق / الموظف"}</Form.Label>
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

            {(config.showClient || config.showDelegate) && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>{config.clientLabel || config.delegateLabel || "المندوب / العميل"}</Form.Label>
                  <Form.Select
                    value={filters.client_id || ""}
                    onChange={(e) => handleChange("client_id", e.target.value)}
                  >
                    <option value="">الكل</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            {config.showStatus && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>{config.statusLabel || "حالة الطلب"}</Form.Label>
                  <Form.Select
                    value={filters.status || ""}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="">الكل</option>
                    {statuses.map((st) => (
                      <option key={st.key || st.id} value={st.key || st.id}>
                        {st.label || st.name}
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
