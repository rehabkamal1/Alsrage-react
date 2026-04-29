import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import "../../styles/FormModal.css";
import { getEmployees } from "../../services/apiService";

const ClientFormModal = ({
  show,
  onHide,
  onSubmit,
  initialData,
  loading,
  isEdit,
}) => {
  const [formData, setFormData] = useState({
    client_type: "individual",
    name: "",
    employee_id: "",
    phone: "",
    additional_phone: "",
    city: "",
    address: "",
  });

  const [employees, setEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees({ per_page: 200, sort_by: "name", sort_dir: "asc" });
      const list = response.data?.data || response.data || [];
      setEmployees(list);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    if (initialData) {
      const selectedEmployeeName = initialData.employee?.name || "";
      setFormData({
        client_type: initialData.client_type || "individual",
        name: initialData.name || "",
        employee_id: initialData.employee_id || "",
        phone: initialData.phone || "",
        additional_phone: initialData.additional_phone || "",
        city: initialData.city || "",
        address: initialData.address || "",
      });
      setEmployeeSearch(selectedEmployeeName);
    } else {
      setFormData({
        client_type: "individual",
        name: "",
        employee_id: "",
        phone: "",
        additional_phone: "",
        city: "",
        address: "",
      });
      setEmployeeSearch("");
    }
    setValidated(false);
  }, [initialData, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const selectedEmployee = employees.find((emp) => emp.name === employeeSearch);
    const payload = {
      ...formData,
      employee_id: selectedEmployee?.id || formData.employee_id,
    };
    onSubmit(payload);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      dir="rtl"
      backdrop="static"
    >
      <Modal.Header closeButton className="border-0 pt-4 px-4">
        <Modal.Title className="fw-bold fs-5">
          {isEdit ? "✏️ تعديل بيانات العميل" : "➕ إضافة عميل جديد"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} noValidate validated={validated}>
        <Modal.Body className="px-4">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  نوع العميل <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="client_type"
                  value={formData.client_type}
                  onChange={handleChange}
                  required
                  className="rounded-3"
                >
                  <option value="individual">👤 عميل فردي</option>
                  <option value="office">🏢 مكتب خدمات</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  رقم الهاتف <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="رقم الهاتف الأساسي"
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  يرجى إدخال رقم الهاتف
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  المندوب
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="اسم المندوب"
                  className="rounded-3"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  اسم الموظف
                </Form.Label>
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={employees.map(emp => ({ value: emp.id, label: emp.name }))}
                  value={employees.find(emp => emp.id === formData.employee_id) ? { value: formData.employee_id, label: employees.find(emp => emp.id === formData.employee_id).name } : null}
                  onChange={(option) => {
                    setFormData(prev => ({ ...prev, employee_id: option ? option.value : "" }));
                  }}
                  placeholder="اختر الموظف..."
                  isClearable
                  isRtl
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  المدينة
                </Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="المدينة"
                  className="rounded-3"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  رقم هاتف إضافي
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="additional_phone"
                  value={formData.additional_phone}
                  onChange={handleChange}
                  placeholder="رقم هاتف إضافي"
                  className="rounded-3"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  العنوان
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="العنوان"
                  className="rounded-3"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="border-0 pb-4 px-4">
          <Button
            variant="light"
            onClick={onHide}
            className="px-4 rounded-3"
            style={{ border: "1px solid #dee2e6" }}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="dark"
            disabled={loading}
            className="px-4 rounded-3"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                جاري الحفظ...
              </>
            ) : isEdit ? (
              "💾 حفظ التغييرات"
            ) : (
              "➕ إضافة عميل"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ClientFormModal;
