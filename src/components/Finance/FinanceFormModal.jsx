import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import "../../styles/FormModal.css";

const FinanceFormModal = ({
  show,
  onHide,
  onSubmit,
  initialData,
  orders,
  paymentMethods,
  bankNames,
  priorityLevels,
  transferStatuses,
  loading,
  isEdit,
  error,
}) => {
  const [formData, setFormData] = useState({
    type: "receipt",
    amount: "",
    order_id: "",
    client_id: "",
    payment_method: "",
    bank_name: "",
    transfer_date: "",
    transfer_number: "",
    status: "pending",
    priority_level: "medium",
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
        payment_method: initialData.payment_method || "",
        bank_name: initialData.bank_name || "",
        transfer_date: initialData.transfer_date || "",
        transfer_number: initialData.transfer_number || "",
        status: initialData.status || "pending",
        priority_level: initialData.priority_level || "medium",
        notes: initialData.notes || "",
      });
    } else {
      setFormData({
        type: "receipt",
        amount: "",
        order_id: "",
        client_id: "",
        payment_method: "",
        bank_name: "",
        transfer_date: "",
        transfer_number: "",
        status: "pending",
        priority_level: "medium",
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
      size="xl"
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
                <Select
                  options={[
                    { value: "receipt", label: "📥 مقبوضات (من العميل)" },
                    { value: "payment", label: "📤 مصروفات" },
                  ]}
                  value={
                    formData.type === "receipt"
                      ? { value: "receipt", label: "📥 مقبوضات (من العميل)" }
                      : { value: "payment", label: "📤 مصروفات" }
                  }
                  onChange={(opt) => setFormData(prev => ({ ...prev, type: opt ? opt.value : "receipt" }))}
                  isRtl
                />
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
                <Select
                  options={orders?.map(o => ({ value: o.id, label: `#${o.id} - ${o.client?.visa_holder_name} - ${o.visa_number || ""}` })) || []}
                  value={orders?.find(o => o.id === parseInt(formData.order_id)) ? { value: formData.order_id, label: `#${formData.order_id} - ${orders.find(o => o.id === parseInt(formData.order_id)).client?.visa_holder_name} - ${orders.find(o => o.id === parseInt(formData.order_id)).visa_number || ""}` } : null}
                  onChange={(opt) => setFormData(prev => ({ ...prev, order_id: opt ? opt.value : "" }))}
                  placeholder="-- اختر طلباً --"
                  isClearable
                  isRtl
                />
                <Form.Control.Feedback type="invalid" style={{ display: validated && !formData.order_id ? 'block' : 'none' }}>
                  يرجى اختيار الطلب
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {selectedOrder && formData.type === "receipt" && (
            <Row>
              <Col md={12}>
                <div className="bg-light p-3 rounded-3 mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">صاحب التأشيرة:</span>
                    <span className="fw-semibold">
                      {selectedOrder.client?.visa_holder_name}
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
                <Select
                  options={paymentMethods.map(m => ({ value: m.value, label: m.label }))}
                  value={paymentMethods.find(m => m.value === formData.payment_method) ? { value: formData.payment_method, label: paymentMethods.find(m => m.value === formData.payment_method).label } : null}
                  onChange={(opt) => setFormData(prev => ({ ...prev, payment_method: opt ? opt.value : "" }))}
                  placeholder="-- اختر --"
                  isClearable
                  isRtl
                />
                {getFieldError("payment_method") && (
                  <div className="text-danger small mt-1">{getFieldError("payment_method")}</div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  بنك المستفيد
                </Form.Label>
                <Select
                  options={bankNames.map(b => ({ value: b.value, label: b.label }))}
                  value={bankNames.find(b => b.value === formData.bank_name) ? { value: formData.bank_name, label: bankNames.find(b => b.value === formData.bank_name).label } : null}
                  onChange={(opt) => setFormData(prev => ({ ...prev, bank_name: opt ? opt.value : "" }))}
                  placeholder="-- اختر --"
                  isClearable
                  isRtl
                />
                {getFieldError("bank_name") && (
                  <div className="text-danger small mt-1">{getFieldError("bank_name")}</div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  رقم الحوالة
                </Form.Label>
                <Form.Control
                  type="text"
                  name="transfer_number"
                  value={formData.transfer_number}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("transfer_number")}
                  className="rounded-3"
                  placeholder="رقم الحوالة"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("transfer_number")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
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
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  حالة الحوالة
                </Form.Label>
                <Select
                  options={transferStatuses.map(s => ({ value: s.value, label: s.label }))}
                  value={transferStatuses.find(s => s.value === formData.status) ? { value: formData.status, label: transferStatuses.find(s => s.value === formData.status).label } : null}
                  onChange={(opt) => setFormData(prev => ({ ...prev, status: opt ? opt.value : "" }))}
                  placeholder="-- اختر --"
                  isClearable
                  isRtl
                />
                {getFieldError("status") && (
                  <div className="text-danger small mt-1">{getFieldError("status")}</div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  درجة الأهمية
                </Form.Label>
                <Select
                  options={priorityLevels.map(l => ({ value: l.value, label: l.label }))}
                  value={priorityLevels.find(l => l.value === formData.priority_level) ? { value: formData.priority_level, label: priorityLevels.find(l => l.value === formData.priority_level).label } : null}
                  onChange={(opt) => setFormData(prev => ({ ...prev, priority_level: opt ? opt.value : "" }))}
                  placeholder="-- اختر --"
                  isClearable
                  isRtl
                />
                {getFieldError("priority_level") && (
                  <div className="text-danger small mt-1">{getFieldError("priority_level")}</div>
                )}
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
                : "➕ إضافة حوالة"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FinanceFormModal;
