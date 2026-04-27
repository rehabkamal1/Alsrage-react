import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import "../../styles/FormModal.css";

const FinanceFormModal = ({
  show,
  onHide,
  onSubmit,
  initialData,
  orders,
  loading,
  isEdit,
  error,
}) => {
  const [formData, setFormData] = useState({
    type: "receipt",
    amount: "",
    order_id: "",
    client_id: "",
    payment_method: "cash",
    bank_name: "",
    transfer_date: "",
    sender_name: "",
    status: "pending",
    notes: "",
  });

  const [validated, setValidated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || "receipt",
        amount: initialData.amount || "",
        order_id: initialData.order_id || "",
        client_id: initialData.client_id || "",
        payment_method: initialData.payment_method || "cash",
        bank_name: initialData.bank_name || "",
        transfer_date: initialData.transfer_date || "",
        sender_name: initialData.sender_name || "",
        status: initialData.status || "pending",
        notes: initialData.notes || "",
      });
    } else {
      setFormData({
        type: "receipt",
        amount: "",
        order_id: "",
        client_id: "",
        payment_method: "cash",
        bank_name: "",
        transfer_date: "",
        sender_name: "",
        status: "pending",
        notes: "",
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const selectedOrder = orders?.find(
    (o) => o.id === parseInt(formData.order_id),
  );

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
          {isEdit ? "✏️ تعديل الحوالة" : "➕ إضافة حوالة جديدة"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} noValidate validated={validated}>
        <Modal.Body className="px-4">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  نوع المعاملة <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  isInvalid={!!getFieldError("type")}
                  className="rounded-3"
                >
                  <option value="receipt">📥 مقبوضات (من العميل)</option>
                  <option value="payment">📤 مصروفات</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {getFieldError("type")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  المبلغ (ر.س) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  isInvalid={!!getFieldError("amount")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("amount")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  رقم الطلب <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="order_id"
                  value={formData.order_id}
                  onChange={handleChange}
                  required
                  isInvalid={!!getFieldError("order_id")}
                  className="rounded-3"
                >
                  <option value="">-- اختر طلباً --</option>
                  {orders?.map((order) => (
                    <option key={order.id} value={order.id}>
                      #{order.id} - {order.client?.name} -{" "}
                      {order.visa_number || ""}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {getFieldError("order_id")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {selectedOrder && formData.type === "receipt" && (
            <Row>
              <Col md={12}>
                <div className="bg-light p-3 rounded-3 mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">العميل:</span>
                    <span className="fw-semibold">
                      {selectedOrder.client?.name}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <span className="text-muted">رقم التأشيرة:</span>
                    <span>{selectedOrder.visa_number || "-"}</span>
                  </div>
                </div>
              </Col>
            </Row>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  طريقة الدفع
                </Form.Label>
                <Form.Select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("payment_method")}
                  className="rounded-3"
                >
                  <option value="cash">💰 كاش</option>
                  <option value="visa">💳 فيزا</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {getFieldError("payment_method")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  بنك المستفيد
                </Form.Label>
                <Form.Control
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("bank_name")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("bank_name")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  تاريخ الحوالة
                </Form.Label>
                <Form.Control
                  type="date"
                  name="transfer_date"
                  value={formData.transfer_date}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("transfer_date")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("transfer_date")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  اسم المرسل
                </Form.Label>
                <Form.Control
                  type="text"
                  name="sender_name"
                  value={formData.sender_name}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("sender_name")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("sender_name")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  حالة الحوالة
                </Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("status")}
                  className="rounded-3"
                >
                  <option value="pending">⏳ قيد الانتظار</option>
                  <option value="accepted">✅ مقبولة</option>
                  <option value="rejected">❌ مرفوضة</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {getFieldError("status")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              ملاحظات
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              isInvalid={!!getFieldError("notes")}
              className="rounded-3"
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
                : "➕ إضافة حوالة"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FinanceFormModal;
