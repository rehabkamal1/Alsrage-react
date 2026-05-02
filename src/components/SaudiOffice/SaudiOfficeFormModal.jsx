import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import "../../styles/FormModal.css";

const SaudiOfficeFormModal = ({
  show,
  onHide,
  onSubmit,
  initialData,
  loading,
  isEdit,
  error,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    responsible_employee: "",
    mobile: "",
    phone: "",
    address: "",
    total_authorization: "",
    musaned_price: "",
    whatsapp_link: "",
    is_supplier: false,
  });

  const [validated, setValidated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        destination: initialData.destination || "",
        city: initialData.city || "",
        responsible_employee: initialData.responsible_employee || "",
        mobile: initialData.mobile || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        notes: initialData.notes || "",
        total_authorization: initialData.total_authorization || "",
        musaned_price: initialData.musaned_price || "",
        whatsapp_link: initialData.whatsapp_link || "",
        is_supplier: initialData.is_supplier || false,
      });
    } else {
      setFormData({
        name: "",
        destination: "",
        city: "",
        responsible_employee: "",
        mobile: "",
        phone: "",
        address: "",
        notes: "",
        total_authorization: "",
        musaned_price: "",
        whatsapp_link: "",
        is_supplier: false,
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
      [name]: type === 'checkbox' ? checked : value 
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
      size="md"
      dir="rtl"
      backdrop="static"
    >
      <Modal.Header closeButton className="border-0 pt-4 px-4">
        <Modal.Title className="fw-bold fs-5">
          {isEdit ? "✏️ تعديل المكتب السعودي" : "➕ إضافة مكتب سعودي جديد"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} noValidate validated={validated}>
        <Modal.Body className="px-4">
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  اسم المكتب <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  isInvalid={!!getFieldError("name")}
                  className="rounded-3"
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
                  جهة الوصول <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                  isInvalid={!!getFieldError("destination")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("destination") || "يرجى إدخال جهة الوصول"}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  المدينة
                </Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("city")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("city")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  الموظف المسؤول <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="responsible_employee"
                  value={formData.responsible_employee}
                  onChange={handleChange}
                  required
                  isInvalid={!!getFieldError("responsible_employee")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("responsible_employee") ||
                    "يرجى إدخال اسم الموظف المسؤول"}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  رقم الجوال <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  isInvalid={!!getFieldError("mobile")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("mobile") || "يرجى إدخال رقم الجوال"}
                </Form.Control.Feedback>
                {formData.mobile && (
                  <div className="mt-2">
                    <a
                      href={`https://wa.me/${formData.mobile.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-success rounded-3 w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                      <i className="fa-brands fa-whatsapp fs-5"></i>
                      <span>تواصل عبر واتساب</span>
                    </a>
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  رقم الهاتف
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("phone")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("phone")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  إجمالي التفويض
                </Form.Label>
                <Form.Control
                  type="number"
                  name="total_authorization"
                  value={formData.total_authorization}
                  onChange={handleChange}
                  placeholder="0.00"
                  isInvalid={!!getFieldError("total_authorization")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("total_authorization")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  السعر ع مساند
                </Form.Label>
                <Form.Control
                  type="number"
                  name="musaned_price"
                  value={formData.musaned_price}
                  onChange={handleChange}
                  placeholder="0.00"
                  isInvalid={!!getFieldError("musaned_price")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("musaned_price")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  العنوان
                </Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("address")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("address")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  ملاحظات
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
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
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="is_supplier"
                  name="is_supplier"
                  label="تحديد كمورد"
                  checked={formData.is_supplier}
                  onChange={handleChange}
                  className="fw-bold text-primary"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  وتساب
                </Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="url"
                    name="whatsapp_link"
                    value={formData.whatsapp_link}
                    onChange={handleChange}
                    placeholder="رابط جروب الواتساب"
                    isInvalid={!!getFieldError("whatsapp_link")}
                    className="rounded-3"
                  />
                  {formData.whatsapp_link && (
                    <a
                      href={formData.whatsapp_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success rounded-3 d-flex align-items-center justify-content-center"
                      title="الدخول لجروب الواتساب"
                    >
                      <i className="fa-brands fa-whatsapp fs-5"></i>
                    </a>
                  )}
                </div>
                <Form.Control.Feedback type="invalid" className={getFieldError("whatsapp_link") ? "d-block" : ""}>
                  {getFieldError("whatsapp_link")}
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
            {loading
              ? "جاري الحفظ..."
              : isEdit
                ? "💾 حفظ التغييرات"
                : "➕ إضافة مكتب"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SaudiOfficeFormModal;
