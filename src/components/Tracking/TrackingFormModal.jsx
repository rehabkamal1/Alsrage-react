import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import "../../styles/FormModal.css";

const TrackingFormModal = ({
  show,
  onHide,
  onSubmit,
  initialData,
  loading,
  isEdit,
  error,
}) => {
  const [formData, setFormData] = useState({
    order_id: "",
    is_authenticated: false,
    authentication_date: "",
    authentication_number: "",
    sent_to_external: false,
    external_status: "pending",
    passport_filtered: "pending",
    is_delivered: false,
  });

  const [validated, setValidated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        order_id: initialData.order_id || "",
        is_authenticated: initialData.is_authenticated || false,
        authentication_date: initialData.authentication_date || "",
        authentication_number: initialData.authentication_number || "",
        sent_to_external: initialData.sent_to_external || false,
        external_status: initialData.external_status || "pending",
        passport_filtered: initialData.passport_filtered || "pending",
        is_delivered: initialData.is_delivered || false,
      });
    } else {
      setFormData({
        order_id: "",
        is_authenticated: false,
        authentication_date: "",
        authentication_number: "",
        sent_to_external: false,
        external_status: "pending",
        passport_filtered: "pending",
        is_delivered: false,
      });
    }
    setValidated(false);
    setFieldErrors({});
  }, [initialData, show]);

  useEffect(() => {
    if (error && error.errors) {
      setFieldErrors(error.errors);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
          {isEdit ? "✏️ تعديل متابعة الطلب" : "➕ إضافة متابعة طلب"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} noValidate validated={validated}>
        <Modal.Body className="px-4">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  رقم الطلب <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="order_id"
                  value={formData.order_id}
                  onChange={handleChange}
                  required
                  disabled={isEdit}
                  isInvalid={!!getFieldError("order_id")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("order_id") || "يرجى إدخال رقم الطلب"}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  رقم التوثيق
                </Form.Label>
                <Form.Control
                  type="text"
                  name="authentication_number"
                  value={formData.authentication_number}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("authentication_number")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("authentication_number")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="is_authenticated"
                  name="is_authenticated"
                  label="تم التوثيق"
                  checked={formData.is_authenticated}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  تاريخ التصديق
                </Form.Label>
                <Form.Control
                  type="date"
                  name="authentication_date"
                  value={formData.authentication_date}
                  onChange={handleChange}
                  disabled={!formData.is_authenticated}
                  isInvalid={!!getFieldError("authentication_date")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("authentication_date")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="sent_to_external"
                  name="sent_to_external"
                  label="تم الإرسال للمكتب الخارجي"
                  checked={formData.sent_to_external}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  حالة المكتب الخارجي
                </Form.Label>
                <Form.Select
                  name="external_status"
                  value={formData.external_status}
                  onChange={handleChange}
                  disabled={!formData.sent_to_external}
                  isInvalid={!!getFieldError("external_status")}
                  className="rounded-3"
                >
                  <option value="pending">في الانتظار</option>
                  <option value="accepted">مقبول</option>
                  <option value="rejected">مرفوض</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {getFieldError("external_status")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  ترشيح الجواز
                </Form.Label>
                <Form.Select
                  name="passport_filtered"
                  value={formData.passport_filtered}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("passport_filtered")}
                  className="rounded-3"
                >
                  <option value="pending">في الانتظار</option>
                  <option value="accepted">مرشح</option>
                  <option value="rejected">غير مرشح</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {getFieldError("passport_filtered")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="is_delivered"
                  name="is_delivered"
                  label="تم التوريد"
                  checked={formData.is_delivered}
                  onChange={handleChange}
                />
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
            {loading
              ? "جاري الحفظ..."
              : isEdit
                ? "💾 حفظ التغييرات"
                : "➕ إضافة متابعة"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TrackingFormModal;
