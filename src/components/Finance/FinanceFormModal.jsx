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
  clients,
  employees,
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
    order_ids: [],
    client_id: "",
    employee_id: "",
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

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    if (dateString.includes("T")) {
      return dateString.split("T")[0];
    }
    return dateString;
  };

  const normalizeOptions = (list) => {
    if (!list || !Array.isArray(list)) return [];
    return list.map((item) => ({
      value: item.value || item.key || item.id,
      label: item.label || item.name || item.text || "غير محدد",
      color: item.color || "#6c757d",
    }));
  };

  const getSelectedOption = (options, value) => {
    if (!value || !options || options.length === 0) return null;
    const found = options.find((opt) => String(opt.value) === String(value));
    return found ? { value: found.value, label: found.label } : null;
  };

  const findValueInList = (list, searchValue, defaultValue = "") => {
    if (!searchValue || !list || list.length === 0) return defaultValue;
    const normalizedList = normalizeOptions(list);
    const found = normalizedList.find(
      (item) =>
        String(item.value) === String(searchValue) ||
        item.label === searchValue,
    );
    return found ? found.value : defaultValue;
  };

  const normalizedPaymentMethods = normalizeOptions(paymentMethods);
  const normalizedBankNames = normalizeOptions(bankNames);
  const normalizedTransferStatuses = normalizeOptions(transferStatuses);
  const normalizedPriorityLevels = normalizeOptions(priorityLevels);

  useEffect(() => {
    if (initialData) {
      const formattedTransferDate = formatDateForInput(
        initialData.transfer_date,
      );

      const paymentMethodValue = findValueInList(
        paymentMethods,
        initialData.payment_method,
        "",
      );

      const bankNameValue = findValueInList(
        bankNames,
        initialData.bank_name,
        "",
      );

      const statusValue = findValueInList(
        transferStatuses,
        initialData.status,
        "pending",
      );

      const priorityValue = findValueInList(
        priorityLevels,
        initialData.priority_level,
        "medium",
      );

      setFormData({
        type: initialData.type || "receipt",
        amount: initialData.amount || "",
        order_id: initialData.order_id || "",
        order_ids: initialData.order_ids || [],
        client_id: initialData.client_id || "",
        employee_id: initialData.employee_id || "",
        payment_method: paymentMethodValue,
        bank_name: bankNameValue,
        transfer_date: formattedTransferDate,
        transfer_number: initialData.transfer_number || "",
        status: statusValue,
        priority_level: priorityValue,
        notes: initialData.notes || "",
      });
    } else {
      setFormData({
        type: "receipt",
        amount: "",
        order_id: "",
        order_ids: [],
        client_id: "",
        employee_id: "",
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
  }, [
    initialData,
    show,
    paymentMethods,
    bankNames,
    priorityLevels,
    transferStatuses,
  ]);

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

  const clientOptions = (clients || []).map((c) => ({
    value: c.id,
    label: `${c.name || ""} - ${c.phone || ""}`,
  }));

  const employeeOptions = (employees || []).map((e) => ({
    value: e.id,
    label: e.name || `موظف #${e.id}`,
  }));

  const orderOptions = (orders || []).map((o) => ({
    value: o.id,
    label: `#${o.id} - ${o.visa_holder_name || o.client?.visa_holder_name || "بدون اسم"} - ${o.visa_number || ""}`,
  }));

  return (
    <Modal show={show} onHide={onHide} centered size="xl" dir="rtl">
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
                  الموظف المسؤول
                </Form.Label>
                <Select
                  options={employeeOptions}
                  value={getSelectedOption(
                    employeeOptions,
                    formData.employee_id,
                  )}
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      employee_id: opt ? opt.value : "",
                    }))
                  }
                  placeholder="-- اختر الموظف --"
                  isClearable
                  isRtl
                />
                {getFieldError("employee_id") && (
                  <div className="text-danger small mt-1">
                    {getFieldError("employee_id")}
                  </div>
                )}
              </Form.Group>
            </Col>
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
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: opt ? opt.value : "receipt",
                    }))
                  }
                  isRtl
                />
                {getFieldError("type") && (
                  <div className="text-danger small mt-1">
                    {getFieldError("type")}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  رقم المندوب <span className="text-danger">*</span>
                </Form.Label>
                <Select
                  options={clientOptions}
                  value={getSelectedOption(clientOptions, formData.client_id)}
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      client_id: opt ? opt.value : "",
                    }))
                  }
                  placeholder="-- اختر المندوب --"
                  isClearable
                  isRtl
                />
                {(validated && !formData.client_id) ||
                getFieldError("client_id") ? (
                  <div className="text-danger small mt-1">
                    {getFieldError("client_id") || "يرجى اختيار المندوب"}
                  </div>
                ) : null}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  رقم الطلب
                </Form.Label>
                <Select
                  isMulti
                  options={orderOptions}
                  value={orderOptions.filter((o) =>
                    formData.order_ids?.includes(o.value),
                  )}
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      order_ids: selected ? selected.map((s) => s.value) : [],
                    }))
                  }
                  placeholder="-- اختر طلباً (يمكن اختيار أكثر من واحد) --"
                  isClearable
                  isRtl
                />
                {getFieldError("order_ids") && (
                  <div className="text-danger small mt-1">
                    {getFieldError("order_ids")}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
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
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  طريقة الدفع
                </Form.Label>
                <Select
                  options={normalizedPaymentMethods}
                  value={getSelectedOption(
                    normalizedPaymentMethods,
                    formData.payment_method,
                  )}
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      payment_method: opt ? opt.value : "",
                    }))
                  }
                  placeholder="-- اختر --"
                  isClearable
                  isRtl
                />
                {getFieldError("payment_method") && (
                  <div className="text-danger small mt-1">
                    {getFieldError("payment_method")}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  بنك المستفيد
                </Form.Label>
                <Select
                  options={normalizedBankNames}
                  value={getSelectedOption(
                    normalizedBankNames,
                    formData.bank_name,
                  )}
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      bank_name: opt ? opt.value : "",
                    }))
                  }
                  placeholder="-- اختر --"
                  isClearable
                  isRtl
                />
                {getFieldError("bank_name") && (
                  <div className="text-danger small mt-1">
                    {getFieldError("bank_name")}
                  </div>
                )}
              </Form.Group>
            </Col>
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
                  حالة الحوالة
                </Form.Label>
                <Select
                  options={normalizedTransferStatuses}
                  value={getSelectedOption(
                    normalizedTransferStatuses,
                    formData.status,
                  )}
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: opt ? opt.value : "",
                    }))
                  }
                  placeholder="-- اختر --"
                  isClearable
                  isRtl
                />
                {getFieldError("status") && (
                  <div className="text-danger small mt-1">
                    {getFieldError("status")}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  درجة الأهمية
                </Form.Label>
                <Select
                  options={normalizedPriorityLevels}
                  value={getSelectedOption(
                    normalizedPriorityLevels,
                    formData.priority_level,
                  )}
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
