import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const MarketingAddOfficeModal = ({
  show,
  onHide,
  onSubmit,
  type,
  loading,
  initialData,
}) => {
  const [formData, setFormData] = useState({});
  const [validated, setValidated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (type === "saudi") {
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
      });
    } else if (type === "external") {
      setFormData({
        name: "",
        country: "",
        nationality: "",
        responsible_employee: "",
        phone: "",
        contacts: [{ name: "", phone: "", position: "" }],
        notes: "",
      });
    } else if (type === "service") {
      setFormData({
        office_name: "",
        country: "",
        nationality: "",
        responsible_employee: "",
        phone: "",
        notes: "",
      });
    }
    setValidated(false);
    setFieldErrors({});
  }, [initialData, show, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: undefined });
    }
  };

  // دوال خاصة بالمكاتب الخارجية (جهات الاتصال)
  const handleContactChange = (index, e) => {
    const { name, value } = e.target;
    const newContacts = [...(formData.contacts || [])];
    newContacts[index][name] = value;
    setFormData({ ...formData, contacts: newContacts });
  };

  const addContact = () => {
    setFormData({
      ...formData,
      contacts: [
        ...(formData.contacts || []),
        { name: "", phone: "", position: "" },
      ],
    });
  };

  const removeContact = (index) => {
    const newContacts = formData.contacts.filter((_, i) => i !== index);
    setFormData({ ...formData, contacts: newContacts });
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

  const getTitle = () => {
    if (type === "saudi")
      return initialData
        ? "✏️ تعديل المكتب السعودي"
        : "➕ إضافة مكتب سعودي جديد";
    if (type === "external")
      return initialData
        ? "✏️ تعديل المكتب الخارجي"
        : "➕ إضافة مكتب خارجي جديد";
    if (type === "service")
      return initialData ? "✏️ تعديل مكتب الخدمات" : "➕ إضافة مكتب خدمات جديد";
    return "إضافة مكتب جديد";
  };

  // المكاتب السعودية
  const SaudiFields = () => (
    <>
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
              جهة التوجيه <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="destination"
              value={formData.destination || ""}
              onChange={handleChange}
              required
              isInvalid={!!getFieldError("destination")}
              className="rounded-3"
            />
            <Form.Control.Feedback type="invalid">
              {getFieldError("destination") || "يرجى إدخال جهة التوجيه"}
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
              value={formData.city || ""}
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
              value={formData.responsible_employee || ""}
              onChange={handleChange}
              required
              isInvalid={!!getFieldError("responsible_employee")}
              className="rounded-3"
            />
            <Form.Control.Feedback type="invalid">
              {getFieldError("responsible_employee") ||
                "يرجى إدخال الموظف المسؤول"}
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
              value={formData.mobile || ""}
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
              رقم المكتب
            </Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone || ""}
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
    </>
  );

  // المكاتب الخارجية
  const ExternalFields = () => (
    <>
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
            />
            <Form.Control.Feedback type="invalid">
              {getFieldError("phone") || "يرجى إدخال رقم المكتب"}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </>
  );

  // مكاتب الخدمات
  const ServiceFields = () => (
    <>
      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              اسم المكتب <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="office_name"
              value={formData.office_name || ""}
              onChange={handleChange}
              required
              isInvalid={!!getFieldError("office_name")}
              className="rounded-3"
            />
            <Form.Control.Feedback type="invalid">
              {getFieldError("office_name") || "يرجى إدخال اسم المكتب"}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              الدولة
            </Form.Label>
            <Form.Control
              type="text"
              name="country"
              value={formData.country || ""}
              onChange={handleChange}
              isInvalid={!!getFieldError("country")}
              className="rounded-3"
            />
            <Form.Control.Feedback type="invalid">
              {getFieldError("country")}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
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
              value={formData.responsible_employee || ""}
              onChange={handleChange}
              required
              isInvalid={!!getFieldError("responsible_employee")}
              className="rounded-3"
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
            />
            <Form.Control.Feedback type="invalid">
              {getFieldError("phone") || "يرجى إدخال رقم المكتب"}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </>
  );

  const renderFields = () => {
    if (type === "saudi") return <SaudiFields />;
    if (type === "external") return <ExternalFields />;
    if (type === "service") return <ServiceFields />;
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
        <Modal.Title className="fw-bold fs-5">{getTitle()}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} noValidate validated={validated}>
        <Modal.Body className="px-4">{renderFields()}</Modal.Body>

        <Modal.Footer className="border-0 pb-4 px-4">
          <Button
            variant="light"
            onClick={onHide}
            className="px-4 rounded-3"
            style={{ border: "1px solid #dee2e6" }}
          >
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
            ) : initialData ? (
              "💾 حفظ التغييرات"
            ) : (
              "➕ إضافة مكتب"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MarketingAddOfficeModal;
