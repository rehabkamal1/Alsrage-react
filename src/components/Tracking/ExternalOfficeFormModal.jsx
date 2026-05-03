import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const ExternalOfficeFormModal = ({ show, onHide, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    country: "",
    name: "",
    nationality: "",
    responsible_employee: "",
    phone: "",
  });

  const [validated, setValidated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!show) {
      setFormData({
        country: "",
        name: "",
        nationality: "",
        responsible_employee: "",
        phone: "",
      });
      setValidated(false);
      setFieldErrors({});
    }
  }, [show]);

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
          ➕ إضافة مكتب خارجي جديد
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} noValidate validated={validated}>
        <Modal.Body className="px-4">
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  الدولة <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="country"
                  value={formData.country || ""}
                  onChange={handleChange}
                  required
                  isInvalid={!!getFieldError("country")}
                  className="rounded-3"
                  placeholder="أدخل الدولة"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("country") || "يرجى إدخال الدولة"}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  اسم المكتب <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                  isInvalid={!!getFieldError("name")}
                  className="rounded-3"
                  placeholder="أدخل اسم المكتب"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("name") || "يرجى إدخال اسم المكتب"}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  الجنسية
                </Form.Label>
                <Form.Control
                  type="text"
                  name="nationality"
                  value={formData.nationality || ""}
                  onChange={handleChange}
                  placeholder="مثال: سعودي، مصري، أردني..."
                  isInvalid={!!getFieldError("nationality")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("nationality")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  الموظف المسؤول <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="responsible_employee"
                  value={formData.responsible_employee || ""}
                  onChange={handleChange}
                  required
                  isInvalid={!!getFieldError("responsible_employee")}
                  className="rounded-3"
                  placeholder="أدخل اسم الموظف المسؤول"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("responsible_employee") ||
                    "يرجى إدخال الموظف المسؤول"}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  رقم المكتب <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  required
                  isInvalid={!!getFieldError("phone")}
                  className="rounded-3"
                  placeholder="أدخل رقم المكتب"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("phone") || "يرجى إدخال رقم المكتب"}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
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
            {loading ? "جاري الحفظ..." : "➕ إضافة مكتب"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ExternalOfficeFormModal;
