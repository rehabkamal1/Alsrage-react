import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import { getOrdersByClient } from "../../services/apiService";
import "../../styles/FormModal.css";

const FinanceFormModal = ({
  show,
  onHide,
  onSubmit,
  initialData,
  orders: allOrders = [],
  clients,
  employees,
  paymentMethods,
  bankNames,
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
    is_reviewed: false,
    notes: "",
  });

  const [clientOrders, setClientOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [validated, setValidated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const lastLoadedId = useRef(null);

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
    if (value === null || value === undefined || value === "") return null;
    if (!options || options.length === 0) return null;
    const found = options.find(
      (opt) => String(opt.value).trim() === String(value).trim(),
    );
    return found ? { value: found.value, label: found.label } : null;
  };

  const findValueInList = (list, searchValue, defaultValue = "") => {
    if (
      searchValue === null ||
      searchValue === undefined ||
      searchValue === ""
    ) {
      return defaultValue;
    }
    if (!list || list.length === 0) return searchValue;
    const normalizedList = normalizeOptions(list);
    const found = normalizedList.find(
      (item) =>
        String(item.value) === String(searchValue) ||
        item.label === searchValue,
    );
    return found ? found.value : searchValue;
  };

  const normalizedPaymentMethods = normalizeOptions(paymentMethods);
  const normalizedBankNames = normalizeOptions(bankNames);
  const selectedPaymentMethod = normalizedPaymentMethods.find(
    (method) => String(method.value) === String(formData.payment_method),
  );
  const isBankPaymentMethod = (paymentMethod, label = "") =>
    [paymentMethod, label].filter(Boolean).some((value) => {
      const normalized = String(value).trim().toLowerCase();
      return normalized.includes("بنك") || normalized.includes("bank");
    });
  const requiresBeneficiaryBank = isBankPaymentMethod(
    formData.payment_method,
    selectedPaymentMethod?.label,
  );

  const extractOrderIds = (data) => {
    if (!data) return [];
    if (Array.isArray(data.order_ids) && data.order_ids.length > 0) {
      return data.order_ids.map((id) => (typeof id === "object" ? id.id : id));
    }
    if (Array.isArray(data.orders) && data.orders.length > 0) {
      return data.orders.map((o) => (typeof o === "object" ? o.id : o));
    }
    if (Array.isArray(data.finance_orders) && data.finance_orders.length > 0) {
      return data.finance_orders.map((o) => (typeof o === "object" ? o.id : o));
    }
    if (data.order_id) {
      return [data.order_id];
    }
    return [];
  };

  const fetchClientOrders = async (clientId) => {
    if (!clientId) {
      setClientOrders([]);
      return;
    }
    setLoadingOrders(true);
    try {
      const response = await getOrdersByClient(clientId);
      const orders = response.data?.data || response.data || [];
      setClientOrders(Array.isArray(orders) ? orders : []);
    } catch (err) {
      console.error("Error fetching client orders:", err);
      setClientOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (formData.client_id) {
      fetchClientOrders(formData.client_id);
    } else {
      setClientOrders([]);
    }
  }, [formData.client_id]);

  useEffect(() => {
    if (!show) return;

    const currentId = initialData?.id || null;
    if (lastLoadedId.current === currentId && currentId !== null) return;
    lastLoadedId.current = currentId;

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

      const extractedOrderIds = extractOrderIds(initialData);

      const clientId =
        initialData.client_id ||
        initialData.client?.id ||
        initialData.order?.client_id ||
        "";

      const employeeId =
        initialData.employee_id || initialData.employee?.id || "";

      setFormData({
        type: initialData.type || "receipt",
        amount: initialData.amount ?? "",
        order_id: initialData.order_id || "",
        order_ids: extractedOrderIds,
        client_id: clientId,
        employee_id: employeeId,
        payment_method: paymentMethodValue,
        bank_name: bankNameValue,
        transfer_date: formattedTransferDate,
        transfer_number: initialData.transfer_number || "",
        is_reviewed: initialData.is_reviewed || false,
        notes: initialData.notes || "",
      });

      if (clientId) {
        fetchClientOrders(clientId);
      }
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
        is_reviewed: false,
        notes: "",
      });
      setClientOrders([]);
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
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value || "" }));
    }
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setValidated(true);
    const errors = {};
    if (requiresBeneficiaryBank && !formData.bank_name) {
      errors.bank_name = ["يرجى اختيار بنك المستفيد"];
    }
    if (form.checkValidity() === false || Object.keys(errors).length > 0) {
      e.stopPropagation();
      setFieldErrors((prev) => ({ ...prev, ...errors }));
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

  const orderOptions = clientOrders.map((o) => ({
    value: o.id,
    label: `#${o.id} - ${o.visa_holder_name || o.client?.visa_holder_name || "بدون اسم"} - ${o.visa_number || ""}`,
  }));

  const selectedOrderIds = formData.order_ids || [];
  const missingOrderIds = selectedOrderIds.filter(
    (id) => !orderOptions.some((o) => String(o.value) === String(id)),
  );
  const extraOptions = missingOrderIds.map((id) => ({
    value: id,
    label: `#${id}`,
  }));

  const displayOrderOptions = [...orderOptions, ...extraOptions];

  const handleClientChange = (opt) => {
    const clientId = opt ? opt.value : "";
    setFormData((prev) => ({
      ...prev,
      client_id: clientId,
      order_id: "",
      order_ids: [],
    }));
    if (fieldErrors.client_id) {
      setFieldErrors((prev) => ({ ...prev, client_id: undefined }));
    }
  };

  const handlePaymentMethodChange = (opt) => {
    const newValue = opt ? opt.value : "";
    setFormData((prev) => {
      const next = { ...prev, payment_method: newValue };
      const method = normalizedPaymentMethods.find(
        (m) => String(m.value) === String(newValue),
      );
      const label = (method?.label || "").trim();
      if (!isBankPaymentMethod(newValue, label)) {
        next.bank_name = "";
      }
      return next;
    });
    if (fieldErrors.payment_method) {
      setFieldErrors((prev) => ({ ...prev, payment_method: undefined }));
    }
    if (fieldErrors.bank_name) {
      setFieldErrors((prev) => ({ ...prev, bank_name: undefined }));
    }
  };

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
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={employeeOptions}
                  value={getSelectedOption(
                    employeeOptions,
                    formData.employee_id,
                  )}
                  onChange={(opt) => {
                    setFormData((prev) => ({
                      ...prev,
                      employee_id: opt ? opt.value : "",
                    }));
                    if (fieldErrors.employee_id) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        employee_id: undefined,
                      }));
                    }
                  }}
                  placeholder="-- اختر الموظف --"
                  isClearable
                  isRtl
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: getFieldError("employee_id")
                        ? "#dc3545"
                        : base.borderColor,
                    }),
                  }}
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
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={[
                    { value: "receipt", label: "📥 مقبوضات (من العميل)" },
                    { value: "payment", label: "📤 مصروفات" },
                  ]}
                  value={
                    formData.type === "receipt"
                      ? { value: "receipt", label: "📥 مقبوضات (من العميل)" }
                      : { value: "payment", label: "📤 مصروفات" }
                  }
                  onChange={(opt) => {
                    setFormData((prev) => ({
                      ...prev,
                      type: opt ? opt.value : "receipt",
                    }));
                    if (fieldErrors.type) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        type: undefined,
                      }));
                    }
                  }}
                  isRtl
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: getFieldError("type")
                        ? "#dc3545"
                        : base.borderColor,
                    }),
                  }}
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
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={clientOptions}
                  value={getSelectedOption(clientOptions, formData.client_id)}
                  onChange={handleClientChange}
                  placeholder="-- اختر المندوب --"
                  isClearable
                  isRtl
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: getFieldError("client_id")
                        ? "#dc3545"
                        : base.borderColor,
                    }),
                  }}
                />
                {getFieldError("client_id") && (
                  <div className="text-danger small mt-1">
                    {getFieldError("client_id")}
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  رقم الطلب
                </Form.Label>
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isMulti
                  options={displayOrderOptions}
                  isLoading={loadingOrders}
                  value={displayOrderOptions.filter((o) =>
                    formData.order_ids?.includes(o.value),
                  )}
                  onChange={(selected) => {
                    setFormData((prev) => ({
                      ...prev,
                      order_ids: selected ? selected.map((s) => s.value) : [],
                    }));
                    if (fieldErrors.order_ids) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        order_ids: undefined,
                      }));
                    }
                  }}
                  placeholder={
                    loadingOrders
                      ? "جاري تحميل الطلبات..."
                      : !formData.client_id
                        ? "يرجى اختيار المندوب أولاً"
                        : clientOrders.length === 0
                          ? "لا توجد طلبات لهذا المندوب"
                          : "-- اختر طلباً (يمكن اختيار أكثر من واحد) --"
                  }
                  isClearable
                  isRtl
                  isDisabled={!formData.client_id || loadingOrders}
                  noOptionsMessage={() =>
                    !formData.client_id
                      ? "يرجى اختيار المندوب أولاً"
                      : clientOrders.length === 0
                        ? "لا توجد طلبات لهذا المندوب"
                        : "لا توجد خيارات"
                  }
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: getFieldError("order_ids")
                        ? "#dc3545"
                        : base.borderColor,
                    }),
                  }}
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
                  {getFieldError("amount") || "يرجى إدخال المبلغ"}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  طريقة الدفع
                </Form.Label>
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={normalizedPaymentMethods}
                  value={getSelectedOption(
                    normalizedPaymentMethods,
                    formData.payment_method,
                  )}
                  onChange={handlePaymentMethodChange}
                  placeholder="-- اختر --"
                  isClearable
                  isRtl
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: getFieldError("payment_method")
                        ? "#dc3545"
                        : base.borderColor,
                    }),
                  }}
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
            {requiresBeneficiaryBank && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">
                    بنك المستفيد <span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    options={normalizedBankNames}
                    value={getSelectedOption(
                      normalizedBankNames,
                      formData.bank_name,
                    )}
                    onChange={(opt) => {
                      setFormData((prev) => ({
                        ...prev,
                        bank_name: opt ? opt.value : "",
                      }));
                      if (fieldErrors.bank_name) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          bank_name: undefined,
                        }));
                      }
                    }}
                    placeholder="-- اختر بنك المستفيد --"
                    isClearable
                    isRtl
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: getFieldError("bank_name")
                          ? "#dc3545"
                          : base.borderColor,
                      }),
                    }}
                  />
                  {getFieldError("bank_name") && (
                    <div className="text-danger small mt-1">
                      {getFieldError("bank_name")}
                    </div>
                  )}
                </Form.Group>
              </Col>
            )}
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
                <div
                  className="d-flex align-items-center justify-content-start rounded-3 border px-2 w-100"
                  style={{
                    height: "38px",
                    backgroundColor: "#fff",
                    direction: "ltr",
                  }}
                >
                  <Form.Control
                    type="date"
                    name="transfer_date"
                    value={formData.transfer_date}
                    onChange={handleChange}
                    isInvalid={!!getFieldError("transfer_date")}
                    className="border-0 shadow-none p-0 bg-transparent"
                    style={{ direction: "ltr" }}
                  />
                </div>
                {getFieldError("transfer_date") && (
                  <div className="text-danger small mt-1">
                    {getFieldError("transfer_date")}
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  مراجعة
                </Form.Label>
                <div
                  className="d-flex align-items-center justify-content-start gap-2 rounded-3 border px-3 w-100"
                  style={{
                    height: "38px",
                    backgroundColor: "#fff",
                  }}
                >
                  <label
                    htmlFor="is_reviewed"
                    className="fw-semibold mb-0"
                    style={{ cursor: "pointer", fontSize: "0.9rem" }}
                  >
                    تمت المراجعة
                  </label>
                  <Form.Check
                    type="checkbox"
                    id="is_reviewed"
                    name="is_reviewed"
                    checked={formData.is_reviewed || false}
                    onChange={handleChange}
                    style={{ margin: 0 }}
                  />
                </div>
                {getFieldError("is_reviewed") && (
                  <div className="text-danger small mt-1">
                    {getFieldError("is_reviewed")}
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
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                جاري الحفظ...
              </>
            ) : isEdit ? (
              "💾 حفظ التغييرات"
            ) : (
              "➕ إضافة حوالة"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FinanceFormModal;