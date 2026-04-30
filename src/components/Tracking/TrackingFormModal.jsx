import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import "../../styles/FormModal.css";

const TrackingFormModal = ({
  show,
  onHide,
  onSubmit,
  initialData,
  orders,
  priorityLevels,
  passportStatuses,
  transferStatuses,
  loading,
  isEdit,
  error,
}) => {
  const [formData, setFormData] = useState({
    order_id: "",
    is_authenticated: false,
    authentication_date: "",
    authentication_number: "",
    authorization_number: "",
    sponsor_number: "",
    last_action_date: "",
    notes: "",
    priority_level: "medium",
    passport_status: "",
    transfer_status: "",
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [validated, setValidated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        order_id: initialData.order_id || "",
        is_authenticated: initialData.is_authenticated || false,
        authentication_date: initialData.authentication_date || "",
        authentication_number: initialData.authentication_number || "",
        authorization_number: initialData.authorization_number || "",
        sponsor_number: initialData.sponsor_number || "",
        last_action_date: initialData.last_action_date || "",
        notes: initialData.notes || "",
        priority_level: initialData.priority_level || "medium",
        passport_status: initialData.passport_status || "",
        transfer_status: initialData.transfer_status || "",
      });
      if (initialData.order_id) {
        const order = orders?.find((o) => o.id === initialData.order_id);
        setSelectedOrder(order);
      }
    } else {
      setFormData({
        order_id: "",
        is_authenticated: false,
        authentication_date: "",
        authentication_number: "",
        authorization_number: "",
        sponsor_number: "",
        last_action_date: "",
        notes: "",
        priority_level: "medium",
        passport_status: "",
        transfer_status: "",
      });
      setSelectedOrder(null);
    }
    setValidated(false);
    setFieldErrors({});
  }, [initialData, show, orders]);

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

  const handleOrderChange = (e) => {
    const orderId = e.target.value;
    setFormData((prev) => ({ ...prev, order_id: orderId }));
    const order = orders?.find((o) => o.id === parseInt(orderId));
    setSelectedOrder(order);
    if (fieldErrors.order_id) {
      setFieldErrors((prev) => ({ ...prev, order_id: undefined }));
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
      size="xl"
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
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  رقم الطلب <span className="text-danger">*</span>
                </Form.Label>
                <Select
                  options={
                    orders?.map((o) => ({
                      value: o.id,
                      label: `#${o.id} - ${o.visa_holder_name || o.client?.visa_holder_name} - ${o.visa_number}`,
                    })) || []
                  }
                  value={
                    orders?.find((o) => o.id === parseInt(formData.order_id))
                      ? {
                          value: formData.order_id,
                          label: `#${formData.order_id} - ${orders.find((o) => o.id === parseInt(formData.order_id)).visa_holder_name || orders.find((o) => o.id === parseInt(formData.order_id)).client?.visa_holder_name} - ${orders.find((o) => o.id === parseInt(formData.order_id)).visa_number}`,
                        }
                      : null
                  }
                  onChange={(opt) => {
                    const orderId = opt ? opt.value : "";
                    setFormData((prev) => ({ ...prev, order_id: orderId }));
                    const order = orders?.find(
                      (o) => o.id === parseInt(orderId),
                    );
                    setSelectedOrder(order);
                  }}
                  isDisabled={isEdit}
                  placeholder="-- اختر طلباً --"
                  isClearable
                  isRtl
                />
                <Form.Control.Feedback
                  type="invalid"
                  style={{
                    display: validated && !formData.order_id ? "block" : "none",
                  }}
                >
                  يرجى اختيار الطلب
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
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
                  placeholder="أدخل رقم التوثيق"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("authentication_number")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {selectedOrder && (
            <div className="bg-light p-3 rounded-3 mb-4">
              <div className="d-flex flex-wrap gap-3">
                <div className="flex-grow-1">
                  <small className="text-muted d-block">صاحب التأشيرة</small>
                  <strong>
                    {selectedOrder.visa_holder_name ||
                      selectedOrder.client?.visa_holder_name ||
                      "-"}
                  </strong>
                </div>
                <div className="flex-grow-1">
                  <small className="text-muted d-block">رقم التأشيرة</small>
                  <strong>{selectedOrder.visa_number || "-"}</strong>
                </div>
              </div>
            </div>
          )}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
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
              <Form.Group>
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

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  رقم التفويض
                </Form.Label>
                <Form.Control
                  type="text"
                  name="authorization_number"
                  value={formData.authorization_number}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("authorization_number")}
                  className="rounded-3"
                  placeholder="أدخل رقم التفويض"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("authorization_number")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  رقم الكفيل
                </Form.Label>
                <Form.Control
                  type="text"
                  name="sponsor_number"
                  value={formData.sponsor_number}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("sponsor_number")}
                  className="rounded-3"
                  placeholder="أدخل رقم الكفيل"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("sponsor_number")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  تاريخ آخر إجراء
                </Form.Label>
                <Form.Control
                  type="date"
                  name="last_action_date"
                  value={formData.last_action_date}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("last_action_date")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("last_action_date")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  درجة الأهمية
                </Form.Label>
                <Select
                  options={
                    priorityLevels?.map((l) => ({
                      value: l.value,
                      label: l.label,
                    })) || []
                  }
                  value={
                    priorityLevels?.find(
                      (l) => l.value === formData.priority_level,
                    )
                      ? {
                          value: formData.priority_level,
                          label: priorityLevels.find(
                            (l) => l.value === formData.priority_level,
                          ).label,
                        }
                      : null
                  }
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority_level: opt ? opt.value : "",
                    }))
                  }
                  placeholder="-- اختر --"
                  isClearable
                  isRtl
                />
                {getFieldError("priority_level") && (
                  <div className="text-danger small mt-1">
                    {getFieldError("priority_level")}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  حالة ترشيح الجواز
                </Form.Label>
                <Select
                  options={
                    passportStatuses?.map((s) => ({
                      value: s.value,
                      label: s.label,
                    })) || []
                  }
                  value={
                    passportStatuses?.find(
                      (s) => s.value === formData.passport_status,
                    )
                      ? {
                          value: formData.passport_status,
                          label: passportStatuses.find(
                            (s) => s.value === formData.passport_status,
                          ).label,
                        }
                      : null
                  }
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      passport_status: opt ? opt.value : "",
                    }))
                  }
                  placeholder="-- اختر --"
                  isClearable
                  isRtl
                />
                {getFieldError("passport_status") && (
                  <div className="text-danger small mt-1">
                    {getFieldError("passport_status")}
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  حالة التحويل
                </Form.Label>
                <Select
                  options={
                    transferStatuses?.map((s) => ({
                      value: s.value,
                      label: s.label,
                    })) || []
                  }
                  value={
                    transferStatuses?.find(
                      (s) => s.value === formData.transfer_status,
                    )
                      ? {
                          value: formData.transfer_status,
                          label: transferStatuses.find(
                            (s) => s.value === formData.transfer_status,
                          ).label,
                        }
                      : null
                  }
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      transfer_status: opt ? opt.value : "",
                    }))
                  }
                  placeholder="-- اختر --"
                  isClearable
                  isRtl
                />
                {getFieldError("transfer_status") && (
                  <div className="text-danger small mt-1">
                    {getFieldError("transfer_status")}
                  </div>
                )}
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
              isInvalid={!!getFieldError("notes")}
              className="rounded-3"
              placeholder="أدخل ملاحظات إضافية..."
            />
            <Form.Control.Feedback type="invalid">
              {getFieldError("notes")}
            </Form.Control.Feedback>
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
                : "➕ إضافة متابعة"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TrackingFormModal;
