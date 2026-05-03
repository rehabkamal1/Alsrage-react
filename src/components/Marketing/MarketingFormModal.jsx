import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";

const formatDateForInput = (val) => {
  if (!val) return "";
  if (val.includes("T")) return val.split("T")[0];
  return val.substring(0, 10);
};

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
    source_type: "service_office",
    type: "service_office",
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
        source_type: initialData.source_type || "service_office",
        type: initialData.type || "service_office",
        status: initialData.status || "new",
        priority_level: initialData.priority_level || "medium",
        notes: initialData.notes || "",
        contact_date: formatDateForInput(initialData.contact_date),
        next_followup_date: formatDateForInput(initialData.next_followup_date),
        assigned_to: initialData.assigned_to || "",
      });
    } else {
      setFormData({
        source_id: "",
        source_type: "service_office",
        type: "service_office",
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
      setSourceOptions(saudiOffices || []);
    } else if (formData.source_type === "external_office") {
      setSourceOptions(externalOffices || []);
    } else {
      setSourceOptions(serviceOffices || []);
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

    if (!formData.source_id) {
      setFieldErrors((prev) => ({
        ...prev,
        source_id: ["يرجى اختيار المصدر"],
      }));
      e.stopPropagation();
      setValidated(true);
      return;
    }

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

  const statusOptions = (statuses || []).map((s) => ({
    value: s.key,
    label: s.label,
    color: s.color,
  }));

  const priorityOptions = (priorityLevels || []).map((l) => ({
    value: l.key,
    label: l.label,
    color: l.color,
  }));

  const getSelectedOption = (options, value) => {
    if (!value || !options || options.length === 0) return null;
    const found = options.find((opt) => opt.value === value);
    return found ? { value: found.value, label: found.label } : null;
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
                  نوع المصدر <span className="text-danger">*</span>
                </Form.Label>
                <Select
                  options={[
                    { value: "saudi_office", label: "مكتب سعودي" },
                    { value: "external_office", label: "مكتب خارجي" },
                    { value: "service_office", label: "مكتب خدمات" },
                  ]}
                  value={
                    formData.source_type === "saudi_office"
                      ? { value: "saudi_office", label: "مكتب سعودي" }
                      : formData.source_type === "external_office"
                        ? { value: "external_office", label: "مكتب خارجي" }
                        : { value: "service_office", label: "مكتب خدمات" }
                  }
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      source_type: opt ? opt.value : "service_office",
                      source_id: "",
                    }))
                  }
                  isRtl
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  {getSourceLabel()} <span className="text-danger">*</span>
                </Form.Label>
                <Select
                  options={sourceOptions.map((opt) => ({
                    value: opt.id,
                    label: opt.name || opt.office_name,
                  }))}
                  value={
                    sourceOptions.find((opt) => opt.id === formData.source_id)
                      ? {
                          value: formData.source_id,
                          label:
                            sourceOptions.find(
                              (opt) => opt.id === formData.source_id,
                            ).name ||
                            sourceOptions.find(
                              (opt) => opt.id === formData.source_id,
                            ).office_name,
                        }
                      : null
                  }
                  onChange={(opt) =>
                    setFormData((prev) => ({
                      ...prev,
                      source_id: opt ? opt.value : "",
                    }))
                  }
                  placeholder="-- اختر --"
                  isClearable
                  isRtl
                />
                {(validated && !formData.source_id) ||
                getFieldError("source_id") ? (
                  <div className="text-danger small mt-1">
                    {getFieldError("source_id") || "يرجى اختيار المصدر"}
                  </div>
                ) : null}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  الحالة
                </Form.Label>
                <Select
                  options={statusOptions}
                  value={getSelectedOption(statusOptions, formData.status)}
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
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
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
                    setFormData((prev) => ({
                      ...prev,
                      priority_level: opt ? opt.value : "",
                    }))
                  }
                  placeholder="-- اختر --"
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
          </Row>

          <Row>
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
                : "➕ إضافة عميل"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MarketingFormModal;
