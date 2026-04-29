import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const MarketingFormModal = ({
  show,
  onHide,
  onSubmit,
  initialData,
  saudiOffices,
  externalOffices,
  serviceOffices,
  statuses,
  priorityLevels,
  loading,
  isEdit,
  error,
}) => {
  const [formData, setFormData] = useState({
    source_id: "",
    source_type: "saudi_office",
    type: "saudi_office",
    status: "new",
    priority_level: "medium",
    notes: "",
    contact_date: "",
    next_followup_date: "",
    assigned_to: "",
  });

  const [validated, setValidated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [sourceOptions, setSourceOptions] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        source_id: initialData.source_id || "",
        source_type: initialData.source_type || "saudi_office",
        type: initialData.type || "saudi_office",
        status: initialData.status || "new",
        priority_level: initialData.priority_level || "medium",
        notes: initialData.notes || "",
        contact_date: initialData.contact_date || "",
        next_followup_date: initialData.next_followup_date || "",
        assigned_to: initialData.assigned_to || "",
      });
    } else {
      setFormData({
        source_id: "",
        source_type: "saudi_office",
        type: "saudi_office",
        status: "new",
        priority_level: "medium",
        notes: "",
        contact_date: "",
        next_followup_date: "",
        assigned_to: "",
      });
    }
    setValidated(false);
    setFieldErrors({});
  }, [initialData, show]);

  useEffect(() => {
    if (formData.source_type === "saudi_office") {
      setSourceOptions(saudiOffices);
    } else if (formData.source_type === "external_office") {
      setSourceOptions(externalOffices);
    } else {
      setSourceOptions(serviceOffices);
    }
  }, [formData.source_type, saudiOffices, externalOffices, serviceOffices]);

  useEffect(() => {
    if (error && error.errors) {
      setFieldErrors(error.errors);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    onSubmit(formData);
  };

  const getFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      return fieldErrors[fieldName][0];
    }
    return null;
  };

  const getSourceLabel = () => {
    if (formData.source_type === "saudi_office") return "المكتب السعودي";
    if (formData.source_type === "external_office") return "المكتب الخارجي";
    return "مكتب الخدمات";
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
          {isEdit ? "✏️ تعديل عميل تسويقي" : "➕ إضافة عميل تسويقي جديد"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} noValidate validated={validated}>
        <Modal.Body className="px-4">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  نوع المصدر
                </Form.Label>
                <Form.Select
                  name="source_type"
                  value={formData.source_type}
                  onChange={handleChange}
                  className="rounded-3"
                >
                  <option value="saudi_office">مكتب سعودي</option>
                  <option value="external_office">مكتب خارجي</option>
                  <option value="client">مكتب خدمات</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  {getSourceLabel()}
                </Form.Label>
                <Form.Select
                  name="source_id"
                  value={formData.source_id}
                  onChange={handleChange}
                  required
                  isInvalid={!!getFieldError("source_id")}
                  className="rounded-3"
                >
                  <option value="">-- اختر --</option>
                  {sourceOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name || option.office_name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {getFieldError("source_id")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  نوع العميل
                </Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="rounded-3"
                >
                  <option value="saudi_office">مكتب سعودي</option>
                  <option value="external_office">مكتب خارجي</option>
                  <option value="service_office">مكتب خدمات</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  الحالة
                </Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="rounded-3"
                >
                  {statuses.map((status) => (
                    <option key={status.key} value={status.key}>
                      {status.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  درجة الأهمية
                </Form.Label>
                <Form.Select
                  name="priority_level"
                  value={formData.priority_level}
                  onChange={handleChange}
                  className="rounded-3"
                >
                  {priorityLevels.map((level) => (
                    <option key={level.key} value={level.key}>
                      {level.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  المسؤول
                </Form.Label>
                <Form.Control
                  type="text"
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleChange}
                  placeholder="اسم المسؤول"
                  className="rounded-3"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  تاريخ التواصل
                </Form.Label>
                <Form.Control
                  type="date"
                  name="contact_date"
                  value={formData.contact_date}
                  onChange={handleChange}
                  className="rounded-3"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  تاريخ المتابعة
                </Form.Label>
                <Form.Control
                  type="date"
                  name="next_followup_date"
                  value={formData.next_followup_date}
                  onChange={handleChange}
                  className="rounded-3"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              الملاحظات
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="أدخل ملاحظات إضافية..."
              className="rounded-3"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="border-0 pb-4 px-4">
          <Button variant="light" onClick={onHide} className="px-4 rounded-3">
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="dark"
            disabled={loading}
            className="px-4 rounded-3"
          >
            {loading
              ? "جاري الحفظ..."
              : isEdit
                ? "💾 حفظ التغييرات"
                : "➕ إضافة عميل"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MarketingFormModal;
