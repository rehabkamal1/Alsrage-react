import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import ExternalOfficeFormModal from "./ExternalOfficeFormModal";
import { createExternalOffice } from "../../services/apiService";
import { showSuccess, showError } from "../../utils/swalHelper";

const formatDateForInput = (val) => {
  if (!val) return "";
  if (val.includes("T")) return val.split("T")[0];
  return val.substring(0, 10);
};

const TrackingFormModal = ({
  show,
  onHide,
  onSubmit,
  initialData,
  orders,
  priorityLevels,
  passportStatuses,
  transferStatuses,
  externalOffices,
  loading,
  isEdit,
  error,
  onRefreshExternalOffices,
}) => {
  const [formData, setFormData] = useState({
    order_id: "",
    is_authenticated: false,
    authentication_date: "",
    certification_date: "",
    authentication_number: "",
    authorization_number: "",
    sponsor_number: "",
    last_action_date: "",
    notes: "",
    priority_level: "",
    passport_status: "",
    transfer_status: "",
    external_office_id: "",
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [validated, setValidated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showExternalModal, setShowExternalModal] = useState(false);
  const [addingOffice, setAddingOffice] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const order = orders?.find((o) => o.id === initialData.order_id);

      const newFormData = {
        order_id: initialData.order_id || "",
        is_authenticated: initialData.is_authenticated || false,
        authentication_date: formatDateForInput(
          initialData.authentication_date,
        ),
        certification_date: formatDateForInput(initialData.certification_date),
        authentication_number: initialData.authentication_number || "",
        authorization_number: initialData.authorization_number || "",
        sponsor_number:
          initialData.sponsor_number || order?.sponsor_number || "",
        last_action_date: formatDateForInput(initialData.last_action_date),
        notes: initialData.notes || "",
        priority_level: initialData.priority_level || "",
        passport_status: initialData.passport_status || "",
        transfer_status: initialData.transfer_status || "",
        external_office_id:
          initialData.external_office_id || order?.external_office_id || "",
      };

      setFormData(newFormData);
      setSelectedOrder(order || null);
    } else {
      setFormData({
        order_id: "",
        is_authenticated: false,
        authentication_date: "",
        certification_date: "",
        authentication_number: "",
        authorization_number: "",
        sponsor_number: "",
        last_action_date: "",
        notes: "",
        priority_level: "",
        passport_status: "",
        transfer_status: "",
        external_office_id: "",
      });
      setSelectedOrder(null);
    }
    setValidated(false);
    setFieldErrors({});
  }, [initialData, show, orders]);

  useEffect(() => {
    if (error?.errors) {
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

  console.log("========== handleSubmit ==========");
  console.log("formData before submit:", formData);
  console.log("external_office_id value:", formData.external_office_id);

  if (e.currentTarget.checkValidity() === false) {
    e.stopPropagation();
    setValidated(true);
    return;
  }
  onSubmit(formData);
};
  const handleAddExternalOffice = async (officeData) => {
    setAddingOffice(true);
    try {
      await createExternalOffice(officeData);
      showSuccess("تم", "تم إضافة المكتب الخارجي بنجاح");
      setShowExternalModal(false);
      if (onRefreshExternalOffices) {
        await onRefreshExternalOffices();
      }
    } catch (error) {
      showError(
        "خطأ",
        error.response?.data?.message || "حدث خطأ أثناء الإضافة",
      );
    } finally {
      setAddingOffice(false);
    }
  };

  const getFieldError = (fieldName) => fieldErrors[fieldName]?.[0];

  const displayOrder = selectedOrder || null;

  const priorityOptions = (priorityLevels || []).map((l) => ({
    value: l.value || l.key,
    label: l.label,
    color: l.color,
  }));

  const passportOptions = (passportStatuses || []).map((s) => ({
    value: s.value || s.key,
    label: s.label,
    color: s.color,
  }));

  const transferOptions = (transferStatuses || []).map((s) => ({
    value: s.value || s.key,
    label: s.label,
    color: s.color,
  }));

  const externalOfficeOptions = [
    ...(externalOffices || []).map((office) => ({
      value: office.id,
      label: `${office.country || ""} - ${office.name}`,
    })),
    { value: "add_new", label: "+ إضافة مكتب خارجي جديد" },
  ];

  const getSelectedOption = (options, value) => {
    if (!value || !options || options.length === 0) return null;
    const found = options.find((opt) => opt.value === value);
    if (found) {
      return { value: found.value, label: found.label };
    }
    return null;
  };

const handleSelectChange = (field, selected) => {
  console.log(`Select changed for ${field}:`, selected);
  if (field === "external_office_id" && selected?.value === "add_new") {
    setShowExternalModal(true);
    return;
  }
  if (selected && selected.value) {
    console.log(`Setting ${field} to:`, selected.value);
    setFormData((prev) => ({
      ...prev,
      [field]: selected.value,
    }));
  } else {
    console.log(`Clearing ${field}`);
    setFormData((prev) => ({
      ...prev,
      [field]: "",
    }));
  }
};

  return (
    <>
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
                    options={(orders || []).map((o) => ({
                      value: o.id,
                      label: `#${o.id} - ${o.visa_holder_name || o.client?.visa_holder_name || ""} - ${o.visa_number || ""}`,
                    }))}
                    value={getSelectedOption(
                      (orders || []).map((o) => ({
                        value: o.id,
                        label: `#${o.id} - ${o.visa_holder_name || o.client?.visa_holder_name || ""} - ${o.visa_number || ""}`,
                      })),
                      formData.order_id,
                    )}
                    onChange={(opt) => {
                      const orderId = opt ? opt.value : "";
                      setFormData((prev) => ({ ...prev, order_id: orderId }));
                      setSelectedOrder(
                        orders?.find((o) => o.id === parseInt(orderId)) || null,
                      );
                    }}
                    isDisabled={isEdit}
                    placeholder="-- اختر طلباً --"
                    isClearable
                    isRtl
                  />
                  {validated && !formData.order_id && (
                    <div className="text-danger small mt-1">
                      يرجى اختيار الطلب
                    </div>
                  )}
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

            {displayOrder && (
              <div className="bg-light p-3 rounded-3 mb-4">
                <div className="mb-2">
                  <small className="text-muted d-block">صاحب التأشيرة</small>
                  <strong>
                    {displayOrder.visa_holder_name ||
                      displayOrder.client?.visa_holder_name ||
                      "-"}
                  </strong>
                </div>
                <Row>
                  <Col xs={4}>
                    <small className="text-muted d-block">التأشيرة</small>
                    <strong>{displayOrder.visa_number || "-"}</strong>
                  </Col>
                  <Col xs={4}>
                    <small className="text-muted d-block">الهوية</small>
                    <strong>{displayOrder.id_number || "-"}</strong>
                  </Col>
                  <Col xs={4}>
                    <small className="text-muted d-block">الجواز</small>
                    <strong>{displayOrder.passport_number || "-"}</strong>
                  </Col>
                </Row>
              </div>
            )}

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

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    تاريخ التوثيق
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="authentication_date"
                    value={formData.authentication_date}
                    onChange={handleChange}
                    isInvalid={!!getFieldError("authentication_date")}
                    className="rounded-3"
                  />
                  <Form.Control.Feedback type="invalid">
                    {getFieldError("authentication_date")}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    تاريخ التصديق
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="certification_date"
                    value={formData.certification_date}
                    onChange={handleChange}
                    isInvalid={!!getFieldError("certification_date")}
                    className="rounded-3"
                  />
                  <Form.Control.Feedback type="invalid">
                    {getFieldError("certification_date")}
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
                <Form.Group className="d-flex align-items-center h-100 pt-4">
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
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    المكتب الخارجي
                  </Form.Label>
                  <Select
                    options={externalOfficeOptions}
                    value={getSelectedOption(
                      externalOfficeOptions,
                      formData.external_office_id,
                    )}
                    onChange={(opt) =>
                      handleSelectChange("external_office_id", opt)
                    }
                    placeholder="-- اختر --"
                    isClearable
                    isRtl
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    درجة الأهمية
                  </Form.Label>
                  <Select
                    options={priorityOptions}
                    value={getSelectedOption(
                      priorityOptions,
                      formData.priority_level,
                    )}
                    onChange={(opt) =>
                      handleSelectChange("priority_level", opt)
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
                    حالة التحويل
                  </Form.Label>
                  <Select
                    options={transferOptions}
                    value={getSelectedOption(
                      transferOptions,
                      formData.transfer_status,
                    )}
                    onChange={(opt) =>
                      handleSelectChange("transfer_status", opt)
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
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    حالة ترشيح الجواز
                  </Form.Label>
                  <Select
                    options={passportOptions}
                    value={getSelectedOption(
                      passportOptions,
                      formData.passport_status,
                    )}
                    onChange={(opt) =>
                      handleSelectChange("passport_status", opt)
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

      <ExternalOfficeFormModal
        show={showExternalModal}
        onHide={() => setShowExternalModal(false)}
        onSubmit={handleAddExternalOffice}
        loading={addingOffice}
      />
    </>
  );
};

export default TrackingFormModal;
